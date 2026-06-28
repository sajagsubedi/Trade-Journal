import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITrade extends Document {
  userId: Types.ObjectId;
  pair: string;
  type: "buy" | "sell";
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  riskPercent: number;
  result: "win" | "loss" | "breakeven";
  profitLoss: number;
  dateTime: Date;
  session: "london" | "new_york" | "tokyo" | "sydney" | "overlap";
  notes: string;
  strategy: string;
  mistakes: string[];
  tags: string[];
  chartScreenshot?: string;
  createdAt: Date;
  updatedAt: Date;
}

const tradeSchema = new Schema<ITrade>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pair: { type: String, required: true, trim: true },
    type: { type: String, enum: ["buy", "sell"], required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, required: true },
    stopLoss: { type: Number, required: true },
    takeProfit: { type: Number, required: true },
    lotSize: { type: Number, required: true },
    riskPercent: { type: Number, required: true },
    result: {
      type: String,
      enum: ["win", "loss", "breakeven"],
      required: true,
    },
    profitLoss: { type: Number, required: true },
    dateTime: { type: Date, required: true, index: true },
    session: {
      type: String,
      enum: ["london", "new_york", "tokyo", "sydney", "overlap"],
      default: "london",
    },
    notes: { type: String, default: "" }, 
    strategy: { type: String, default: "" },
    mistakes: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    chartScreenshot: { type: String },
  },
  { timestamps: true }
);

tradeSchema.index({ userId: 1, dateTime: -1 });

const TradeModel: Model<ITrade> =
  mongoose.models.Trade || mongoose.model<ITrade>("Trade", tradeSchema);

export default TradeModel;
