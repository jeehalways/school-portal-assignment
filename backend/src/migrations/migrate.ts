// Node script to apply migrations
import fs from "fs";
import path from "path";
import db from "../config/db";

const filePath = path.join(__dirname, "001_create_tables.sql");
const sql = fs.readFileSync(filePath, "utf8");

try {
  db.exec(sql);
  console.log("✅ Migration completed successfully!");
} catch (err) {
  console.error("❌ Migration failed:", err);
}
