import db from "../config/db";

console.log("🌱 Seeding database...");

try {
  // WIPE EXISTING DATA SO WE NEVER GET DUPLICATES
  db.exec(`
    DELETE FROM grades;
    DELETE FROM courses;
    DELETE FROM users;

    -- Reset autoincrement counters
    DELETE FROM sqlite_sequence WHERE name IN ('grades', 'courses', 'users');
  `);

  // SEED COURSES (same list as in 001_create_tables.sql)
  const courses = [
    // Year 1
    { name: "Engelska 5", year: 1 },
    { name: "Filosofi 1", year: 1 },
    { name: "Historia 1b", year: 1 },
    { name: "Idrott och Hälsa 1", year: 1 },
    { name: "Matematik 1b", year: 1 },
    { name: "Naturkunskap 1b", year: 1 },
    { name: "Samhällskunskap 1b", year: 1 },
    { name: "Svenska 1", year: 1 },

    // Year 2
    { name: "Engelska 6", year: 2 },
    { name: "Ledarskap och organisation", year: 2 },
    { name: "Internationella Relationer", year: 2 },
    { name: "Matematik 2b", year: 2 },
    { name: "Samhällskunskap 2", year: 2 },
    { name: "Svenska 2", year: 2 },

    // Year 3
    { name: "Filosofi 2", year: 3 },
    { name: "Gymnasiearbete SA", year: 3 },
    { name: "Kommunikation", year: 3 },
    { name: "Psykologi 1", year: 3 },
    { name: "Psykologi 2a", year: 3 },
    { name: "Religionskunskap 1", year: 3 },
    { name: "Religionskunskap 2", year: 3 },
    { name: "Sociologi", year: 3 },
    { name: "Svenska 3", year: 3 },
  ];

  const insertCourse = db.prepare(
    `INSERT INTO courses (name, year) VALUES (@name, @year)`
  );

  for (const c of courses) {
    insertCourse.run(c);
  }

  // ADMIN USER
  db.prepare(
    `
    INSERT INTO users (firebase_uid, email, name, role, year, phone, address)
    VALUES (@uid, @email, @name, 'admin', NULL, @phone, @address)
  `
  ).run({
    uid: "dW8B7rrj6XSKJGeVmLQS3CyFKuf2",
    email: "admin@example.com",
    name: "Admin User",
    phone: null,
    address: null,
  });

  // TEST STUDENTS
  const students = [
    {
      uid: "zX9gqzUvAqPQBtml4MgiDM0tNjH3",
      email: "anna.bergstrom@example.com",
      name: "Anna Bergström",
      year: 1,
      phone: "0701110001",
      address: "Drottninggatan 1",
    },
    {
      uid: "UYAT9C6JBZQ31VMJUytMzZDscFn1",
      email: "johan.lindgren@example.com",
      name: "Johan Lindgren",
      year: 1,
      phone: "0701110002",
      address: "Södra Storgatan 2",
    },
    {
      uid: "iJefPL89X8M2p9x32yIcuGXco4P2",
      email: "maria.ekholm@example.com",
      name: "Maria Ekholm",
      year: 1,
      phone: "0701110003",
      address: "Hälsovägen 3",
    },
    {
      uid: "KWo9FY1YkzUQkpZbSYzbU07K43w2",
      email: "erik.sandberg@example.com",
      name: "Erik Sandberg",
      year: 2,
      phone: "0701110004",
      address: "Kopparmöllegatan 4",
    },
    {
      uid: "i8Ah2aGfO6OvVV8WeyLIR0yZWzZ2",
      email: "sofia.henningsson@example.com",
      name: "Sofia Henningsson",
      year: 2,
      phone: "0701110005",
      address: "Fältarpsvägen 5",
    },
    {
      uid: "hj7gv9hCrYMbDuRoCQuWnuC1r7t2",
      email: "daniel.norberg@example.com",
      name: "Daniel Norberg",
      year: 2,
      phone: "0701110006",
      address: "Kurirgatan 6",
    },
    {
      uid: "cjE0dg81FXOHd5dHe1czr88IkSh1",
      email: "klara.sjodin@example.com",
      name: "Klara Sjödin",
      year: 3,
      phone: "0701110007",
      address: "Jönköpingsgatan 7",
    },
    {
      uid: "ZuZMaDFIoRPd4eGUpbziMhWScLM2",
      email: "markus.lundvall@example.com",
      name: "Markus Lundvall",
      year: 3,
      phone: "0701110008",
      address: "Carl Krooks gata 8",
    },
    {
      uid: "n4G4dPyP0kejR1bsBXRuoejWprT2",
      email: "elin.westin@example.com",
      name: "Elin Westin",
      year: 3,
      phone: "0701110009",
      address: "Ängelholmsvägen 9",
    },
    {
      uid: "0X4OkPj0u0ZaqSuzGTSknT4VypG3",
      email: "tobias.holmgren@example.com",
      name: "Tobias Holmgren",
      year: 3,
      phone: "0701110010",
      address: "Miatorpsvägen 10",
    },
  ];

  const insertStudent = db.prepare(
    `
    INSERT INTO users (firebase_uid, email, name, role, year, phone, address)
    VALUES (@uid, @email, @name, 'student', @year, @phone, @address)
  `
  );

  for (const s of students) {
    insertStudent.run({
      uid: s.uid,
      email: s.email,
      name: s.name,
      year: s.year,
      phone: s.phone,
      address: s.address,
    });
  }

  console.log("✅ Seeding completed!");
} catch (err) {
  console.error("❌ Error during seeding:", err);
}
