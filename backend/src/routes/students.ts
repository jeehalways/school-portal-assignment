// CRUD student accounts
// GET /students; GET /students?year=2; GET /students/me; POST /students/:id; DELETE /students/:id
// (Only admin can modify students)
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getMe } from "../controllers/studentController";

const router = Router();

router.get("/me", authenticate, getMe);

export default router;
