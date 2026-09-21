import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId, orgId } = await auth();

    // ---------------------------------------------------------
    // Authentication checks
    // ---------------------------------------------------------

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
          error: "No organization selected.",
        },
        { status: 400 }
      );
    }

    const clerk = await clerkClient();

    // ---------------------------------------------------------
    // Get Clerk user
    // ---------------------------------------------------------

    const user = await clerk.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "User email not found.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Get Clerk organization & memberships
    // ---------------------------------------------------------

    const clerkOrganization = await clerk.organizations.getOrganization({
      organizationId: orgId,
    });

    const organizationSlug = clerkOrganization.slug || orgId;

    // Fetch user's membership details in the org from Clerk to determine correct role
    let clerkUserRole = "MEMBER";
    try {
      const memberships = await clerk.organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });
      const currentMember = memberships.data.find(
        (m) => m.publicUserData?.userId === userId
      );
      if (currentMember && currentMember.role) {
        // Clerk roles are usually like 'org:admin' or 'org:member'
        clerkUserRole = currentMember.role.includes("admin") ? "ADMIN" : "MEMBER";
      }
    } catch (err) {
      console.warn("Could not fetch Clerk organization memberships:", err);
    }

    // ---------------------------------------------------------
    // Sync User
    // ---------------------------------------------------------

    let dbUser = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });
    }

    const userName =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;

    if (dbUser) {
      dbUser = await prisma.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          clerkUserId: userId,
          name: userName,
          image: user.imageUrl,
        },
      });
    } else {
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: userId,
          name: userName,
          email,
          image: user.imageUrl,
        },
      });
    }

    // ---------------------------------------------------------
    // Sync Organization
    // ---------------------------------------------------------

    let dbOrganization = await prisma.organization.findUnique({
      where: {
        clerkOrgId: orgId,
      },
    });

    if (!dbOrganization) {
      dbOrganization = await prisma.organization.findUnique({
        where: {
          slug: organizationSlug,
        },
      });
    }

    if (dbOrganization) {
      dbOrganization = await prisma.organization.update({
        where: {
          id: dbOrganization.id,
        },
        data: {
          clerkOrgId: orgId,
          name: clerkOrganization.name,
          slug: organizationSlug,
        },
      });
    } else {
      dbOrganization = await prisma.organization.create({
        data: {
          clerkOrgId: orgId,
          name: clerkOrganization.name,
          slug: organizationSlug,
        },
      });
    }

    // ---------------------------------------------------------
    // Sync Organization Membership
    // ---------------------------------------------------------

    if (prisma.organizationMember) {
      let membership = await prisma.organizationMember.findFirst({
        where: {
          userId: dbUser.id,
          organizationId: dbOrganization.id,
        },
      });

      if (!membership) {
        await prisma.organizationMember.create({
          data: {
            userId: dbUser.id,
            organizationId: dbOrganization.id,
            role: clerkUserRole,
          },
        });
      } else {
        // Update role if changed in Clerk
        await prisma.organizationMember.update({
          where: {
            id: membership.id,
          },
          data: {
            role: clerkUserRole,
          },
        });
      }
    }

    // ---------------------------------------------------------
    // Response
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      data: {
        userId: dbUser.id,
        organizationId: dbOrganization.id,
        organizationName: dbOrganization.name,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/sync error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SYNC_FAILED",
          message: "Failed to sync Clerk user and organization.",
        },
      },
      { status: 500 }
    );
  }
}