use crate::database::api::{search_files_by_tags, File};
use tauri::State;

/// Performs a search based on selected tags.
/// Allows optional refinement by filename within the results.
#[tauri::command]
pub async fn search_by_tags(
    tag_ids: Vec<i32>,
    filename_filter: Option<String>,
) -> Result<Vec<File>, String> {
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

    Ok(results)
}
