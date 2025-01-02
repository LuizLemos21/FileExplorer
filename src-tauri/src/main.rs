// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod filesystem;
mod search;
mod errors;
mod database;

use filesystem::explorer::{open_file, open_directory, create_file, create_directory, rename_file, delete_file};
use filesystem::volume::get_volumes;
use search::search_directory;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use database::api::{create_tag, delete_tag, get_tags, register_file, tag_file, update_tag};
use errors::ApiError;



#[derive(Serialize, Deserialize)]
pub struct CachedPath {
    #[serde(rename = "p")]
    file_path: String,
    #[serde(rename = "t")]
    file_type: String,
}

pub type VolumeCache = HashMap<String, Vec<CachedPath>>;

#[derive(Default)]
pub struct AppState {
    system_cache: HashMap<String, VolumeCache>,
}

pub type StateSafe = Arc<Mutex<AppState>>;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_volumes,
            open_directory,
            search_directory,
            open_file,
            create_file,
            create_directory,
            rename_file,
            delete_file,
            create_tag_handler,
            get_tags_handler,
            update_tag_handler,
            delete_tag_handler,
            tag_file_handler,
            get_tags_hierarchy_handler
        ])
        .manage(Arc::new(Mutex::new(AppState::default())))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


// Tauri Command Handlers
#[tauri::command]
async fn create_tag_handler(name: String, parent_id: Option<i32>) -> Result<(), String> {
    create_tag(name, parent_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_tags_handler() -> Result<Vec<database::api::Tag>, String> {
    match get_tags() {
        Ok(tags) => Ok(tags),          // Return the list of tags
        Err(e) => Err(e.to_string()),  // Return error as a String
    }
}

#[tauri::command]
async fn get_tags_hierarchy_handler() -> Result<Vec<database::api::Tag>, String> {
    database::api::get_tags_hierarchically().map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_tag_handler(tag_id: i32, new_name: String, parent_id: Option<i32>) -> Result<(), String> {
    update_tag(tag_id, new_name, parent_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_tag_handler(tag_id: i32) -> Result<(), String> {
    delete_tag(tag_id).map_err(|e| e.to_string())
}


#[tauri::command]
async fn register_file_handler(name: String, path: String) -> Result<i32, String> {
    register_file(name, path).map_err(|e| e.to_string())

}


#[tauri::command]
async fn tag_file_handler(name: String, path: String, tag_ids: Vec<i32>) -> Result<(), String> {
    tag_file(name, path, tag_ids)
}