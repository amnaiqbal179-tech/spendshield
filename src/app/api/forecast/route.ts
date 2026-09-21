import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Pehli organization fetch kar rahe hain (aap yahan auth/clerk ke zariye current org id laga sakte hain)
    const organization = await prisma.organization.findFirst({
      include: {
        monthlyForecasts: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    // Database se real renewals fetch karein
    const renewals = await prisma.renewal.findMany({
      where: { organizationId: organization.id },
      include: { subscription: true },
      orderBy: { renewalDate: "asc" },
      take: 6,
    });

    // Total Spend calculate karein
    const totalSpend = renewals.reduce(
      (acc, r) => acc + Number(r.currentCost),
      0
    );
    const totalSavings = totalSpend * 0.174; // Estimated ratio

    const metrics = {
      projectedSpend: `$${(totalSpend / 1000).toFixed(1)}K`,
      projectedSavings: `$${(totalSavings / 1000).toFixed(1)}K`,
      savingsCoverage: "17.4%",
      spendExposure: "+8.6%",
    };

    // Agar database mein monthlyForecasts mojood hon toh woh use karein, warna default format
    const monthlyForecast =
      organization.monthlyForecasts.length > 0
        ? organization.monthlyForecasts.map((item) => ({
            month: item.month,
            spend: `$${Number(item.spend).toLocaleString()}`,
            savings: `$${Number(item.savings).toLocaleString()}`,
            width: item.width || "50%",
          }))
        : [
            { month: "Sep", spend: "$42.8K", savings: "$7.2K", width: "42%" },
            { month: "Oct", spend: "$48.5K", savings: "$8.6K", width: "54%" },
            { month: "Nov", spend: "$39.2K", savings: "$6.4K", width: "46%" },
            { month: "Dec", spend: "$51.7K", savings: "$9.1K", width: "68%" },
            { month: "Jan", spend: "$44.3K", savings: "$7.8K", width: "58%" },
            { month: "Feb", spend: "$46.1K", savings: "$8.2K", width: "63%" },
          ];

    const upcomingRenewals = renewals.map((r) => ({
      name: r.subscription.productName,
      date: new Date(r.renewalDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      spend: `$${Number(r.currentCost).toLocaleString()}`,
      savings: `$${(Number(r.currentCost) * 0.15).toFixed(0)}`,
      risk: (r.readinessScore && r.readinessScore < 50 ? "Critical" : "At Risk") as "Critical" | "At Risk" | "On Track",
    }));

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        monthlyForecast,
        upcomingRenewals: upcomingRenewals.length > 0 ? upcomingRenewals : [
          { name: "Zoom", date: "Sep 14, 2026", spend: "$2,100", savings: "$420", risk: "Critical" },
        ],
      },
    });
  } catch (error) {
    console.error("Database forecast error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}