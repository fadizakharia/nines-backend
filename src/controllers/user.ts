import { userDoc, User } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../util/Error/Error";
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const invalid: ResponseError = new Error();
  const { characterName, Bio } = req.body;
  try {
    const user: userDoc = await User.findById(req.session.user.id);
    if (!user) {
      invalid.message = "this user does not exist!";
      invalid.status = 404;
      return next(invalid);
    }
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
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    next(invalid);
  }
};
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.body;
  const invalid: ResponseError = new Error();
  try {
    const foundUsers = await User.find({ verified: true })
      .skip(page * limit)
      .limit(limit);
    if (foundUsers.length === 0) {
      invalid.message = "No users found.";
      invalid.status = 404;
      return next(invalid);
    }
    res.send(foundUsers);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.session.user;
  res.status(200).send(user);
};
const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  const invalid: ResponseError = new Error();
  try {
    const user = await User.findById(userId);
    if (!user) {
      invalid.message = "user does not exist!";
      invalid.status = 404;
      return next(invalid);
    }
    return res.send({ user });
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  const invalid: ResponseError = new Error();
  try {
    const user: userDoc = await User.findById(userId);
    if (!user) {
      invalid.message = "this user does not exist";
      invalid.status = 404;
      return next(invalid);
    }
    await User.deleteOne(user);
    res.send({ status: "user has been successfully removed" });
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
export {
  getUser as getUserHandler,
  getUsers as getUsersHandler,
  updateUser as updateUserHandler,
  deleteUser as deleteUserHandler,
  currentUser as currentUserHandler,
};
