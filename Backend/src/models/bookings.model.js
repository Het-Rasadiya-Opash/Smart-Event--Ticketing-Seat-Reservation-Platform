import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required for a booking"],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required for a booking"],
    },
    seats: [
      {
        seatId: {
          type: String,
          required: [true, "Seat ID is required"],
        },
        row: {
          type: String,
          required: [true, "Row is required"],
          uppercase: true,
        },
        number: {
          type: Number,
          required: [true, "Seat number is required"],
        },
        tier: {
          type: String,
          enum: ["VIP", "PREMIUM", "STANDARD"],
          required: [true, "Pricing tier is required"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
        message:
          "Payment status must be pending, completed, failed, or refunded",
      },
      default: "PENDING",
    },
    paymentIntentId: {
      type: String,
      default: null,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const bookingModel = mongoose.model("Booking", bookingSchema);
export default bookingModel;
