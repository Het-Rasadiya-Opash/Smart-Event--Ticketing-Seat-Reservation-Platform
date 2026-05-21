import bookingModel from "../models/bookings.model.js";
import eventModal from "../models/events.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required to view bookings.");
  }

  const bookings = await bookingModel
    .find({ userId })
    .populate(
      "eventId",
      "title description startDate venue bannerUrl category city",
    )
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Bookings retrieved successfully."));
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { id: bookingId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required to cancel booking.");
  }

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (booking.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this booking.");
  }

  if (booking.paymentStatus === "REFUNDED") {
    throw new ApiError(
      400,
      "This booking has already been cancelled and refunded.",
    );
  }

  if (booking.paymentStatus === "FAILED") {
    throw new ApiError(400, "Cannot cancel a failed booking.");
  }

  const event = await eventModal.findById(booking.eventId);
  if (!event) {
    throw new ApiError(404, "Associated event not found.");
  }

  const now = new Date();
  if (new Date(event.startDate) <= now) {
    throw new ApiError(
      400,
      "Cannot cancel booking. The event has already started or completed.",
    );
  }

  let modified = false;
  booking.seats.forEach((bookingSeat) => {
    const seat = event.seatMap.find((s) => s.seatId === bookingSeat.seatId);
    if (seat) {
      seat.status = "AVAILABLE";
      seat.heldBy = null;
      seat.heldUntil = null;
      seat.bookingId = null;
      modified = true;
    }
  });

  event.seatMap.forEach((seat) => {
    if (
      seat.bookingId &&
      seat.bookingId.toString() === booking._id.toString()
    ) {
      seat.status = "AVAILABLE";
      seat.heldBy = null;
      seat.heldUntil = null;
      seat.bookingId = null;
      modified = true;
    }
  });

  if (modified) {
    await event.save();

    if (global.io) {
      global.io.to(booking.eventId.toString()).emit("seatsUpdated", {
        eventId: booking.eventId,
        seatMap: event.seatMap,
      });
    }
  }

  booking.paymentStatus = "REFUNDED";
  await booking.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        booking,
        "Booking successfully cancelled and tickets refunded.",
      ),
    );
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  if (user.role !== "ORGANIZER") {
    throw new ApiError(403, "You are not authorized to view these bookings.");
  }

  const { status, eventId, event } = req.query;
  const query = {};

  const organizerEvents = await eventModal
    .find({
      organizerId: user._id,
      isDeleted: { $ne: true },
    })
    .select("_id");

  const organizerEventIds = organizerEvents.map((e) => e._id);

  const filterEventId = eventId || event;
  if (filterEventId) {
    const hasAccess = organizerEventIds.some(
      (id) => id.toString() === filterEventId.toString(),
    );
    if (!hasAccess) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "Bookings retrieved successfully."));
    }
    query.eventId = filterEventId;
  } else {
    query.eventId = { $in: organizerEventIds };
  }

  if (status) {
    query.paymentStatus = status.toUpperCase();
  }

  const bookings = await bookingModel
    .find(query)
    .populate("userId", "username email avatar")
    .populate(
      "eventId",
      "title description startDate venue bannerUrl category city",
    )
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Bookings retrieved successfully."));
});
