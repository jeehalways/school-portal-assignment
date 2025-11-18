// Require admin
// Checks if logged-in user is admin
// If not admin return 403 Forbidden
// Used ind admin-only routes like: POST/grades; PUT/students/:id; DELETE/students/:id.
import { Request, Response, NextFunction } from "express";

/**
 * Require the user to be admin.
 * This assumes authenticate() already ran and set req.user.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = (req as any).user?.role;

  if (role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}
