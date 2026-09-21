import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "No organization selected" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found in database" },
        { status: 404 }
      );
    }

    // 1. Fetch all subscriptions for the organization
    const subscriptions = await prisma.subscription.findMany({
      where: { organizationId: organization.id },
    });

    // 2. Fetch all renewals with associated opportunities
    const renewals = await prisma.renewal.findMany({
      where: { organizationId: organization.id },
      include: {
        opportunities: true,
        subscription: true,
      },
    });

    // Calculate metrics
    let totalAnnualSpend = 0;
    let totalMonthlySpend = 0;
    let activeSubscriptionsCount = 0;
    let totalLicenses = 0;
    let activeLicenses = 0;

    subscriptions.forEach((sub) => {
      if (sub.status === "ACTIVE") {
        activeSubscriptionsCount++;
        totalAnnualSpend += Number(sub.annualCost || 0);
        totalMonthlySpend += Number(sub.monthlyCost || (sub.annualCost ? Number(sub.annualCost) / 12 : 0));
      }
      totalLicenses += sub.licenseCount || 0;
      activeLicenses += sub.activeUsers || 0;
    });

    const now = new Date();
    let upcomingRenewalsCount = 0;
    let totalPotentialSavings = 0;

    renewals.forEach((renewal) => {
      const renewalDate = new Date(renewal.renewalDate);
      const diffTime = renewalDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Upcoming renewals in next 30 days
      if (diffDays >= 0 && diffDays <= 30 && renewal.status === "UPCOMING") {
        upcomingRenewalsCount++;
      }

      // Calculate potential savings from opportunities
      const opps = renewal.opportunities || [];
      opps.forEach((opp) => {
        totalPotentialSavings += Number(opp.estimatedSaving || 0);
      });
    });

    // Fallback or additional savings calculation for unused seats if not caught by opportunities
    subscriptions.forEach((sub) => {
      const unused = Math.max((sub.licenseCount || 0) - (sub.activeUsers || 0), 0);
      if (unused > 0 && sub.licenseCount && sub.licenseCount > 0) {
        const costPerSeat = Number(sub.annualCost || 0) / sub.licenseCount;
        // Add to potential savings if not already accounted for
        // (Yeh basic estimation hai agar direct opportunity record na ho)
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalAnnualSpend: totalAnnualSpend.toFixed(2),
        totalMonthlySpend: totalMonthlySpend.toFixed(2),
        activeSubscriptionsCount,
        upcomingRenewalsCount,
        totalPotentialSavings: totalPotentialSavings.toFixed(2),
        totalLicenses,
        activeLicenses,
        currency: organization.currency || "USD",
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/metrics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}