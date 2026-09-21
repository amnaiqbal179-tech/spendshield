import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    // Accept rows or subscriptions array from the payload
    const rows = body.rows || body.subscriptions;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No subscription rows provided for import",
        },
        {
          status: 400,
        }
      );
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const vendor = row.vendorName || row.vendor;
      const productName = row.productName;
      const renewalDateStr = row.renewalDate;

      if (!vendor || !productName || !renewalDateStr) {
        errors.push(`Row ${i + 1}: Missing required fields (vendor, productName, renewalDate)`);
        continue;
      }

      const licenseCount = Number(row.seatCount ?? row.licenseCount ?? 0);
      const activeUsers = Number(row.activeSeats ?? row.activeUsers ?? 0);
      const annualCost = Number(row.annualCost ?? row.cost ?? 0);

      if (
        !Number.isFinite(licenseCount) ||
        !Number.isFinite(activeUsers) ||
        !Number.isFinite(annualCost)
      ) {
        errors.push(`Row ${i + 1}: Invalid numeric values`);
        continue;
      }

      const renewalDate = new Date(renewalDateStr);

      if (Number.isNaN(renewalDate.getTime())) {
        errors.push(`Row ${i + 1}: Invalid renewal date format`);
        continue;
      }

      const monthlyCost = annualCost / 12;

      // Create subscription in database
      const subscription = await prisma.subscription.create({
        data: {
          organizationId: organization.id,
          vendor: String(vendor).trim(),
          productName: String(productName).trim(),
          category: row.category ? String(row.category).trim() : "Uncategorized",
          licenseCount,
          activeUsers,
          monthlyCost,
          annualCost,
          billingCycle: row.billingCycle === "MONTHLY" ? "MONTHLY" : "YEARLY",
          renewalDate,
          status: "ACTIVE",
          autoRenew: row.autoRenew ?? false,
          criticality: row.criticality ? String(row.criticality).toUpperCase() : "MEDIUM",
        },
      });

      // Automatically create the associated renewal record
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

      importedCount++;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          importedCount,
          totalRows: rows.length,
          errors,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/subscriptions/import error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process bulk import",
      },
      {
        status: 500,
      }
    );
  }
}