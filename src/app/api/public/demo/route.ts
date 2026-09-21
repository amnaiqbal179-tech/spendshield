import { NextResponse } from "next/server";
import { getDemoData } from "@/lib/demo-data";

export async function GET() {
  try {
    const data = await getDemoData();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/public/demo error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load demo data",
      },
      { status: 500 }
    );
  }
}