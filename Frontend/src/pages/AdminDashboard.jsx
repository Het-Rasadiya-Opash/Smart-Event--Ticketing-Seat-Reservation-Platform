import React, { useState, useEffect } from "react";
import apiRequest from "../utils/apiRequest";
import {
  Users,
  DollarSign,
  Calendar,
  Ticket,
  Search,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  Building,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");

  const [hoveredTrendIndex, setHoveredTrendIndex] = useState(null);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await apiRequest.get("/admin/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
        toast.error("Access denied or failed to load administrative insights.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-7xl space-y-8 animate-pulse">
          <div className="h-12 w-64 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full text-red-600 mb-4">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Unauthorized Access
        </h2>
        <p className="text-gray-600 max-w-md">
          Only administrators have credentials to inspect the global analytics
          vault. Please login with an administrator profile.
        </p>
      </div>
    );
  }

  const {
    summary,
    eventDetails,
    organizerDetails,
    bookingDetails,
    categoryStats,
    trends,
    topEvents,
  } = stats;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  let filteredData = [];
  if (activeTab === "events") {
    filteredData = eventDetails.filter(
      (e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  } else if (activeTab === "bookings") {
    filteredData = bookingDetails.filter(
      (b) =>
        b.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  } else if (activeTab === "organizers") {
    filteredData = organizerDetails.filter(
      (o) =>
        o.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const chartWidth = 500;
  const chartHeight = 220;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const maxRevenue = Math.max(...trends.map((t) => t.revenue), 1000);

  const points = trends.map((t, idx) => {
    const x = paddingLeft + (idx / (trends.length - 1)) * usableWidth;
    const y =
      paddingTop + usableHeight - (t.revenue / maxRevenue) * usableHeight;
    return { x, y, data: t };
  });

  const pathD =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ")
      : "";

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
      : "";

  const totalCategoryRevenue =
    categoryStats.reduce((sum, c) => sum + c.revenue, 0) || 1;
  let currentAngle = 0;
  const donutCenter = 100;
  const donutRadius = 65;
  const donutStrokeWidth = 24;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const categoryColors = [
    "#16a34a",
    "#2563eb",
    "#9333ea",
    "#ea580c",
    "#0d9488",
    "#db2777",
    "#4b5563",
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 text-white py-12 px-6 shadow-lg shadow-green-900/10 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Admin Dashboard
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Platform Revenue
              </span>
              <div className="bg-green-100 text-green-700 p-2.5 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {formatCurrency(summary.totalRevenue)}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md w-fit">
                <TrendingUp className="w-3.5 h-3.5" /> High volume sales
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Purchases
              </span>
              <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl">
                <Ticket className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {summary.totalBookings}
              </h3>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Tickets securely processed
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Hosted Events
              </span>
              <div className="bg-purple-100 text-purple-700 p-2.5 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {summary.totalEvents}
              </h3>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Across all major cities
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Active Accounts
              </span>
              <div className="bg-teal-100 text-teal-700 p-2.5 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {summary.totalUsers}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">
                  <UserCheck className="w-2.5 h-2.5" />{" "}
                  {summary.userStats.CUSTOMER} Customers
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                  <Building className="w-2.5 h-2.5" />{" "}
                  {summary.userStats.ORGANIZER} Organizers
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Financial Performance Matrix
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>{" "}
                  Revenue
                </span>
              </div>
            </div>

            <div className="relative w-full">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible select-none"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingTop + usableHeight * ratio;
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#f3f4f6"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] font-bold fill-gray-400 font-mono"
                      >
                        {formatCurrency(maxRevenue * (1 - ratio))}
                      </text>
                    </g>
                  );
                })}

                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop
                      offset="100%"
                      stopColor="#10b981"
                      stopOpacity="0.00"
                    />
                  </linearGradient>
                </defs>

                <path d={areaD} fill="url(#areaGrad)" />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {points.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredTrendIndex === idx ? "6" : "4"}
                      fill={hoveredTrendIndex === idx ? "#10b981" : "#ffffff"}
                      stroke="#10b981"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredTrendIndex(idx)}
                      onMouseLeave={() => setHoveredTrendIndex(null)}
                    />
                    <text
                      x={pt.x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-gray-500"
                    >
                      {pt.data.month}
                    </text>
                  </g>
                ))}
              </svg>

              {hoveredTrendIndex !== null && (
                <div
                  className="absolute z-10 bg-gray-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none transition-all duration-200 border border-gray-800"
                  style={{
                    left: `${(points[hoveredTrendIndex].x / chartWidth) * 100}%`,
                    top: `${(points[hoveredTrendIndex].y / chartHeight) * 100 - 24}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <p className="font-bold text-gray-300">
                    {trends[hoveredTrendIndex].month}
                  </p>
                  <p className="font-mono text-green-400 font-extrabold mt-0.5">
                    {formatCurrency(trends[hoveredTrendIndex].revenue)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {trends[hoveredTrendIndex].bookingsCount} successful
                    bookings
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-950">
                Category Distribution
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="relative w-44 h-44">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full transform -rotate-90"
                >
                  <circle
                    cx={donutCenter}
                    cy={donutCenter}
                    r={donutRadius}
                    fill="transparent"
                    stroke="#f3f4f6"
                    strokeWidth={donutStrokeWidth}
                  />
                  {categoryStats.map((cat, idx) => {
                    const percent = cat.revenue / totalCategoryRevenue;
                    const strokeDash = percent * donutCircumference;
                    const strokeOffset = donutCircumference - strokeDash;

                    const rotation = (currentAngle * 360) / donutCircumference;
                    currentAngle += strokeDash;

                    const color = categoryColors[idx % categoryColors.length];

                    return (
                      <circle
                        key={idx}
                        cx={donutCenter}
                        cy={donutCenter}
                        r={donutRadius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={
                          hoveredCategoryIndex === idx
                            ? donutStrokeWidth + 4
                            : donutStrokeWidth
                        }
                        strokeDasharray={`${strokeDash} ${donutCircumference}`}
                        strokeDashoffset={strokeOffset}
                        transform={`rotate(${rotation} ${donutCenter} ${donutCenter})`}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredCategoryIndex(idx)}
                        onMouseLeave={() => setHoveredCategoryIndex(null)}
                      />
                    );
                  })}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  {hoveredCategoryIndex !== null ? (
                    <>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {categoryStats[hoveredCategoryIndex].category}
                      </span>
                      <span className="text-sm font-black text-gray-900 font-mono mt-0.5">
                        {Math.round(
                          (categoryStats[hoveredCategoryIndex].revenue /
                            totalCategoryRevenue) *
                            100,
                        )}
                        %
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Global
                      </span>
                      <span className="text-xs font-extrabold text-gray-700 mt-0.5">
                        Categorized
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2.5 flex-1 min-w-[120px]">
                {categoryStats.map((cat, idx) => {
                  const color = categoryColors[idx % categoryColors.length];
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between gap-2 p-1.5 rounded-lg transition-colors duration-150 ${hoveredCategoryIndex === idx ? "bg-gray-50" : ""}`}
                      onMouseEnter={() => setHoveredCategoryIndex(idx)}
                      onMouseLeave={() => setHoveredCategoryIndex(null)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        ></span>
                        <span className="text-xs font-semibold text-gray-700 capitalize truncate">
                          {cat.category.toLowerCase()}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 font-mono">
                        {formatCurrency(cat.revenue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex bg-gray-100 p-1.5 rounded-xl gap-1 shrink-0">
              <button
                onClick={() => handleTabChange("events")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
                  activeTab === "events"
                    ? "bg-green-600 text-white shadow-sm "
                    : "text-gray-600  hover:text-gray-900"
                }`}
              >
                Events Analytics
              </button>
              <button
                onClick={() => handleTabChange("bookings")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
                  activeTab === "bookings"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Audited Bookings
              </button>
              <button
                onClick={() => handleTabChange("organizers")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
                  activeTab === "organizers"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Organizer Accounts
              </button>
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-50/50 pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-gray-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {paginatedData.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[700px]">
                {activeTab === "events" && (
                  <>
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-4 px-6">Event Details</th>
                        <th className="py-4 px-6">City & Venue</th>
                        <th className="py-4 px-6">Organizer</th>
                        <th className="py-4 px-6">Seat map breakdown</th>
                        <th className="py-4 px-6">Gross Sales</th>
                        <th className="py-4 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {paginatedData.map((event) => {
                        const soldPercent =
                          event.totalSeats > 0
                            ? Math.round(
                                (event.soldSeats / event.totalSeats) * 100,
                              )
                            : 0;
                        const heldPercent =
                          event.totalSeats > 0
                            ? Math.round(
                                (event.heldSeats / event.totalSeats) * 100,
                              )
                            : 0;
                        const availPercent = 100 - soldPercent - heldPercent;

                        return (
                          <tr
                            key={event._id}
                            className="hover:bg-gray-50/30 transition-colors"
                          >
                            <td className="py-4.5 px-6">
                              <div className="font-bold text-gray-900 text-sm">
                                {event.title}
                              </div>
                              <span className="inline-flex mt-1 text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                {event.category}
                              </span>
                            </td>
                            <td className="py-4.5 px-6">
                              <div className="font-semibold text-gray-900">
                                {event.venue}
                              </div>
                              <div className="text-gray-500 font-medium">
                                {event.city}
                              </div>
                            </td>
                            <td className="py-4.5 px-6">
                              <div className="font-semibold text-gray-900">
                                {event.organizer.username}
                              </div>
                              <div className="text-gray-500 font-mono text-[10px]">
                                {event.organizer.email}
                              </div>
                            </td>
                            <td className="py-4.5 px-6 min-w-[200px]">
                              <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                                <span>
                                  {event.soldSeats} / {event.totalSeats} Sold (
                                  {soldPercent}%)
                                </span>
                                {event.heldSeats > 0 && (
                                  <span>{event.heldSeats} Held</span>
                                )}
                              </div>
                              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-green-500 transition-all duration-300"
                                  style={{ width: `${soldPercent}%` }}
                                  title="Sold"
                                ></div>
                                <div
                                  className="h-full bg-amber-400 transition-all duration-300"
                                  style={{ width: `${heldPercent}%` }}
                                  title="Held"
                                ></div>
                                <div
                                  className="h-full bg-gray-200 transition-all duration-300"
                                  style={{ width: `${availPercent}%` }}
                                  title="Available"
                                ></div>
                              </div>
                            </td>
                            <td className="py-4.5 px-6 font-bold font-mono text-gray-950">
                              {formatCurrency(event.revenue)}
                            </td>
                            <td className="py-4.5 px-6">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                  event.status === "PUBLISHED"
                                    ? "bg-green-100 text-green-800"
                                    : event.status === "DRAFT"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {event.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </>
                )}

                {activeTab === "bookings" && (
                  <>
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-4 px-6">Transaction ID</th>
                        <th className="py-4 px-6">Target Event</th>
                        <th className="py-4 px-6">Customer Details</th>
                        <th className="py-4 px-6">Seats Reserved</th>
                        <th className="py-4 px-6">Transaction Amount</th>
                        <th className="py-4 px-6">Audited Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {paginatedData.map((booking) => (
                        <tr
                          key={booking._id}
                          className="hover:bg-gray-50/30 transition-colors"
                        >
                          <td className="py-4.5 px-6 font-mono text-[10px] font-semibold text-gray-500">
                            {booking._id}
                          </td>
                          <td className="py-4.5 px-6 font-bold text-gray-900">
                            {booking.eventTitle}
                          </td>
                          <td className="py-4.5 px-6">
                            <div className="font-semibold text-gray-900">
                              {booking.customerName}
                            </div>
                            <div className="text-gray-500 font-mono text-[10px]">
                              {booking.customerEmail}
                            </div>
                          </td>
                          <td className="py-4.5 px-6">
                            <div className="font-semibold text-gray-900">
                              {booking.seatsCount} Ticket(s)
                            </div>
                            <div
                              className="text-gray-400 font-mono text-[9px] truncate max-w-[150px]"
                              title={booking.seatIds}
                            >
                              [{booking.seatIds}]
                            </div>
                          </td>
                          <td className="py-4.5 px-6 font-bold font-mono text-gray-950">
                            {formatCurrency(booking.totalAmount)}
                          </td>
                          <td className="py-4.5 px-6">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                booking.paymentStatus === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : booking.paymentStatus === "FAILED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {booking.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {activeTab === "organizers" && (
                  <>
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-4 px-6">Organizer Account</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6">Events Created</th>
                        <th className="py-4 px-6">Total Seating Purchases</th>
                        <th className="py-4 px-6">Total Generated Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {paginatedData.map((org) => (
                        <tr
                          key={org._id}
                          className="hover:bg-gray-50/30 transition-colors"
                        >
                          <td className="py-4.5 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  org.avatar ||
                                  "https://png.pngtree.com/png-vector/20220210/ourmid/pngtree-avatar-bussinesman-man-profile-icon-vector-illustration-png-image_4384273.png"
                                }
                                alt={org.username}
                                className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                              />
                              <span className="font-bold text-gray-900">
                                {org.username}
                              </span>
                            </div>
                          </td>
                          <td className="py-4.5 px-6 font-mono text-gray-500 font-semibold">
                            {org.email}
                          </td>
                          <td className="py-4.5 px-6 font-semibold text-gray-900 text-center md:text-left">
                            {org.eventsCreated}
                          </td>
                          <td className="py-4.5 px-6 font-semibold text-gray-900">
                            {org.ticketsSold} Tickets Sold
                          </td>
                          <td className="py-4.5 px-6 font-bold font-mono text-gray-950">
                            {formatCurrency(org.totalRevenueGenerated)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            ) : (
              <div className="py-12 text-center text-gray-500 text-xs font-semibold">
                No matching administrative records found.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50/30">
              <span className="text-xs font-medium text-gray-500">
                Showing Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-green-100 text-green-700 p-2 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-950">
                High Performance Events
              </h3>
              <p className="text-xs text-gray-500">Top 5 box office earners</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {topEvents.map((event, idx) => (
              <div
                key={event._id}
                className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl relative overflow-hidden transition-all duration-200 hover:shadow-sm"
              >
                <div className="absolute top-2 right-2 text-2xl font-black text-gray-200/90 select-none font-mono">
                  #0{idx + 1}
                </div>
                <div className="font-bold text-gray-900 truncate pr-6 text-sm">
                  {event.title}
                </div>
                <div className="text-[10px] font-bold text-gray-400 capitalize mt-0.5">
                  {event.category.toLowerCase()}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/60 flex justify-between items-end">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">
                      Revenue
                    </span>
                    <span className="font-mono font-bold text-xs text-gray-950">
                      {formatCurrency(event.revenue)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 uppercase font-bold block">
                      Capacity
                    </span>
                    <span className="font-mono font-bold text-xs text-gray-950">
                      {Math.round(
                        (event.soldSeats / (event.totalSeats || 1)) * 100,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
