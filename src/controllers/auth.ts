import { NextFunction, Request, Response } from "express";
import { User, userDoc } from "../models/User";
import jwt from "jsonwebtoken";
import { compareHash } from "../util/services/password";
import { ResponseError } from "../util/Error/Error";

import { sendEmail } from "../util/services/ses-client/ses-client";

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.body.characterName;
  const password = req.body.password;
  const invalid: ResponseError = new Error();
  const confirmPassword = req.body.confirm;
  try {
    const oldUser: userDoc | undefined = await User.findOne({
      characterName: username,
    });
    if (oldUser) {
      invalid.message = "this user already exists!";
      invalid.status = 400;
      return next(invalid);
    }

    if (confirmPassword !== password) {
      invalid.message = "passwords do not match";
      invalid.status = 400;
      return next(invalid);
    }
    const newUser = await new User({
      characterName: username,
      password: password,
      admin: false,
      verified: false,
    }).save();
    req.session.user = newUser;

    res.json({
      user: newUser,
    });
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.session.user;
  const invalid: ResponseError = new Error();
  try {
    const foundUser = await User.findById(id);
    if (!foundUser) {
      invalid.message = "An internal error occured please try again later";
      invalid.status = 500;
      return next(invalid);
    }
    res.status(200).send(foundUser);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const login = async (req: Request, res: Response, next: NextFunction) => {
  const { characterName, password } = req.body;

  const error: ResponseError = new Error();

  try {
    const foundUser: userDoc | undefined = await User.findOne({
      characterName: characterName,
    });

    if (!foundUser) {
      error.status = 400;
      error.message = "username is incorrect";
      return next(error);
    }

    const comparisionResult = await compareHash(password, foundUser.password);
    if (!comparisionResult) {
      error.status = 400;
      error.message = "username or password is incorrect";
      return next(error);
    }
    req.session.user = foundUser;
    console.log(foundUser);

    res.status(200).send(foundUser);
  } catch (err) {
    console.log(err);

    error.message = "An internal error occured please try again later";
    error.status = 500;
    return next(error);
  }
};
const logout = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("auth");
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    req.session = null;
  });
  res.status(200).send();
};
const requestVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.session.user;
  const invalid: ResponseError = new Error();
  try {
    const foundUser: userDoc = await User.findById(user.id);
    const date = new Date();
    date.setDate(date.getDate() + 1);

    const verificationUrl = jwt.sign(
      { userId: foundUser.id as string, expiration: date.getMilliseconds() },
      process.env.ACCESS_TOKEN_SECRET,
      { algorithm: "HS512" }
    );
    foundUser.verificationUrl = verificationUrl;
    const savedUser = await foundUser.save();
    sendEmail(
      "fadi.zakharia@icloud.com",
      `${savedUser.characterName} wants to join the guild`,
      `please click this <a href=http://localhost:4000/auth/verify/${savedUser.verificationUrl}>Link</a> to authorize ${savedUser.characterName} to join the guild!`,
      "fadi.zakharia@icloud.com"
    );
    res.send({ user: foundUser });
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const verifyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const verificationLink = req.params.link;
  const currentTime = new Date();
  const invalid: ResponseError = new Error();
  let userPayload:
    | { userId: string; expiration: number }
    | undefined = undefined;
  jwt.verify(
    verificationLink,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, decoded: typeof userPayload) {
      if (err) {
        invalid.message = "An internal error occured please try again later";
        invalid.status = 500;
        return next(invalid);
      }
      userPayload = decoded;
    }
  );
  try {
    const foundUser: userDoc = await User.findById(userPayload.userId);
    if (userPayload.expiration < currentTime.getMilliseconds()) {
      foundUser.verificationUrl = undefined;
      await foundUser.save();
      res.status(405).send({ status: "validation token has expired" });
    }
    if (!foundUser) {
      res.status(404).send({ status: "user not found!" });
    }
    foundUser.verificationUrl = undefined;
    foundUser.verified = true;
    await foundUser.save();
    res.send({ status: "user has been successfully verified!" });
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
export {
  signup as signupHandler,
  login as loginHandler,
  logout as logoutHandler,
  currentUser as currentUserHandler,
  requestVerification as reqVerificationHandler,
  verifyAccount as verifyAccountHandler,
};
