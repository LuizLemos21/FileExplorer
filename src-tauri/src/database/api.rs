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

//get tags hierarchialy 
pub fn get_tags_hierarchically() -> Result<Vec<Tag>, ApiError> {
    let conn = establish_connection()?;
    let mut stmt = conn.prepare("SELECT id, name, parent_id FROM tags")?;
    let tag_iter = stmt.query_map([], |row|{
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

//Registar um arquivo no banco

pub fn register_file(name: String, path: String) -> Result<i32, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?; 
        conn.execute(
        "INSERT INTO files (name, path) VALUES (?1, ?2)",
        &[&name, &path],
    ).map_err(|e| e.to_string())?;

    let last_id = conn.last_insert_rowid();
    Ok(last_id as i32)
}

// Associate Tag with File
pub fn tag_file(name: String, path: String, tag_ids: Vec<i32>) -> Result<(), String> {
   let conn = establish_connection().map_err(|e| e.to_string())?; 

    // Verificar se o arquivo já existe
    let file_id: i32 = conn
        .query_row(
            "SELECT id FROM files WHERE path = ?1",
            [&path],
            |row| row.get(0),
        )
        .unwrap_or_else(|_| {
            // Inserir o arquivo, se não existir
            conn.execute(
                "INSERT INTO files (name, path) VALUES (?1, ?2)",
                [&name, &path],
            )
            .expect("Failed to insert file");
            conn.last_insert_rowid() as i32
        });

    // Associar as tags ao arquivo
    for tag_id in tag_ids {
        conn.execute(
            "INSERT OR IGNORE INTO tagged_files (file_id, tag_id) VALUES (?1, ?2)",
            &[&file_id, &tag_id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}


// Pesquisar arquivos por Tags
#[tauri::command]
pub fn search_files_by_tags(tag_ids: Vec<i32>) -> Result<Vec<File>, String> {
    let conn = establish_connection().map_err(|e| e.to_string())?;

    let query = format!(
        "SELECT DISTINCT f.id, f.name, f.file_path
         FROM files f
         INNER JOIN tagged_files tf ON f.id = tf.file_id
         WHERE tf.tag_id IN ({})",
        tag_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",")    
    );

    let params: Vec<&dyn rusqlite::ToSql> = tag_ids.iter().map(|id| id as &dyn rusqlite::ToSql).collect();

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let file_iter = stmt
        .query_map(params.as_slice(), |row| {            
                Ok(File {
                id: row.get(0)?,
                name: row.get(1)?,
                file_path: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(file_iter.filter_map(Result::ok).collect())
}
