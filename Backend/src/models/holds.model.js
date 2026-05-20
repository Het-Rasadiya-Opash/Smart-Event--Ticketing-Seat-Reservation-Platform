import mongoose from "mongoose";

const { Schema } = mongoose;

const holdSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required for a hold"],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required for a hold"],
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
    heldUntil: {
      type: Date,
      required: [true, "Expiration time (heldUntil) is required"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "RELEASED", "CONVERTED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

// Virtual to check if the hold has expired
holdSchema.virtual("isExpired").get(function () {
  return new Date() > this.heldUntil;
});

const holdModel = mongoose.model("Hold", holdSchema);
export default holdModel;
