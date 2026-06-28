import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDb from "@/lib/connectDb";
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth";
import { mapTradeToClient } from "@/lib/trade-mapper";
import TradeModel from "@/models/trade.model";

const tradeUpdateSchema = z.object({
  pair: z.string().min(1).optional(),
  type: z.enum(["buy", "sell"]).optional(),
  entryPrice: z.number().positive().optional(),
  exitPrice: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  lotSize: z.number().positive().optional(),
  riskPercent: z.number().min(0).max(100).optional(),
  result: z.enum(["win", "loss", "breakeven"]).optional(),
  profitLoss: z.number().optional(),
  dateTime: z.string().optional(),
  session: z.enum(["london", "new_york", "tokyo", "sydney", "overlap"]).optional(),
  notes: z.string().optional(),
  strategy: z.string().optional(),
  mistakes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  chartScreenshot: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const { id } = await context.params;
    await connectDb();

    const trade = await TradeModel.findOne({ _id: id, userId }).lean();
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json({ trade: mapTradeToClient(trade) });
  } catch (error) {
    console.error("GET /api/trades/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const { id } = await context.params;
    const body = await req.json();
    const data = tradeUpdateSchema.parse(body);

    await connectDb();

    const updateData: Record<string, unknown> = { ...data };
    if (data.dateTime) {
      updateData.dateTime = new Date(data.dateTime);
    }

    const trade = await TradeModel.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    ).lean();

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json({ trade: mapTradeToClient(trade) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid trade data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("PATCH /api/trades/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const { id } = await context.params;
    await connectDb();

    const trade = await TradeModel.findOneAndDelete({ _id: id, userId });
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trades/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete trade" },
      { status: 500 }
    );
  }
}
