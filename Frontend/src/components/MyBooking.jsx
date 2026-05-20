import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import apiRequest from "../utils/apiRequest";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { CalendarDays, Ticket } from "lucide-react";
import { formatDate } from "../utils/utilities";
const MyBooking = () => {
  const { currentUser } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [verifying, setVerifying] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const isOrganizer = currentUser?.role === "ORGANIZER";

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
  }, [currentUser]);

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

  return (
    <div>
      {!isOrganizer && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Ticket className="w-4 h-4 text-green-500" />
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              My Bookings & Tickets
            </h2>
          </div>

          {loadingBookings ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Ticket className="w-12 h-12 text-slate-350 mx-auto mb-3 stroke-[1.5]" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                No Tickets Booked Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 leading-relaxed">
                You haven't purchased tickets for any events. Browse our
                upcoming events and reserve your seats!
              </p>
              <button
                onClick={() => navigate("/events")}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
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

                let statusBadge = "";
                if (isCompleted) {
                  statusBadge =
                    "bg-emerald-50 text-emerald-700 border-emerald-200";
                } else if (isFailed) {
                  statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
                } else {
                  statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                }

                const formattedDate = event?.startDate
                  ? formatDate(event.startDate)
                  : "N/A";

                return (
                  <div
                    key={booking._id}
                    className="border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow bg-white"
                  >
                    {/* Left: Event Banner */}
                    <div className="md:w-44 h-36 md:h-auto relative bg-slate-100 shrink-0">
                      {event?.bannerUrl ? (
                        <img
                          src={event.bannerUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900/10 text-slate-400 font-bold uppercase tracking-widest text-xs">
                          {event?.category || "EVENT"}
                        </div>
                      )}
                      <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider bg-slate-900/70 backdrop-blur-md text-white px-2 py-0.5 rounded-md">
                        {event?.category || "General"}
                      </span>
                    </div>

                    <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug truncate max-w-md">
                            {event?.title || "Unknown Event"}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                            {formattedDate} • {event?.venue}, {event?.city}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${statusBadge}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">
                            Seats Booked ({booking.seats.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {booking.seats.map((s) => (
                              <span
                                key={s.seatId}
                                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-700"
                              >
                                {s.seatId}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="sm:text-right shrink-0">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-0.5">
                            Total Paid
                          </span>
                          <span className="text-base font-black text-slate-900">
                            ₹{booking.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBooking;
