import { NextFunction, Request, Response } from "express";
import { User, userDoc } from "../models/User";
import jwt from "jsonwebtoken";
import { compareHash } from "../util/services/password";
import { ResponseError } from "../util/Error/Error";

import { sendEmail } from "../util/services/ses-client/ses-client";

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const username = req.body.userName;
  const password = req.body.password;
  const validationError: ResponseError = new Error();
  const confirmPassword = req.body.confirm;

  const oldUser: userDoc | undefined = await User.findOne({
    characterName: username,
  });
  if (oldUser) {
    validationError.message = "this user already exists!";
    validationError.status = 400;
    return next(validationError);
  }

  if (confirmPassword !== password) {
    validationError.message = "passwords do not match";
    validationError.status = 400;
    return next(validationError);
  }
  const newUser = await new User({
    characterName: username,
    password: password,
    admin: false,
    verified: false,
  }).save();

  // const signedJwt = jwt.sign(
  //   {
  //     id: newUser.id as string,
  //     characterName: newUser.characterName as string,
  //   },
  //   process.env.ACCESS_TOKEN_SECRET as string,
  //   { algorithm: "HS512" }
  // );

  req.session.user = newUser;

  res.json({
    user: newUser,
  });
};
const currentUser = (req: Request, res: Response, next: NextFunction) => {
  const { session } = req;

  session.user
    ? res.send({ user: session.user })
    : res.status(405).send({ error: "user is not logged in!" });
};
const login = async (req: Request, res: Response, next: NextFunction) => {
  const { userName, password } = req.body;
  const error: ResponseError = new Error();
  const foundUser: userDoc | undefined = await User.findOne({
    characterName: userName,
  });
  console.log(foundUser);

  if (foundUser === undefined) {
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
  res.status(200).send({ user: foundUser });
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
  console.log(user);
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
    console.log(err);
  }
};
const verifyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const verificationLink = req.params.link;
  const currentTime = new Date();

  let userPayload:
    | { userId: string; expiration: number }
    | undefined = undefined;
  jwt.verify(
    verificationLink,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, decoded: typeof userPayload) {
      if (err) {
        return res.status(405).send({ status: "invalid token" });
      }
      userPayload = decoded;
    }
  );
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
};
export {
  signup as signupHandler,
  login as loginHandler,
  logout as logoutHandler,
  currentUser as currentUserHandler,
  requestVerification as reqVerificationHandler,
  verifyAccount as verifyAccountHandler,
};
