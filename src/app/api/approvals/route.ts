import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const allowedStatuses = ["PENDING", "APPROVED", "REJECTED", "NEEDS_CHANGES"] as const;

// GET: Manager ke liye sari software requests fetch karna
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Database se sari requests fetch ki ja rahi hain taake UI par foran show ho sakein
    const requests = await prisma.softwareRequest.findMany({
      include: {
        requester: {
          select: { name: true, email: true, image: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Total requests found in DB:", requests.length);

    // Frontend ke ApprovalItem interface ke sath data map kiya ja raha hai
    const formattedApprovals = requests.map((req) => ({
      id: req.id,
      status: req.status,
      comment: req.rejectionReason || req.reviewComment,
      createdAt: req.createdAt,
      User: req.requester,
      decision: {
        softwareName: req.softwareName,
        reason: req.reason,
        estimatedCost: req.estimatedCost,
      },
    }));

    return NextResponse.json(formattedApprovals);
  } catch (error: any) {
    console.error("Error fetching approvals:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Request ka status (Approve/Reject) update karne ke liye
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, comment } = body;

    if (!id || !status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid ID or status." },
        { status: 400 }
      );
    }

    // SoftwareRequest table ko update karein
    const updatedRequest = await prisma.softwareRequest.update({
      where: { id },
      data: {
        status: status,
        rejectionReason: status === "REJECTED" ? comment : null,
        reviewComment: status !== "REJECTED" ? comment : null,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error: any) {
    console.error("Error updating approval:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}