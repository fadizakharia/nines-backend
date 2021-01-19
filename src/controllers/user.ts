import { userDoc, User } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../util/Error/Error";
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const invalid: ResponseError = new Error();
  const { characterName, Bio } = req.body;
  const user: userDoc = await User.findById(req.session.user.id);
  const invalidUser: userDoc = await User.findOne({
    characterName: user.characterName,
  });
  if (invalidUser) {
    invalid.message = "this character name is already taken";
    invalid.status = 400;
    return next(invalidUser);
  }
  user.characterName =
    user.characterName !== characterName ? characterName : user.characterName;
  user.bio = user.bio !== Bio ? Bio : user.bio;
};
const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  const invalid: ResponseError = new Error();
  const user = await User.findById(userId);
  if (!user) {
    invalid.message = "user does not exist!";
    invalid.status = 404;
    return next(invalid);
  }
  return res.send({ user });
};
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  const user: userDoc = await User.findById(userId);
  if (!user) {
    const invalid: ResponseError = new Error("This user does not exist!");
    invalid.status = 404;
    return next(invalid);
  }
  await User.deleteOne(user);
  res.send({ status: "user has been successfully removed" });
};
export {
  getUser as getUserHandler,
  updateUser as updateUserHandler,
  deleteUser as deleteUserHandler,
};
