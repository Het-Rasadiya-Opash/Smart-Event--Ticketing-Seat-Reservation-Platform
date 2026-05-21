import { ArrowRight, Heart, Mail, MapPin, Phone, Ticket } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-350 border-t border-slate-800/80 pt-16 pb-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-green-600 p-2 rounded-xl group-hover:bg-green-500 transition-colors shadow-lg shadow-green-600/10">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Smart<span className="text-green-500">Event</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience the future of event ticketing and real-time interactive
              seat reservations. Secure, fast, and completely hassle-free.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Explore Platform
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-slate-400 hover:text-green-500 transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-green-500" />
                  <span>Home Page</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-slate-400 hover:text-green-500 transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-green-500" />
                  <span>All Events</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-slate-400 hover:text-green-500 transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-green-500" />
                  <span>User Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/bookings"
                  className="text-slate-400 hover:text-green-500 transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-green-500" />
                  <span>My Bookings</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Get in Touch
            </h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>Surat, Gujarat</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-500 shrink-0" />
                <a
                  href="tel:+911234567890"
                  className="text-slate-400 hover:text-green-500 transition-colors"
                >
                  +91 12345 67890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-500 shrink-0" />
                <a
                  href="mailto:support@smartevent.com"
                  className="text-slate-400 hover:text-green-500 transition-colors"
                >
                  support@smartevent.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
              Stay Updated
            </h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Subscribe to our newsletter to receive the latest updates,
              exclusive deals, and event announcements.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-500 transition-all font-medium"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-semibold">
            &copy; {currentYear} SmartEvent. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
            <a
              href="/"
              className="text-slate-550 hover:text-slate-350 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/"
              className="text-slate-550 hover:text-slate-350 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/"
              className="text-slate-550 hover:text-slate-350 transition-colors"
            >
              Cookie Policy
            </a>
          </div>
          <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            Made with{" "}
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />{" "}
            for SmartEvent.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
