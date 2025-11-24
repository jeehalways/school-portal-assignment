// Simple test to verify that the health endpoint works.
import { describe, it, expect, beforeAll } from "@jest/globals";
import express from "express";
import request from "supertest";
import healthRouter from "../src/routes/health";

beforeAll(async () => {
  const g: any = global;
  if (!g.__DB_INITIALIZED__) {
    await import("../src/migrations/migrate");
    await import("../src/migrations/seed");
    g.__DB_INITIALIZED__ = true;
  }
});

describe("Health route", () => {
    // Create a small Express app only for this test
  const app = express();
  app.use("/api/health", healthRouter);

  it("GET /api/health returns ok: true", async () => {
    // Send request to the route
    const res = await request(app).get("/api/health");

    // Expect correct response
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
