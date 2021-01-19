import express from "express";
import {
  getUserEventsHandler,
  getEventsHandler,
  createEventHandler,
  EditEventHandler,
  deleteEventHandler,
  addAttendingHandler,
  removeAttendingHandler,
} from "../controllers/event";

import isLoggedIn from "../middleware/auth-validator";
import {
  getUserEventsValidator,
  getEventsValidator,
  createEventValidator,
  EditEventValidator,
  deleteEventValidator,
  addAttendingValidator,
  removeAttendingValidator,
} from "../middleware/express-validators";
import isVerified from "../middleware/verified-validator";

const app = express.Router();
app.post(
  "/event/attending",
  addAttendingValidator,
  isLoggedIn,
  isVerified,
  addAttendingHandler
);
app.post(
  "/event/attending",
  removeAttendingValidator,
  isLoggedIn,
  isVerified,
  removeAttendingHandler
);
app.get(
  "/event/user",
  getUserEventsValidator,
  isLoggedIn,
  isVerified,
  getUserEventsHandler
);
app.get("/event", getEventsValidator, getEventsHandler);
app.post(
  "/event",
  createEventValidator,
  isLoggedIn,
  isVerified,
  createEventHandler
);
app.put("/event", EditEventValidator, isLoggedIn, isVerified, EditEventHandler);
app.delete(
  "/event",
  deleteEventValidator,
  isLoggedIn,
  isVerified,
  deleteEventHandler
);

export { app as pollRouter };
