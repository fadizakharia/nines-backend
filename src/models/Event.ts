import mongoose, { Types } from "mongoose";
import { UserAttrs } from "./User";
export interface EventsAttrs {
  title: string;
  description?: string;
  type: number;
  EventTime: Date;
  eventDuration: number;
  expirationTime: Date;
  creatorId: string | Types.ObjectId | UserAttrs;
  attending?: string[] | Types.ObjectId[] | UserAttrs[];
  createdAt: Date;
  updatedAt: Date;
}
export interface EventsDoc extends mongoose.Document {
  title: string;
  description?: string;
  type: number;
  EventTime: Date;
  eventDuration: number;
  expirationTime: Date;
  creatorId: string | Types.ObjectId | UserAttrs;
  attending?: string[] | Types.ObjectId[] | UserAttrs[];
  createdAt: Date;
  updatedAt: Date;
}
interface EventsModel extends mongoose.Model<EventsDoc> {
  build(attrs: EventsAttrs): EventsDoc;
}
const EventSchema = new mongoose.Schema<EventsAttrs>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    type: {
      type: Number,
      required: true,
    },
    eventTime: {
      type: Date,
      required: true,
    },
    eventDuration: {
      type: Number,
      required: true,
    },
    expirationTime: {
      type: Date,
      required: true,
    },
    creatorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    attending: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User" }],
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = doc.id;
        delete ret._id;
      },
      versionKey: false,
    },
    timestamps: true,
  }
);
EventSchema.statics.build = (attrs: EventsAttrs) => {
  return new Event(attrs);
};
const Event = mongoose.model<EventsDoc, EventsModel>("event", EventSchema);
export { Event };
