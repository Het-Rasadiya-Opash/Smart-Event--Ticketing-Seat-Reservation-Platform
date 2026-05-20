import Stripe from "stripe";

import bookingModel from "../models/bookings.model.js";
import eventModal from "../models/events.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = asyncHandler(async (req, res) => {
  const { eventId, seatIds } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(
      401,
      "Authentication required to create a payment session.",
    );
  }

  if (!eventId) {
    throw new ApiError(400, "Event ID is required.");
  }

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    throw new ApiError(400, "Please select at least one seat to book.");
  }

  const event = await eventModal.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found.");
  }

  const now = new Date();
  const seatsToPay = [];
  const invalidSeats = [];

  for (const seatId of seatIds) {
    const seat = event.seatMap.find((s) => s.seatId === seatId);
    if (!seat) {
      throw new ApiError(404, `Seat ${seatId} does not exist in this event.`);
    }

    const isHeldByMe =
      seat.status === "HELD" && seat.heldBy?.toString() === userId.toString();
    const isExpired = seat.heldUntil && new Date(seat.heldUntil) < now;

    if (!isHeldByMe || isExpired) {
      invalidSeats.push(seatId);
    } else {
      seatsToPay.push(seat);
    }
  }

  if (invalidSeats.length > 0) {
    throw new ApiError(
      400,
      `Hold expired or invalid for seats: ${invalidSeats.join(", ")}. Please hold them again.`,
    );
  }

  const totalAmount = seatsToPay.reduce((sum, seat) => sum + seat.price, 0);

  const lineItems = seatsToPay.map((seat) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: `${event.title} - Seat ${seat.seatId}`,
        description: `Row ${seat.row}, Seat ${seat.number} (${seat.tier} Tier)`,
      },
      unit_amount: seat.price * 100,
    },
    quantity: 1,
  }));

  const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const successUrl = `${frontendUrl}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${frontendUrl}/events?payment=cancelled`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      eventId: eventId,
      seatIds: JSON.stringify(seatIds),
    },
  });

  await bookingModel.create({
    userId,
    eventId,
    seats: seatsToPay.map((s) => ({
      seatId: s.seatId,
      row: s.row,
      number: s.number,
      tier: s.tier,
      price: s.price,
    })),
    totalAmount,
    paymentStatus: "PENDING",
    paymentIntentId: session.id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { sessionId: session.id, url: session.url },
        "Stripe checkout session created successfully.",
      ),
    );
});

export const verifySession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    throw new ApiError(400, "Stripe session ID is required.");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) {
    throw new ApiError(404, "Stripe session not found.");
  }

  const booking = await bookingModel.findOne({ paymentIntentId: sessionId });
  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (booking.paymentStatus === "COMPLETED") {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          booking,
          "Payment already verified and booking completed.",
        ),
      );
  }

  if (booking.paymentStatus === "FAILED") {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          booking,
          "Payment verification failed, booking status is FAILED.",
        ),
      );
  }

  if (session.payment_status !== "paid") {
    booking.paymentStatus = "FAILED";
    await booking.save();

    const event = await eventModal.findById(booking.eventId);
    if (event) {
      let modified = false;
      booking.seats.forEach((bookingSeat) => {
        const seat = event.seatMap.find((s) => s.seatId === bookingSeat.seatId);
        if (
          seat &&
          seat.status === "HELD" &&
          seat.heldBy?.toString() === booking.userId.toString()
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
    }

    throw new ApiError(
      400,
      "Payment has not been completed or failed for this session.",
    );
  }

  const event = await eventModal.findById(booking.eventId);
  if (!event) {
    throw new ApiError(404, "Event not found for this booking.");
  }

  let modified = false;
  booking.seats.forEach((bookingSeat) => {
    const seat = event.seatMap.find((s) => s.seatId === bookingSeat.seatId);
    if (seat) {
      seat.status = "SOLD";
      seat.heldBy = null;
      seat.heldUntil = null;
      seat.bookingId = booking._id;
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

  booking.paymentStatus = "COMPLETED";
  if (session.payment_intent) {
    booking.paymentIntentId = session.payment_intent;
  }
  await booking.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        booking,
        "Payment successfully verified and booking completed!",
      ),
    );
});
