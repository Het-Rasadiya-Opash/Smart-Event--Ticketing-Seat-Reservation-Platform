import express from "express";
import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/users.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, getMe);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

export default router;
