import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { subscriptionId, action, targetSeats } = body;

    if (!subscriptionId || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required simulation fields (subscriptionId, action)" },
        { status: 400 }
      );
    }

    // Mocking or fetching subscription data for simulation calculation
    // Yahan aap apne database ya Prisma client se actual subscription data fetch kar sakte hain
    const originalAnnualCost = 12000; // Example baseline cost
    let simulatedAnnualCost = originalAnnualCost;
    let businessRisk = "Low";

    switch (action) {
      case "REDUCE":
        const reductionFactor = targetSeats ? targetSeats / 10 : 0.8;
        simulatedAnnualCost = Math.round(originalAnnualCost * Math.max(0.2, reductionFactor));
        businessRisk = targetSeats < 5 ? "Moderate" : "Low";
        break;
      case "NEGOTIATE":
        simulatedAnnualCost = Math.round(originalAnnualCost * 0.85); // 15% discount simulation
        businessRisk = "Low";
        break;
      case "CANCEL":
        simulatedAnnualCost = 0;
        businessRisk = "High";
        break;
      case "RENEW":
      default:
        simulatedAnnualCost = originalAnnualCost;
        businessRisk = "None";
        break;
    }

    const estimatedSavings = Math.max(0, originalAnnualCost - simulatedAnnualCost);

    const simulationResult = {
      productName: `Enterprise Tool (${subscriptionId.slice(0, 6)}...)`,
      action,
      originalAnnualCost,
      simulatedAnnualCost,
      estimatedSavings,
      businessRisk,
      currency: "USD",
    };

    return NextResponse.json({
      success: true,
      data: simulationResult,
    });
  } catch (error) {
    console.error("Error executing simulator API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during simulation calculation" },
      { status: 500 }
    );
  }
}