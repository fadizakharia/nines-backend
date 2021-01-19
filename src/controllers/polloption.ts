import { NextFunction, Request, Response } from "express";
import Poll from "../models/poll";
import { PollItem } from "../models/pollItem";
import { ResponseError } from "../util/Error/Error";
const addPollOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { pollId, text } = req.body;
  const { id } = req.session.user;
  const invalid: ResponseError = new Error();
  try {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      invalid.status = 404;
      invalid.message = "poll does not exist";
      return next(invalid);
    }
    const pollItem = new PollItem({ text, creatorId: id });
    const savedPollItem = await pollItem.save();
    poll.pollItems.push(savedPollItem.id);
    await poll.save();
    res.status(201).send(poll);
  } catch (err) {
    invalid.status = 500;
    invalid.message = "An internal error just occured!";
    return next(invalid);
  }
};
const deletePollOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { pollId, pollOptionId } = req.body;
  const { id } = req.session.user;
  const invalid: ResponseError = new Error();
  try {
    const poll = await Poll.findById(pollId);
    const pollOption = await PollItem.findById(pollOptionId);

    if (pollOption.creatorId !== id && poll.creatorId !== id) {
      invalid.message = "you are forbidden from deleting this poll option.";
      invalid.status = 403;
      return next(invalid);
    }
    await PollItem.deleteOne(pollOption);
  } catch (err) {
    invalid.status = 500;
    invalid.message = "An internal error just occured!";
    return next(invalid);
  }
};
const editPollOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { pollId, pollOptionId, text } = req.body;
  const { id } = req.session.user;
  const invalid: ResponseError = new Error();
  try {
    const poll = await Poll.findById(pollId);
    const pollOption = await PollItem.findById(pollOptionId);

    if (pollOption.creatorId !== id && poll.creatorId !== id) {
      invalid.message = "you are forbidden from editting this poll option.";
      invalid.status = 403;
      return next(invalid);
    }

    pollOption.text = text;
    await pollOption.save();
  } catch (err) {
    invalid.status = 500;
    invalid.message = "An internal error just occured!";
    return next(invalid);
  }
};
const addVote = async (req: Request, res: Response, next: NextFunction) => {
  const { pollOptionId } = req.body;
  const { id } = req.session.user;
  const invalid: ResponseError = new Error();
  try {
    const pollOption = await PollItem.findById(pollOptionId);
    if (pollOption.voters.includes(id)) {
      invalid.message = "this vote has already been counted";
      invalid.status = 400;
      return next(invalid);
    }
    pollOption.voters.push(id);
    await pollOption.save();
    res.status(201).send("vote successfully created");
  } catch (err) {
    invalid.status = 500;
    invalid.message = "An internal error just occured!";
    return next(invalid);
  }
};
const removeVote = async (req: Request, res: Response, next: NextFunction) => {
  const { pollOptionId } = req.body;
  const { id } = req.session.user;
  const invalid: ResponseError = new Error();
  try {
    const pollOption = await PollItem.findById(pollOptionId);
    const elementIndex = pollOption.voters.indexOf(id);
    if (elementIndex !== -1) {
      invalid.message = "this vote has already been removed";
      invalid.status = 400;
      return next(invalid);
    }

    pollOption.voters.splice(elementIndex, 1);
    const savedPollOption = await pollOption.save();
    res.status(204).send(savedPollOption);
  } catch (err) {
    invalid.status = 500;
    invalid.message = "An internal error just occured!";
    return next(invalid);
  }
};
export {
  addPollOption as addPollOptionHandler,
  deletePollOption as deletePollOptionHandler,
  editPollOption as editPollOptionHandler,
  addVote as addVoteHandler,
  removeVote as removeVoteHandler,
};
