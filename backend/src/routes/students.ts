// CRUD student accounts
// GET /students; GET /students?year=2; GET /students/me; POST /students/:id; DELETE /students/:id
// (Only admin can modify students)
import { Router } from "express";
import { authenticate } from "../middleware/auth";

const router = Router();

// TEMP STATIC DB until we create real DB
const FAKE_USERS = [
  { firebase_uid: "ADMIN_UID", role: "admin", name: "Admin User" },
  { firebase_uid: "STUDENT_UID", role: "student", name: "Student User" },
];

router.get("/me", authenticate, (req: any, res) => {
  const uid = req.user.uid;

  const user = FAKE_USERS.find((u) => u.firebase_uid === uid);

  if (!user) {
    return res.status(404).json({ error: "User not found in database" });
  }

  res.json(user);
});

export default router;
