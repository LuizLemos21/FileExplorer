use tokio;
use crate::{register_file_handler,  tag_file_handler};



#[tokio::test]
async fn test_register_file_handler() {
    let file_name = "2019.prproj".to_string();
    let file_path = "C:/Users/luizf_nxc87sj/Desktop/2019.prproj".to_string();

    let result = register_file_handler(file_name, file_path).await;

    assert!(
        result.is_ok(),
        "Failed to register file: {:?}",
        result.err()
    );

    let file_id = result.unwrap();
    assert!(
        file_id > 0,
        "Expected a valid file ID but got: {}",
        file_id
    );
}

#[tokio::test]
async fn test_tag_file_handler() {
    let file_name = "testpicture (8).png".to_string();
    let file_path = "C:/Users/luizf_nxc87sj/Documents/GitHub/FileExplorer/testfiles/testpicture (8).png".to_string();
    let tag_ids = vec![11, 2, 3]; // Replace with valid tag IDs

    let result = tag_file_handler(file_name, file_path, tag_ids).await;

    assert!(
        result.is_ok(),
        "Failed to tag file: {:?}",
        result.err()
    );


}