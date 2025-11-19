import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";
import db from "../config/db";

const router = Router();

router.get("/", authenticate, requireAdmin, (_req, res) => {
  const courses = db
    .prepare(`SELECT id, name, year FROM courses ORDER BY year, name`)
    .all();

  res.json({ courses });
});

export default router;
