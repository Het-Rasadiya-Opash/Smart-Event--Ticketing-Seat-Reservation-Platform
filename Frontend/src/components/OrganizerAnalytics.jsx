import { useState, useEffect } from "react";
import apiRequest from "../utils/apiRequest";
import { formatDate } from "../utils/utilities";
import {
  TrendingUp,
  Ticket,
  Layers,
  BarChart3,
  CalendarDays,
  Percent,
  RefreshCw,
  AlertCircle,
  Sparkles,
  PieChart,
} from "lucide-react";
import toast from "react-hot-toast";

const OrganizerAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredTier, setHoveredTier] = useState(null);
  const [chartMetric, setChartMetric] = useState("totalRevenue");
  const [hoveredBar, setHoveredBar] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest.get("/events/organizer/analytics");
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching organizer analytics:", err);
      setError(err.response?.data?.message || "Failed to fetch analytics.");
      toast.error("Could not fetch dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium animate-pulse">
          Analyzing event performance and compiling statistics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm max-w-lg mx-auto">
        <div className="bg-red-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Unable to Load Analytics
        </h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 w-fit mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Retry Request</span>
        </button>
      </div>
    );
  }

  if (!data || !data.summary || data.summary.totalEvents === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-100 mb-5">
          <BarChart3 className="w-8 h-8 text-slate-400 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Dashboard Unavailable
        </h3>
      </div>
    );
  }

  const { summary, eventDetails } = data;
  const {
    totalEvents,
    totalSeats,
    seatsSold,
    sellThroughRate,
    totalRevenue,
    seatsSoldByTier,
    revenueByTier,
    totalSeatsByTier,
  } = summary;

  const c = 2 * Math.PI * 40;
  const totalRev = totalRevenue || 1;
  const vipPct = (revenueByTier.VIP || 0) / totalRev;
  const premiumPct = (revenueByTier.PREMIUM || 0) / totalRev;
  const standardPct = (revenueByTier.STANDARD || 0) / totalRev;

  const vipLen = vipPct * c;
  const premiumLen = premiumPct * c;
  const standardLen = standardPct * c;

  const maxBarValue = Math.max(
    ...eventDetails.map((e) => {
      if (chartMetric === "totalRevenue") return e.totalRevenue || 0;
      return e.soldSeats || 0;
    }),
    1,
  );

  const getNiceMax = (val) => {
    if (chartMetric === "soldSeats") {
      if (val <= 4) return 4;
      if (val <= 8) return 8;
      if (val <= 12) return 12;
      if (val <= 16) return 16;
      if (val <= 20) return 20;
      if (val <= 40) return 40;
      if (val <= 100) return 100;
    }
    if (val <= 10) return 10;
    if (val <= 50) return 50;
    if (val <= 100) return 100;
    if (val <= 200) return 200;
    if (val <= 500) return 500;
    if (val <= 1000) return 1000;
    if (val <= 2500) return 2500;
    if (val <= 5000) return 5000;
    if (val <= 10000) return 10000;
    if (val <= 50000) return 50000;
    if (val <= 100000) return 100000;
    const digits = Math.pow(10, Math.floor(Math.log10(val)));
    return Math.ceil(val / digits) * digits;
  };

  const niceMax = getNiceMax(maxBarValue);

  const ticks = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25, 0];

  const formatTick = (val) => {
    if (chartMetric === "totalRevenue") {
      if (val >= 1000)
        return `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
      return `${val}`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="space-y-6 text-slate-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Dashboard
          </h2>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 sm:px-3.5 rounded-xl transition-all shadow-sm active:scale-95 w-fit shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 hover:rotate-180 transition-transform duration-500" />
          <span className="hidden sm:inline">Refresh Stats</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Total Revenue
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
                ₹{totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-650">Live</span>
            <span className="text-slate-400 font-semibold">Aggregated</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Sell-Through Rate
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
                {sellThroughRate}%
              </h3>
            </div>
            <div className="w-10 h-10 bg-[#0f172a] text-white flex items-center justify-center rounded-xl font-black text-sm group-hover:scale-105 transition-transform">
              %
            </div>
          </div>
          <div className="mt-6 w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/20">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${sellThroughRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Tickets Sold
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
                {seatsSold}
                <span className="text-sm font-bold text-slate-400">
                  {" "}
                  / {totalSeats}
                </span>
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-650 rounded-xl group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-5 text-[11px] text-slate-400 font-semibold">
            <span className="font-bold text-slate-700">
              {(totalSeats - seatsSold).toLocaleString()}
            </span>{" "}
            available seats remaining
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Active Events
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
                {totalEvents}
              </h3>
            </div>
            <div className="p-2.5 bg-slate-900 text-white rounded-xl group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-slate-200" />
            </div>
          </div>
          <div className="mt-5 text-[11px] flex gap-2 font-bold">
            <span className="text-emerald-600">
              {eventDetails.filter((e) => e.status === "PUBLISHED").length}{" "}
              Published
            </span>
            <span className="text-slate-400 font-semibold">
              • {eventDetails.filter((e) => e.status === "DRAFT").length} Drafts
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="bg-white border border-slate-100 rounded-[28px] p-4 sm:p-6 shadow-xs lg:col-span-7 flex flex-col min-h-[360px]">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Event-by-Event Comparison
              </h3>
            </div>
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-250/20 self-end sm:self-auto">
              <button
                onClick={() => setChartMetric("totalRevenue")}
                className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  chartMetric === "totalRevenue"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-400 hover:text-slate-650"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartMetric("soldSeats")}
                className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                  chartMetric === "soldSeats"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-400 hover:text-slate-650"
                }`}
              >
                Tickets Sold
              </button>
            </div>
          </div>

          <div className="relative mt-6 flex-1 flex items-center justify-center min-h-[220px] w-full">
            <svg
              viewBox="0 0 440 220"
              className="w-full h-full overflow-visible font-sans"
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="ticketsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
              </defs>

              {ticks.map((tick, idx) => {
                const y = 20 + (160 * idx) / 4;
                return (
                  <g key={idx}>
                    <line
                      x1="45"
                      y1={y}
                      x2="420"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1.2"
                    />
                    <text
                      x="32"
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9.5px] font-bold tracking-tight"
                      fill="#94a3b8"
                    >
                      {formatTick(tick)}
                    </text>
                  </g>
                );
              })}

              <line
                x1="40"
                y1="180"
                x2="420"
                y2="180"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {eventDetails.slice(0, 5).map((event, index) => {
                const metricValue =
                  chartMetric === "totalRevenue"
                    ? event.totalRevenue || 0
                    : event.soldSeats || 0;
                const pct = niceMax > 0 ? metricValue / niceMax : 0;
                const barHeight = pct * 160;
                const usableWidth = 375;
                const step =
                  usableWidth / Math.max(eventDetails.slice(0, 5).length, 1);
                const barWidth = Math.min(step * 0.4, 30);
                const x = 45 + index * step + (step - barWidth) / 2;
                const y = 180 - barHeight;

                const isHovered = hoveredBar?.index === index;

                return (
                  <g
                    key={event._id}
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredBar({
                        index,
                        event,
                        x: x + barWidth / 2,
                        y: y - 8,
                      })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <rect
                      x={x - 10}
                      y="20"
                      width={barWidth + 20}
                      height="160"
                      fill="transparent"
                    />
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 2)}
                      rx="6"
                      fill={
                        chartMetric === "totalRevenue"
                          ? "url(#revenueGrad)"
                          : "url(#ticketsGrad)"
                      }
                      className="transition-all duration-200 hover:brightness-105"
                      opacity={isHovered ? "1" : "0.85"}
                    />
                    <text
                      x={x + barWidth / 2}
                      y="198"
                      textAnchor="middle"
                      className="text-[8.5px] font-bold transition-all duration-150"
                      fill={
                        isHovered
                          ? chartMetric === "totalRevenue"
                            ? "#059669"
                            : "#6d28d9"
                          : "#64748b"
                      }
                    >
                      {event.title.length > 12
                        ? `${event.title.substring(0, 10)}...`
                        : event.title}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredBar && (
              <div
                className="absolute z-10 bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-[10px] space-y-1 w-44 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
                style={{
                  left: `${(hoveredBar.x / 440) * 100}%`,
                  bottom: `${((220 - hoveredBar.y) / 220) * 100 + 4}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45 border-b border-r border-slate-800" />
                <p className="font-extrabold text-white line-clamp-1">
                  {hoveredBar.event.title}
                </p>
                <div className="border-t border-white/10 my-1 pt-1.5 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revenue:</span>
                    <span className="font-extrabold">
                      ₹{hoveredBar.event.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sold:</span>
                    <span className="font-extrabold">
                      {hoveredBar.event.soldSeats} /{" "}
                      {hoveredBar.event.totalSeats}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sell-through:</span>
                    <span className="font-extrabold text-emerald-400">
                      {hoveredBar.event.sellThroughRate}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[28px] p-4 sm:p-6 shadow-xs lg:col-span-5 flex flex-col min-h-[360px]">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Revenue Share by Tier
            </h3>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-6 mt-6 w-full">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full transform -rotate-90 overflow-visible"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                />

                {vipPct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#a855f7"
                    strokeWidth={hoveredTier === "VIP" ? "11" : "8"}
                    strokeDasharray={`${vipLen} ${c - vipLen}`}
                    strokeDashoffset="0"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredTier("VIP")}
                    onMouseLeave={() => setHoveredTier(null)}
                  />
                )}

                {premiumPct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth={hoveredTier === "PREMIUM" ? "11" : "8"}
                    strokeDasharray={`${premiumLen} ${c - premiumLen}`}
                    strokeDashoffset={-vipLen}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredTier("PREMIUM")}
                    onMouseLeave={() => setHoveredTier(null)}
                  />
                )}

                {standardPct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth={hoveredTier === "STANDARD" ? "11" : "8"}
                    strokeDasharray={`${standardLen} ${c - standardLen}`}
                    strokeDashoffset={-(vipLen + premiumLen)}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredTier("STANDARD")}
                    onMouseLeave={() => setHoveredTier(null)}
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
                {hoveredTier ? (
                  <>
                    <span
                      className="text-[8px] font-extrabold uppercase tracking-widest transition-colors duration-150"
                      style={{
                        color: {
                          VIP: "#a855f7",
                          PREMIUM: "#f97316",
                          STANDARD: "#10b981",
                        }[hoveredTier],
                      }}
                    >
                      {hoveredTier}
                    </span>
                    <span className="text-base font-black text-slate-900 mt-0.5 animate-in fade-in duration-150">
                      ₹{(revenueByTier[hoveredTier] || 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold mt-0.5">
                      {totalRevenue > 0
                        ? `${Math.round(((revenueByTier[hoveredTier] || 0) / totalRevenue) * 100)}%`
                        : "0%"}{" "}
                      share
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">
                      AGGREGATE
                    </span>
                    <span className="text-base font-black text-slate-900 mt-0.5">
                      ₹{totalRevenue.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold mt-0.5">
                      Total Revenue
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
              {["VIP", "PREMIUM", "STANDARD"].map((tier) => {
                const rev = revenueByTier[tier] || 0;
                const sold = seatsSoldByTier[tier] || 0;
                const total = totalSeatsByTier[tier] || 0;
                const pct = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;

                const tierColors = {
                  VIP: { dot: "bg-[#a855f7]", fill: "#a855f7" },
                  PREMIUM: { dot: "bg-[#f97316]", fill: "#f97316" },
                  STANDARD: { dot: "bg-[#10b981]", fill: "#10b981" },
                }[tier];

                return (
                  <div
                    key={tier}
                    className={`flex items-center justify-between transition-opacity duration-150 ${
                      hoveredTier && hoveredTier !== tier
                        ? "opacity-40"
                        : "opacity-100"
                    }`}
                    onMouseEnter={() => setHoveredTier(tier)}
                    onMouseLeave={() => setHoveredTier(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${tierColors.dot}`}
                      />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                        {tier}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">
                        ₹{rev.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {Math.round(pct)}% share • {sold}/{total} Sold
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[28px] shadow-xs overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2 bg-white">
          <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            Detailed Performance Metrics
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Event Title
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Sell-Through Rate
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  VIP Seats (Sold)
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Premium Seats (Sold)
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Standard Seats (Sold)
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventDetails.map((event) => {
                const total = event.totalSeats || 0;
                const sold = event.soldSeats || 0;
                const pct = event.sellThroughRate || 0;

                return (
                  <tr
                    key={event._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-1 max-w-[220px]">
                          {event.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-350" />
                          {formatDate(event.startDate)}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="w-[155px] space-y-1.5">
                        <div className="flex justify-between items-baseline text-[11px] font-bold">
                          <span className="text-slate-800">{pct}%</span>
                          <span className="text-slate-400 font-semibold text-[10px]">
                            {sold} / {total} sold
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {event.seatsSoldByTier.VIP} /{" "}
                          {event.seatsTotalByTier.VIP}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          ₹{event.revenueByTier.VIP.toLocaleString()}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {event.seatsSoldByTier.PREMIUM} /{" "}
                          {event.seatsTotalByTier.PREMIUM}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          ₹{event.revenueByTier.PREMIUM.toLocaleString()}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {event.seatsSoldByTier.STANDARD} /{" "}
                          {event.seatsTotalByTier.STANDARD}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          ₹{event.revenueByTier.STANDARD.toLocaleString()}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-900">
                        ₹{event.totalRevenue.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}

              <tr className="bg-slate-50/50 border-t border-slate-200 font-extrabold">
                <td className="px-6 py-5">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    TOTAL AGGREGATE
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="w-[155px] space-y-1.5">
                    <div className="flex justify-between items-baseline text-[11px] font-bold">
                      <span className="text-slate-950 font-black">
                        {sellThroughRate}%
                      </span>
                      <span className="text-slate-400 font-bold text-[10px]">
                        {seatsSold} / {totalSeats} sold
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${sellThroughRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col text-xs text-slate-900">
                    <span className="font-extrabold">
                      {seatsSoldByTier.VIP} / {totalSeatsByTier.VIP}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col text-xs text-slate-900">
                    <span className="font-extrabold">
                      {seatsSoldByTier.PREMIUM} / {totalSeatsByTier.PREMIUM}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col text-xs text-slate-900">
                    <span className="font-extrabold">
                      {seatsSoldByTier.STANDARD} / {totalSeatsByTier.STANDARD}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-black text-slate-900">
                    ₹{totalRevenue.toLocaleString()}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrganizerAnalytics;
