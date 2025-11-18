// CRUD student accounts
// GET /students; GET /students?year=2; GET /students/me; POST /students/:id; DELETE /students/:id
// (Only admin can modify students)
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getMe, getMyCourses } from "../controllers/studentController";

const router = Router();

router.get("/me", authenticate, getMe);
router.get("/me/courses", authenticate, getMyCourses);
export default router;
