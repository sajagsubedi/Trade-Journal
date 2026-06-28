import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectDb from "@/lib/connectDb";
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth";
import UserModel from "@/models/user.model";
import { DEFAULT_USER_SETTINGS } from "@/lib/types";

const settingsSchema = z.object({
  dailyRiskLimit: z.number().min(0).max(100).optional(),
  maxTradesPerDay: z.number().min(0).max(50).optional(),
  streakTarget: z.number().min(0).max(365).optional(),
  currency: z.string().min(0).max(3).optional(),
  locale: z.string().min(0).max(10).optional(),
  accountSize: z.number().min(0).optional(),
  minRiskReward: z.number().min(0).max(10).optional(),
  weeklyRiskLimit: z.number().min(0).max(100).optional(),
  monthlyProfitTarget: z.number().min(0).optional(),
});

function mergeSettings(
  stored: Partial<typeof DEFAULT_USER_SETTINGS> | null | undefined,
): typeof DEFAULT_USER_SETTINGS {
  return { ...DEFAULT_USER_SETTINGS, ...stored };
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    await connectDb();
    const user = await UserModel.findById(userId).select("settings").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      settings: mergeSettings(user.settings),
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const data = settingsSchema.parse(body);

    await connectDb();
    const user = await UserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      {
        $set: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [`settings.${k}`, v]),
        ),
      },
      { returnDocument: "after" },
    )
      .select("settings")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ settings: mergeSettings(user.settings) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid settings", details: error.errors },
        { status: 400 },
      );
    }
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
