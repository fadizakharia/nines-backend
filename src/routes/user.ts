import express from "express";
import { currentUserHandler } from "../controllers/auth";
import multer from "multer";
import { v1 } from "uuid";
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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, v1());
  },
});
const acceptedImages = ["image/jpeg", "image/png", "image/jpg"];
const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: (Error, status) => void
) => {
  if (acceptedImages.indexOf(file.mimetype) > -1) {
    cb(null, true);
  } else {
    cb(
      new Error("file type is unsupported please use either png, jpg or jpeg"),
      false
    );
  }
};
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 8 },
  fileFilter,
});
app.get("/user/:current", getUserHandler);
app.get("/user", isLoggedIn, currentUserHandler);
app.post("/user/users", getUsersHandler);
app.put(
  "/user",
  upload.single("profilePicture"),
  isLoggedIn,
  isVerified,
  updateUserValidator,
  updateUserHandler
);
app.delete("/user", isLoggedIn, isVerified, isAdmin, deleteUserHandler);
export { app as userRouter };
