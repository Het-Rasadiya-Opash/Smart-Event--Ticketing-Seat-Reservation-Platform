import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import apiRequest from "../utils/apiRequest";
import { formatDate, formatTime } from "../utils/utilities";
import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Plus,
  Layers,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  BadgeCheck,
  CircleDashed,
  Ban,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    icon: CircleDashed,
    cls: "text-slate-600 bg-slate-100 border-slate-200",
  },
  PUBLISHED: {
    label: "Published",
    icon: BadgeCheck,
    cls: "text-green-700 bg-green-50 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    cls: "text-red-600 bg-red-50 border-red-200",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    cls: "text-blue-600 bg-blue-50 border-blue-200",
  },
};

const STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"];

const OrganizerEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusLoading, setStatusLoading] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiRequest.get("/events/organizer");
        setEvents(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch events.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleStatusChange = async (eventId, newStatus) => {
    setStatusLoading(eventId);
    try {
      await apiRequest.patch(`/events/status/${eventId}`, { status: newStatus });
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setStatusLoading(null);
    }
  };

  const totalSeats = events.reduce(
    (s, e) => s + (e.analytics?.totalSeats || 0),
    0,
  );
  const totalSold = events.reduce(
    (s, e) => s + (e.analytics?.soldSeats || 0),
    0,
  );
  const totalRevenue = events.reduce(
    (s, e) => s + (e.analytics?.totalRevenue || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-green-500" />
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              My Events
            </h2>
            {!loading && (
              <span className="ml-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2 py-0.5 rounded-full">
                {events.length}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate("/create-event")}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-md shadow-green-600/10"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Event
          </button>
        </div>

        {!loading && events.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
            {[
              { label: "Total Events", value: events.length, icon: Ticket },
              {
                label: "Total Seats",
                value: totalSeats.toLocaleString(),
                icon: Layers,
              },
              { label: "Sold", value: totalSold.toLocaleString(), icon: Users },
              {
                label: "Revenue",
                value: `₹${totalRevenue.toLocaleString()}`,
                icon: TrendingUp,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {label}
                  </span>
                </div>
                <p className="text-lg font-extrabold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
                <div className="h-5 bg-slate-200 rounded-lg w-2/3" />
                <div className="h-4 bg-slate-200 rounded-lg w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 border border-slate-100 mb-4">
            <Ticket className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No Events Yet
          </h3>
          <p className="text-slate-500 text-sm mb-5">
            Create your first event to get started.
          </p>
          <button
            onClick={() => navigate("/create-event")}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => {
            const status = STATUS_CONFIG[event.status] || STATUS_CONFIG.DRAFT;
            const StatusIcon = status.icon;
            const total = event.analytics?.totalSeats || 0;
            const sold = event.analytics?.soldSeats || 0;
            const held = event.analytics?.heldSeats || 0;
            const available = total - sold - held;
            const pct = total > 0 ? (sold / total) * 100 : 0;

            return (
              <div
                key={event._id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                <div className="h-40 relative bg-slate-900 overflow-hidden">
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-green-900 to-slate-900 flex items-center justify-center">
                      <Ticket className="w-10 h-10 text-green-400/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  <div className="absolute top-3 left-3">
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm bg-white/90 ${status.cls}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 text-white border border-white/10 backdrop-blur-sm">
                      {event.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className="flex items-center gap-1 text-xs text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                      <MapPin className="w-3 h-3 text-green-400" />
                      {event.city}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {formatDate(event.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {formatTime(event.startDate)}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {event.venue}
                      </span>
                    </div>
                  </div>

                  {total > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Tickets Sold
                        </span>
                        <span className="font-bold text-slate-700">
                          {sold} / {total}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-green-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{available} available</span>
                        <span>{held} held</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Revenue
                      </p>
                      <p className="text-sm font-extrabold text-slate-900">
                        ₹{(event.analytics?.totalRevenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        {statusLoading === event._id ? (
                          <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Updating...
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              value={event.status}
                              onChange={(e) => handleStatusChange(event._id, e.target.value)}
                              className={`appearance-none text-xs font-semibold pl-2.5 pr-7 py-2 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${
                                event.status === "PUBLISHED"
                                  ? "bg-green-50 border-green-200 text-green-700"
                                  : event.status === "CANCELLED"
                                  ? "bg-red-50 border-red-200 text-red-600"
                                  : event.status === "COMPLETED"
                                  ? "bg-blue-50 border-blue-200 text-blue-600"
                                  : "bg-slate-100 border-slate-200 text-slate-600"
                              }`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-slate-400" />
                          </div>
                        )}
                      </div>
                      {/* <button
                        onClick={() => navigate(`/events/${event._id}`)}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-md shadow-green-600/10"
                      >
                        Manage
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button> */}
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

export default OrganizerEvents;
