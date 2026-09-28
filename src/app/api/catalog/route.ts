import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 400 }
      );
    }

    // Database se real subscriptions fetch karein jo catalog mein show hongi
    const subscriptions = await prisma.subscription.findMany({
      where: {
        organizationId: organization.id,
        status: "ACTIVE",
      },
      orderBy: { productName: "asc" },
    });

    const catalogData = subscriptions.map((sub) => ({
      id: sub.id,
      productName: sub.productName,
      vendor: sub.vendor,
      category: sub.category || "General",
      plan: sub.billingCycle === "YEARLY" ? "Enterprise Annual" : "Standard Plan",
    }));

    return NextResponse.json({
      success: true,
      data: catalogData,
    });
  } catch (error) {
    console.error("GET /api/catalog error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch software catalog" },
      { status: 500 }
    );
  }
}