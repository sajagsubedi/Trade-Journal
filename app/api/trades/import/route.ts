import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDb from "@/lib/connectDb";
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth";
import { mapTradeToClient } from "@/lib/trade-mapper";
import TradeModel from "@/models/trade.model";

const importSchema = z.object({
  trades: z.array(
    z.object({
      pair: z.string(),
      type: z.enum(["buy", "sell"]),
      entryPrice: z.number(),
      exitPrice: z.number(),
      stopLoss: z.number(),
      takeProfit: z.number(),
      lotSize: z.number(),
      riskPercent: z.number(),
      result: z.enum(["win", "loss", "breakeven"]),
      profitLoss: z.number(),
      dateTime: z.string(),
      session: z.enum(["london", "new_york", "tokyo", "sydney", "overlap"]).optional(),
      notes: z.string().optional(),
      strategy: z.string().optional(),
      mistakes: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      chartScreenshot: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const { trades } = importSchema.parse(body);

    await connectDb();

    const created = await TradeModel.insertMany(
      trades.map((t) => ({
        userId,
        pair: t.pair,
        type: t.type,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        stopLoss: t.stopLoss,
        takeProfit: t.takeProfit,
        lotSize: t.lotSize,
        riskPercent: t.riskPercent,
        result: t.result,
        profitLoss: t.profitLoss,
        dateTime: new Date(t.dateTime),
        session: t.session ?? "london",
        notes: t.notes ?? "",
        strategy: t.strategy ?? "",
        mistakes: t.mistakes ?? [],
        tags: t.tags ?? [],
        chartScreenshot: t.chartScreenshot,
      }))
    );

    return NextResponse.json({
      trades: created.map((t) => mapTradeToClient(t)),
      count: created.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid import data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("POST /api/trades/import error:", error);
    return NextResponse.json(
      { error: "Failed to import trades" },
      { status: 500 }
    );
  }
}
