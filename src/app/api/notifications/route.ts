import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma"; 
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clerk ID ke zariye database se user find karein
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");

    let notifications;

    // Check if user has admin/manager roles safely
    const isManagerRole = user.role === "ADMIN" || user.role === "FINANCE_MANAGER" || user.role === "MANAGER";

    if (view === "manager" && isManagerRole) {
      // Manager/Admin ke liye organization ki sari notifications
      notifications = await db.notification.findMany({
        where: {
          ...(user.organizationId ? { organizationId: user.organizationId } : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Employee ke liye: Wahi notifications jo is user ki ID se linked hain
      notifications = await db.notification.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json({ success: true, data: notifications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}