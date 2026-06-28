import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserSettings {
  dailyRiskLimit: number;
  maxTradesPerDay: number;
  streakTarget: number;
  currency: string;
  locale: string;
  accountSize: number;
  minRiskReward: number;
  weeklyRiskLimit: number;
  monthlyProfitTarget: number;
}

export interface IUser extends Document {
  fullName: string;
  username: string;
  password: string;
  settings: IUserSettings;
  isPasswordCorrect: (password: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 1024,
    },
    settings: {
      dailyRiskLimit: { type: Number, default: 5 },
      maxTradesPerDay: { type: Number, default: 5 },
      streakTarget: { type: Number, default: 7 },
      currency: { type: String, default: "USD" },
      locale: { type: String, default: "en-US" },
      accountSize: { type: Number, default: 10000 },
      minRiskReward: { type: Number, default: 2 },
      weeklyRiskLimit: { type: Number, default: 15 },
      monthlyProfitTarget: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default UserModel;