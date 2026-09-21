import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: "No organization selected",
        },
        {
          status: 400,
        }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        clerkOrgId: orgId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Organization is not synced with the database. Please sync your account first.",
        },
        {
          status: 400,
        }
      );
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        department: true, // Department details fetch karne ke liye
      },
      orderBy: {
        renewalDate: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: subscriptions.map((subscription) => ({
        id: subscription.id,
        vendorName: subscription.vendor,
        productName: subscription.productName,
        category: subscription.category ?? "Uncategorized",
        seatCount: subscription.licenseCount,
        activeSeats: subscription.activeUsers,
        cost: subscription.annualCost.toString(),
        currency: organization.currency,
        billingCycle: subscription.billingCycle,
        renewalDate: subscription.renewalDate,
        criticality: subscription.criticality,
        departmentId: subscription.departmentId,
        departmentName: subscription.department?.name ?? "General",
      })),
    });
  } catch (error) {
    console.error("GET /api/subscriptions error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subscriptions",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: "No organization selected",
        },
        {
          status: 400,
        }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        clerkOrgId: orgId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Organization is not synced with the database. Please sync your account first.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const vendorValue = body.vendorName || body.vendor;

    if (!vendorValue || !body.productName || !body.renewalDate) {
      return NextResponse.json(
        {
          success: false,
          error: "Required fields are missing (Vendor, Product Name, Renewal Date)",
        },
        {
          status: 400,
        }
      );
    }

    const licenseCount = Number(body.seatCount ?? 0);
    const activeUsers = Number(body.activeSeats ?? 0);
    const annualCost = Number(body.annualCost ?? body.cost ?? 0);

    if (
      !Number.isFinite(licenseCount) ||
      !Number.isFinite(activeUsers) ||
      !Number.isFinite(annualCost)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid numeric values provided",
        },
        {
          status: 400,
        }
      );
    }

    if (
      licenseCount < 0 ||
      activeUsers < 0 ||
      activeUsers > licenseCount
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Active seats cannot be greater than total seats",
        },
        {
          status: 400,
        }
      );
    }

    const renewalDate = new Date(body.renewalDate);

    if (Number.isNaN(renewalDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid renewal date format",
        },
        {
          status: 400,
        }
      );
    }

    const monthlyCost = annualCost / 12;

    // Subscription create karein with proposal metadata fields
    const subscription = await prisma.subscription.create({
      data: {
        organizationId: organization.id,
        vendor: String(vendorValue).trim(),
        productName: String(body.productName).trim(),
        category: body.category ? String(body.category).trim() : null,
        licenseCount,
        activeUsers,
        monthlyCost,
        annualCost,
        billingCycle: body.billingCycle === "MONTHLY" ? "MONTHLY" : "YEARLY",
        renewalDate,
        status: "ACTIVE",
        autoRenew: body.autoRenew ?? false,
        criticality: body.criticality ? String(body.criticality).toUpperCase() : "MEDIUM",
        departmentId: body.departmentId || null,
      },
    });

    // Associated Renewal Record create karein taake Renewal Intelligence & Simulator kaam kar sakay
    await prisma.renewal.create({
      data: {
        organizationId: organization.id,
        subscriptionId: subscription.id,
        renewalDate,
        previousCost: annualCost,
        currentCost: annualCost,
        status: "UPCOMING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: subscription.id,
          vendorName: subscription.vendor,
          productName: subscription.productName,
          category: subscription.category ?? "Uncategorized",
          seatCount: subscription.licenseCount,
          activeSeats: subscription.activeUsers,
          cost: subscription.annualCost.toString(),
          currency: organization.currency,
          billingCycle: subscription.billingCycle,
          renewalDate: subscription.renewalDate,
          criticality: subscription.criticality,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/subscriptions error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create subscription",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: "No organization selected",
        },
        {
          status: 400,
        }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        clerkOrgId: orgId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error: "Organization is not synced with the database.",
        },
        {
          status: 400,
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Subscription ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: "Subscription not found",
        },
        {
          status: 404,
        }
      );
    }

    // Delete associated renewal records first
    await prisma.renewal.deleteMany({
      where: {
        subscriptionId: id,
      },
    });

    // Delete the subscription
    await prisma.subscription.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/subscriptions error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete subscription",
      },
      {
        status: 500,
      }
    );
  }
}