import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma"; // Aapka Prisma client import
import { auth } from "@clerk/nextjs/server"; // Agar Clerk use ho raha hai

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Database se user find karein taake internal DB ID mil jaye
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sirf approved software requests fetch karein jo is user ne ki hain
    const myTools = await db.softwareRequest.findMany({
      where: {
        requesterId: user.id,
        status: "APPROVED",
      },
      include: {
        department: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(myTools, { status: 200 });
  } catch (error) {
    console.error("Error fetching my tools:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}