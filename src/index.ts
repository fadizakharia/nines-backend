import * as dotenv from "dotenv";
import { json } from "body-parser";

import express, { NextFunction, Request, Response } from "express";
import session, { SessionOptions } from "express-session";
import { ResponseError } from "./util/Error/Error";
import mongoose from "mongoose";
import Cors from "cors";
import { authRouter } from "./routes/auth";
import MongoStore from "connect-mongo";
import { pollRouter } from "./routes/poll";
dotenv.config();
const app = express();
declare module "express-session" {
  interface Session {
    user: { [key: string]: any };
  }
}
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
      secure: false,
      path: "/",
    },
  } as SessionOptions)
);

app.use(json());

app.use(Cors({ credentials: true }));
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
