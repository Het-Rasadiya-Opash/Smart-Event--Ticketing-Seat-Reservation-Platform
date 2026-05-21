import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import apiRequest from "../utils/apiRequest";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  Ticket,
  Trash2,
  ArrowLeft,
  BadgeInfo,
} from "lucide-react";
import { formatDate } from "../utils/utilities";
import CancelBooking from "./CancelBooking";

const MyBooking = () => {
  const { currentUser } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [verifying, setVerifying] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [bookingToCancel, setBookingToCancel] = useState(null);

  const isOrganizer = currentUser?.role === "ORGANIZER";
  const isFullPage = location.pathname === "/bookings";

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      const verifyPayment = async () => {
        setVerifying(true);
        try {
          const res = await apiRequest.post("/payment/verify-session", {
            sessionId,
          });
          if (res.data?.success) {
            toast.success(
              "Payment successfully verified and booking completed!",
            );
          } else {
            toast.error("Payment verification failed.");
          }
        } catch (err) {
          console.error("Verification error:", err);
          toast.error(
            err.response?.data?.message || "Payment verification failed.",
          );
        } finally {
          setVerifying(false);
          setSearchParams({}, { replace: true });
          fetchBookings();
        }
      };
      verifyPayment();
    } else if (payment === "cancelled") {
      toast.error("Payment cancelled.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchBookings = async () => {
    if (!currentUser || currentUser.role === "ORGANIZER") return;
    setLoadingBookings(true);
    try {
      const res = await apiRequest.get("/bookings");
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      toast.error("Could not fetch your booking history.");
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== "ORGANIZER") {
      fetchBookings();
    }
    ``;
  }, [currentUser]);

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
  };

  if (verifying) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
        <div className="bg-slate-800 p-8 rounded-3xl border border-white/10 flex flex-col items-center shadow-2xl animate-in zoom-in-95 max-w-sm text-center">
          <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-black tracking-tight mb-2">
            Verifying Transaction
          </h2>
          <p className="text-sm text-slate-400">
            Please wait while we confirm your tickets and reserve your seats...
          </p>
        </div>
      </div>
    );
  }

  const renderBookingsContent = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 space-y-6">
        {!isFullPage && (
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Ticket className="w-5 h-5 text-green-600" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              My Bookings & Tickets
            </h2>
          </div>
        )}

        {loadingBookings ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-slate-400 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No Tickets Booked Yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              You haven't purchased tickets for any events. Browse our upcoming
              events and reserve your seats!
            </p>
            <button
              onClick={() => navigate("/events")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const event = booking.eventId;
              const isCompleted = booking.paymentStatus === "COMPLETED";
              const isFailed = booking.paymentStatus === "FAILED";
              const isRefunded = booking.paymentStatus === "REFUNDED";

              let statusBadge = "";
              let statusLabel = booking.paymentStatus;
              if (isCompleted) {
                statusBadge =
                  "bg-emerald-50 text-emerald-700 border-emerald-200";
              } else if (isFailed) {
                statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
              } else if (isRefunded) {
                statusBadge = "bg-red-50 text-red-600 border-red-200";
                statusLabel = "CANCELLED & REFUNDED";
              } else {
                statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
              }

              const formattedDate = event?.startDate
                ? formatDate(event.startDate)
                : "N/A";

              const isEventFuture =
                event?.startDate && new Date(event.startDate) > new Date();
              const canCancel =
                isEventFuture &&
                ["COMPLETED", "PENDING"].includes(booking.paymentStatus);

              return (
                <div
                  key={booking._id}
                  className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all duration-300 bg-white group hover:border-slate-300"
                >
                  <div className="md:w-52 h-40 md:h-auto relative bg-slate-100 shrink-0 overflow-hidden">
                    {event?.bannerUrl ? (
                      <img
                        src={event.bannerUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900/10 text-slate-400 font-bold uppercase tracking-widest text-xs">
                        {event?.category || "EVENT"}
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider bg-slate-900/75 backdrop-blur-md text-white px-2.5 py-1 rounded-lg">
                      {event?.category || "General"}
                    </span>
                  </div>

                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950 leading-snug group-hover:text-green-700 transition-colors">
                          {event?.title || "Unknown Event"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
                          <CalendarDays className="w-4 h-4 shrink-0 text-slate-400" />
                          {formattedDate} • {event?.venue}, {event?.city}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border tracking-wider ${statusBadge}`}
                        >
                          {statusLabel}
                        </span>
                        {!isEventFuture && !isRefunded && (
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                            <BadgeInfo className="w-3 h-3 text-slate-400" />{" "}
                            Event has started
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-200/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1.5">
                          Seats Booked ({booking.seats.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {booking.seats.map((s) => (
                            <span
                              key={s.seatId}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm"
                            >
                              {s.seatId}{" "}
                              <span className="text-[10px] text-slate-450 font-normal">
                                ({s.tier})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-start sm:gap-6 shrink-0 border-t border-slate-150 sm:border-0 pt-3 sm:pt-0">
                        <div className="sm:text-right">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-0.5">
                            Total Paid
                          </span>
                          <span className="text-lg font-black text-slate-900">
                            ₹{booking.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                        {canCancel && (
                          <button
                            onClick={() => handleCancelClick(booking)}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancel Tickets
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={isFullPage ? "min-h-screen bg-slate-50 pb-20" : ""}>
      {isFullPage && (
        <div className="relative bg-slate-900 overflow-hidden py-12 shadow-inner">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider mb-4 transition-colors focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Ticket className="w-8 h-8 text-green-500" />
                  My Booking History
                </h1>
              </div>
              <button
                onClick={() => navigate("/events")}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95 shrink-0"
              >
                Browse Events
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={isFullPage ? "max-w-4xl mx-auto px-4 sm:px-6 mt-8" : ""}>
        {!isOrganizer && renderBookingsContent()}
      </div>

      <CancelBooking
        booking={bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        onSuccess={() => {
          setBookingToCancel(null);
          fetchBookings();
        }}
      />
    </div>
  );
};

export default MyBooking;
