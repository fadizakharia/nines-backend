import { NextFunction, Request, Response } from "express";
import { Event } from "../models/Event";
import { ResponseError } from "../util/Error/Error";

const getUserEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.session.user;
  const { expiredOnBefore } = req.body;
  const invalid: ResponseError = new Error();
  try {
    const events = await Event.find({
      creatorId: id,
      expirationTime: { $lte: expiredOnBefore },
    })
      .limit(10)
      .sort("-expirationTime");
    if (events.length === 0) {
      invalid.message = "user has no events!";
      invalid.status = 404;
      return next(invalid);
    }
    res.send(events);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  const { expiredOnBefore } = req.body;
  const invalid: ResponseError = new Error();
  try {
    const events = await Event.find({
      expirationTime: { $lte: expiredOnBefore },
    })
      .limit(10)
      .sort("-expirationTime");
    if (events.length === 0) {
      invalid.message = "there are no events!";
      invalid.status = 404;
      return next(invalid);
    }
    res.send(events);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.session.user;
  const { eventTime, eventDuration } = req.body;
  const invalid: ResponseError = new Error();
  const eventTimeInMs = (eventTime as Date).getMilliseconds;
  const eventTimeMax = eventTimeInMs + eventDuration;
  const eventTimeDateMax = new Date(eventTimeInMs + eventTimeMax);
  try {
    const contendingEvent = await Event.findOne({
      EventTime: { $gt: eventTime, $lt: eventTimeDateMax },
      expirationTime: { $gt: eventTime, $lt: eventTimeDateMax },
    });
    if (contendingEvent) {
      invalid.status = 400;
      invalid.message =
        "an event either is already in progress in that specific time";
      return next(invalid);
    }
    const event = new Event({ ...req.body, creatorId: id });
    const savedEvent = await event.save();
    res.status(201).send(savedEvent);
    req.io.emit("createEvent", savedEvent);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const EditEvent = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.session.user;
  const { eventTime, eventDuration, eventId } = req.body;
  const invalid: ResponseError = new Error();
  const eventTimeInMs = (eventTime as Date).getMilliseconds;
  const eventTimeMax = eventTimeInMs + eventDuration;
  const eventTimeDateMax = new Date(eventTimeInMs + eventTimeMax);
  try {
    const contendingEvent = await Event.findOne({
      EventTime: { $gt: eventTime, $lt: eventTimeDateMax },
      expirationTime: { $gt: eventTime, $lt: eventTimeDateMax },
    });
    if (contendingEvent) {
      invalid.status = 400;
      invalid.message =
        "an event either is already in progress in that specific time";
      return next(invalid);
    }

    const event = await Event.findById(eventId);
    if (!event) {
      invalid.status = 404;
      invalid.message = "Event does not exist";
      return next(invalid);
    }
    if (event.creatorId !== id) {
      invalid.status = 403;
      invalid.message = "you are not allowed to change this event!";
      return next(invalid);
    }
    event.update({ ...req.body });
    const savedEvent = await event.save();
    res.status(201).send(savedEvent);
    req.io.emit("updateEvent", savedEvent);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.session.user;
  const { eventId } = req.body;
  const invalid: ResponseError = new Error();
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      invalid.status = 404;
      invalid.message = "Event does not exist";
      return next(invalid);
    }
    if (event.creatorId !== id) {
      invalid.status = 403;
      invalid.message = "you are not allowed to delete this event!";
      return next(invalid);
    }

    req.io.emit("deleteEvent", event);
    await Event.deleteOne(event);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const addAttending = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { eventId } = req.body;
  const { id } = req.session.user;
  const invalid: ResponseError = new Error();
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      invalid.status = 404;
      invalid.message = "Event does not exist";
      return next(invalid);
    }
    if (event.attending.includes(id)) {
      invalid.status = 400;
      invalid.message = "user is already attending!";
      return next(invalid);
    }
    event.attending.push(id);
    const attending = await event.save();

    res.status(201).send(attending);
    req.io.emit("attendingEvent", [id]);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
const removeAttending = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { eventId } = req.body;
  const { id } = req.session.user;
  const invalid: ResponseError = new Error();
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      invalid.status = 404;
      invalid.message = "Event does not exist";
      return next(invalid);
    }
    const attendingIndex = event.attending.indexOf(id);
    if (attendingIndex === -1) {
      invalid.status = 400;
      invalid.message = "user is not attending!";
      return next(invalid);
    }
    event.attending.splice(attendingIndex, 1);
    const attending = await event.save();
    req.io.emit("removeAttending", attending);
    res.status(205).send(attending);
  } catch (err) {
    invalid.message = "An internal error occured please try again later";
    invalid.status = 500;
    return next(invalid);
  }
};
export {
  getUserEvents as getUserEventsHandler,
  getEvents as getEventsHandler,
  createEvent as createEventHandler,
  EditEvent as EditEventHandler,
  deleteEvent as deleteEventHandler,
  addAttending as addAttendingHandler,
  removeAttending as removeAttendingHandler,
};
