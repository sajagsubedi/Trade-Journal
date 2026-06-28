import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?._id ?? null;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
