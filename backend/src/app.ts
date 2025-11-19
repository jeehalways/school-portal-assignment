// Express instance
// Creates the Express application
// Here we add: Middlewake (Json, Cors); Firebase auth middleware; Routes: students, grades, courses; Error handling.
import express from "express";
import cors from "cors";

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

// Admin routes
app.use("/api/admin/students", adminStudentRouter);
app.use("/api/admin/courses", adminCoursesRouter);
app.use("/api/admin/grades", gradesRouter);

export default app;
