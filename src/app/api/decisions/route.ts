import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==================================================
// HELPER — Ensure Organization and User JIT Sync
// ==================================================
async function ensureOrgAndUser(orgId: string, userId: string) {
  // 1. Ensure Organization
  let organization = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
  });

  if (!organization) {
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
        OR: [{ clerkOrgId: orgId }, { slug: uniqueSlug }],
      },
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
  }

  // 2. Ensure User (Handling email unique constraint safely)
  let user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email =
      clerkUser.emailAddresses[0]?.emailAddress || `${userId}@clerk.user`;
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      "User";
    const image = clerkUser.imageUrl;

    // Check if a user with this email already exists to prevent unique constraint crash
    user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          clerkUserId: userId,
          name,
          image,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          clerkUserId: userId,
          email,
          name,
          image,
        },
      });
    }
  }

  return { organization, user };
}

// ==================================================
// GET — Fetch Decision(s)
// ==================================================
export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "No organization selected" },
        { status: 400 }
      );
    }

    const { organization } = await ensureOrgAndUser(orgId, userId);

    const { searchParams } = new URL(request.url);
    const renewalId = searchParams.get("renewalId");
    const all = searchParams.get("all") === "true";

    if (all) {
      const decisions = await prisma.decision.findMany({
        where: { organizationId: organization.id },
        include: {
          DecisionScenario: true,
          Renewal: {
            include: { subscription: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const data = decisions.map((decision) => {
        const selectedScenario =
          decision.DecisionScenario.find(
            (scenario) => scenario.action === decision.selectedAction
          ) ??
          decision.DecisionScenario[0] ??
          null;

        return {
          id: decision.id,
          renewalId: decision.renewalId,
          recommendedAction: decision.recommendedAction,
          selectedAction: decision.selectedAction,
          currentAnnualCost: decision.currentAnnualCost.toString(),
          expectedAnnualCost: decision.expectedAnnualCost?.toString() ?? null,
          estimatedSaving: decision.estimatedSaving?.toString() ?? "0",
          status: decision.status,
          reasoning: decision.reasoning,
          recommendationScore: decision.recommendationScore?.toString() ?? null,
          finalizedAt: decision.finalizedAt,
          finalizedById: decision.finalizedById,
          createdAt: decision.createdAt,
          updatedAt: decision.updatedAt,
          selectedScenario: selectedScenario
            ? {
                id: selectedScenario.id,
                action: selectedScenario.action,
                annualCost: selectedScenario.annualCost.toString(),
                estimatedSaving: selectedScenario.estimatedSaving.toString(),
                licenseCount: selectedScenario.licenseCount,
                plan: selectedScenario.plan,
                notes: selectedScenario.notes,
              }
            : null,
          renewal: {
            id: decision.Renewal.id,
            renewalDate: decision.Renewal.renewalDate,
            noticeDeadline: decision.Renewal.noticeDeadline,
            previousCost: decision.Renewal.previousCost.toString(),
            currentCost: decision.Renewal.currentCost.toString(),
            priceIncreasePercent:
              decision.Renewal.priceIncreasePercent?.toString() ?? "0",
            readinessScore: decision.Renewal.readinessScore,
            status: decision.Renewal.status,
            subscription: {
              id: decision.Renewal.subscription.id,
              vendor: decision.Renewal.subscription.vendor,
              productName: decision.Renewal.subscription.productName,
              category:
                decision.Renewal.subscription.category ?? "Uncategorized",
              plan: decision.Renewal.subscription.plan,
              licenseCount: decision.Renewal.subscription.licenseCount,
              activeUsers: decision.Renewal.subscription.activeUsers,
              annualCost:
                decision.Renewal.subscription.annualCost.toString(),
              criticality: decision.Renewal.subscription.criticality,
              autoRenew: decision.Renewal.subscription.autoRenew,
              status: decision.Renewal.subscription.status,
            },
          },
        };
      });

      return NextResponse.json({ success: true, data });
    }

    if (!renewalId) {
      return NextResponse.json(
        { success: false, error: "Renewal ID is required, or use ?all=true." },
        { status: 400 }
      );
    }

    const decision = await prisma.decision.findFirst({
      where: {
        renewalId,
        organizationId: organization.id,
      },
      include: {
        DecisionScenario: true,
        Renewal: { include: { subscription: true } },
      },
    });

    if (!decision) {
      return NextResponse.json({ success: true, data: null }, { status: 200 });
    }

    const selectedScenario =
      decision.DecisionScenario.find(
        (scenario) => scenario.action === decision.selectedAction
      ) ??
      decision.DecisionScenario[0] ??
      null;

    return NextResponse.json({
      success: true,
      data: {
        id: decision.id,
        renewalId: decision.renewalId,
        recommendedAction: decision.recommendedAction,
        selectedAction: decision.selectedAction,
        currentAnnualCost: decision.currentAnnualCost.toString(),
        expectedAnnualCost: decision.expectedAnnualCost?.toString() ?? null,
        estimatedSaving: decision.estimatedSaving?.toString() ?? "0",
        status: decision.status,
        reasoning: decision.reasoning,
        recommendationScore: decision.recommendationScore?.toString() ?? null,
        finalizedAt: decision.finalizedAt,
        createdAt: decision.createdAt,
        updatedAt: decision.updatedAt,
        selectedScenario: selectedScenario
          ? {
              id: selectedScenario.id,
              action: selectedScenario.action,
              annualCost: selectedScenario.annualCost.toString(),
              estimatedSaving: selectedScenario.estimatedSaving.toString(),
              licenseCount: selectedScenario.licenseCount,
              plan: selectedScenario.plan,
              notes: selectedScenario.notes,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("GET /api/decisions ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch decision.",
      },
      { status: 500 }
    );
  }
}

// ==================================================
// POST — Create Decision
// ==================================================
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "No organization selected" },
        { status: 400 }
      );
    }

    const { organization } = await ensureOrgAndUser(orgId, userId);

    const body = await request.json();
    const { renewalId, action, selectedScenario, estimatedSaving, notes } =
      body;

    if (!renewalId || !action) {
      return NextResponse.json(
        { success: false, error: "Renewal ID and decision action are required." },
        { status: 400 }
      );
    }

    const validActions = [
      "RENEW",
      "REDUCE",
      "DOWNGRADE",
      "NEGOTIATE",
      "CANCEL",
      "REPLACE",
    ] as const;

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid decision action." },
        { status: 400 }
      );
    }

    const renewal = await prisma.renewal.findFirst({
      where: {
        id: renewalId,
        organizationId: organization.id,
      },
      include: { subscription: true },
    });

    if (!renewal) {
      return NextResponse.json(
        { success: false, error: "Renewal not found." },
        { status: 404 }
      );
    }

    const existingDecision = await prisma.decision.findUnique({
      where: { renewalId },
    });

    if (existingDecision) {
      return NextResponse.json(
        { success: false, error: "A decision already exists for this renewal." },
        { status: 409 }
      );
    }

    const currentAnnualCost = Number(renewal.currentCost);
    const saving =
      estimatedSaving !== undefined && estimatedSaving !== null
        ? Number(estimatedSaving)
        : 0;

    if (
      !Number.isFinite(currentAnnualCost) ||
      !Number.isFinite(saving) ||
      saving < 0
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid financial values." },
        { status: 400 }
      );
    }

    const expectedAnnualCost = Math.max(currentAnnualCost - saving, 0);

    const decision = await prisma.decision.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: organization.id,
        renewalId: renewal.id,
        recommendedAction: action,
        selectedAction: action,
        recommendationScore: null,
        reasoning:
          notes ??
          `Decision created for ${renewal.subscription.vendor} ${renewal.subscription.productName}.`,
        currentAnnualCost,
        expectedAnnualCost,
        estimatedSaving: saving,
        status: "DRAFT",
        finalizedAt: null,
        finalizedById: null,
        updatedAt: new Date(),
      },
    });

    if (selectedScenario) {
      const scenarioAnnualCost = Math.max(currentAnnualCost - saving, 0);

      await prisma.decisionScenario.create({
        data: {
          id: crypto.randomUUID(),
          decisionId: decision.id,
          action,
          licenseCount: renewal.subscription.licenseCount,
          plan: renewal.subscription.plan ?? null,
          discountPercent: null,
          annualCost: scenarioAnnualCost,
          estimatedSaving: saving,
          businessRisk: null,
          notes: `Selected scenario: ${selectedScenario}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: decision.id,
          renewalId: decision.renewalId,
          recommendedAction: decision.recommendedAction,
          selectedAction: decision.selectedAction,
          currentAnnualCost: decision.currentAnnualCost.toString(),
          expectedAnnualCost: decision.expectedAnnualCost?.toString() ?? null,
          estimatedSaving: decision.estimatedSaving?.toString() ?? "0",
          status: decision.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/decisions ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to save decision.",
        debug:
          process.env.NODE_ENV !== "production" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// ==================================================
// PATCH — Send Decision for Approval
// ==================================================
export async function PATCH(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "No organization selected" },
        { status: 400 }
      );
    }

    const { organization, user } = await ensureOrgAndUser(orgId, userId);

    let body: { decisionId?: string; status?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    const { decisionId, status } = body;

    if (!decisionId || typeof decisionId !== "string") {
      return NextResponse.json(
        { success: false, error: "Decision ID is required." },
        { status: 400 }
      );
    }

    if (status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only PENDING_APPROVAL status is allowed through this action.",
        },
        { status: 400 }
      );
    }

    const decision = await prisma.decision.findFirst({
      where: {
        id: decisionId,
        organizationId: organization.id,
      },
    });

    if (!decision) {
      return NextResponse.json(
        {
          success: false,
          error: "Decision not found in the current organization.",
        },
        { status: 404 }
      );
    }

    const existingApproval = await prisma.approval.findFirst({
      where: {
        decisionId: decision.id,
        organizationId: organization.id,
      },
    });

    if (decision.status === "PENDING_APPROVAL") {
      return NextResponse.json({
        success: true,
        message: "Decision is already pending approval.",
        data: {
          id: decision.id,
          status: decision.status,
          approvalId: existingApproval?.id ?? null,
          updatedAt: decision.updatedAt,
        },
      });
    }

    if (decision.status !== "DRAFT") {
      return NextResponse.json(
        {
          success: false,
          error: `Decision cannot be sent for approval because its current status is ${decision.status}. Only DRAFT decisions can be submitted.`,
        },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.decision.updateMany({
        where: {
          id: decision.id,
          organizationId: organization.id,
          status: "DRAFT",
        },
        data: {
          status: "PENDING_APPROVAL",
          updatedAt: new Date(),
        },
      });

      if (updateResult.count !== 1) {
        throw new Error(
          "Decision could not be updated. It may have already been changed."
        );
      }

      const approval = await tx.approval.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: organization.id,
          decisionId: decision.id,
          approverId: user.id,
          comment: null,
          approvedAt: null,
          updatedAt: new Date(),
        },
      });

      const updatedDecision = await tx.decision.findFirst({
        where: {
          id: decision.id,
          organizationId: organization.id,
        },
      });

      if (!updatedDecision) {
        throw new Error(
          "Decision was updated but could not be fetched afterward."
        );
      }

      return { approval, updatedDecision };
    });

    return NextResponse.json({
      success: true,
      message: "Decision sent for approval successfully.",
      data: {
        id: result.updatedDecision.id,
        renewalId: result.updatedDecision.renewalId,
        status: result.updatedDecision.status,
        approvalId: result.approval.id,
        approvalStatus: result.approval.status,
        updatedAt: result.updatedDecision.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/decisions ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update decision.",
        debug:
          process.env.NODE_ENV !== "production" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}