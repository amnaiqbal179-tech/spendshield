import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { isAuthenticated, userId, orgId } = await auth();

  return NextResponse.json({
    isAuthenticated,
    userId,
    orgId,
  });
}