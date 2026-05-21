import express from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import {
  getMyBookings,
  cancelBooking,
  getAllBookings,
} from "../controllers/bookings.controller.js";
const router = express.Router();

router.get("/", authMiddleware, getMyBookings);
router.get("/all", authMiddleware, authorizeRole("ORGANIZER"), getAllBookings);
router.post("/:id/cancel", authMiddleware, cancelBooking);

export default router;

