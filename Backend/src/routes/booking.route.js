import express from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getMyBookings, cancelBooking } from "../controllers/bookings.controller.js";
const router = express.Router();

router.get("/", authMiddleware, getMyBookings);
router.post("/:id/cancel", authMiddleware, cancelBooking);

export default router;
