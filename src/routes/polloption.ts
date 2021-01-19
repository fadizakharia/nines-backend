import express from "express";
import isLoggedIn from "../middleware/auth-validator";
import isVerified from "../middleware/verified-validator";
import {
  addPollOptionValidator,
  editPollOptionValidator,
  removePollOptionValidator,
  voteValidator,
} from "../middleware/express-validators";
import {
  addPollOptionHandler,
  addVoteHandler,
  deletePollOptionHandler,
  editPollOptionHandler,
  removeVoteHandler,
} from "../controllers/polloption";

const app = express.Router();
app.post(
  "/poll/polloption",
  addPollOptionValidator,
  isLoggedIn,
  isVerified,
  addPollOptionHandler
);
app.delete(
  "/poll/polloption",
  removePollOptionValidator,
  isLoggedIn,
  isVerified,
  deletePollOptionHandler
);
app.put(
  "/poll/polloption",
  editPollOptionValidator,
  isLoggedIn,
  isVerified,
  editPollOptionHandler
);
app.put(
  "/poll/polloption/vote",
  voteValidator,
  isLoggedIn,
  isVerified,
  addVoteHandler
);
app.delete(
  "/poll/polloption/vote",
  voteValidator,
  isLoggedIn,
  isVerified,
  removeVoteHandler
);

export { app as pollOptionRouter };
