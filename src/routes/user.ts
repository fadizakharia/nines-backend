import express from "express";
import { currentUserHandler } from "../controllers/auth";
import {
  deleteUserHandler,
  getUserHandler,
  getUsersHandler,
  updateUserHandler,
} from "../controllers/user";
import isAdmin from "../middleware/admin-validator";
import isLoggedIn from "../middleware/auth-validator";
import { updateUserValidator } from "../middleware/express-validators";
import isVerified from "../middleware/verified-validator";

const app = express.Router();
app.get("/user/current", isLoggedIn, currentUserHandler);
app.post("/user/users", getUsersHandler);
app.get("/user", getUserHandler);
app.put(
  "/user",
  isLoggedIn,
  isVerified,
  updateUserValidator,
  updateUserHandler
);
app.delete("/user", isLoggedIn, isVerified, isAdmin, deleteUserHandler);
export { app as userRouter };
