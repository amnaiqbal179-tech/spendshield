import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET: Current Organization ki sari requests fetch karega taake Manager/Employee ko dikhein
export async function GET(req: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. User find ya create karein taake membership match ho sake
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: `${userId}@clerk.user`,
          name: "Workspace User",
        },
      });
    }

    // 2. Organization Resolution Logic
    let organization = null;

    if (orgId) {
      organization = await prisma.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        organization = await prisma.organization.create({
          data: {
            clerkOrgId: orgId,
            name: "Default Workspace",
          },
        });
      }

      const existingMembership = await prisma.membership.findFirst({
        where: {
          userId: dbUser.id,
          organizationId: organization.id,
        },
      });

      if (!existingMembership) {
        await prisma.membership.create({
          data: {
            userId: dbUser.id,
            organizationId: organization.id,
            role: "ADMIN",
          },
        });
      }
    } else {
      const membership = await prisma.membership.findFirst({
        where: { userId: dbUser.id },
        include: { organization: true },
      });

      if (membership) {
        organization = membership.organization;
      }
    }

    if (!organization) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 3. Sirf ishi organization ki requests fetch karein
    const requests = await prisma.softwareRequest.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        requester: true,
        department: true,
        reviewer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST: Nayi Software Request submit karne ke liye + Department Budget Validation
export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { softwareName, reason, estimatedCost, departmentId } = body;

    if (!softwareName || !reason) {
      return NextResponse.json({ error: "Software name and reason are required" }, { status: 400 });
    }

    // 1. User find ya create karein
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: `${userId}@clerk.user`,
          name: "Workspace User",
        },
      });
    }

    // 2. Permanent Organization Resolution Logic
    let organization = null;
    
    if (orgId) {
      organization = await prisma.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (!organization) {
        organization = await prisma.organization.create({
          data: {
            clerkOrgId: orgId,
            name: "Default Workspace",
          },
        });
      }

      const existingMembership = await prisma.membership.findFirst({
        where: {
          userId: dbUser.id,
          organizationId: organization.id,
        },
      });

      if (!existingMembership) {
        await prisma.membership.create({
          data: {
            userId: dbUser.id,
            organizationId: organization.id,
            role: "EMPLOYEE",
          },
        });
      }
    } else {
      const membership = await prisma.membership.findFirst({
        where: { userId: dbUser.id },
        include: { organization: true },
      });

      if (membership) {
        organization = membership.organization;
      }
    }

    if (!organization) {
      return NextResponse.json(
        { error: "Organization context missing. Please select a workspace in Clerk." },
        { status: 400 }
      );
    }

    const costNum = estimatedCost ? parseFloat(estimatedCost) : 0;
    let budgetExceeded = false;
    let departmentName = "General";

    // 3. --- DEPARTMENT BUDGET VALIDATION LOGIC ---
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
        include: {
          requests: {
            where: { status: "APPROVED" },
          },
        },
      });

      if (department) {
        departmentName = department.name;
        const currentApprovedSpent = department.requests.reduce(
          (sum, req) => sum + Number(req.estimatedCost),
          0
        );

        const monthlyLimit = Number(department.monthlyBudget);

        if (currentApprovedSpent + costNum > monthlyLimit) {
          budgetExceeded = true;
        }
      }
    }

    // 4. Software Request create karein
    const newRequest = await prisma.softwareRequest.create({
      data: {
        organizationId: organization.id,
        requesterId: dbUser.id,
        softwareName: softwareName,
        reason: reason,
        estimatedCost: costNum,
        departmentId: departmentId || null,
        status: "PENDING",
      },
    });

    // 5. Is Organization ke tamam Managers aur Admins ko find karein
    const managersAndAdmins = await prisma.membership.findMany({
      where: {
        organizationId: organization.id,
        role: {
          in: ["ADMIN", "MANAGER"],
        },
      },
      select: {
        userId: true,
      },
    });

    // 6. Notifications generate karein managers ke liye
    if (managersAndAdmins.length > 0) {
      const title = budgetExceeded ? "⚠️ Budget Exceeded Request" : "New Software Request 📦";
      const message = budgetExceeded
        ? `${dbUser.name || "Employee"} requested ${softwareName} ($${costNum}), which exceeds the budget for ${departmentName}!`
        : `${dbUser.name || "An employee"} has requested a license for ${softwareName} ($${costNum}).`;

      const notificationsData = managersAndAdmins.map((manager) => ({
        organizationId: organization.id,
        userId: manager.userId,
        type: "REQUEST_SUBMITTED" as const,
        title: title,
        message: message,
        relatedRequestId: newRequest.id,
        read: false,
      }));

      await prisma.notification.createMany({
        data: notificationsData,
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: newRequest, 
      budgetWarning: budgetExceeded 
    });
  } catch (error: any) {
    console.error("Error creating software request:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Request ko Approve ya Reject karne ke liye (Manager Action) aur Employee ko notify karne ke liye
export async function PUT(req: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, status } = body; // status can be "APPROVED" or "REJECTED"

    if (!requestId || !status) {
      return NextResponse.json({ error: "Request ID and status are required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Optional: Verify that the user has ADMIN or MANAGER role in this organization
    if (orgId) {
      const organization = await prisma.organization.findUnique({
        where: { clerkOrgId: orgId },
      });

      if (organization) {
        const membership = await prisma.membership.findFirst({
          where: {
            userId: dbUser.id,
            organizationId: organization.id,
          },
        });

        if (membership && membership.role === "EMPLOYEE") {
          return NextResponse.json({ error: "Forbidden: Only managers can approve or reject requests" }, { status: 403 });
        }
      }
    }

    // Request update karein
    const updatedRequest = await prisma.softwareRequest.update({
      where: { id: requestId },
      data: {
        status: status,
        reviewerId: dbUser.id,
      },
    });

    // Employee ko notification bhejein ke uski request approve/reject ho gayi hai
    await prisma.notification.create({
      data: {
        organizationId: updatedRequest.organizationId,
        userId: updatedRequest.requesterId,
        type: "REQUEST_STATUS_UPDATED" as const,
        title: `Request ${status === "APPROVED" ? "Approved ✅" : "Rejected ❌"}`,
        message: `Your request for ${updatedRequest.softwareName} has been ${status.toLowerCase()} by ${dbUser.name || "Management"}.`,
        relatedRequestId: updatedRequest.id,
        read: false,
      },
    });

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error: any) {
    console.error("Error updating software request:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}