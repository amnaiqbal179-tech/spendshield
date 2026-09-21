import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js params ko safely handle karne ke liye
    const params = await Promise.resolve(context.params);
    const requestId = params.id;

    const body = await req.json();
    const { status } = body; // "APPROVED" ya "REJECTED"

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Database mein request update karein (sirf status update hoga taake error na aaye)
    const updatedRequest = await prisma.softwareRequest.update({
      where: { id: requestId },
      data: {
        status: status,
      },
    });

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error: any) {
    console.error("Error updating request status:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}