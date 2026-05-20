import express from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getMyBookings } from "../controllers/bookings.controller.js";
const router = express.Router();

router.get("/", authMiddleware, getMyBookings);

export default router;
