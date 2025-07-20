CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone_number TEXT,
  session_id TEXT
);
