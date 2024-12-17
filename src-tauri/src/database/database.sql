PRAGMA foreign_keys = OFF; -- It's better to set this OFF at the beginning

BEGIN TRANSACTION;

-- Correct order: Create referenced tables FIRST
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES tags(id) ON DELETE CASCADE
);

-- Now you can create the table with foreign key references
CREATE TABLE IF NOT EXISTS tagged_files (
    file_id INTEGER REFERENCES files(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (file_id, tag_id) -- Important: Add a composite primary key
);

-- Insert data AFTER table creation
INSERT INTO files (id, name, file_path) VALUES
(1, 'test5', 'testfile5'),
(2, 'test4', 'testfile4'),
(3, 'test3', 'testfile3'),
(4, 'test2', 'testfile2'),
(5, 'test1', 'testfile1');

INSERT INTO tags (id, name, parent_id) VALUES
(1, 'test', NULL),
(2, 'work', NULL),
(3, 'music', NULL),
(4, 'classic', 3),
(5, 'jazz', 3),
(7, 'pop', 3), -- Corrected the ID to avoid skipping 6. Insert order doesn't matter for the database integrity, but it's better for readability.
(6, 'jpop', 7); -- Corrected the parent_id to 7.

INSERT INTO tagged_files (file_id, tag_id) VALUES
(3, 2),
(5, 1),
(4, 1),
(3, 1),
(2, 2),
(1, 1);

COMMIT TRANSACTION;

PRAGMA foreign_keys = ON; -- Turn foreign key checking back on