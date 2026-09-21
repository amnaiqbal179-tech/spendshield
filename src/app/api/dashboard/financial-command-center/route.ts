import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Authentication / Organization check
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: "No organization selected.",
        },
        { status: 400 }
      );
    }

    // 2. Find or synchronize organization safely using clerkOrgId
    const client = await clerkClient();
    const clerkOrg = await client.organizations.getOrganization({
      organizationId: orgId,
    });

    const baseSlug = clerkOrg.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    const slug = baseSlug || `org-${Date.now()}`;

    const organization = await prisma.organization.upsert({
      where: { clerkOrgId: orgId },
      update: {
        name: clerkOrg.name,
      },
      create: {
        clerkOrgId: orgId,
        name: clerkOrg.name,
        slug: slug,
        currency: "USD",
      },
    });

    const now = new Date();

    // 3. Active subscriptions & Category Spend aggregation
    const subscriptions = await prisma.subscription.findMany({
      where: {
        organizationId: organization.id,
        status: "ACTIVE",
      },
      select: {
        annualCost: true,
        category: true,
      },
    });

    const totalAnnualSpend = subscriptions.reduce(
      (sum, subscription) => {
        return sum + Number(subscription.annualCost ?? 0);
      },
      0
    );

    const categoryMap: { [key: string]: number } = {};
    subscriptions.forEach((sub) => {
      const cat = sub.category || "General";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(sub.annualCost ?? 0);
    });

    const categorySpend = Object.keys(categoryMap).length > 0
      ? Object.keys(categoryMap).map((cat) => ({
          category: cat,
          amount: categoryMap[cat],
        }))
      : [
          { category: "Engineering", amount: 0 },
          { category: "Operations", amount: 0 },
        ];

    // 4. Upcoming renewals & Decisions
    const renewals = await prisma.renewal.findMany({
      where: {
        organizationId: organization.id,
        renewalDate: {
          gte: now,
        },
      },
      include: {
        subscription: {
          select: {
            vendor: true,
            productName: true,
            annualCost: true,
          },
        },
      },
      orderBy: {
        renewalDate: "asc",
      },
    });

    const upcomingRenewalsCount = renewals.length;

    const recentDecisions = renewals.slice(0, 3).map((renewal) => ({
      id: renewal.id,
      vendor: renewal.subscription?.vendor || "Unknown Vendor",
      productName: renewal.subscription?.productName || "SaaS Tool",
      annualCost: Number(renewal.subscription?.annualCost ?? 0),
      potentialSavings: Number(renewal.projectedCost ?? 0) > 0 
        ? Math.max(0, Number(renewal.subscription?.annualCost ?? 0) - Number(renewal.projectedCost))
        : Number(renewal.subscription?.annualCost ?? 0) * 0.2,
      status: renewal.status,
      renewalDate: renewal.renewalDate.toISOString(),
    }));

    const recentActivity = renewals.slice(0, 4).map((renewal, index) => ({
      id: String(renewal.id || index),
      action: `Renewal scheduled for ${renewal.subscription?.productName || "SaaS Tool"}`,
      user: renewal.subscription?.vendor || "System",
      time: new Date(renewal.renewalDate).toLocaleDateString(),
      type: "renewal" as const,
    }));

    // 5. Open savings opportunities
    const opportunities = await prisma.savingsOpportunity.findMany({
      where: {
        organizationId: organization.id,
        status: "OPEN",
      },
      select: {
        estimatedSaving: true,
      },
    });

    const totalPotentialSavings = opportunities.reduce(
      (sum, opportunity) => {
        return sum + Number(opportunity.estimatedSaving ?? 0);
      },
      0
    );

    // 6. Realized savings
    let totalRealizedSavings = 0;
    try {
      const savingsRecords = await prisma.savingsRecord.findMany({
        where: {
          organizationId: organization.id,
          stage: "REALIZED",
        },
        select: {
          realizedSaving: true,
        },
      });

      totalRealizedSavings = savingsRecords.reduce(
        (sum, record) => {
          return sum + Number(record.realizedSaving ?? 0);
        },
        0
      );
    } catch (savingsErr) {
      console.warn("SavingsRecord query skipped gracefully:", savingsErr);
    }

    // 7. Final response
    const dashboardMetrics = {
      organizationId: organization.id,
      organizationName: organization.name,
      totalSubscriptions: subscriptions.length,
      totalAnnualSpend: Number(totalAnnualSpend.toFixed(2)),
      upcomingRenewalsCount,
      totalPotentialSavings: Number(totalPotentialSavings.toFixed(2)),
      totalRealizedSavings: Number(totalRealizedSavings.toFixed(2)),
      currency: organization.currency || "USD",
      recentDecisions,
      categorySpend,
      recentActivity,
    };

    return NextResponse.json({
      success: true,
      data: dashboardMetrics,
    });
  } catch (error) {
    console.error("Error fetching dashboard command center data:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch dashboard metrics.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}