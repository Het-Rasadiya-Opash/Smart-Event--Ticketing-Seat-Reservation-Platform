import eventModal from "../models/events.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    city,
    venue,
    bannerUrl,
    startDate,
    endDate,
    saleWindowStart,
    saleWindowEnd,
    rows,
    seatsPerRow,
    pricingTiers,
  } = req.body;

  if (
    !title ||
    !category ||
    !city ||
    !venue ||
    !startDate ||
    !rows ||
    !seatsPerRow
  ) {
    throw new ApiError(400, "Please provide all required fields");
  }

  const numRows = parseInt(rows, 10);
  const numSeatsPerRow = parseInt(seatsPerRow, 10);

  if (isNaN(numRows) || numRows < 1 || numRows > 26) {
    throw new ApiError(400, "Rows must be a number between 1 and 26");
  }

  if (isNaN(numSeatsPerRow) || numSeatsPerRow < 1 || numSeatsPerRow > 500) {
    throw new ApiError(400, "Seats per row must be between 1 and 500");
  }

  let parsedPricingTiers = [];
  if (pricingTiers) {
    try {
      parsedPricingTiers =
        typeof pricingTiers === "string"
          ? JSON.parse(pricingTiers)
          : pricingTiers;
    } catch {
      throw new ApiError(400, "Invalid pricingTiers format");
    }
  }

  const seatMap = eventModal.buildSeatMap(
    numRows,
    numSeatsPerRow,
    parsedPricingTiers,
  );

  let finalBannerUrl = bannerUrl || null;
  const bannerLocalPath =
    req.file?.path ||
    (req.files && req.files.bannerUrl && req.files.bannerUrl[0]?.path);

  if (bannerLocalPath) {
    const bannerUpload = await uploadOnCloudinary(bannerLocalPath);
    if (!bannerUpload) {
      throw new ApiError(
        500,
        "Error while uploading banner image to Cloudinary",
      );
    }
    finalBannerUrl = bannerUpload.url;
  }

  const newEvent = await eventModal.create({
    title,
    description,
    category,
    city,
    venue,
    bannerUrl: finalBannerUrl,
    organizerId: req.user?._id,
    startDate,
    endDate,
    saleWindowStart,
    saleWindowEnd,
    rows: numRows,
    seatsPerRow: numSeatsPerRow,
    pricingTiers: parsedPricingTiers,
    seatMap,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newEvent, "Event created successfully"));
});

export const getEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    city,
    searchTerm,
    status,
  } = req.query;

  const query = { isDeleted: { $ne: true } };

  if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (city) {
    query.city = { $regex: city, $options: "i" };
  }

  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { venue: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const events = await eventModal
    .find(query)
    .select("-seatMap")
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("organizerId", "username email avatar");

  const totalEvents = await eventModal.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        events,
        totalEvents,
        totalPages: Math.ceil(totalEvents / limitNumber),
        currentPage: pageNumber,
      },
      "Events retrieved successfully",
    ),
  );
});

export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await eventModal
    .findById(id)
    .populate("organizerId", "username email avatar");

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event retrieved successfully"));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    city,
    venue,
    bannerUrl,
    startDate,
    endDate,
    saleWindowStart,
    saleWindowEnd,
    rows,
    seatsPerRow,
    pricingTiers,
    status,
  } = req.body;

  const event = await eventModal.findById(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.organizerId.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this event");
  }

  let finalBannerUrl = bannerUrl || event.bannerUrl;
  const bannerLocalPath =
    req.file?.path ||
    (req.files && req.files.bannerUrl && req.files.bannerUrl[0]?.path);

  if (bannerLocalPath) {
    const bannerUpload = await uploadOnCloudinary(bannerLocalPath);
    if (!bannerUpload) {
      throw new ApiError(
        500,
        "Error while uploading banner image to Cloudinary",
      );
    }
    finalBannerUrl = bannerUpload.url;
  }

  if (title) event.title = title;
  if (description !== undefined) event.description = description;
  if (category) event.category = category;
  if (city) event.city = city;
  if (venue) event.venue = venue;
  if (startDate) event.startDate = startDate;
  if (endDate) event.endDate = endDate;
  if (saleWindowStart) event.saleWindowStart = saleWindowStart;
  if (saleWindowEnd) event.saleWindowEnd = saleWindowEnd;
  if (status) event.status = status;

  event.bannerUrl = finalBannerUrl;

  if (pricingTiers) {
    try {
      event.pricingTiers =
        typeof pricingTiers === "string"
          ? JSON.parse(pricingTiers)
          : pricingTiers;
    } catch (error) {
      throw new ApiError(400, "Invalid pricingTiers format");
    }
  }

  if (rows || seatsPerRow) {
    if (event.status !== "DRAFT") {
      throw new ApiError(
        400,
        "Cannot modify seating configuration (rows/seats) unless the event is in DRAFT status",
      );
    }

    const numRows = rows ? parseInt(rows, 10) : event.rows;
    const numSeatsPerRow = seatsPerRow
      ? parseInt(seatsPerRow, 10)
      : event.seatsPerRow;

    if (isNaN(numRows) || numRows < 1 || numRows > 26) {
      throw new ApiError(400, "Rows must be a number between 1 and 26");
    }

    if (isNaN(numSeatsPerRow) || numSeatsPerRow < 1 || numSeatsPerRow > 500) {
      throw new ApiError(400, "Seats per row must be between 1 and 500");
    }

    event.rows = numRows;
    event.seatsPerRow = numSeatsPerRow;

    event.seatMap = eventModal.buildSeatMap(
      numRows,
      numSeatsPerRow,
      event.pricingTiers,
    );
  } else if (pricingTiers && event.status === "DRAFT") {
    event.seatMap = eventModal.buildSeatMap(
      event.rows,
      event.seatsPerRow,
      event.pricingTiers,
    );
  }

  const updatedEvent = await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await eventModal.findById(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.organizerId.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this event");
  }

  event.isDeleted = true;
  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Event deleted successfully"));
});

export const manageStatusEvents = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"];
  if (!status || !VALID_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Status must be one of: ${VALID_STATUSES.join(", ")}`,
    );
  }

  const event = await eventModal.findById(id);
  if (!event) throw new ApiError(404, "Event not found");

  if (event.organizerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this event");
  }

  event.status = status;
  await event.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { _id: event._id, status: event.status },
        "Event status updated successfully",
      ),
    );
});

export const eventFetchByOrganizer = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const events = await eventModal
    .find({ organizerId, isDeleted: { $ne: true } })
    .select("-seatMap")
    .sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, events, "Events fetched successfully"));
});
