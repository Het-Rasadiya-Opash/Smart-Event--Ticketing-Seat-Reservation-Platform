
import bookingModel from "../models/bookings.model.js";
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