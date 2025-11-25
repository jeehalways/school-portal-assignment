import { Router, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const router = Router();

// Load swagger.json
const filePath = path.join(__dirname, "swagger.json");
const swaggerDoc = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Serve Swagger UI
router.use("/", swaggerUi.serve);
router.get("/", (req: Request, res: Response) => {
  res.send(swaggerUi.generateHTML(swaggerDoc));
});

export default router;
