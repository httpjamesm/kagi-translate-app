use std::sync::{Arc, Mutex};

use anyhow::anyhow;
use anyhow_tauri::TAResult;
use scraper::{Html, Selector};
use serde_json::json;
use tauri::{
    http::{HeaderMap, HeaderValue},
    Manager,
};
use tauri_plugin_http::reqwest;
use tauri_plugin_sql::{Migration, MigrationKind};

#[derive(serde::Deserialize)]
struct DetectLanguageResponse {
    iso: String,
    label: String,
}

#[derive(serde::Deserialize)]
struct TranslationResponse {
    r#type: String,
    status: i32,
    data: String,
}

#[derive(serde::Deserialize)]
struct TranslationData {
    success: i32,
    completion: i32,
    from: i32,
    to: i32,
    detectedLanguage: i32,
}

#[derive(serde::Deserialize)]
struct LanguageInfo {
    iso: i32,
    label: i32,
}

#[derive(serde::Deserialize)]
#[serde(untagged)]
enum TranslationDataItem {
    Stats(TranslationData),
    Bool(bool),
    Text(String),
    LanguageInfo(LanguageInfo),
    Number(i32),
}

#[derive(serde::Deserialize)]
struct RomanizationResponse {
    result: String,
}

#[derive(serde::Deserialize)]
struct TranscriptionResponse {
    duration: f32,
    language: String,
    transcription: String,
}

