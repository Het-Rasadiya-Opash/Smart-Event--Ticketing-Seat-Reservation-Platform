import React, { useState, useEffect } from "react";
import apiRequest from "../utils/apiRequest";
import { formatDate } from "../utils/utilities";
import {
  Ticket,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarDays,
  Layers,
  RefreshCw,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

const OrganizerGetAllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedEventId, setSelectedEventId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await apiRequest.get("/events/organizer");
      if (res.data?.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setError("");
    try {
      const params = {};
      if (selectedStatus !== "ALL") {
        params.status = selectedStatus;
      }
      if (selectedEventId !== "ALL") {
        params.eventId = selectedEventId;
      }

      const res = await apiRequest.get("/bookings/all", { params });
      if (res.data?.success) {
        setBookings(res.data.data);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.response?.data?.message || "Failed to fetch bookings.");
      toast.error("Could not fetch bookings.");
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus, selectedEventId]);

  const filteredBookings = bookings.filter((booking) => {
    const username = booking.userId?.username?.toLowerCase() || "";
    const email = booking.userId?.email?.toLowerCase() || "";
    const eventTitle = booking.eventId?.title?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return (
      username.includes(query) ||
      email.includes(query) ||
      eventTitle.includes(query) ||
      booking._id.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "REFUNDED":
        return "bg-red-50 text-red-600 border-red-200";
      case "PENDING":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getSeatStyle = (tier) => {
    switch (tier?.toUpperCase()) {
      case "VIP":
        return "bg-rose-50 text-rose-700 border-rose-250";
      case "PREMIUM":
        return "bg-amber-50 text-amber-700 border-amber-250";
      case "STANDARD":
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-2.5">
            <div className=" p-2 rounded-xl ">
              <Layers className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Booking Management
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchEvents();
                fetchBookings();
              }}
              className="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1 rounded-full">
              {bookings.length} Total Bookings
            </span>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, event, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-500 transition-all font-medium"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-500 transition-all appearance-none cursor-pointer font-medium text-slate-700"
            >
              <option value="ALL">All Events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-500 transition-all appearance-none cursor-pointer font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="REFUNDED">Refunded / Cancelled</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="m-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {loadingBookings ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin font-medium"></div>
            <p className="text-sm text-slate-400 font-medium">
              Loading bookings data...
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-slate-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-7 h-7 text-slate-400 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No Bookings Found
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              No matching ticket purchases were found for the selected filter
              criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Customer Info
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Event Info
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Seats Reserved
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Amount Paid
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Booking Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBookings.map((booking) => {
                  const customer = booking.userId;
                  const event = booking.eventId;

                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={customer?.avatar || "/default-avatar.png"}
                            alt={customer?.username || "User"}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${customer?.username || "U"}`;
                            }}
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-green-600 transition-colors">
                              {customer?.username || "Deleted User"}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {customer?.email || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800 line-clamp-1 max-w-[200px]">
                            {event?.title || "Deleted Event"}
                          </p>
                          <p className="text-xs text-slate-450 mt-0.5 flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                            {event?.startDate
                              ? formatDate(event.startDate)
                              : "N/A"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {booking.seats?.map((seat) => (
                            <span
                              key={seat.seatId}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border shadow-sm ${getSeatStyle(
                                seat.tier,
                              )}`}
                            >
                              {seat.seatId}
                              <span className="text-[9px] opacity-75 font-normal ml-0.5">
                                ({seat.tier})
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-slate-800">
                          ₹{booking.totalAmount?.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getStatusStyle(
                            booking.paymentStatus,
                          )}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-600">
                          {formatDate(booking.bookingDate || booking.createdAt)}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loadingBookings && filteredBookings.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 gap-4">
            <span className="text-xs text-slate-500 font-semibold">
              Showing{" "}
              <span className="text-slate-800">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="text-slate-800">
                {Math.min(currentPage * itemsPerPage, filteredBookings.length)}
              </span>{" "}
              of{" "}
              <span className="text-slate-800">{filteredBookings.length}</span>{" "}
              bookings
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 text-slate-400 hover:text-green-600 disabled:text-slate-300 hover:bg-white disabled:hover:bg-transparent border border-slate-200 disabled:border-slate-100 rounded-xl transition-all shadow-sm disabled:shadow-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 text-xs font-bold rounded-xl border transition-all ${
                      currentPage === page
                        ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-600/10"
                        : "bg-white border-slate-200 text-slate-600 hover:text-green-600 hover:border-green-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 text-slate-400 hover:text-green-600 disabled:text-slate-300 hover:bg-white disabled:hover:bg-transparent border border-slate-200 disabled:border-slate-100 rounded-xl transition-all shadow-sm disabled:shadow-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerGetAllBookings;
