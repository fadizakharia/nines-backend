import { NextFunction, Request, Response } from "express";

import Poll, { PollsDoc } from "../models/poll";
import { PollItem, PollItemAttrs, PollItemDoc } from "../models/pollItem";
import moment from "moment";
import { ResponseError } from "../util/Error/Error";
const getAllPolls = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.params.createdAt);
  const expiredOnBefore = moment(+req.params.createdAt);

  const invalid: ResponseError = new Error();
  try {
    const polls = await Poll.find({
      createdAt: { $lte: expiredOnBefore.toDate() },
      // type: type && type,
    })
      .populate("creatorId")
      .limit(10)
      .sort("-expirationTime");
    if (polls.length === 0) {
      invalid.message = "user has no polls!";
      invalid.status = 404;
      return next(invalid);
    }
    res.send(polls);
  } catch (err) {
    console.log(err.message);

    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};

const createPoll = async (req: Request, res: Response, next: NextFunction) => {
  const {
    title,
    description,
    type,
    expirationTime,
    pollItems,
  } = req.body as PollsDoc;
  const invalid: ResponseError = new Error();
  try {
    const user = req.session.user.id as string;
    const poll: PollsDoc = new Poll({
      title: title as string,
      description: description as string,
      type: type as number,
      expirationTime: expirationTime as Date,
      creatorId: user,
    });
    let pollItem: PollItemDoc[] = [];
    pollItems.forEach((i: string) => {
      pollItem = [
        ...pollItem,
        new PollItem({
          text: i,
          creatorId: user,
        } as PollItemAttrs),
      ];
    });
    const savedPollItems = await PollItem.create(pollItem);
    const savedItemIds = savedPollItems.map((item) => {
      return item._id as string;
    });
    poll.pollItems = savedItemIds;
    const savedPoll = await poll.save();

    res.send({ poll: savedPoll });
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const updatePoll = async (req: Request, res: Response, next: NextFunction) => {
  const { pollId } = req.body;
  const invalid: ResponseError = new Error();
  const foundPoll = Poll.findById(pollId);
  try {
    if (!foundPoll) {
      invalid.status = 404;
      invalid.message = "this poll does not exist!";
      return next(invalid);
    }
    const updatedPoll = await foundPoll.update({
      ...req.body,
    });

    res.status(204).send(updatedPoll);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};

const deletePoll = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.session.user;
  const { pollId } = req.body;
  const invalid: ResponseError = new Error();
  try {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      invalid.status = 404;
      invalid.message = "poll does not exist";
      return next(invalid);
    }
    if (poll.creatorId !== id) {
      invalid.status = 403;
      invalid.message = "only the owner of this poll can delete it!";
      return next(invalid);
    }
    await PollItem.deleteMany(poll.pollItems);
    await Poll.deleteOne(poll);

    res.status(200).send("poll successfully removed!");
  } catch (err) {
    invalid.message =
      "we're sorry! an internal error occured please try again later.";
    invalid.status = 500;
    return next(invalid);
  }
};
const getUserPolls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.session.user;
  const invalid: ResponseError = new Error();
  const { expiredOnBefore } = req.body;
  try {
    const polls = await Poll.find({
      creator: id,
      expirationTime: { $lte: expiredOnBefore },
    })
      .populate(["poll_item", "user"])
      .limit(10)
      .sort("-expirationTime");
    if (polls.length === 0) {
      invalid.message = "user has no polls!";
      invalid.status = 404;
      return next(invalid);
    }
    res.status(200).send(polls);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
export {
  createPoll as createPollHandler,
  updatePoll as updatePollHandler,
  deletePoll as deletePollHandler,
  getUserPolls as getUserPollsHandler,
  getAllPolls as getPollsHandler,
};
