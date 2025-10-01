import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../../config";
import { IUser } from "./auth.interface";
import { USER_ROLES } from "../../../enums";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: [USER_ROLES.STUDENT, USER_ROLES.EMPLOYEE, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    houseCoords: {
      type: [Number],
      validate: {
        validator: (arr: number[]) => arr.length === 2,
        message: "houseCoords must be [longitude, latitude]",
      },
      required: false,
    },
    routeId: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    notificationToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, Number(config.BCRYPT_SALT_ROUNDS));
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
