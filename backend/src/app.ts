// Express instance
// Creates the Express application
// Here we add: Middlewake (Json, Cors); Firebase auth middleware; Routes: students, grades, courses; Error handling.
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import studentRouter from "./routes/students";

const app = express();

app.use(cors());
app.use(express.json());

// Basic route
app.use("/api/health", healthRouter);
app.use("/api/students", studentRouter);

export default app;
