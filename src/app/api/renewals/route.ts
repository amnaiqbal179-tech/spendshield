import { auth, clerkClient } from "@clerk/nextjs/server";
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
        { status: 401 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: "No organization selected",
        },
        { status: 400 }
      );
    }

    // 1. Find organization by clerkOrgId
    let organization = await prisma.organization.findUnique({
      where: {
        clerkOrgId: orgId,
      },
    });

    // 2. If not found, safely sync using JIT logic (Avoiding slug collision)
    if (!organization) {
      try {
        const client = await clerkClient();
        const clerkOrg = await client.organizations.getOrganization({
          organizationId: orgId,
        });

        const baseSlug = clerkOrg.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        const uniqueSlug = `${baseSlug || "org"}-${orgId.slice(-6).toLowerCase()}`;

        organization = await prisma.organization.findFirst({
          where: {
            OR: [
              { clerkOrgId: orgId },
              { slug: uniqueSlug }
            ]
          }
        });

        if (organization) {
          organization = await prisma.organization.update({
            where: { id: organization.id },
            data: {
              name: clerkOrg.name,
              clerkOrgId: orgId,
            },
          });
        } else {
          organization = await prisma.organization.create({
            data: {
              clerkOrgId: orgId,
              name: clerkOrg.name,
              slug: uniqueSlug,
              currency: "USD",
            },
          });
        }
      } catch (syncError) {
        console.error("Failed to auto-sync organization from Clerk:", syncError);
        return NextResponse.json(
          {
            success: false,
            error:
              "Organization is not synced with the database. Please sync your account first.",
          },
          { status: 400 }
        );
      }
    }

    // Fetch renewals belonging only to this organization safely with opportunities count if relation exists
    const renewals = await prisma.renewal.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        subscription: true,
        opportunities: true, 
      },
      orderBy: {
        renewalDate: "asc",
      },
    });

    const now = new Date();

    const data = renewals.map((renewal) => {
      const renewalDate = new Date(renewal.renewalDate);

      // Calculate remaining days
      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const daysUntilRenewal = Math.ceil(
        (renewalDate.getTime() - now.getTime()) /
          millisecondsPerDay
      );

      // Calculate unused seats safely
      const totalSeats = renewal.subscription?.licenseCount ?? 0;
      const activeSeats = renewal.subscription?.activeUsers ?? 0;

      const unusedSeats = Math.max(
        totalSeats - activeSeats,
        0
      );

      // Estimate potential saving from unused licenses
      const annualCost = Number(
        renewal.subscription?.annualCost ?? renewal.currentCost ?? 0
      );

      const costPerSeat =
        totalSeats > 0
          ? annualCost / totalSeats
          : 0;

      const unusedLicenseSaving = unusedSeats * costPerSeat;
      
      const opportunitiesList = (renewal as any).opportunities || [];
      const oppsSaving = opportunitiesList.reduce(
        (acc: number, opp: any) => acc + Number(opp.potentialSaving || 0),
        0
      );

      const totalPotentialSaving = Math.max(
        unusedLicenseSaving + oppsSaving,
        0
      );

      // Determine urgency
      let urgency = "LOW";
      if (daysUntilRenewal <= 7) {
        urgency = "CRITICAL";
      } else if (daysUntilRenewal <= 30) {
        urgency = "HIGH";
      } else if (daysUntilRenewal <= 60) {
        urgency = "MEDIUM";
      }

      const readinessScore = renewal.readinessScore ?? 0;

      return {
        id: renewal.id,
        subscriptionId: renewal.subscriptionId,
        vendorName: renewal.subscription?.vendor ?? "Unknown Vendor",
        productName: renewal.subscription?.productName ?? "Unknown Product",
        category:
          renewal.subscription?.category ??
          "Uncategorized",
        renewalDate: renewalDate.toISOString(),
        daysUntilRenewal,
        previousCost: (renewal.previousCost ?? 0).toString(),
        currentCost: (renewal.currentCost ?? 0).toString(),
        priceIncreasePercent:
          renewal.priceIncreasePercent?.toString() ??
          "0",
        readinessScore,
        status: renewal.status ?? "PENDING",
        urgency,
        criticality:
          renewal.subscription?.criticality ?? "MEDIUM",
        autoRenew:
          renewal.subscription?.autoRenew ?? false,
        totalSeats,
        activeSeats,
        unusedSeats,
        potentialSaving: totalPotentialSaving.toFixed(2),
        opportunityCount: opportunitiesList.length > 0 ? opportunitiesList.length : (unusedSeats > 0 ? 1 : 0),
        currency: organization?.currency || "USD",
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/renewals error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch renewals",
      },
      { status: 500 }
    );
  }
}

// POST endpoint to update renewal status or details
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized or No Organization" },
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

    const body = await request.json();
    const { renewalId, status, readinessScore, currentCost } = body;

    if (!renewalId) {
      return NextResponse.json(
        { success: false, error: "Renewal ID is required" },
        { status: 400 }
      );
    }

    const existingRenewal = await prisma.renewal.findFirst({
      where: {
        id: renewalId,
        organizationId: organization.id,
      },
    });

    if (!existingRenewal) {
      return NextResponse.json(
        { success: false, error: "Renewal record not found" },
        { status: 404 }
      );
    }

    const updatedRenewal = await prisma.renewal.update({
      where: { id: renewalId },
      data: {
        ...(status && { status }),
        ...(readinessScore !== undefined && { readinessScore: Number(readinessScore) }),
        ...(currentCost !== undefined && { currentCost: Number(currentCost) }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRenewal,
    });
  } catch (error) {
    console.error("POST /api/renewals error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update renewal" },
      { status: 500 }
    );
  }
}