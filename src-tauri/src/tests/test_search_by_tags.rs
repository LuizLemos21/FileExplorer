use tokio;
use crate::{get_tags_by_file_handler, tagSearch::search_by_tags};


#[tokio::test]
async fn test_get_tags_by_file() {
    let file_id = 1;
    let result = get_tags_by_file_handler(file_id);

}






#[tokio::test]
async fn test_search_by_tags() {
    let tag_ids = vec![1, 2];
    let filename_filter = Some("2019".to_string());

    let result = search_by_tags(tag_ids, filename_filter).await;

    assert!(
        result.is_ok(),
        "Failed to search files by tags: {:?}",
        result.err()
    );

    let files = result.unwrap();
    assert!(
        !files.is_empty(),
        "Expected at least one result, but got none"
    );

    for file in files {
        println!("File: {} - Path: {}", file.name, file.file_path);
    }
}
