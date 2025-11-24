// SQlite connection
// Creates and exports the SQLite (or POstgreSQL) database connection.
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "..", "..", "database.sqlite");

const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

export default db;
