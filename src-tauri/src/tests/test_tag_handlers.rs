use tokio;    // Ensure tokio is available for async testing
use crate::{create_tag_handler, update_tag_handler, delete_tag_handler};


#[tokio::test] // Use tokio's test macro to enable async testing
async fn test_delete_tag() {
    // Replace with a valid tag ID for testing
    let tag_id = 1;

    // Call the async handler and await its result
    let result = delete_tag_handler(tag_id).await;

    // Assert that the result is successful
    assert!(result.is_ok(), "Tag deletion failed: {:?}", result.err());
}

#[tokio::test]
    async fn test_update_tag_handler() {
        let tag_id = 4; 
        let new_name = "classical".to_string();
        let parent_id = Some(3); 

        let result = update_tag_handler(tag_id, new_name, parent_id).await;

        assert!(
            result.is_ok(),
            "Failed to update tag: {:?}",
            result.err()
        );
    }

    #[tokio::test]
    async fn test_create_tag_handler(){
        let new_tag_name = "New test tag".to_string();
       // let parent_id = 2; 
    
        let result = create_tag_handler(new_tag_name, None).await;
    
        assert!(
            result.is_ok(),
            "Failed to create tag: {:?}",
            result.err()
        );
    
    
    }