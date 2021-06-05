import mongoose from "mongoose";
import * as password from "../util/services/password";
//an interface that describes the properties required to create a new user
export interface UserAttrs {
  characterName: string;
  password: string;
  bio?: string;
  verified: boolean;
  verificationUrl?: string;
  profilePictureURI?: string;
  admin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
//An interface that describes the properties that a user document has
export interface userDoc extends mongoose.Document {
  characterName: string;
  password: string;
  bio?: string;
  verified: boolean;
  verificationUrl?: string;
  profilePictureURI?: string;
  admin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
// an interface that describes the properties that a user model has
interface userModel extends mongoose.Model<userDoc> {
  build(attrs: UserAttrs): userDoc;
}
const userSchema = new mongoose.Schema<UserAttrs>(
  {
    characterName: {
      type: String,
      required: true,
    },
    password: { type: String, required: true },
    bio: { type: String, required: false },
    verified: { type: Boolean, required: true },
    verificationUrl: { type: String, required: false },
    profilePictureURI: { type: String, required: false },
    admin: { type: Boolean, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret._id;
        delete ret.verificationUrl;
        ret.id = doc.id;
      },
      versionKey: false,
    },
    timestamps: true,
  }
);
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});
const User = mongoose.model<userDoc, userModel>("user", userSchema);

export { User };
