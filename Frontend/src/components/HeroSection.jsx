import React from "react";
import { Search, MapPin, ArrowRight, Ticket, Users } from "lucide-react";

const HeroSection = ({
  searchTerm,
  setSearchTerm,
  selectedCity,
  setSelectedCity,
  setCurrentPage,
  availableCities,
  totalEvents,
  handleSearchSubmit,
}) => {
  return (
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
  );
};

export default HeroSection;
