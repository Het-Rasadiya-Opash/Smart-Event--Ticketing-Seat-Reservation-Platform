import express from "express";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  eventFetchByOrganizer,
} from "../controllers/events.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRole("ORGANIZER"),
  upload.single("bannerUrl"),
  createEvent,
);

router.get("/", getEvents);

router.get(
  "/organizer",
  authMiddleware,
  authorizeRole("ORGANIZER"),
  eventFetchByOrganizer,
);

router.get("/:id", getEventById);

router.patch(
  "/update/:id",
  authMiddleware,
  authorizeRole("ORGANIZER"),
  upload.single("bannerUrl"),
  updateEvent,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeRole("ORGANIZER"),
  deleteEvent,
);

export default router;
