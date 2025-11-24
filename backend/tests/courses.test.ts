// Use adminCoursesController (not the router) for a simple CRUD lifecyrcle.
import { describe, it, expect, beforeAll } from "@jest/globals";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../src/controllers/adminCoursesController";

// Run DB setup
beforeAll(async () => {
  const g: any = global;
  if (!g.__DB_INITIALIZED__) {
    await import("../src/migrations/migrate");
    await import("../src/migrations/seed");
    g.__DB_INITIALIZED__ = true;
  }
});

// Simple Express-like response mock
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

describe("Admin courses controller", () => {
  it("can list courses", () => {
    const res = createMockResponse();
    getCourses({} as any, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("courses");
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(res.body.courses.length).toBeGreaterThan(0);
  });

  it("can create, read, update and delete a course", () => {
    // Create course
    const createReq: any = {
      body: {
        name: "Test Course",
        year: 2,
      },
    };
    const createRes = createMockResponse();

    createCourse(createReq, createRes);

    expect(createRes.statusCode).toBe(201);
    const createdId = Number(createRes.body.id);
    expect(createdId).toBeGreaterThan(0);
    expect(createRes.body).toMatchObject({
      name: "Test Course",
      year: 2,
    });

    // Read course by ID
    const getReq: any = { params: { id: String(createdId) } };
    const getRes = createMockResponse();

    getCourseById(getReq, getRes);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body).toMatchObject({
      id: createdId,
      name: "Test Course",
      year: 2,
    });

    // Update course
    const updateReq: any = {
      params: { id: String(createdId) },
      body: {
        name: "Updated Test Course",
        year: 2,
      },
    };
    const updateRes = createMockResponse();

    updateCourse(updateReq, updateRes);
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toMatchObject({
      id: createdId,
      name: "Updated Test Course",
      year: 2,
    });

    // Verify update by reading again
    const getAfterUpdateRes = createMockResponse();
    getCourseById(getReq, getAfterUpdateRes);

    expect(getAfterUpdateRes.statusCode).toBe(200);
    expect(getAfterUpdateRes.body).toMatchObject({
      id: createdId,
      name: "Updated Test Course",
      year: 2,
    });

    // Delete course
    const deleteReq: any = { params: { id: String(createdId) } };
    const deleteRes = createMockResponse();
    deleteCourse(deleteReq, deleteRes);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toEqual({ success: true });

    // Verify deletion (should give 404)
    const getAfterDeleteRes = createMockResponse();
    getCourseById(getReq, getAfterDeleteRes);
    expect(getAfterDeleteRes.statusCode).toBe(404);
  });
});
