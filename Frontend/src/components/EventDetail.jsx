import {
  CalendarDays,
  Clock,
  Info,
  Layers,
  Loader2,
  MapPin,
  Tag,
  Ticket,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate, formatTime } from "../utils/utilities";
const EventDetail = ({
  selectedEvent,
  setSelectedEvent,
  detailsLoading,
  fullEventDetails,
}) => {
  return (
    <div>
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="h-64 relative bg-slate-900 shrink-0">
              {selectedEvent.bannerUrl ? (
                <img
                  src={selectedEvent.bannerUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-slate-900 flex items-center justify-center">
                  <Ticket className="w-16 h-16 text-indigo-400/40" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 border border-white/10 text-white p-2 rounded-full transition-all backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-block px-3 py-1 bg-indigo-600/80 backdrop-blur-sm rounded-full text-xs font-semibold border border-indigo-400/30 mb-3 uppercase tracking-wider">
                  {selectedEvent.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  {selectedEvent.title}
                </h2>
              </div>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-indigo-600">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Date
                    </p>
                    <p className="text-xs font-extrabold text-slate-800">
                      {formatDate(selectedEvent.startDate)}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-indigo-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Time
                    </p>
                    <p className="text-xs font-extrabold text-slate-800">
                      {formatTime(selectedEvent.startDate)}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-indigo-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      City
                    </p>
                    <p
                      className="text-xs font-extrabold text-slate-800 truncate"
                      title={selectedEvent.city}
                    >
                      {selectedEvent.city}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-500" />
                  About the Event
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedEvent.description ||
                    "No specific details provided for this event. Prepare to experience a breathtaking and professionally managed venue!"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Venue Location
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    {selectedEvent.venue}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Layout Configuration
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                    {selectedEvent.rows} rows &times;{" "}
                    {selectedEvent.seatsPerRow} seats per row (
                    {selectedEvent.analytics?.totalSeats} capacity)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  Pricing Tiers & Tickets
                </h4>

                {detailsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedEvent.pricingTiers?.map((pt) => {
                      let tierBg =
                        "bg-slate-50 text-slate-800 border-slate-200";
                      let badgeBg = "bg-slate-200 text-slate-800";
                      if (pt.tier === "VIP") {
                        tierBg = "bg-rose-50/50 text-rose-900 border-rose-100";
                        badgeBg =
                          "bg-rose-600 text-white shadow-sm shadow-rose-200";
                      } else if (pt.tier === "PREMIUM") {
                        tierBg =
                          "bg-amber-50/50 text-amber-900 border-amber-100";
                        badgeBg =
                          "bg-amber-500 text-white shadow-sm shadow-amber-200";
                      }

                      const totalSeatsInTier =
                        fullEventDetails?.seatMap?.filter(
                          (s) => s.tier === pt.tier,
                        ).length || 0;
                      const availableSeatsInTier =
                        fullEventDetails?.seatMap?.filter(
                          (s) => s.tier === pt.tier && s.status === "AVAILABLE",
                        ).length || 0;

                      return (
                        <div
                          key={pt.tier}
                          className={`border p-4 rounded-2xl transition-all ${tierBg} flex flex-col justify-between gap-3`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${badgeBg}`}
                              >
                                {pt.tier}
                              </span>
                              {fullEventDetails && (
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  {availableSeatsInTier} left
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-xs text-slate-500">
                              {pt.label || `${pt.tier} Seating`}
                            </h5>
                          </div>

                          <div className="pt-2 border-t border-slate-200/50 flex justify-between items-end">
                            <span className="text-xs text-slate-400 font-medium">
                              Price per seat
                            </span>
                            <span className="text-lg font-extrabold text-slate-900">
                              ₹{pt.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-white border border-slate-200 w-11 h-11 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {selectedEvent.organizerId?.avatar ? (
                    <img
                      src={selectedEvent.organizerId.avatar}
                      alt={selectedEvent.organizerId.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Organizer
                  </p>
                  <p className="text-sm font-extrabold text-slate-800">
                    {selectedEvent.organizerId?.username || "SmartEvent Team"}
                  </p>
                  <p className="text-xs text-slate-500 leading-none mt-0.5">
                    {selectedEvent.organizerId?.email ||
                      "support@smartevent.com"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-5 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Total Seats Available
                </span>
                <span className="text-lg font-black text-slate-800">
                  {selectedEvent.analytics?.totalSeats -
                    selectedEvent.analytics?.soldSeats -
                    selectedEvent.analytics?.heldSeats}{" "}
                  / {selectedEvent.analytics?.totalSeats} Left
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 sm:flex-initial border border-slate-300 hover:border-slate-400 text-slate-700 font-bold px-6 py-3 rounded-xl transition-all text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    toast.success(
                      "Proceeding to Interactive Seating map reservation...",
                    );
                    setSelectedEvent(null);
                  }}
                  className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Reserve Seats Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
