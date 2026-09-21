import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma"; 
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // URL se query params check karein (e.g., /api/notifications?view=manager)
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");

    let notifications;

    if (view === "manager") {
      // Manager ke liye: Sabhi requests ya manager-specific notifications fetch karein
      notifications = await db.notification.findMany({
        where: {
          // Aap yahan manager ki ID ya organization ki notifications filter kar sakte hain
          userId: user.id, 
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Employee ke liye: Sirf uski apni notifications
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