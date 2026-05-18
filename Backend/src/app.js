import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js";
export const app = express();

import userRouter from "./routes/users.route.js";
import eventRouter from "./routes/events.route.js";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api/users", userRouter);
app.use("/api/events", eventRouter);

//error handler
app.use(errorHandler);
