import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId, orgId, orgRole } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "You must be signed in." },
        },
        { status: 401 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "No active organization found." },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      clerkOrgId,
      name,
      industry,
      employeeCount,
      currency,
      timezone,
    } = body;

    if (clerkOrgId !== orgId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Organization mismatch." },
        },
        { status: 403 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Organization name is required." },
        },
        { status: 400 }
      );
    }

    if (!industry?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Industry is required." },
        },
        { status: 400 }
      );
    }

    if (!employeeCount || Number(employeeCount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Valid employee count is required." },
        },
        { status: 400 }
      );
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Clerk user could not be found." },
        },
        { status: 401 }
      );
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Your Clerk account has no email address." },
        },
        { status: 400 }
      );
    }

    const fullName =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || clerkUser.username || "User";

    const existingOrganization = await prisma.organization.findUnique({
      where: {
        clerkOrgId: orgId,
      },
    });

    /*
     * The Clerk organization may already exist even when
     * SpendShield has not created its database records yet.
     *
     * We therefore create/sync the SpendShield User and Membership
     * instead of rejecting the existing organization.
     */

    const spendShieldUser = await prisma.user.upsert({
      where: {
        clerkUserId: userId,
      },
      update: {
        name: fullName,
        email,
        image: clerkUser.imageUrl,
      },
      create: {
        clerkUserId: userId,
        name: fullName,
        email,
        image: clerkUser.imageUrl,
      },
    });

    if (existingOrganization) {
      /*
       * Clerk Admin → SpendShield ADMIN
       * Clerk Member → SpendShield EMPLOYEE
       */
      const spendShieldRole =
        orgRole === "org:admin" ? "ADMIN" : "EMPLOYEE";

      /*
       * Only Clerk admins can update organization setup details.
       */
      if (orgRole === "org:admin") {
        await prisma.organization.update({
          where: {
            id: existingOrganization.id,
          },
          data: {
            name: name.trim(),
            industry: industry.trim(),
            employeeCount: Number(employeeCount),
            currency: currency || "USD",
            timezone: timezone || "UTC",
          },
        });
      }

      const membership = await prisma.membership.upsert({
        where: {
          userId_organizationId: {
            userId: spendShieldUser.id,
            organizationId: existingOrganization.id,
          },
        },
        update: {
          role: spendShieldRole,
        },
        create: {
          userId: spendShieldUser.id,
          organizationId: existingOrganization.id,
          role: spendShieldRole,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          organizationId: existingOrganization.id,
          clerkOrgId: existingOrganization.clerkOrgId,
          name: existingOrganization.name,
          role: membership.role,
        },
      });
    }

    /*
     * A new SpendShield organization can only be created
     * by a Clerk organization admin.
     */
    if (orgRole !== "org:admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Only organization admins can create the workspace.",
          },
        },
        { status: 403 }
      );
    }

    const organization = await prisma.$transaction(async (tx) => {
      const newOrganization = await tx.organization.create({
        data: {
          clerkOrgId: orgId,
          name: name.trim(),
          slug: `${name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}-${Date.now()}`,
          industry: industry.trim(),
          employeeCount: Number(employeeCount),
          currency: currency || "USD",
          timezone: timezone || "UTC",
        },
      });

      await tx.membership.create({
        data: {
          userId: spendShieldUser.id,
          organizationId: newOrganization.id,
          role: "ADMIN",
        },
      });

      return newOrganization;
    });

    return NextResponse.json({
      success: true,
      data: {
        organizationId: organization.id,
        clerkOrgId: organization.clerkOrgId,
        name: organization.name,
        role: "ADMIN",
      },
    });
  } catch (error) {
    console.error("Organization sync error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while syncing the organization.",
        },
      },
      { status: 500 }
    );
  }
}