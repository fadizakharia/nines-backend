import { body } from "express-validator";

export const authValidator = [
  body("characterName", "character name must be between 3-30 characters!")
    .isString()
    .isLength({ min: 3, max: 30 }),
  body("password", "your password must be between 6-18 characters!").isLength({
    min: 6,
    max: 18,
  }),
];
export const deleteValidator = [body("id").isString()];
export const getUserPollsValidator = [
  body("expiredOnBefore")
    .isDate()
    .isAfter(new Date(new Date().getTime()).toString()),
];
export const getPollsValidator = [
  body("expiredOnBefore")
    .isDate()
    .isAfter(new Date(new Date().getTime()).toString()),
];
export const addPollOptionValidator = [
  body("pollId").isString(),
  body("text").isString().isLength({ min: 3, max: 100 }),
];
export const editPollOptionValidator = [
  body("pollId").isString(),
  body("pollOptionId").isString(),
  body("text").isString().isLength({ min: 3, max: 100 }),
];

export const removePollOptionValidator = [
  body("pollId").isString(),
  body("pollOptionId").isString(),
];

export const voteValidator = [body("pollOptionId").isString()];
export const userValidator = [
  body("characterName").isString().isLength({ min: 3, max: 30 }),
  body("Bio").isString(),
];
export const updateUserValidator = [
  body("id").isString(),
  body("characterName").isString().isLength({ min: 3, max: 30 }),
  body("Bio").isString(),
];
export const postPollValidator = [
  body("title").isString().isLength({ min: 3, max: 100 }),
  body("description").optional().isString().isLength({ min: 3 }),
  body("type").isInt({ min: 0, max: 4 }),
  body("expirationTime").isDate(),
  body("pollItems.*").isString().isLength({ min: 3, max: 100 }),
];
export const updatePollValidator = [
  body("pollId").isString(),
  body("title").optional().isString().isLength({ min: 3, max: 100 }),
  body("description").optional().isString().isLength({ min: 3 }),
  body("type").optional().isInt({ min: 0, max: 4 }),
  body("expirationTime").optional().isDate(),
];
export const deletePollValidator = [body("pollId").isString()];
export const getUserEventsValidator = [
  body("expiredOnBefore")
    .isDate()
    .isAfter(new Date(new Date().getTime()).toString()),
];
export const getEventsValidator = [
  body("expiredOnBefore")
    .isDate()
    .isAfter(new Date(new Date().getTime()).toString()),
];
export const createEventValidator = [
  body("title").isString().isLength({ min: 3, max: 100 }),
  body("description").optional().isString().isLength({ min: 5 }),
  body("type").isInt({ min: 0, max: 4 }),
  body("eventTime").isDate().isAfter(new Date(new Date().getTime()).toString()),
  body("eventDuration").isInt(),
];
export const EditEventValidator = [
  body("eventId").isString(),
  body("title").optional().isString().isLength({ min: 3, max: 100 }),
  body("description").optional().isString().isLength({ min: 5 }),
  body("type").optional().isInt({ min: 0, max: 4 }),
  body("eventTime").isDate().isAfter(new Date(new Date().getTime()).toString()),
  body("eventDuration").isInt(),
];
export const deleteEventValidator = [body("eventId").isString()];
export const addAttendingValidator = [body("eventId").isString()];
export const removeAttendingValidator = [body("eventId").isString()];
