use tokio;
use crate::main;

#[tokio::test]
async fn test_search_by_tags() {
    let tag_ids = vec![1, 2];
    let filename_filter = Some("example".to_string());

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
