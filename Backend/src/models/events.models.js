import mongoose from "mongoose";
const { Schema } = mongoose;
const seatSubSchema = new Schema(
  {
    seatId: {
      type: String,
      required: [true, "seatId is required"],
    },
    row: {
      type: String,
      required: [true, "Row  is required"],
      uppercase: true,
      trim: true,
    },
    number: {
      type: Number,
      required: [true, "Seat number is required"],
      min: [1, "Seat number must be at least 1"],
    },
    tier: {
      type: String,
      enum: {
        values: ["VIP", "PREMIUM", "STANDARD"],
        message: "Tier must be vip, premium, or standard",
      },
      required: [true, "Pricing tier is required"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    status: {
      type: String,
      enum: {
        values: ["AVAILABLE", "HELD", "SOLD"],
        message: "Status must be available, held, or sold",
      },
      default: "AVAILABLE",
    },

    heldBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    heldUntil: {
      type: Date,
      default: null,
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { _id: false },
);

const pricingTierSchema = new Schema(
  {
    tier: {
      type: String,
      enum: ["VIP", "PREMIUM", "STANDARD"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    label: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      enum: {
        values: [
          "CONCERT",
          "SPORTS",
          "THEATRE",
          "CONFERENCE",
          "COMEDY",
          "FESTIVAL",
          "OTHER",
        ],
        message: "Invalid event category",
      },
      required: [true, "Category is required"],
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    venue: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
    },

    bannerUrl: {
      type: String,
      default: null,
    },

    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      default: null,
    },

    saleWindowStart: {
      type: Date,
      default: null,
    },
    saleWindowEnd: {
      type: Date,
      default: null,
    },

    rows: {
      type: Number,
      required: [true, "Number of rows is required"],
      min: [1, "Must have at least 1 row"],
      max: [26, "Cannot  26 rows (A–Z)"],
    },

    seatsPerRow: {
      type: Number,
      required: [true, "Seats per row is required"],
      min: [1, "Must have at least 1 seat per row"],
      max: [500, "Cannot exceed 500 seats per row"],
    },

    pricingTiers: {
      type: [pricingTierSchema],
      default: [],
    },

    seatMap: {
      type: [seatSubSchema],
      default: [],
    },

    status: {
      type: String,
      enum: {
        values: ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"],
        message: "Invalid event status",
      },
      default: "DRAFT",
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },

    analytics: {
      totalSeats: { type: Number, default: 0 },
      soldSeats: { type: Number, default: 0 },
      heldSeats: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

eventSchema.virtual("availableSeats").get(function () {
  return this.seatMap.filter((s) => s.status === "AVAILABLE").length;
});

eventSchema.virtual("soldSeats").get(function () {
  return this.seatMap.filter((s) => s.status === "SOLD").length;
});

eventSchema.virtual("isSaleOpen").get(function () {
  const now = new Date();
  if (this.saleWindowStart && now < this.saleWindowStart) return false;
  if (this.saleWindowEnd && now > this.saleWindowEnd) return false;
  return this.status === "PUBLISHED";
});

eventSchema.statics.buildSeatMap = function (
  rows,
  seatsPerRow,
  pricingTiers = [],
) {
  const ROW_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const priceMap = {};
  pricingTiers.forEach(({ tier, price }) => {
    priceMap[tier] = price;
  });

  if (!priceMap.VIP) priceMap.VIP = 5000;
  if (!priceMap.PREMIUM) priceMap.PREMIUM = 3000;
  if (!priceMap.STANDARD) priceMap.STANDARD = 1500;

  const vipRows = Math.max(1, Math.floor(rows * 0.15));
  const premiumRows = Math.max(1, Math.floor(rows * 0.35));

  const seatMap = [];
  for (let r = 0; r < rows; r++) {
    const rowLabel = ROW_LABELS[r];
    const tier =
      r < vipRows ? "VIP" : r < vipRows + premiumRows ? "PREMIUM" : "STANDARD";
    for (let s = 1; s <= seatsPerRow; s++) {
      seatMap.push({
        seatId: `${rowLabel}-${s}`,
        row: rowLabel,
        number: s,
        tier,
        price: priceMap[tier],
        status: "AVAILABLE",
        heldBy: null,
        heldUntil: null,
        bookingId: null,
      });
    }
  }
  return seatMap;
};

eventSchema.pre("save", function () {
  if (this.isModified("seatMap")) {
    this.analytics.totalSeats = this.seatMap.length;
    this.analytics.soldSeats = this.seatMap.filter(
      (s) => s.status === "SOLD",
    ).length;
    this.analytics.heldSeats = this.seatMap.filter(
      (s) => s.status === "HELD",
    ).length;
    this.analytics.totalRevenue = this.seatMap
      .filter((s) => s.status === "SOLD")
      .reduce((sum, s) => sum + s.price, 0);
  }
});

const eventModal = mongoose.model("Event", eventSchema);

export default eventModal;
