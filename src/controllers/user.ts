import { userDoc, User } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../util/Error/Error";
import { Session } from "express-session";
import fs from "fs";
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const invalid: ResponseError = new Error();
  const { characterName, bio } = req.body;

  const profilePicture = req.file;

  try {
    const user: userDoc = await User.findById(req.session.user.id);
    if (!user) {
      invalid.message = "this user does not exist!";
      invalid.status = 404;
      return next(invalid);
    }
    console.log("i am trying to update user!");

    const invalidUser: userDoc = await User.findOne({
      characterName: characterName,
    });
    if (invalidUser && invalidUser.characterName !== characterName) {
      invalid.message = "this character name is already taken";
      invalid.status = 400;
      return next(invalid);
    }

    const unlinkedImage = user.profilePictureURI;
    user.characterName =
      characterName && user.characterName !== characterName
        ? characterName
        : user.characterName;
    user.bio = bio ? bio : user.bio;
    console.log(profilePicture);
    console.log(user.profilePictureURI);
    user.profilePictureURI = profilePicture
      ? profilePicture.path
      : user.profilePictureURI;
    const savedUser = await user.save();

    const expires = req.session.cookie.expires;
    req.session.user = savedUser;
    req.session.cookie.expires = expires;

    if (profilePicture) {
      fs.unlink(unlinkedImage, (err) => {
        console.log(err);
      });
    }
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
    const foundUsers = await User.find()
      .skip(page * limit)
      .limit(limit);
    const length = await User.countDocuments();
    const pages = Math.ceil(length / limit);
    if (foundUsers.length === 0) {
      invalid.message = "No users found.";
      invalid.status = 404;
      return next(invalid);
    }
    res.json({ users: foundUsers, length, pages });
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const characterName = req.params.current.toString();

  console.log(characterName);

  const invalid: ResponseError = new Error();
  try {
    const user = await User.findOne({ characterName });
    if (!user) {
      invalid.message = "user does not exist!";
      invalid.status = 404;
      return next(invalid);
    }
    return res.send(user);
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
};
