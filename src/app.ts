import "express-async-errors";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { Application, NextFunction, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import routeNotFoundError from "./app/middlewares/routeNotFoundError";
import { AuthRouter } from "./app/modules/auth/auth.route";
import { BusRouter } from "./app/modules/bus/bus.route";
import { RouteRouter } from "./app/modules/route/route.route";
import { TripRouter } from "./app/modules/trip/trip.route";
import { logger } from "./shared/logger";
import { SOCKET_EVENTS } from "./constants";
import { BusModel } from "./app/modules/bus/bus.model";
import ApiError from "./errors/ApiError";
import { stat } from "fs";
import { io } from "./server";
import { ScheduleRouter } from "./app/modules/schedule/schedule.route";
import UserModel from "./app/modules/auth/auth.model";
import { broadcastLocation } from "./app/socket/broadcast";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  // console.log(req.url);
  next();
});

// routes
app.get("/", (req: Request, res: Response) => {
  res.send("HELLO WORLD");
});

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/buses", BusRouter);
app.use("/api/v1/routes", RouteRouter);
app.use("/api/v1/trips", TripRouter);
app.use("/api/v1/schedules", ScheduleRouter);
app.use(globalErrorHandler);
app.use(routeNotFoundError);
// ---------------------------
// Socket IO
// ---------------------------

export const socketHandler = (socket: any) => {
  // console.log(`🟢 New client connected: ${socket.id}`);

  // 1️⃣ User joins a route-specific room
  socket.on(SOCKET_EVENTS.JOIN_ROUTE, (routeId: string) => {
    socket.join(routeId);
    const currUserCnt = io.sockets.adapter.rooms.get(routeId)?.size;
    // console.log(`👥 Client ${socket.id} joined; cnt: ${currUserCnt}`);
  });

  // 2️⃣ Bus broadcasts location updates along with user count and host name
  socket.on(SOCKET_EVENTS.BROADCAST_BUS_LOCATION, broadcastLocation);

  // 3️⃣ User leaves the route-specific room
  socket.on("leave-room", (room: string) => {
    socket.leave(room);
    // console.log(`👤 Client ${socket.id} left room ${room}`);
    // const currUserCnt = io.sockets.adapter.rooms.get(room)?.size;
    // console.log(`👤 Client ${socket.id} left room ${room}; cnt: ${currUserCnt}`);
  });

  // 4️⃣ Handle disconnection
  socket.on("disconnect", () => {
    // console.log(`🔴 Client disconnected: ${socket.id}`);
  });
};

export default app;
