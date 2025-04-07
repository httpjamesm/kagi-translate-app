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

#[derive(serde::Deserialize, serde::Serialize)]
struct AlternativeTranslation {
    translation: String,
    explanation: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
struct AlternativeTranslationsResponse {
    originalDescription: String,
    elements: Vec<AlternativeTranslation>,
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

#[derive(serde::Deserialize)]
struct DetectedLanguage {
    iso: String,
    label: String,
}

#[derive(serde::Deserialize)]
struct NewTranslationResponse {
    translation: String,
    detectedLanguage: DetectedLanguage,
    definition: Option<serde_json::Value>,
}

#[derive(serde::Deserialize, serde::Serialize)]
struct WordVariation {
    text: String,
    explanation: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
struct WordInsight {
    id: String,
    originalText: String,
    variations: Vec<WordVariation>,
    r#type: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
struct WordInsightsResponse {
    markedTranslation: String,
    insights: Vec<WordInsight>,
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
    settings: &str,
) -> TAResult<String> {
    if text.is_empty() {
        return Ok("".to_string());
    }

    let (session_token, client) = {
        let state = state.lock().unwrap();
        (state.session_token.clone(), state.reqwest_client.clone())
    };

    let session_token = session_token.ok_or_else(|| anyhow!("No login cookie"))?;

    // Parse settings from stringified JSON
    let settings_value: serde_json::Value =
        serde_json::from_str(settings).map_err(|e| anyhow!("Failed to parse settings: {}", e))?;

    // Extract settings with defaults if any are missing
    let translation_style = settings_value
        .get("translation_style")
        .and_then(|v| v.as_str())
        .unwrap_or("natural");

    let formality = settings_value
        .get("formality_level")
        .and_then(|v| v.as_str())
        .unwrap_or("neutral");

    let speaker_gender = settings_value
        .get("speaker_gender")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");

    let addressee_gender = settings_value
        .get("addressee_gender")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");

    let context = settings_value
        .get("context")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let json_body = json!({
        "text": text,
        "from": source_language,
        "to": target_language,
        "stream": false,
        "prediction": false,
        "formality": formality,
        "speaker_gender": speaker_gender,
        "addressee_gender": addressee_gender,
        "translation_style": translation_style,
        "context": context
    });

    let response = client
        .post("https://translate.kagi.com/api/translate")
        .header("Cookie", format!("kagi_session={}", session_token))
        .header("User-Agent", get_user_agent(&app))
        .header("x-kagi-authorization", &session_token)
        .header("Content-Type", "application/json")
        .json(&json_body)
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let translation_response: NewTranslationResponse =
        response.json().await.map_err(|e| anyhow!(e))?;

    Ok(translation_response.translation)
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

#[tauri::command]
async fn get_alternative_translations(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    source_language: &str,
    target_language: &str,
    original_text: &str,
    existing_translation: &str,
    settings: &str,
) -> TAResult<AlternativeTranslationsResponse> {
    let (session_token, client) = {
        let state = state.lock().unwrap();
        (state.session_token.clone(), state.reqwest_client.clone())
    };

    let session_token = session_token.ok_or_else(|| anyhow!("No login cookie"))?;

    // Parse settings from stringified JSON
    let settings_value: serde_json::Value =
        serde_json::from_str(settings).map_err(|e| anyhow!("Failed to parse settings: {}", e))?;

    // Extract settings with defaults if any are missing
    let formality = settings_value
        .get("formality_level")
        .and_then(|v| v.as_str())
        .unwrap_or("neutral");

    let speaker_gender = settings_value
        .get("speaker_gender")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");

    let addressee_gender = settings_value
        .get("addressee_gender")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");

    let translation_style = settings_value
        .get("translation_style")
        .and_then(|v| v.as_str())
        .unwrap_or("natural");

    let context = settings_value
        .get("context")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let translation_options = json!({
        "speakerGender": speaker_gender,
        "addresseeGender": addressee_gender,
        "formality": formality,
        "style": translation_style,
        "context": context
    });

    let form = reqwest::multipart::Form::new()
        .text("targetLanguage", target_language.to_string())
        .text("sourceLanguage", source_language.to_string())
        .text("originalText", original_text.to_string())
        .text("existingTranslation", existing_translation.to_string())
        .text("targetExplanationLanguage", target_language.to_string())
        .text("partialTranslation", "false")
        .text("translationOptions", translation_options.to_string());

    let response = client
        .post("https://translate.kagi.com/api/alternative-translations")
        .multipart(form)
        .header("Cookie", format!("kagi_session={}", session_token))
        .header("User-Agent", get_user_agent(&app))
        .header("x-kagi-authorization", &session_token)
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let alt_translations: AlternativeTranslationsResponse =
        response.json().await.map_err(|e| anyhow!(e))?;
    Ok(alt_translations)
}

#[tauri::command]
async fn get_word_insights(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    original_text: &str,
    translated_text: &str,
    target_explanation_language: &str,
    settings: &str,
) -> TAResult<WordInsightsResponse> {
    if original_text.is_empty() || translated_text.is_empty() {
        return Ok(WordInsightsResponse {
            markedTranslation: "".to_string(),
            insights: vec![],
        });
    }

    let (session_token, client) = {
        let state = state.lock().unwrap();
        (state.session_token.clone(), state.reqwest_client.clone())
    };

    let session_token = session_token.ok_or_else(|| anyhow!("No login cookie"))?;

    // Parse settings from stringified JSON
    let settings_value: serde_json::Value =
        serde_json::from_str(settings).map_err(|e| anyhow!("Failed to parse settings: {}", e))?;

    // Extract settings with defaults if any are missing
    let formality = settings_value
        .get("formality_level")
        .and_then(|v| v.as_str())
        .unwrap_or("default");

    let speaker_gender = settings_value
        .get("speaker_gender")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");

    let addressee_gender = settings_value
        .get("addressee_gender")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");

    let translation_style = settings_value
        .get("translation_style")
        .and_then(|v| v.as_str())
        .unwrap_or("natural");

    let context = settings_value
        .get("context")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let translation_options = json!({
        "speakerGender": speaker_gender,
        "addresseeGender": addressee_gender,
        "formality": formality,
        "style": translation_style,
        "context": context
    });

    let form = reqwest::multipart::Form::new()
        .text("originalText", original_text.to_string())
        .text("translatedText", translated_text.to_string())
        .text(
            "targetExplanationLanguage",
            target_explanation_language.to_string(),
        )
        .text("translationOptions", translation_options.to_string());

    let response = client
        .post("https://translate.kagi.com/api/word-insights")
        .multipart(form)
        .header("Cookie", format!("kagi_session={}", session_token))
        .header("User-Agent", get_user_agent(&app))
        .header("x-kagi-authorization", &session_token)
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let insights: WordInsightsResponse = response.json().await.map_err(|e| anyhow!(e))?;
    Ok(insights)
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
            get_alternative_translations,
            get_word_insights,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
