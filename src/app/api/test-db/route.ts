import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "SpendShield database connected successfully!",
      organizations,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}