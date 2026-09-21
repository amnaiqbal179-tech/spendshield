import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma"; // Apne project ke mutabiq db import check kar lein (jaise @/lib/db ya @/lib/prisma)
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // User ki organization find karein membership ke zariye
    const membership = await db.membership.findFirst({
      where: {
        User: {
          clerkUserId: userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Organization ki active subscriptions fetch karein jo catalog mein dikhengi
    const catalogItems = await db.subscription.findMany({
      where: {
        organizationId: membership.organizationId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        productName: true,
        vendor: true,
        category: true,
        plan: true,
        monthlyCost: true,
      },
    });

    return NextResponse.json({ success: true, data: catalogItems }, { status: 200 });
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}