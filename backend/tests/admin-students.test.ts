// Test the adminStudentCOntroller (not the router) with a full CRUD flow.
import { describe, it, expect, beforeAll } from "@jest/globals";
import {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../src/controllers/adminStudentController";

// Run DB setup once
beforeAll(async () => {
  const g: any = global;
  if (!g.__DB_INITIALIZED__) {
    await import("../src/migrations/migrate");
    await import("../src/migrations/seed");
    g.__DB_INITIALIZED__ = true;
  }
});

// Minimal mock Express res object
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

describe("Admin student controller", () => {
  it("can list, create, read, update and delete a student", () => {
    // List existing students
    const listRes = createMockResponse();
    getAllStudents({} as any, listRes);
    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body.students)).toBe(true);

    // Create a new student
    const uniqueUid = `test-student-${Date.now()}`;
    const createReq: any = {
      body: {
        firebaseUid: uniqueUid,
        email: "test.student@example.com",
        name: "Test Student",
        role: "student",
        year: 1,
        phone: "0700000000",
        address: "Testgatan 1",
      },
    };
    const createRes = createMockResponse();

    createStudent(createReq, createRes);

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toHaveProperty("student");
    const createdId = Number(createRes.body.student.id);
    expect(createdId).toBeGreaterThan(0);

    // Read the student by ID
    const getReq: any = {
      params: {
        id: String(createdId),
      },
    };
    const getRes = createMockResponse();

    getStudent(getReq, getRes);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.student).toMatchObject({
      email: "test.student@example.com",
      name: "Test Student",
      year: 1,
    });

    // Update the student
    const updateReq: any = {
      params: { id: String(createdId) },
      body: {
        name: "Updated Student",
        phone: "0701234567",
      },
    };
    const updateRes = createMockResponse();

    updateStudent(updateReq, updateRes);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toEqual({ message: "Student updated" });

    // Verify the update
    const getAfterUpdateRes = createMockResponse();
    getStudent(getReq, getAfterUpdateRes);
    expect(getAfterUpdateRes.statusCode).toBe(200);
    expect(getAfterUpdateRes.body.student).toMatchObject({
      name: "Updated Student",
      phone: "0701234567",
    });

    // Delete the student
    const deleteReq: any = {
      params: { id: String(createdId) },
    };
    const deleteRes = createMockResponse();

    deleteStudent(deleteReq, deleteRes);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toEqual({ message: "Student deleted" });

    // Verify deletion (should return 404)
    const getAfterDeleteRes = createMockResponse();
    getStudent(getReq, getAfterDeleteRes);
    expect(getAfterDeleteRes.statusCode).toBe(404);
  });
});