fn get_user_agent(app: &tauri::AppHandle) -> String {
    let config = app.config();
    let identifier = config.identifier.clone();
    let version = config.version.clone().unwrap_or("1.0.0".to_string());
    format!("{}/{}", identifier, version)
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn detect_language(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    text: &str,
) -> TAResult<String> {
    let (session_token, client) = {
        let state = state.lock().unwrap();
        (state.session_token.clone(), state.reqwest_client.clone())
    };

    let session_token = session_token.ok_or_else(|| anyhow!("No login cookie"))?;

    let json_body = json!({
        "text": text,
    });

    let response = client
        .post("https://translate.kagi.com/api/detect")
        .json(&json_body)
        .header("Cookie", format!("kagi_session={}", session_token))
        .header("User-Agent", get_user_agent(&app))
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let detect_response: DetectLanguageResponse = response.json().await.map_err(|e| anyhow!(e))?;
    Ok(detect_response.iso)
}

#[tauri::command]
async fn get_translation(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    source_language: &str,
    target_language: &str,
    text: &str,
) -> TAResult<String> {
    let (session_token, client, translate_session_token) = {
        let state = state.lock().unwrap();
        (
            state.session_token.clone(),
            state.reqwest_client.clone(),
            state.translate_session_token.clone().unwrap_or_default(),
        )
    };

    let session_token = session_token.ok_or_else(|| anyhow!("No login cookie"))?;

    let response = client
        .post("https://translate.kagi.com/?/translate")
        .form(&[
            ("from", source_language),
            ("to", target_language),
            ("text", text),
            ("session_token", &translate_session_token),
        ])
        .header("Cookie", format!("kagi_session={}", session_token))
        .header("User-Agent", get_user_agent(&app))
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let translation_response: TranslationResponse =
        response.json().await.map_err(|e| anyhow!(e))?;
    let data: Vec<TranslationDataItem> =
        serde_json::from_str(&translation_response.data).map_err(|e| anyhow!(e))?;

    if let Some(TranslationDataItem::Text(translation)) = data.get(2) {
        Ok(translation.clone())
    } else {
        Err(anyhow!("Failed to parse translation response").into())
    }
}

#[tauri::command]
async fn get_romanization(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    text: &str,
    language: &str,
) -> TAResult<String> {
    let (session_token, client) = {
        let state = state.lock().unwrap();
        (state.session_token.clone(), state.reqwest_client.clone())
    };

    let session_token = session_token.ok_or_else(|| anyhow!("No login cookie"))?;

    let response = client
        .get("https://translate.kagi.com/api/romanize")
        .query(&[("text", text), ("lang", language)])
        .header("Cookie", format!("kagi_session={}", session_token))
        .header("User-Agent", get_user_agent(&app))
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let romanization_response: RomanizationResponse =
        response.json().await.map_err(|e| anyhow!(e))?;
    Ok(romanization_response.result)
}

#[tauri::command]
async fn get_translate_session_token(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
) -> TAResult<String> {
    let client = reqwest::Client::new();

    let session_token = state
        .lock()
        .unwrap()
        .session_token
        .clone()
        .ok_or_else(|| anyhow!("No login cookie"))?;

    let response = client
        .get("https://translate.kagi.com/")
        .header("User-Agent", get_user_agent(&app))
        .header("Cookie", format!("kagi_session={}", session_token))
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let html = response.text().await.map_err(|e| anyhow!(e))?;
    let document = Html::parse_document(&html);
    let selector = Selector::parse("input[name='session_token']").unwrap();

    if let Some(element) = document.select(&selector).next() {
        if let Some(token) = element.value().attr("value") {
            let mut state = state.lock().unwrap();
            state.translate_session_token = Some(token.to_string());
            return Ok(token.to_string());
        }
    }

    Err(anyhow!("Could not find session token").into())
}

#[tauri::command]
fn set_session_token(state: tauri::State<'_, Arc<Mutex<AppState>>>, session_token: &str) {
    state.lock().unwrap().session_token = Some(session_token.to_string());
}

#[derive(serde::Serialize)]
struct SpeechResponse {
    content_type: String,
    data: Vec<u8>,
}

#[tauri::command]
async fn get_speech(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    text: &str,
    language: &str,
) -> TAResult<SpeechResponse> {
    let client = reqwest::Client::new();

    let session_token = state
        .lock()
        .unwrap()
        .session_token
        .clone()
        .ok_or_else(|| anyhow!("No login cookie"))?;

    let response = client
        .get(format!(
            "https://translate.kagi.com/api/speech?text={}&language={}",
            text, language
        ))
        .header("Cookie", format!("kagi_session={}", session_token))
        .header("User-Agent", get_user_agent(&app))
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("audio/wav")
        .to_string();

    let bytes = response.bytes().await.map_err(|e| anyhow!(e))?;
    Ok(SpeechResponse {
        content_type,
        data: bytes.to_vec(),
    })
}

#[tauri::command]
async fn get_transcription(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    audio_data: Vec<u8>,
) -> TAResult<String> {
    let (session_token, client) = {
        let state = state.lock().unwrap();
        (state.session_token.clone(), state.reqwest_client.clone())
    };

    let session_token = session_token.ok_or_else(|| anyhow!("No login cookie"))?;

    let response = client
        .post("https://translate.kagi.com/api/transcribe")
        .body(audio_data)
        .header("Content-Type", "audio/mpeg")
        .header("Cookie", format!("kagi_session={}", session_token))
        .header("User-Agent", get_user_agent(&app))
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let transcription: TranscriptionResponse = response.json().await.map_err(|e| anyhow!(e))?;
    Ok(transcription.transcription)
}

struct AppState {
    session_token: Option<String>,
    reqwest_client: reqwest::Client,
    translate_session_token: Option<String>,
}

fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_favorites_table",
            sql: "CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_text TEXT NOT NULL,
                translated_text TEXT NOT NULL,
                source_language TEXT NOT NULL,
                target_language TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_starred_languages_table",
            sql: "CREATE TABLE IF NOT EXISTS starred_languages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                language_api_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );",
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:kagi-translate.db", get_migrations())
                .build(),
        )
        .setup(|app| {
            let mut default_headers = HeaderMap::new();
            default_headers.insert(
                "User-Agent",
                HeaderValue::from_str(&get_user_agent(app.handle())).unwrap(),
            );
            let reqwest_client = reqwest::Client::builder()
                .default_headers(default_headers)
                .build()
                .unwrap();
            let state = AppState {
                session_token: None,
                reqwest_client,
                translate_session_token: None,
            };

            app.manage(Arc::new(Mutex::new(state)));

            Ok(())
        })
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init());

    #[cfg(any(target_os = "android", target_os = "ios"))]
    {
        builder = builder.plugin(tauri_plugin_haptics::init());
    }

    builder
        .invoke_handler(tauri::generate_handler![
            detect_language,
            get_translation,
            get_romanization,
            set_session_token,
            get_speech,
            get_translate_session_token,
            get_transcription,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
