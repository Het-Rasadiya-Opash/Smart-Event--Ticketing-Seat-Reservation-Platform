import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Ticket,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react";
import apiRequest from "../utils/apiRequest";
import { formatDate, formatTime } from "../utils/utilities";

const CATEGORY_DETAILS = {
  CONCERT: {
    label: "Concert",
  },
  SPORTS: {
    label: "Sports",
  },
  THEATER: {
    label: "Theatre",
  },
  CONFERENCE: {
    label: "Conference",
  },
  COMEDY: {
    label: "Comedy",
  },
  FESTIVAL: {
    label: "Festival",
  },
  OTHER: {
    label: "Other",
  },
};

const UpcomingEvents = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const res = await apiRequest.get("/events/draft");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setUpcomingEvents(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const scrollLeft = () => {
    const container = document.getElementById("upcoming-scroll-container");
    if (container) {
      container.scrollBy({ left: -390, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById("upcoming-scroll-container");
    if (container) {
      container.scrollBy({ left: 390, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-slate-50/50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-between items-end">
              <div className="space-y-3 w-1/3">
                <div className="h-8 bg-slate-200 rounded-xl w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              </div>
            </div>
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-[320px] sm:w-[380px] h-[480px] bg-slate-200/60 rounded-[32px] shrink-0 border border-slate-200/20"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-slate-50/50 py-16 ">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Upcoming Shows
            </h2>
          </div>

          {upcomingEvents.length > 0 && (
            <div className="flex gap-3 shrink-0">
              <button
                onClick={scrollLeft}
                className="w-10 h-10 flex items-center justify-center bg-green-50/60 hover:bg-green-100/80 text-green-600 rounded-full transition-all border border-green-100/10 active:scale-95 shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="w-10 h-10 flex items-center justify-center bg-green-50/60 hover:bg-green-100/80 text-green-600 rounded-full transition-all border border-green-100/10 active:scale-95 shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div
          id="upcoming-scroll-container"
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {upcomingEvents.map((event) => {
            const cat = event.category || "OTHER";
            const catDetails = CATEGORY_DETAILS[cat] || CATEGORY_DETAILS.OTHER;
            const standardTier = event.pricingTiers?.find(
              (pt) => pt.tier?.toUpperCase() === "STANDARD",
            );
            const price = standardTier ? standardTier.price : 0;
            const hasDateDetails = event.startDate;
            const hasPriceDetails = price > 0;

            return (
              <div
                key={event._id}
                className="w-[320px] sm:w-[380px] bg-white border border-slate-100/90 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.035)] shrink-0 snap-start hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:border-slate-200/60 transition-all duration-300 flex flex-col group"
              >
                <div className="h-52 relative bg-slate-100 overflow-hidden rounded-t-[32px]">
                  {event.bannerUrl ? (
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center p-4">
                      <span className="text-slate-400 font-extrabold text-sm uppercase tracking-wider text-center line-clamp-2">
                        {event.title}
                      </span>
                    </div>
                  )}

                  <span className="absolute top-4 left-4 bg-black/35 backdrop-blur-md text-white border border-white/20 text-[10px] font-extrabold tracking-wider uppercase px-3.5 py-1.5 rounded-full select-none">
                    {catDetails.label}
                  </span>

                  <span className="absolute top-4 right-4 bg-green-500 text-white font-extrabold text-[10px] tracking-wider px-3.5 py-1.5 rounded-full shadow-sm select-none">
                    COMING SOON
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between min-h-[300px]">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-green-600 transition-colors line-clamp-1 leading-tight tracking-tight">
                        {event.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-1 font-medium">
                        {event.description ||
                          event.venue ||
                          "Get ready for an amazing live experience!"}
                      </p>
                    </div>

                    {hasDateDetails && (
                      <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 p-4.5 rounded-[24px] bg-[#F8FAFC] border border-slate-100/80">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Calendar className="w-4 h-4 text-green-700/85 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                              Date
                            </div>
                            <div className="text-[11px] font-extrabold text-slate-700 truncate leading-tight">
                              {formatDate(event.startDate)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 min-w-0">
                          <Clock className="w-4 h-4 text-green-700/85 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                              Time
                            </div>
                            <div className="text-[11px] font-extrabold text-slate-700 truncate leading-tight">
                              {formatTime(event.startDate)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 col-span-2 min-w-0">
                          <MapPin className="w-4 h-4 text-green-700/85 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                              Location
                            </div>
                            <div className="text-[11px] font-extrabold text-slate-700 truncate leading-tight">
                              {event.venue ? `${event.venue}, ` : ""}
                              {event.city}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {hasPriceDetails ? (
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Estimated Ticket
                        </p>
                        <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                          ₹{price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 shadow-sm transition-all active:scale-95 cursor-pointer">
                        <Info className="w-3.5 h-3.5 text-green-600" />
                        <span>Sneak Peek</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-10"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;
