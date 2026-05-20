import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import {
  X,
  Clock,
  Ticket,
  Lock,
  Armchair,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Download,
  Check,
} from "lucide-react";
import apiRequest from "../utils/apiRequest";
import toast from "react-hot-toast";

const SeatMap = ({
  eventId,
  onClose,
  eventTitle,
  pricingTiers,
  currentUser,
}) => {
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heldUntil, setHeldUntil] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedDetails, setBookedDetails] = useState(null);

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_ENDPOINT.replace("/api", "");
    socketRef.current = io(socketUrl, {
      withCredentials: true,
    });

    socketRef.current.emit("joinEventRoom", { eventId });

    socketRef.current.on("seatsUpdated", (data) => {
      if (data.eventId === eventId) {
        setSeatMap(data.seatMap);
      }
    });

    const fetchInitialData = async () => {
      try {
        const res = await apiRequest.get(`/events/${eventId}`);
        if (res.data?.success) {
          const event = res.data.data;
          setSeatMap(event.seatMap || []);

          const myHeldSeats = event.seatMap.filter(
            (s) =>
              s.status === "HELD" &&
              s.heldBy?.toString() === currentUser?._id?.toString(),
          );
          if (myHeldSeats.length > 0) {
            setSelectedSeats(myHeldSeats.map((s) => s.seatId));
            const latestHold = new Date(
              Math.max(
                ...myHeldSeats.map((s) => new Date(s.heldUntil).getTime()),
              ),
            );
            setHeldUntil(latestHold);
          }
        }
      } catch (err) {
        console.error("Error loading seating data:", err);
        toast.error("Could not retrieve real-time seat configuration.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveEventRoom", { eventId });
        socketRef.current.disconnect();
      }
    };
  }, [eventId, currentUser]);

  useEffect(() => {
    if (!heldUntil) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const difference = new Date(heldUntil).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft(0);
        clearInterval(timerRef.current);
        handleTimeout();
      } else {
        const minutes = Math.floor(difference / 1000 / 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => clearInterval(timerRef.current);
  }, [heldUntil]);

  const handleTimeout = async () => {
    if (selectedSeats.length === 0) return;
    try {
      await apiRequest.post(`/events/release/${eventId}`, {
        seatIds: selectedSeats,
      });
      setSelectedSeats([]);
      setHeldUntil(null);
      toast(
        (t) => (
          <span className="flex items-center gap-2 text-amber-700 font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />
            Seating hold expired. Your seats have been released.
          </span>
        ),
        { duration: 6000 },
      );
    } catch (err) {
      console.error("Error releasing seats on timeout:", err);
    }
  };

  const handleManualClose = async () => {
    if (selectedSeats.length > 0 && !isBooked) {
      try {
        await apiRequest.post(`/events/release/${eventId}`, {
          seatIds: selectedSeats,
        });
      } catch (err) {
        console.error("Error releasing seats on close:", err);
      }
    }
    onClose();
  };

  const handleSeatClick = async (seat) => {
    if (loading) return;

    const isCurrentlySelected = selectedSeats.includes(seat.seatId);

    try {
      if (isCurrentlySelected) {
        const res = await apiRequest.post(`/events/release/${eventId}`, {
          seatIds: [seat.seatId],
        });
        if (res.data?.success) {
          const newSelected = selectedSeats.filter((id) => id !== seat.seatId);
          setSelectedSeats(newSelected);
          if (newSelected.length === 0) {
            setHeldUntil(null);
          }
        }
      } else {
        const res = await apiRequest.post(`/events/hold/${eventId}`, {
          seatIds: [seat.seatId],
        });
        if (res.data?.success) {
          setSelectedSeats([...selectedSeats, seat.seatId]);
          setHeldUntil(new Date(res.data.data.heldUntil));
          toast.success(`Seat ${seat.seatId} held for 5 minutes.`);
        }
      }
    } catch (err) {
      console.error("Seat toggle failed:", err);
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat to book.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest.post(`/events/book/${eventId}`, {
        seatIds: selectedSeats,
      });

      if (res.data?.success) {
        setBookedDetails({
          seats: selectedSeats,
          totalPrice: calculateTotalPrice(),
          eventTitle,
          bookingDate: new Date(),
          ticketNo: `SE-${Math.floor(100000 + Math.random() * 900000)}`,
        });
        setIsBooked(true);
        setSelectedSeats([]);
        setHeldUntil(null);
        toast.success("Seats successfully reserved! Enjoy your event.");
      }
    } catch (err) {
      console.error("Booking checkout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, id) => {
      const seat = seatMap.find((s) => s.seatId === id);
      return total + (seat ? seat.price : 0);
    }, 0);
  };

  const rowsGroup = {};
  seatMap.forEach((seat) => {
    if (!rowsGroup[seat.row]) {
      rowsGroup[seat.row] = [];
    }
    rowsGroup[seat.row].push(seat);
  });

  const getTierColor = (tier) => {
    switch (tier) {
      case "VIP":
        return "border-rose-400 bg-rose-50/40 text-rose-600 hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-md hover:shadow-rose-500/10";
      case "PREMIUM":
        return "border-amber-400 bg-amber-50/40 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/10";
      case "STANDARD":
      default:
        return "border-emerald-450 bg-emerald-50/40 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-650 hover:shadow-md hover:shadow-emerald-500/10";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col text-slate-800">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 opacity-80" />

        <div className="p-6 border-b border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider block mb-1">
              Interactive Seating Chart
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-slate-900 truncate max-w-lg sm:max-w-xl">
              {eventTitle}
            </h2>
          </div>
          <button
            onClick={handleManualClose}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-550 hover:text-slate-900 transition-all border border-slate-200/60 shadow-sm active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isBooked ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 min-h-0">
            <div className="flex-1 bg-slate-50/50 border border-slate-200/60 rounded-2xl p-6 overflow-x-auto flex flex-col min-h-[450px] shadow-inner">
              <div className="w-full max-w-md flex flex-col items-center mb-10 shrink-0 mx-auto">
                <div className="w-full h-2.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"></div>
                <div className="text-[10px] text-slate-450 font-black tracking-widest mt-2 uppercase">
                  Stage / Screen Front
                </div>
              </div>

              {loading && seatMap.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3 pb-8 shrink-0 min-w-max mx-auto">
                  {Object.keys(rowsGroup)
                    .sort()
                    .map((rowLabel) => (
                      <div key={rowLabel} className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-black text-slate-400 select-none">
                          {rowLabel}
                        </span>

                        <div className="flex items-center gap-2">
                          {rowsGroup[rowLabel]
                            .sort((a, b) => a.number - b.number)
                            .map((seat) => {
                              const isSelected = selectedSeats.includes(
                                seat.seatId,
                              );
                              const isSold = seat.status === "SOLD";
                              const isHeldByOthers =
                                seat.status === "HELD" &&
                                seat.heldBy?.toString() !==
                                  currentUser?._id?.toString();

                              let seatClass = "";
                              let content = (
                                <span className="text-[9px] font-black">
                                  {seat.number}
                                </span>
                              );

                              if (isSold) {
                                seatClass =
                                  "bg-slate-100 text-slate-350 border-slate-200 cursor-not-allowed opacity-80 shadow-none";
                                content = (
                                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                                );
                              } else if (isHeldByOthers) {
                                seatClass =
                                  "border-amber-200 bg-amber-50/70 text-amber-600 cursor-not-allowed opacity-80 shadow-none";
                                content = <Lock className="w-2.5 h-2.5" />;
                              } else if (isSelected) {
                                seatClass =
                                  "bg-green-600 border-green-600 text-white font-black scale-110 shadow-lg shadow-green-500/20 animate-pulse";
                                content = (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                );
                              } else {
                                // Available
                                seatClass = `border ${getTierColor(seat.tier)}`;
                              }

                              return (
                                <button
                                  key={seat.seatId}
                                  disabled={isSold || isHeldByOthers}
                                  onClick={() => handleSeatClick(seat)}
                                  title={`Row ${seat.row}, Seat ${seat.number} • ${seat.tier} (₹${seat.price})`}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 border cursor-pointer select-none font-bold ${seatClass}`}
                                >
                                  {content}
                                </button>
                              );
                            })}
                        </div>

                        <span className="w-6 text-center text-xs font-black text-slate-400 select-none">
                          {rowLabel}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 justify-between">
              {selectedSeats.length > 0 && timeLeft !== null && (
                <div className="bg-amber-50/65 border border-amber-200/70 rounded-2xl p-4 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-250 flex items-center justify-center text-amber-650 animate-pulse">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider leading-none mb-1">
                        Hold Session Timer
                      </p>
                      <p className="text-xs text-amber-800 font-semibold">
                        Complete check-out in:
                      </p>
                    </div>
                  </div>
                  <div className="text-xl font-black font-mono text-amber-705 tracking-wider">
                    {timeLeft}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 shrink-0 shadow-sm">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Layout Legend
                </h4>
                <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border border-rose-350 bg-rose-50 flex items-center justify-center text-rose-600 font-extrabold text-[8px]">
                      V
                    </span>
                    <span>VIP Tier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border border-amber-350 bg-amber-50 flex items-center justify-center text-amber-650 font-extrabold text-[8px]">
                      P
                    </span>
                    <span>Premium Tier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border border-emerald-350 bg-emerald-50 flex items-center justify-center text-emerald-650 font-extrabold text-[8px]">
                      S
                    </span>
                    <span>Standard Tier</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="w-4 h-4 rounded border border-green-600 bg-green-600 flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                    <span>Your Hold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-600">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                    <span>Held by Other</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                    <span>Sold Seat</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-end gap-5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex-1 flex flex-col justify-between min-h-[180px] shadow-sm">
                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                      Selected Seats
                    </h4>

                    {selectedSeats.length === 0 ? (
                      <div className="h-28 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-slate-200/85 bg-white rounded-xl px-4">
                        <Armchair className="w-8 h-8 mb-2 opacity-35" />
                        <p className="text-xs font-semibold leading-relaxed">
                          Click available seats in the seating grid to hold and
                          select them.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-36 overflow-y-auto flex flex-wrap gap-2 pr-1">
                        {selectedSeats.map((id) => {
                          const seat = seatMap.find((s) => s.seatId === id);
                          let badgeBg =
                            "bg-emerald-50 text-emerald-700 border-emerald-250";
                          if (seat?.tier === "VIP")
                            badgeBg =
                              "bg-rose-50 text-rose-700 border-rose-250";
                          if (seat?.tier === "PREMIUM")
                            badgeBg =
                              "bg-amber-50 text-amber-700 border-amber-250";
                          return (
                            <span
                              key={id}
                              className={`px-3 py-1 rounded-lg text-xs font-black border flex items-center gap-1.5 ${badgeBg}`}
                            >
                              <span>{id}</span>
                              <span className="text-[9px] opacity-75">
                                ₹{seat?.price}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {selectedSeats.length > 0 && (
                    <div className="border-t border-slate-200 pt-4 mt-4 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                          Total Payable Amount
                        </span>
                        <span className="text-2xl font-black text-slate-900">
                          ₹{calculateTotalPrice().toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-slate-700 font-extrabold bg-slate-200 border border-slate-350 px-3 py-1 rounded-lg">
                        {selectedSeats.length}{" "}
                        {selectedSeats.length === 1 ? "Ticket" : "Tickets"}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  disabled={selectedSeats.length === 0 || loading}
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold shadow-lg shadow-green-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Reserve & Book Seats</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Booked Confirmation Ticket Overlay */
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex flex-col items-center justify-center bg-slate-900/10 max-h-[80vh]">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-6 animate-bounce shadow-md">
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-center text-slate-900 mb-2 leading-none">
              Reservation Successful!
            </h3>
            <p className="text-xs text-slate-500 text-center mb-10 max-w-sm">
              Your tickets are confirmed. Below is your virtual booking voucher
              pass.
            </p>

            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 rounded-full bg-slate-50 border-r border-slate-200/80 z-10"></div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 rounded-full bg-slate-50 border-l border-slate-200/80 z-10"></div>

              <div className="p-6 bg-slate-50 pb-6 border-b border-dashed border-slate-200/80">
                <span className="inline-block px-3 py-1 bg-emerald-550/10 rounded-full text-[10px] font-black border border-emerald-500/20 text-emerald-600 uppercase tracking-widest mb-3">
                  SmartEvent Voucher
                </span>
                <h4 className="text-lg font-black text-slate-900 mb-1 leading-tight">
                  {bookedDetails.eventTitle}
                </h4>
                <p className="text-xs text-slate-450 leading-none">
                  Ticket No: {bookedDetails.ticketNo}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                      Customer Name
                    </span>
                    <span className="font-bold text-slate-700">
                      {currentUser?.username}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                      Date of Purchase
                    </span>
                    <span className="font-bold text-slate-700">
                      {new Date(bookedDetails.bookingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white pt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                      Allocated Seats
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {bookedDetails.seats.map((id) => (
                        <span
                          key={id}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded text-xs font-extrabold text-slate-700"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">
                      Total Paid
                    </span>
                    <span className="text-xl font-black text-emerald-650">
                      ₹{bookedDetails.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 shrink-0 select-none">
                  <div className="h-10 w-full flex items-center justify-center gap-0.5 overflow-hidden">
                    {Array.from({ length: 38 }).map((_, i) => {
                      const widths = ["w-0.5", "w-1", "w-1.5"];
                      const width = widths[(i * 7 + 3) % widths.length];
                      const opacity =
                        (i * 3) % 2 === 0 ? "opacity-75" : "opacity-30";
                      return (
                        <div
                          key={i}
                          className={`h-full bg-slate-400 ${width} ${opacity}`}
                        ></div>
                      );
                    })}
                  </div>
                  <span className="text-[9px] font-mono text-slate-450 font-black tracking-widest leading-none">
                    *SMARTEVENT-{bookedDetails.ticketNo}*
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4 shrink-0">
              <button
                onClick={() => {
                  toast.success("Receipt ticket details saved!");
                }}
                className="px-6 py-3 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-750 font-extrabold rounded-xl transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save Receipt Voucher</span>
              </button>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl shadow-lg shadow-green-600/20 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete Reservation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMap;
