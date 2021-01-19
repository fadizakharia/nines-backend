import { NextFunction, Request, Response } from "express";
import { ResponseError } from "../util/Error/Error";

interface authProtectedRequest extends Request {
  user: string;
}
function isLoggedIn(
  req: authProtectedRequest,
  res: Response,
  next: NextFunction
) {
  const error: ResponseError = new Error("user is not logged in!");
  error.status = 405;
  // Gather the jwt access token from the request header
  req.session.user ? next() : next(error);
}
export default isLoggedIn;
