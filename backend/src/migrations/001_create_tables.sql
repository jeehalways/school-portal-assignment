PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'student', -- 'student' or 'admin'
  year INTEGER, -- 1|2|3 for students
  phone TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  year INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade CHAR(1) NOT NULL CHECK (grade IN ('A','B','C','D','E','F')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Seed courses (from PDF lists - Year 1, Year 2, Year 3)
INSERT INTO courses (name, year) VALUES
('Engelska 5', 1),
('Filosofi 1', 1),
('Historia 1b', 1),
('Idrott och Hälsa 1', 1),
('Matematik 1b', 1),
('Naturkunskap 1b', 1),
('Samhällskunskap 1b', 1),
('Svenska 1', 1),

('Engelska 6', 2),
('Ledarskap och organisation', 2),
('Internationella Relationer', 2),
('Matematik 2b', 2),
('Samhällskunskap 2', 2),
('Svenska 2', 2),

('Filosofi 2', 3),
('Gymnasiearbete SA', 3),
('Kommunikation', 3),
('Psykologi 1', 3),
('Psykologi 2a', 3),
('Religionskunskap 1', 3),
('Religionskunskap 2', 3),
('Sociologi', 3),
('Svenska 3', 3);
