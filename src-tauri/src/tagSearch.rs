use crate::database::api::{search_files_by_tags, File};
use crate::filesystem::volume::DirectoryChild;
use tauri::State;
use std::time::Instant;

// Performs a search based on selected tags
//  Returns results in a format compatible with the DirectoryContents component.
#[tauri::command]
pub async fn search_by_tags(
    tagIds: Vec<i32>,
    filename_filter: Option<String>,
) -> Result<Vec<DirectoryChild>, String> {
    let start_time = Instant::now(); //start timer

    // Query files associated with the selected tags
    let mut results = search_files_by_tags(tagIds)?;

    // If a filename filter is provided, apply it
    if let Some(filter) = filename_filter {
        let filter_lower = filter.to_lowercase();
        results = results
            .into_iter()
            .filter(|file| file.name.to_lowercase().contains(&filter_lower))
            .collect();
    }

    // Transform results into DirectoryContent format
    let directory_contents: Vec<DirectoryChild> = results
        .into_iter()
        .map(|file| {
            // Assuming DirectoryChild::File(name, path) is the correct variant
            DirectoryChild::File(file.name, file.file_path)
        })
        .collect();
    let end_time = Instant::now(); // End timing
    println!("Elapsed time for tag search: {:?}", end_time - start_time);    
    Ok(directory_contents)
}
