import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Aapke project ka prisma/db import

export async function GET() {
  try {
    // Database se subscriptions fetch karein aur har possible name field ko cover karein
    const subscriptions = await db.subscription.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedData = subscriptions.map((sub: any) => ({
      id: sub.id,
      name: sub.name || sub.title || sub.productName || sub.serviceName || "Software Asset",
      vendor: sub.vendor || sub.vendorName || "Enterprise Vendor",
      annualCost: Number(sub.currentCost || sub.annualCost || sub.cost || 1200),
    }));

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch subscriptions for simulator:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subscriptionId, action, targetSeats } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Target subscription ko database se find karein
    const sub = await db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    const productName = sub 
      ? (sub.name || (sub as any).title || (sub as any).productName || "Software Asset")
      : "Enterprise Subscription";

    const originalCost = sub 
      ? Number((sub as any).currentCost || (sub as any).annualCost || (sub as any).cost || 1200)
      : 1200;

    let simulatedCost = originalCost;
    let estimatedSavings = 0;
    let businessRisk = "LOW";

    switch (action) {
      case "REDUCE":
        const totalSeats = Number((sub as any).totalSeats || 10);
        const ratio = Math.max(1, targetSeats) / Math.max(1, totalSeats);
        simulatedCost = Math.round(originalCost * ratio);
        estimatedSavings = Math.max(0, originalCost - simulatedCost);
        businessRisk = ratio < 0.6 ? "HIGH" : ratio < 0.8 ? "MODERATE" : "LOW";
        break;

      case "NEGOTIATE":
        simulatedCost = Math.round(originalCost * 0.85); // 15% discount simulation
        estimatedSavings = originalCost - simulatedCost;
        businessRisk = "LOW";
        break;

      case "CANCEL":
        simulatedCost = 0;
        estimatedSavings = originalCost;
        businessRisk = "CRITICAL";
        break;

      case "RENEW":
      default:
        simulatedCost = originalCost;
        estimatedSavings = 0;
        businessRisk = "LOW";
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        productName,
        action,
        originalAnnualCost: originalCost,
        simulatedAnnualCost: simulatedCost,
        estimatedSavings,
        businessRisk,
        currency: (sub as any)?.currency || "USD",
      },
    });
  } catch (error) {
    console.error("Simulation engine error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during simulation calculation." },
      { status: 500 }
    );
  }
}