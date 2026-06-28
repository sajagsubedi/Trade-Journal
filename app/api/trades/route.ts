import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDb from "@/lib/connectDb";
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth";
import { mapTradeToClient } from "@/lib/trade-mapper";
import TradeModel from "@/models/trade.model";

const tradeInputSchema = z.object({
  pair: z.string().min(1),
  type: z.enum(["buy", "sell"]),
  entryPrice: z.number().positive(),
  exitPrice: z.number().positive(),
  stopLoss: z.number().positive(),
  takeProfit: z.number().positive(),
  lotSize: z.number().positive(),
  riskPercent: z.number().min(0).max(100),
  result: z.enum(["win", "loss", "breakeven"]),
  profitLoss: z.number(),
  dateTime: z.string(),
  session: z.enum(["london", "new_york", "tokyo", "sydney", "overlap"]),
  notes: z.string().optional(),
  strategy: z.string().optional(),
  mistakes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  chartScreenshot: z.string().optional(),
});

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    await connectDb();
    const trades = await TradeModel.find({ userId })
      .sort({ dateTime: -1 })
      .lean();

    return NextResponse.json({
      trades: trades.map((t) => mapTradeToClient(t)),
    });
  } catch (error) {
    console.error("GET /api/trades error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const data = tradeInputSchema.parse(body);

    await connectDb();
    const trade = await TradeModel.create({
      userId,
      ...data,
      notes: data.notes ?? "",
      strategy: data.strategy ?? "",
      mistakes: data.mistakes ?? [],
      tags: data.tags ?? [],
      dateTime: new Date(data.dateTime),
    });

    return NextResponse.json(
      { trade: mapTradeToClient(trade) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid trade data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("POST /api/trades error:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    await connectDb();
    await TradeModel.deleteMany({ userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trades error:", error);
    return NextResponse.json(
      { error: "Failed to delete trades" },
      { status: 500 }
    );
  }
}
