import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Layers2,
  MapPin,
  Search,
  Smile,
  Sparkles,
  Tent,
  Ticket,
  Trophy,
  Tv,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import apiRequest from "../utils/apiRequest";
import EventDetail from "./EventDetail";
import { formatDate, formatTime } from "../utils/utilities";

const CATEGORY_DETAILS = {
  CONCERT: {
    label: "Concert",
    icon: Sparkles,
    color:
      "text-pink-600 bg-pink-50 border-pink-100 dark:text-pink-400 dark:bg-pink-900/20",
  },
  SPORTS: {
    label: "Sports",
    icon: Trophy,
    color:
      "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20",
  },
  THEATRE: {
    label: "Theatre",
    icon: Tv,
    color:
      "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-900/20",
  },
  CONFERENCE: {
    label: "Conference",
    icon: Users,
    color:
      "text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/20",
  },
  COMEDY: {
    label: "Comedy",
    icon: Smile,
    color:
      "text-purple-600 bg-purple-50 border-purple-100 dark:text-purple-400 dark:bg-purple-900/20",
  },
  FESTIVAL: {
    label: "Festival",
    icon: Tent,
    color:
      "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-900/20",
  },
  OTHER: {
    label: "Other",
    icon: Compass,
    color:
      "text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-900/20",
  },
};

