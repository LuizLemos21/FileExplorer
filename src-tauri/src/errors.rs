use serde_bencode::error;
use thiserror::Error;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("{0}")]
    Custom(String),
}

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Database connection error: {0}")]
    ConnectionError(String),
    #[error("Database query failed: {0}")]
    QueryError(String),
    #[error("Resource not found: {0}")]
    NotFound(String),
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    #[error("Unexpected error: {0}")]
    Unexpected(String),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

impl From<rusqlite::Error> for ApiError {
    fn from(err: rusqlite::Error) -> Self {
        ApiError::QueryError(err.to_string())
    }
}