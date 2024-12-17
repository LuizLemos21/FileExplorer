// Import the SQLite3 package
const sqlite3 = require('sqlite3').verbose();

// Path to your SQLite database file
const dbPath = 'database.db';  

// Create a new SQLite database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("Could not open database:", err.message);
    } else {
        console.log("Connected to the database.");
    }
});

// Function to retrieve and print all table names
function printTables() {
    db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, rows) => {
        if (err) {
            console.error("Error retrieving tables:", err.message);
        } else {
            console.log("Tables in the database:");
            rows.forEach((row) => {
                console.log(row.name);
            });
        }
    });
}

// Call the function to print the tables
printTables();

// Close the database connection when done
db.close((err) => {
    if (err) {
        console.error("Error closing the database:", err.message);
    } else {
        console.log("Database connection closed.");
    }
});
