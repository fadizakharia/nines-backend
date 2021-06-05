import express from "express";
import {
  createPollHandler,
  getPollsHandler,
  deletePollHandler,
  getUserPollsHandler,
  updatePollHandler,
} from "../controllers/poll";
import isLoggedIn from "../middleware/auth-validator";
import {
  getUserPollsValidator,
  getPollsValidator,
  postPollValidator,
  updatePollValidator,
  deletePollValidator,
} from "../middleware/express-validators";
import isVerified from "../middleware/verified-validator";

const app = express.Router();
app.get(
  "/poll/user",
  getUserPollsValidator,
  isLoggedIn,
  isVerified,
  getUserPollsHandler
);
app.get("/poll/:createdAt", getPollsValidator, isLoggedIn, getPollsHandler);
app.post("/poll", postPollValidator, isLoggedIn, isVerified, createPollHandler);
app.put(
  "/poll",
  updatePollValidator,
  isLoggedIn,
  isVerified,
  updatePollHandler
);
app.delete(
  "/poll",
  deletePollValidator,
  isLoggedIn,
  isVerified,
  deletePollHandler
);

export { app as pollRouter };
