import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import OrganizerEvents from "../components/OrganizerEvents";
import OrganizerAnalytics from "../components/OrganizerAnalytics";
import {
  User,
  Mail,
  Shield,
  CalendarDays,
  CalendarPlus,
  Ticket,
  BarChart3,
  Layers,
} from "lucide-react";
import { formatDate } from "../utils/utilities";
import apiRequest from "../utils/apiRequest";
import toast from "react-hot-toast";
import MyBooking from "../components/MyBooking";
import OrganizerGetAllBookings from "../components/OrganizerGetAllBookings";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between px-6 py-4">
    <div className="flex items-center gap-2.5">
      {icon}
      <span className="text-sm text-slate-500 font-medium">{label}</span>
    </div>
    <span className="text-sm font-semibold text-slate-800">{value}</span>
  </div>
);

const Profile = () => {
  const { currentUser } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");

  if (!currentUser) return null;

  const joinedDate = formatDate(currentUser.createdAt);
  const isOrganizer = currentUser.role === "ORGANIZER";
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="relative bg-slate-900 overflow-hidden py-12 shadow-inner">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/10 shadow-xl"
              />
              <span
                className={`absolute -bottom-2 -right-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isOrganizer
                    ? "bg-green-600 text-white border-green-500"
                    : "bg-slate-700 text-white border-slate-600"
                }`}
              >
                {currentUser.role}
              </span>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {currentUser.username}
              </h1>
              <p className="text-slate-400 text-sm mt-1">{currentUser.email}</p>
              <p className="text-slate-500 text-xs mt-1 flex items-center justify-center sm:justify-start gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Joined {joinedDate}
              </p>
            </div>

            {isOrganizer && (
              <button
                onClick={() => navigate("/create-event")}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-600/20 shrink-0"
              >
                <CalendarPlus className="w-4 h-4" />
                Create Event
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <User className="w-4 h-4 text-green-500" />
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Account Details
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            <InfoRow
              icon={<User className="w-4 h-4 text-slate-400" />}
              label="Username"
              value={currentUser.username}
            />
            <InfoRow
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              label="Email"
              value={currentUser.email}
            />
            <InfoRow
              icon={<Shield className="w-4 h-4 text-slate-400" />}
              label="Role"
              value={
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isOrganizer
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <Ticket className="w-3 h-3" />
                  {currentUser.role}
                </span>
              }
            />
            <InfoRow
              icon={<CalendarDays className="w-4 h-4 text-slate-400" />}
              label="Member Since"
              value={joinedDate}
            />
          </div>
        </div> */}

        {isOrganizer && (
          <div className="flex border border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === "analytics"
                  ? "bg-green-600 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-700 hover:text-slate-650 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === "events"
                  ? "bg-green-600 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-700 hover:text-slate-650 hover:bg-slate-100"
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">My Events</span>
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === "bookings"
                  ? "bg-green-600 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-700 hover:text-slate-650 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Booking List</span>
            </button>
          </div>
        )}

        {!isOrganizer && <MyBooking />}

        {isOrganizer && activeTab === "analytics" && <OrganizerAnalytics />}
        {isOrganizer && activeTab === "events" && <OrganizerEvents />}
        {isOrganizer && activeTab === "bookings" && <OrganizerGetAllBookings />}
      </div>
    </div>
  );
};

export default Profile;
