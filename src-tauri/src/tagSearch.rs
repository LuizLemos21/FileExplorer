use crate::database::api::{search_files_by_tags, File};
use tauri::State;
use std::collections::HashMap;

/// Performs a search based on selected tags.
/// Allows optional refinement by filename within the results.
#[tauri::command]
pub async fn search_by_tags(
    tag_ids: Vec<i32>,
    filename_filter: Option<String>,
) -> Result<HashMap<String, (String, String)>, String> {
    // Query files associated with the selected tags
    let mut results = search_files_by_tags(tag_ids)?;

    // If a filename filter is provided, apply it
    if let Some(filter) = filename_filter {
        let filter_lower = filter.to_lowercase();
        results = results
            .into_iter()
            .filter(|file| file.name.to_lowercase().contains(&filter_lower))
            .collect();
    }

    // Transform results into the expected format
    let mut directory_contents = HashMap::new();
    for file in results {
        directory_contents.insert(
            file.file_path.clone(),
            ("File".to_string(), file.name.clone()),
        );
    }

    Ok(directory_contents)
}