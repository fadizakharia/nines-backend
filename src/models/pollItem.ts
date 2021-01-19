import mongoose, { Types } from "mongoose";
import { UserAttrs } from "./User";
import { PollsAttrs } from "./poll";
export interface PollItemAttrs {
  text: string;
  voters?: string[] | Types.ObjectId[] | UserAttrs[];
  creatorId: string | Types.ObjectId | UserAttrs;
  pollId: string | Types.ObjectId | PollsAttrs;
}
export interface PollItemDoc extends mongoose.Document {
  text: string;
  voters?: string[] | Types.ObjectId[] | UserAttrs[];
  creatorId: string | Types.ObjectId | UserAttrs;
  pollId: string | Types.ObjectId | PollsAttrs;
}
interface PollItemModel extends mongoose.Model<PollItemDoc> {
  build(attrs: PollItemAttrs): PollItemDoc;
}
const PollItemSchema = new mongoose.Schema<PollItemAttrs>(
  {
    text: {
      type: String,
      required: true,
    },
    voters: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
      },
    ],
    creatorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = doc.id;
        delete ret._id;
      },
      versionKey: false,
    },
  }
);
PollItemSchema.statics.build = (attrs: PollItemAttrs) => {
  return new PollItem(attrs);
};
const PollItem = mongoose.model<PollItemDoc, PollItemModel>(
  "poll_item",
  PollItemSchema
);
export { PollItem };
