import eventModal from "../models/events.models.js";
import bookingModel from "../models/bookings.model.js";
import userModel from "../models/users.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const [totalEvents, totalBookings, usersCount, bookings] = await Promise.all([
    eventModal.countDocuments({ isDeleted: { $ne: true } }),
    bookingModel.countDocuments(),
    userModel.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]),
    bookingModel
      .find()
      .populate("userId", "username email")
      .populate("eventId", "title"),
  ]);

  const userStats = {
    CUSTOMER: 0,
    ORGANIZER: 0,
    ADMIN: 0,
  };
  usersCount.forEach((item) => {
    if (userStats[item._id] !== undefined) {
      userStats[item._id] = item.count;
    }
  });
  const totalUsers = Object.values(userStats).reduce((a, b) => a + b, 0);

  const completedBookings = bookings.filter(
    (b) => b.paymentStatus === "COMPLETED",
  );
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + b.totalAmount,
    0,
  );

  const events = await eventModal
    .find({ isDeleted: { $ne: true } })
    .populate("organizerId", "username email avatar")
    .lean();

  const eventDetails = events.map((event) => {
    const totalSeats = event.seatMap ? event.seatMap.length : 0;
    const soldSeats = event.seatMap
      ? event.seatMap.filter((s) => s.status === "SOLD").length
      : 0;
    const heldSeats = event.seatMap
      ? event.seatMap.filter((s) => s.status === "HELD").length
      : 0;
    const availableSeats = totalSeats - soldSeats - heldSeats;
    const revenue = event.seatMap
      ? event.seatMap
          .filter((s) => s.status === "SOLD")
          .reduce((sum, s) => sum + s.price, 0)
      : 0;

    return {
      _id: event._id,
      title: event.title,
      category: event.category,
      status: event.status,
      venue: event.venue,
      city: event.city,
      startDate: event.startDate,
      organizer: event.organizerId || { username: "N/A", email: "N/A" },
      totalSeats,
      soldSeats,
      heldSeats,
      availableSeats,
      revenue,
    };
  });

  const organizers = await userModel.find({ role: "ORGANIZER" }).lean();
  const organizerDetails = organizers.map((org) => {
    const orgEvents = eventDetails.filter(
      (e) => e.organizer?._id?.toString() === org._id.toString(),
    );
    const eventsCreated = orgEvents.length;
    const totalRevenueGenerated = orgEvents.reduce(
      (sum, e) => sum + e.revenue,
      0,
    );
    const ticketsSold = orgEvents.reduce((sum, e) => sum + e.soldSeats, 0);

    return {
      _id: org._id,
      username: org.username,
      email: org.email,
      avatar: org.avatar,
      eventsCreated,
      totalRevenueGenerated,
      ticketsSold,
    };
  });

  const categoryStatsMap = {};
  eventDetails.forEach((e) => {
    const category = e.category || "OTHER";
    if (!categoryStatsMap[category]) {
      categoryStatsMap[category] = { count: 0, revenue: 0, ticketsSold: 0 };
    }
    categoryStatsMap[category].count += 1;
    categoryStatsMap[category].revenue += e.revenue;
    categoryStatsMap[category].ticketsSold += e.soldSeats;
  });
  const categoryStats = Object.keys(categoryStatsMap).map((cat) => ({
    category: cat,
    ...categoryStatsMap[cat],
  }));

  const trendsMap = {};
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    trendsMap[key] = {
      month: key,
      bookingsCount: 0,
      revenue: 0,
      timestamp: d.getTime(),
    };
  }

  completedBookings.forEach((b) => {
    const date = new Date(b.bookingDate || b.createdAt);
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    if (trendsMap[key]) {
      trendsMap[key].bookingsCount += 1;
      trendsMap[key].revenue += b.totalAmount;
    }
  });

  const trends = Object.values(trendsMap).sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  const bookingDetails = bookings.map((b) => ({
    _id: b._id,
    eventTitle: b.eventId?.title || "Deleted Event",
    customerName: b.userId?.username || "Deleted User",
    customerEmail: b.userId?.email || "N/A",
    seatsCount: b.seats.length,
    seatIds: b.seats.map((s) => s.seatId).join(", "),
    totalAmount: b.totalAmount,
    paymentStatus: b.paymentStatus,
    bookingDate: b.bookingDate || b.createdAt,
  }));

  const topEvents = [...eventDetails]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalEvents,
          totalBookings,
          totalUsers,
          totalRevenue,
          userStats,
        },
        eventDetails,
        organizerDetails,
        bookingDetails,
        categoryStats,
        trends,
        topEvents,
      },
      "Admin stats fetched successfully",
    ),
  );
});
