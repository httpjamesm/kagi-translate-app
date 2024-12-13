use std::sync::{Arc, Mutex};

use anyhow::anyhow;
use anyhow_tauri::TAResult;
use scraper::{Html, Selector};
use serde_json::json;
use tauri::Manager;
use tauri_plugin_http::reqwest;
use tauri_plugin_sql::{Migration, MigrationKind};

#[derive(serde::Deserialize)]
struct DetectLanguageResponse {
    iso: String,
    language: String,
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
}

#[derive(serde::Deserialize)]
#[serde(untagged)]
enum TranslationDataItem {
    Stats(TranslationData),
    Bool(bool),
    Text(String),
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
    let client = reqwest::Client::new();

    let json_body = json!({
        "text": text,
    });

    let session_token = state
        .lock()
        .unwrap()
        .session_token
        .clone()
        .ok_or_else(|| anyhow!("No login cookie"))?;

    let response = client
        .post("https://translate.kagi.com/api/detect")
        .json(&json_body)
        .header("Cookie", format!("kagi_session={}", session_token,))
        .header("User-Agent", get_user_agent(&app))
        .send()
        .await
        .map_err(|e| anyhow!(e))?;

    let detect_response: DetectLanguageResponse = response.json().await.map_err(|e| anyhow!(e))?;
    Ok(detect_response.language)
}

#[tauri::command]
async fn get_translation(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<Mutex<AppState>>>,
    source_language: &str,
    target_language: &str,
    text: &str,
) -> TAResult<String> {
    let client = reqwest::Client::new();

    let session_token = state
        .lock()
        .unwrap()
        .session_token
        .clone()
        .ok_or_else(|| anyhow!("No login cookie"))?;

    let response = client
        .post("https://translate.kagi.com/?/translate")
        .form(&[
            ("from", source_language),
            ("to", target_language),
            ("text", text),
        ])
        .header("Cookie", format!("kagi_session={}", session_token,))
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
fn set_session_token(state: tauri::State<'_, Arc<Mutex<AppState>>>, session_token: &str) {
    state.lock().unwrap().session_token = Some(session_token.to_string());
}

struct AppState {
    session_token: Option<String>,
}

fn get_migrations() -> Vec<Migration> {
    vec![Migration {
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
    }]
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
            let state = AppState {
                session_token: None,
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
            set_session_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
