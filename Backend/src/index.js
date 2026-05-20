import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/db.js";
import { app } from "./app.js";

import http from "http";
import { Server } from "socket.io";
import eventModal from "./models/events.models.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

global.io = io;

io.on("connection", (socket) => {
  socket.on("joinEventRoom", ({ eventId }) => {
    socket.join(eventId);
    console.log(`User socket ${socket.id} joined event room: ${eventId}`);
  });

  socket.on("leaveEventRoom", ({ eventId }) => {
    socket.leave(eventId);
    console.log(`User socket ${socket.id} left event room: ${eventId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

setInterval(async () => {
  try {
    const now = new Date();
    const eventsWithExpiredHolds = await eventModal.find({
      seatMap: {
        $elemMatch: {
          status: "HELD",
          heldUntil: { $lt: now },
        },
      },
    });

    for (const event of eventsWithExpiredHolds) {
      let modified = false;
      event.seatMap.forEach((seat) => {
        if (seat.status === "HELD" && seat.heldUntil && seat.heldUntil < now) {
          seat.status = "AVAILABLE";
          seat.heldBy = null;
          seat.heldUntil = null;
          modified = true;
        }
      });
      if (modified) {
        await event.save();
        if (global.io) {
          global.io.to(event._id.toString()).emit("seatsUpdated", {
            eventId: event._id,
            seatMap: event.seatMap,
          });
        }
        console.log(`Auto-released expired seat holds for event: ${event._id}`);
      }
    }
  } catch (err) {
    console.error("Error in active auto-release background job:", err);
  }
}, 15000);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server is Running on ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("DB Connection Failed..!", err);
  });
