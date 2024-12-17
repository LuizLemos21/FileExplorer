use rusqlite::Connection;
use crate::errors::ApiError;
use rusqlite::params;
use serde::Serialize;

#[derive(Serialize)]
pub struct Tag {
    pub id: i32,
    pub name: String,
    pub parent_id: Option<i32>,
}

#[derive(Serialize)]
pub struct File {
    pub id: i32,
    pub name: String,
    pub file_path: String,
}


use std::env;

fn establish_connection() -> Result<rusqlite::Connection, ApiError> {
    let db_path = env::current_dir()
        .expect("Failed to get current directory")
        .join("src/database/database.db");
    rusqlite::Connection::open(db_path)
        .map_err(|e| ApiError::ConnectionError(e.to_string()))
}


// Create Tag
pub fn create_tag(name: String, parent_id: Option<i32>) -> Result<(), ApiError> {
    let conn = establish_connection()?;
    conn.execute(
        "INSERT INTO tags (name, parent_id) VALUES (?1, ?2)", 
        params![&name, &parent_id],
    )
    .map_err(|e| ApiError::QueryError(e.to_string()))?;
    Ok(())
}

// Get All Tags
pub fn get_tags() -> Result<Vec<Tag>, ApiError> {
    let conn = establish_connection()?;
    let mut stmt = conn.prepare("SELECT id, name, parent_id FROM tags")?;
    let tag_iter = stmt.query_map([], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            parent_id: row.get(2)?,
        })
    })?;

    let tags: Vec<Tag> = tag_iter.filter_map(Result::ok).collect();
    Ok(tags)
}

// Update Tag
pub fn update_tag(tag_id: i32, new_name: String, new_parent_id: Option<i32>) -> Result<(), ApiError> {
    let conn = establish_connection()?;
    let affected = conn.execute(
        "UPDATE tags SET name = ?1, parent_id = ?2 WHERE id = ?3",
        params![&new_name, &new_parent_id, &tag_id],
    )?;
    if affected == 0 {
        return Err(ApiError::NotFound(format!("Tag with ID {} not found", tag_id)));
    }
    Ok(())
}

// Delete Tag
pub fn delete_tag(tag_id: i32) -> Result<(), ApiError> {
    let conn = establish_connection()?;
    let affected = conn.execute("DELETE FROM tags WHERE id = ?1", &[&tag_id])?;
    if affected == 0 {
        return Err(ApiError::NotFound(format!("Tag with ID {} not found", tag_id)));
    }
    Ok(())
}

// Associate Tag with File
pub fn tag_file(file_id: i32, tag_id: i32) -> Result<(), ApiError> {
    let conn = establish_connection()?;
    conn.execute(
        "INSERT INTO tagged_files (file_id, tag_id) VALUES (?1, ?2)",
        &[&file_id, &tag_id],
    )?;
    Ok(())
}
