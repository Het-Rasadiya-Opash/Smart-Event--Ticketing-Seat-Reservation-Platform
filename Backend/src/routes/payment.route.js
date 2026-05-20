import express from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createPayment,
  verifySession,
} from "../controllers/payment.controller.js";
const router = express.Router();

router.post("/create-checkout-session", authMiddleware, createPayment);
router.post("/verify-session", authMiddleware, verifySession);

export default router;
