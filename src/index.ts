import * as dotenv from "dotenv";
import { json } from "body-parser";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import express, { NextFunction, Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import { ResponseError } from "./util/Error/Error";
import mongoose from "mongoose";
import Cors from "cors";
import { authRouter } from "./routes/auth";
import MongoStore from "connect-mongo";
import { pollRouter } from "./routes/poll";
import { PollsDoc } from "./models/poll";
import { EventsDoc } from "./models/Event";
dotenv.config();
const app = express();

app.set("trust proxy", 1);

mongoose.connect(process.env.DB_CONNECTION_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const mongoStore = MongoStore(session);
app.use(
  session({
    secret: process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "auth",
    store: new mongoStore({
      mongooseConnection: mongoose.connection,
      collection: "session",
    }),
    cookie: {
      httpOnly: true,
      signed: false,
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "prod",
      path: "/",
    },
  } as SessionOptions)
);

app.use(json());

app.use(Cors({ credentials: true }));
const server = createServer(app);
const io = new Server(server);
io.on("connect", (socket: Socket) => {
  console.log("connecion");
});
io.on("updatedPoll", (socket: Socket, data: PollsDoc) => {
  io.sockets.emit(data.toObject());
});
io.on("createdPoll", (socket: Socket, data: PollsDoc) => {
  io.sockets.emit(data.toObject());
});
io.on("createEvent", (socket: Socket, data: EventsDoc) => {
  io.sockets.emit(data.toObject());
});
io.on("updateEvent", (socket: Socket, data: EventsDoc) => {
  io.sockets.emit(data.toObject());
});
app.use((req: Request, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});
app.use(authRouter);
app.use(pollRouter);
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: ResponseError = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use(
  (error: ResponseError, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);
    return res.json({
      error: {
        message: error.message,
      },
    });
  }
);

module.exports = app;
app.listen("4000", () => {
  console.log("started on 4000");
});
