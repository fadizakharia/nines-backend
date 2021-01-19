import { NextFunction, Request, Response } from "express";
import { User, userDoc } from "../models/User";
import { ResponseError } from "../util/Error/Error";

interface authProtectedRequest extends Request {
  user: string;
}
async function isVerified(
  req: authProtectedRequest,
  res: Response,
  next: NextFunction
) {
  const user: userDoc = await User.findById(req.session.user.id);

  const error: ResponseError = new Error(
    "user must be verified to perform this task!"
  );
  error.status = 405;
  // Gather the jwt access token from the request header
  user.verified ? next() : next(error);
}
export default isVerified;
