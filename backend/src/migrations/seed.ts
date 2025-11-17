import db from "../config/db";

console.log("🌱 Seeding database...");

try {
  // Create an admin user
  db.prepare(
    `
    INSERT OR IGNORE INTO users (firebase_uid, email, name, role, year)
    VALUES (@uid, @email, @name, 'admin', NULL)
  `
  ).run({
    uid: "ADMIN_LOCAL_TEST_UID",
    email: "admin@example.com",
    name: "Admin User",
  });

  // Create test students
  const students = [
    {
      uid: "STUDENT1_UID",
      name: "Anna Andersson",
      email: "anna@example.com",
      year: 1,
    },
    {
      uid: "STUDENT2_UID",
      name: "Johan Svensson",
      email: "johan@example.com",
      year: 2,
    },
    {
      uid: "STUDENT3_UID",
      name: "Maria Karlsson",
      email: "maria@example.com",
      year: 3,
    },
  ];

  const insertStudent = db.prepare(`
    INSERT OR IGNORE INTO users (firebase_uid, email, name, role, year)
    VALUES (@uid, @email, @name, 'student', @year)
  `);

  students.forEach((s) => insertStudent.run(s));

  console.log("✅ Seeding completed!");
} catch (err) {
  console.error("❌ Error during seeding:", err);
}