const Events = () => {
  const { currentUser } = useSelector((state) => state.users);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [availableCities, setAvailableCities] = useState([
    "New York",
    "London",
    "Tokyo",
    "Mumbai",
    "Paris",
    "Berlin",
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [fullEventDetails, setFullEventDetails] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 6,
        searchTerm: searchTerm || undefined,
        category: selectedCategory || undefined,
        city: selectedCity || undefined,
        status: "PUBLISHED",
      };

    const res = await apiRequest.get("/events", { params });
      if (res.data?.success) {
        setEvents(res.data.data.events);
        setTotalEvents(res.data.data.totalEvents);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, selectedCategory, selectedCity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedCity("");
    setCurrentPage(1);
  };

  const handleViewDetails = async (event) => {
    setSelectedEvent(event);
    setDetailsLoading(true);
    setFullEventDetails(null);
    try {
      const res = await apiRequest.get(`/events/${event._id}`);
      if (res.data?.success) {
        setFullEventDetails(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      toast.error("Could not load detailed event information.");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <div className="relative bg-slate-900 overflow-hidden py-16 sm:py-24 shadow-inner">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none mb-6">
            Smart<span className="text-green-500">Event</span> Reservation
          </h1>

          <form
            onSubmit={handleSearchSubmit}
            className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-3 items-stretch shadow-2xl"
          >
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-green-400 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search artists, team, show, conference..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-sm"
              />
            </div>

            <div className="relative w-full sm:w-48">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white appearance-none focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-sm cursor-pointer"
              >
                <option value="" className="text-slate-800">
                  All Cities
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city} className="text-slate-800">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl sm:rounded-2xl transition-all shadow-lg hover:shadow-green-500/20 focus:outline-none focus:ring-4 focus:ring-green-500/20 flex items-center justify-center gap-2"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mt-12 text-slate-400 border-t border-slate-800 pt-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5">
              <Ticket className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">
                <strong className="text-white text-base">{totalEvents}</strong>{" "}
                Live Events
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">
                <strong className="text-white text-base">20+</strong> Active
                Cities
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">
                <strong className="text-white text-base">99.8%</strong> Happy
                Bookings
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider">
                  <Layers2 className="w-4 h-4 text-green-500" />
                  Categories
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="text-xs text-green-600 hover:text-green-800 font-semibold transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                    !selectedCategory
                      ? "bg-green-600 text-white shadow-md shadow-green-600/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    All Categories
                  </span>
                </button>
                {Object.entries(CATEGORY_DETAILS).map(([key, value]) => {
                  const Icon = value.icon;
                  const isSelected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedCategory(key);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-green-600 text-white shadow-md shadow-green-600/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {value.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedCategory
                    ? `${CATEGORY_DETAILS[selectedCategory]?.label} Events`
                    : "Trending Live Events"}
                </h2>
                <p className="text-sm text-slate-500">
                  Showing {events.length} of {totalEvents} available events
                </p>
              </div>

              {(selectedCategory || selectedCity || searchTerm) && (
                <button
                  onClick={handleResetFilters}
                  className="self-start sm:self-center px-4 py-2 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50/30 transition-all flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-pulse h-[400px] flex flex-col"
                  >
                    <div className="bg-slate-200 h-48 w-full"></div>
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex gap-2">
                        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                        <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                      </div>
                      <div className="h-6 bg-slate-200 rounded-xl w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-5/6"></div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div className="h-6 bg-slate-200 rounded-lg w-1/3"></div>
                        <div className="h-10 bg-slate-200 rounded-xl w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm max-w-xl mx-auto mt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-6 border border-slate-100">
                  <Ticket className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  No Matching Events Found
                </h3>

                <button
                  onClick={handleResetFilters}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-green-500/20"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => {
                  const catDetails =
                    CATEGORY_DETAILS[event.category] || CATEGORY_DETAILS.OTHER;
                  const CatIcon = catDetails.icon;

                  const total = event.analytics?.totalSeats || 0;
                  const sold = event.analytics?.soldSeats || 0;
                  const held = event.analytics?.heldSeats || 0;
                  const available = total - sold - held;
                  const pctAvailable =
                    total > 0 ? (available / total) * 100 : 0;

                  const standardTier = event.pricingTiers?.find(
                    (pt) => pt.tier === "STANDARD",
                  );
                  const minPrice = standardTier ? standardTier.price : 0;

                  return (
                    <div
                      key={event._id}
                      onClick={() => handleViewDetails(event)}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
                    >
                      <div className="h-48 relative overflow-hidden bg-slate-900">
                        {event.bannerUrl ? (
                          <img
                            src={event.bannerUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-green-900 to-slate-900 flex items-center justify-center p-6 text-center select-none">
                            <span className="text-white/40 font-bold text-lg leading-tight tracking-wide uppercase">
                              {event.title}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

                        <div className="absolute top-4 left-4 flex gap-2">
                          <span
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${catDetails.color} backdrop-blur-sm bg-white/90`}
                          >
                            <CatIcon className="w-3.5 h-3.5" />
                            {catDetails.label}
                          </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
                          <div className="flex items-center gap-1 text-white/90 text-xs font-medium bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10">
                            <MapPin className="w-3.5 h-3.5 text-green-400" />
                            <span>{event.city}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
                            {event.title}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                            {event.description ||
                              "No description provided for this event."}
                          </p>

                          <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[11px] font-semibold text-slate-700 truncate">
                                {formatDate(event.startDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[11px] font-semibold text-slate-700 truncate">
                                {formatTime(event.startDate)}
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[11px] font-semibold text-slate-700 truncate">
                                {event.venue}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {total > 0 && (
                            <div className="mb-4 space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">
                                  Availability
                                </span>
                                <span className="font-bold text-slate-700">
                                  {available} / {total} seats left
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    pctAvailable > 50
                                      ? "bg-emerald-500"
                                      : pctAvailable > 15
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${pctAvailable}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                Standard Ticket
                              </p>
                              <p className="text-lg font-extrabold text-slate-900">
                                {minPrice > 0
                                  ? `₹${minPrice.toLocaleString()}`
                                  : "Free"}
                              </p>
                            </div>

                            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-green-600/10 flex items-center gap-1 group-hover:bg-green-700 animate-fade-in">
                              <span>View Details</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 bg-white border border-slate-200 py-3.5 px-6 rounded-2xl shadow-sm max-w-sm mx-auto">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1.5 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (num) => (
                      <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`w-9 h-9 font-bold text-xs rounded-xl transition-all ${
                          currentPage === num
                            ? "bg-green-600 text-white shadow-md shadow-green-600/10"
                            : "border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {num}
                      </button>
                    ),
                  )}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <EventDetail
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        setDetailsLoading={setDetailsLoading}
        detailsLoading={detailsLoading}
        fullEventDetails={fullEventDetails}
      />
    </div>
  );
};

export default Events;
