import mongoose, { Types } from "mongoose";
import { UserAttrs } from "./User";
export interface PollsAttrs {
  title: string;
  description: string;
  type: number;
  expirationTime: Date;
  creatorId: string | Types.ObjectId | UserAttrs;
  pollItems?: string[];
  createdAt: Date;
  updatedAt: Date;
}
export interface PollsDoc extends mongoose.Document {
  title: string;
  description: string;
  type: number;
  expirationTime: Date;
  creatorId: string | Types.ObjectId | UserAttrs;
  pollItems?: string[];
  createdAt: Date;
  updatedAt: Date;
}
interface PollsModel extends mongoose.Model<PollsDoc> {
  build(attrs: PollsAttrs): PollsDoc;
}
const PollSchema = new mongoose.Schema<PollsAttrs>(
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
    expirationTime: {
      type: Date,
      required: true,
    },
    creatorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
      required: true,
    },
    pollItems: [{ type: mongoose.SchemaTypes.ObjectId, ref: "poll_item" }],
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

PollSchema.statics.build = (attrs: PollsAttrs) => {
  return new Poll(attrs);
};
const Poll = mongoose.model<PollsDoc, PollsModel>("poll", PollSchema);
export default Poll;
