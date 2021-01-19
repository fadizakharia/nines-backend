import { NextFunction, Request, Response } from "express";
import { User, userDoc } from "../models/User";
import { ResponseError } from "../util/Error/Error";
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.session.user;
  const unauthorized: ResponseError = new Error(
    "you are forbidden from performing this action!"
  );
  unauthorized.status = 403;
  const foundUser = await User.findById(id);
  foundUser.admin ? next() : next(unauthorized);
};
export default isAdmin;
