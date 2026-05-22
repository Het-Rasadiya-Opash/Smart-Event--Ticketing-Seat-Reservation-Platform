import express from "express";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getAdminDashboardStats } from "../controllers/admin.controller.js";

const router = express.Router();

router.get(
  "/stats",
  authMiddleware,
  authorizeRole("ADMIN"),
  getAdminDashboardStats
);

export default router;
