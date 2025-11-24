// Test the studentController functions directly: getMe and getMyCourses.
// Pretend the user is one of the seeded students (Anna).
import { describe, it, expect, beforeAll } from "@jest/globals";
import { getMe, getMyCourses } from "../src/controllers/studentController";

// Run migrations + seed once
beforeAll(async () => {
  const g: any = global;
  if (!g.__DB_INITIALIZED__) {
    await import("../src/migrations/migrate");
    await import("../src/migrations/seed");
    g.__DB_INITIALIZED__ = true;
  }
});

// Helper to simulate Express response object
function createMockResponse() {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.body = data;
    return res;
  };
  return res;
}

describe("Student controller", () => {
  // Using one of the seeded students from seed.ts
  const studentUid = "zX9gqzUvAqPQBtml4MgiDM0tNjH3";
  const studentEmail = "anna.bergstrom@example.com";

  it("getMe returns the logged-in student's info from DB", () => {
    // Fake request with user UID
    const req: any = {
      user: {
        uid: studentUid,
      },
    };
    const res = createMockResponse();

    getMe(req, res);

    // Check that the student exists
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      email: studentEmail,
      role: "student",
    });
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("year");
  });

  it("getMyCourses returns a list of courses for the student", async () => {
    const req: any = {
      user: {
        uid: studentUid,
      },
    };
    const res = createMockResponse();

    await getMyCourses(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("courses");
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(res.body.courses.length).toBeGreaterThan(0);

    // Each course has name, year and grade (grade can be null)
    for (const c of res.body.courses) {
      expect(c).toHaveProperty("name");
      expect(c).toHaveProperty("year");
      expect(c).toHaveProperty("grade");
    }
  });
});
