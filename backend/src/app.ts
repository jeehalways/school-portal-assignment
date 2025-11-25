import express from "express";
import cors from "cors";
import SwaggerRouter from "./swaggerRouter";

import healthRouter from "./routes/health";
import studentRouter from "./routes/students";
import adminStudentRouter from "./routes/admin-students";
import adminCoursesRouter from "./routes/admin-courses";
import gradesRouter from "./routes/grades";

const app = express();

app.use(cors());
app.use(express.json());

// Basic route
app.use("/api/health", healthRouter);
app.use("/api/students", studentRouter);
app.use("/api/docs", SwaggerRouter);
// Admin routes
app.use("/api/admin/students", adminStudentRouter);
app.use("/api/admin/courses", adminCoursesRouter);
app.use("/api/admin/grades", gradesRouter);

export default app;
