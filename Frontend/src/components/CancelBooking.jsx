import { useState } from "react";
import apiRequest from "../utils/apiRequest";
import toast from "react-hot-toast";
import { AlertTriangle, X, ShieldAlert, Trash2 } from "lucide-react";

const CancelBooking = ({ booking, onClose, onSuccess }) => {
  const [isCancelling, setIsCancelling] = useState(false);

  if (!booking) return null;

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await apiRequest.post(`/bookings/${booking._id}/cancel`);
      if (res.data?.success) {
        toast.success(
          "Booking successfully cancelled. Seats have been released!",
        );
        onSuccess();
      }
    } catch (err) {
      console.error("Cancellation error:", err);
      toast.error(
        err.response?.data?.message ||
          "Could not cancel booking. Please try again.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-5 flex items-start gap-4">
          <div className="bg-rose-100 p-2.5 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Cancel Ticket Reservation?
            </h3>
            <p className="text-xs text-rose-700 font-semibold mt-0.5 uppercase tracking-wider">
              Important Policy Information
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 p-1 transition-colors ml-auto focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>Are you sure you want to cancel your tickets for the event:</p>
            <p className="font-extrabold text-slate-950 bg-slate-50 border border-slate-150 p-3 rounded-xl">
              {booking.eventId?.title}
            </p>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-150 p-3.5 rounded-xl mt-2 text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Seats to be Released:</span>{" "}
                {booking.seats.map((s) => s.seatId).join(", ")}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
          >
            No, Keep Booking
          </button>
          <button
            onClick={handleConfirmCancel}
            disabled={isCancelling}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg shadow-rose-600/10 active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isCancelling ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Cancelling...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Cancel Reservation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBooking;
