import { Router } from "express";
import { body } from "express-validator";
import isLoggedIn from "../middleware/auth-validator";
import {
  signupHandler,
  loginHandler,
  logoutHandler,
  currentUserHandler,
  reqVerificationHandler,
  verifyAccountHandler,
} from "../controllers/auth";
import { authValidator } from "../middleware/express-validators";
const authRouter = Router();
authRouter.post("/auth/register", authValidator, signupHandler);
authRouter.get("/auth/currentuser", currentUserHandler);
authRouter.post("/auth/login", authValidator, loginHandler);
authRouter.delete("/auth/logout", isLoggedIn, logoutHandler);
authRouter.post("/auth/sendverify", isLoggedIn, reqVerificationHandler);
authRouter.get("/auth/verify/:link", verifyAccountHandler);
export { authRouter };
