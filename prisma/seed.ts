import "dotenv/config";

import {
  PrismaClient,
  Role,
  SubscriptionStatus,
  BillingCycle,
  Criticality,
  RenewalStatus,
  OpportunityType,
  OpportunityStatus,
  DecisionAction,
  DecisionStatus,
  ApprovalStatus,
  SavingsStage,
  NotificationType,
} from "@prisma/client";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const id = () => crypto.randomUUID();

async function main() {
  console.log("🌱 Starting SpendShield demo seed...");

  /*
   * ------------------------------------------------------------
   * 1. DEMO ORGANIZATION
   * ------------------------------------------------------------
   */

  const org = await prisma.organization.upsert({
    where: {
      slug: "acme-technologies",
    },
    update: {
      name: "Acme Technologies",
      industry: "Software & Technology",
      employeeCount: 250,
      currency: "USD",
      timezone: "UTC",
    },
    create: {
      name: "Acme Technologies",
      slug: "acme-technologies",
      industry: "Software & Technology",
      employeeCount: 250,
      currency: "USD",
      timezone: "UTC",
    },
  });

  console.log(`🏢 Organization: ${org.name}`);

  /*
   * ------------------------------------------------------------
   * 2. DEMO USERS
   * ------------------------------------------------------------
   */

  const adminUser = await prisma.user.upsert({
    where: {
      email: "demo.admin@acmetech.example",
    },
    update: {
      name: "Amna Iqbal",
    },
    create: {
      name: "Amna Iqbal",
      email: "demo.admin@acmetech.example",
    },
  });

  const financeUser = await prisma.user.upsert({
    where: {
      email: "demo.finance@acmetech.example",
    },
    update: {
      name: "Sarah Khan",
    },
    create: {
      name: "Sarah Khan",
      email: "demo.finance@acmetech.example",
    },
  });

  const procurementUser = await prisma.user.upsert({
    where: {
      email: "demo.procurement@acmetech.example",
    },
    update: {
      name: "Ahmed Raza",
    },
    create: {
      name: "Ahmed Raza",
      email: "demo.procurement@acmetech.example",
    },
  });

  /*
   * ------------------------------------------------------------
   * 3. MEMBERSHIPS / RBAC
   * ------------------------------------------------------------
   */

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: adminUser.id,
        organizationId: org.id,
      },
    },
    update: {
      role: Role.ADMIN,
    },
    create: {
      id: id(),
      userId: adminUser.id,
      organizationId: org.id,
      role: Role.ADMIN,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: financeUser.id,
        organizationId: org.id,
      },
    },
    update: {
      role: Role.FINANCE,
    },
    create: {
      id: id(),
      userId: financeUser.id,
      organizationId: org.id,
      role: Role.FINANCE,
    },
  });

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: procurementUser.id,
        organizationId: org.id,
      },
    },
    update: {
      role: Role.PROCUREMENT,
    },
    create: {
      id: id(),
      userId: procurementUser.id,
      organizationId: org.id,
      role: Role.PROCUREMENT,
    },
  });

  /*
   * ------------------------------------------------------------
   * 4. CLEAN ONLY THIS DEMO ORGANIZATION'S BUSINESS DATA
   * ------------------------------------------------------------
   */

  await prisma.auditLog.deleteMany({
    where: {
      organizationId: org.id,
    },
  });

  await prisma.notification.deleteMany({
    where: {
      organizationId: org.id,
    },
  });

  await prisma.savingsRecord.deleteMany({
    where: {
      organizationId: org.id,
    },
  });

  await prisma.approval.deleteMany({
    where: {
      organizationId: org.id,
    },
  });

  await prisma.decisionScenario.deleteMany({
    where: {
      Decision: {
        organizationId: org.id,
      },
    },
  });

  await prisma.decision.deleteMany({
    where: {
      organizationId: org.id,
    },
  });

  await prisma.savingsOpportunity.deleteMany({
    where: {
      organizationId: org.id,
    },
  });

  await prisma.renewal.deleteMany({
    where: {
      organizationId: org.id,
    },
  });

  await prisma.subscription.deleteMany({
    where: {
      organizationId: org.id,
    },
  });

  await prisma.department.deleteMany({
    where: {
      organizationId: org.id,
    },
  });

  console.log("🧹 Previous demo business data cleared.");

  /*
   * ------------------------------------------------------------
   * 5. DEPARTMENTS
   * ------------------------------------------------------------
   */

  const engineering = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: "Engineering",
      description:
        "Software engineering, infrastructure, development tools, and technical operations.",
      managerId: adminUser.id,
    },
  });

  const marketing = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: "Marketing",
      description:
        "Marketing campaigns, creative production, growth, and customer acquisition.",
      managerId: financeUser.id,
    },
  });

  const sales = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: "Sales",
      description:
        "Sales operations, CRM, customer communication, and revenue operations.",
      managerId: financeUser.id,
    },
  });

  const operations = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: "Operations",
      description:
        "Business operations, finance, procurement, and internal productivity.",
      managerId: procurementUser.id,
    },
  });

  /*
   * ------------------------------------------------------------
   * 6. SUBSCRIPTIONS
   * ------------------------------------------------------------
   */

  const subscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        organizationId: org.id,
        departmentId: engineering.id,
        ownerId: adminUser.id,
        vendor: "Amazon Web Services",
        productName: "AWS Cloud Infrastructure",
        category: "Cloud Infrastructure",
        plan: "Enterprise",
        billingCycle: BillingCycle.YEARLY,
        licenseCount: 50,
        activeUsers: 45,
        monthlyCost: 12500,
        annualCost: 150000,
        previousAnnualCost: 120000,
        renewalDate: new Date("2026-10-15"),
        noticeDeadline: new Date("2026-09-15"),
        noticePeriodDays: 30,
        vendorContactEmail: "account@aws.example",
        vendorContactName: "AWS Account Team",
        autoRenew: true,
        criticality: Criticality.HIGH,
        status: SubscriptionStatus.ACTIVE,
      },
    }),

    prisma.subscription.create({
      data: {
        organizationId: org.id,
        departmentId: engineering.id,
        ownerId: adminUser.id,
        vendor: "GitHub",
        productName: "GitHub Enterprise",
        category: "Developer Tools",
        plan: "Enterprise Cloud",
        billingCycle: BillingCycle.YEARLY,
        licenseCount: 80,
        activeUsers: 62,
        monthlyCost: 1800,
        annualCost: 21600,
        previousAnnualCost: 18000,
        renewalDate: new Date("2026-11-01"),
        noticeDeadline: new Date("2026-10-01"),
        noticePeriodDays: 30,
        vendorContactEmail: "enterprise@github.example",
        autoRenew: false,
        criticality: Criticality.HIGH,
        status: SubscriptionStatus.ACTIVE,
      },
    }),

    prisma.subscription.create({
      data: {
        organizationId: org.id,
        departmentId: marketing.id,
        ownerId: financeUser.id,
        vendor: "Adobe",
        productName: "Adobe Creative Cloud",
        category: "Design & Creative",
        plan: "Teams",
        billingCycle: BillingCycle.YEARLY,
        licenseCount: 40,
        activeUsers: 29,
        monthlyCost: 2000,
        annualCost: 24000,
        previousAnnualCost: 22000,
        renewalDate: new Date("2026-10-18"),
        noticeDeadline: new Date("2026-09-18"),
        noticePeriodDays: 30,
        vendorContactEmail: "teams@adobe.example",
        autoRenew: true,
        criticality: Criticality.MEDIUM,
        status: SubscriptionStatus.ACTIVE,
      },
    }),

    prisma.subscription.create({
      data: {
        organizationId: org.id,
        departmentId: sales.id,
        ownerId: financeUser.id,
        vendor: "HubSpot",
        productName: "HubSpot CRM",
        category: "CRM",
        plan: "Professional",
        billingCycle: BillingCycle.YEARLY,
        licenseCount: 35,
        activeUsers: 26,
        monthlyCost: 1541.67,
        annualCost: 18500,
        previousAnnualCost: 16500,
        renewalDate: new Date("2026-09-29"),
        noticeDeadline: new Date("2026-09-14"),
        noticePeriodDays: 15,
        vendorContactEmail: "sales@hubspot.example",
        autoRenew: true,
        criticality: Criticality.HIGH,
        status: SubscriptionStatus.ACTIVE,
      },
    }),

    prisma.subscription.create({
      data: {
        organizationId: org.id,
        departmentId: operations.id,
        ownerId: procurementUser.id,
        vendor: "Zoom",
        productName: "Zoom Workplace",
        category: "Communication",
        plan: "Business",
        billingCycle: BillingCycle.YEARLY,
        licenseCount: 60,
        activeUsers: 42,
        monthlyCost: 1000,
        annualCost: 12000,
        previousAnnualCost: 10800,
        renewalDate: new Date("2026-09-30"),
        noticeDeadline: new Date("2026-09-15"),
        noticePeriodDays: 15,
        vendorContactEmail: "business@zoom.example",
        autoRenew: true,
        criticality: Criticality.MEDIUM,
        status: SubscriptionStatus.ACTIVE,
      },
    }),

    prisma.subscription.create({
      data: {
        organizationId: org.id,
        departmentId: marketing.id,
        ownerId: financeUser.id,
        vendor: "Figma",
        productName: "Figma Professional",
        category: "Design & Collaboration",
        plan: "Professional",
        billingCycle: BillingCycle.YEARLY,
        licenseCount: 30,
        activeUsers: 19,
        monthlyCost: 450,
        annualCost: 5400,
        previousAnnualCost: 4800,
        renewalDate: new Date("2026-12-12"),
        noticeDeadline: new Date("2026-11-12"),
        noticePeriodDays: 30,
        vendorContactEmail: "teams@figma.example",
        autoRenew: false,
        criticality: Criticality.MEDIUM,
        status: SubscriptionStatus.ACTIVE,
      },
    }),

    prisma.subscription.create({
      data: {
        organizationId: org.id,
        departmentId: operations.id,
        ownerId: procurementUser.id,
        vendor: "Slack",
        productName: "Slack Business+",
        category: "Communication",
        plan: "Business+",
        billingCycle: BillingCycle.YEARLY,
        licenseCount: 250,
        activeUsers: 211,
        monthlyCost: 1800,
        annualCost: 21600,
        previousAnnualCost: 20400,
        renewalDate: new Date("2027-01-20"),
        noticeDeadline: new Date("2026-12-20"),
        noticePeriodDays: 30,
        vendorContactEmail: "sales@slack.example",
        autoRenew: true,
        criticality: Criticality.HIGH,
        status: SubscriptionStatus.ACTIVE,
      },
    }),

    prisma.subscription.create({
      data: {
        organizationId: org.id,
        departmentId: operations.id,
        ownerId: procurementUser.id,
        vendor: "Notion",
        productName: "Notion Team",
        category: "Productivity",
        plan: "Team",
        billingCycle: BillingCycle.YEARLY,
        licenseCount: 100,
        activeUsers: 54,
        monthlyCost: 833.33,
        annualCost: 10000,
        previousAnnualCost: 9000,
        renewalDate: new Date("2026-10-25"),
        noticeDeadline: new Date("2026-09-25"),
        noticePeriodDays: 30,
        vendorContactEmail: "sales@notion.example",
        autoRenew: false,
        criticality: Criticality.LOW,
        status: SubscriptionStatus.ACTIVE,
      },
    }),
  ]);

  console.log(`💳 Created ${subscriptions.length} subscriptions.`);

  /*
   * ------------------------------------------------------------
   * 7. RENEWALS
   * ------------------------------------------------------------
   */

  const renewalData = [
    {
      subscription: subscriptions[0],
      previousCost: 120000,
      currentCost: 150000,
      increase: 25,
      readiness: 68,
      status: RenewalStatus.IN_REVIEW,
    },
    {
      subscription: subscriptions[1],
      previousCost: 18000,
      currentCost: 21600,
      increase: 20,
      readiness: 82,
      status: RenewalStatus.UPCOMING,
    },
    {
      subscription: subscriptions[2],
      previousCost: 22000,
      currentCost: 24000,
      increase: 9.09,
      readiness: 76,
      status: RenewalStatus.IN_REVIEW,
    },
    {
      subscription: subscriptions[3],
      previousCost: 16500,
      currentCost: 18500,
      increase: 12.12,
      readiness: 54,
      status: RenewalStatus.DECISION_PENDING,
    },
    {
      subscription: subscriptions[4],
      previousCost: 10800,
      currentCost: 12000,
      increase: 11.11,
      readiness: 61,
      status: RenewalStatus.APPROVAL_PENDING,
    },
    {
      subscription: subscriptions[5],
      previousCost: 4800,
      currentCost: 5400,
      increase: 12.5,
      readiness: 88,
      status: RenewalStatus.UPCOMING,
    },
    {
      subscription: subscriptions[6],
      previousCost: 20400,
      currentCost: 21600,
      increase: 5.88,
      readiness: 91,
      status: RenewalStatus.UPCOMING,
    },
    {
      subscription: subscriptions[7],
      previousCost: 9000,
      currentCost: 10000,
      increase: 11.11,
      readiness: 72,
      status: RenewalStatus.IN_REVIEW,
    },
  ];

  const renewals = [];

  for (const item of renewalData) {
    const renewal = await prisma.renewal.create({
      data: {
        organizationId: org.id,
        subscriptionId: item.subscription.id,
        renewalDate: item.subscription.renewalDate,
        noticeDeadline: item.subscription.noticeDeadline,
        previousCost: item.previousCost,
        currentCost: item.currentCost,
        priceIncreasePercent: item.increase,
        readinessScore: item.readiness,
        status: item.status,
      },
    });

    renewals.push(renewal);
  }

  console.log(`🔄 Created ${renewals.length} renewals.`);

  /*
   * ------------------------------------------------------------
   * 8. SAVINGS OPPORTUNITIES
   * ------------------------------------------------------------
   */

  const opportunities = [
    {
      renewal: renewals[0],
      type: OpportunityType.UNUSED_LICENSES,
      title: "Optimize 5 idle AWS resources",
      description:
        "Usage analysis indicates that approximately five reserved resources have remained underutilized and may be downsized.",
      estimatedSaving: 12500,
      confidence: 85,
      action: DecisionAction.REDUCE,
      status: OpportunityStatus.OPEN,
    },
    {
      renewal: renewals[0],
      type: OpportunityType.NEGOTIATION,
      title: "Negotiate AWS renewal pricing",
      description:
        "The renewal introduces a significant year-over-year cost increase. Procurement should request improved commercial terms.",
      estimatedSaving: 7500,
      confidence: 72,
      action: DecisionAction.NEGOTIATE,
      status: OpportunityStatus.VALIDATED,
    },
    {
      renewal: renewals[1],
      type: OpportunityType.UNUSED_LICENSES,
      title: "Reduce inactive GitHub seats",
      description:
        "18 seats show no meaningful activity and can be reviewed before renewal.",
      estimatedSaving: 4860,
      confidence: 91,
      action: DecisionAction.REDUCE,
      status: OpportunityStatus.OPEN,
    },
    {
      renewal: renewals[2],
      type: OpportunityType.UNUSED_LICENSES,
      title: "Remove inactive Adobe seats",
      description:
        "11 of 40 assigned licenses show low utilization and should be reviewed before renewal.",
      estimatedSaving: 6600,
      confidence: 89,
      action: DecisionAction.REDUCE,
      status: OpportunityStatus.OPEN,
    },
    {
      renewal: renewals[3],
      type: OpportunityType.NEGOTIATION,
      title: "Negotiate HubSpot price increase",
      description:
        "Current renewal pricing is 12.12% higher than the previous annual cost.",
      estimatedSaving: 4200,
      confidence: 78,
      action: DecisionAction.NEGOTIATE,
      status: OpportunityStatus.CONVERTED,
    },
    {
      renewal: renewals[4],
      type: OpportunityType.UNUSED_LICENSES,
      title: "Reduce unused Zoom licenses",
      description:
        "18 licenses appear inactive and can be removed from the renewal quantity.",
      estimatedSaving: 3600,
      confidence: 94,
      action: DecisionAction.REDUCE,
      status: OpportunityStatus.CONVERTED,
    },
    {
      renewal: renewals[5],
      type: OpportunityType.UNDERUTILIZATION,
      title: "Review Figma license utilization",
      description:
        "11 seats show limited usage and may not require the current plan.",
      estimatedSaving: 1320,
      confidence: 82,
      action: DecisionAction.DOWNGRADE,
      status: OpportunityStatus.OPEN,
    },
    {
      renewal: renewals[7],
      type: OpportunityType.DUPLICATE_TOOL,
      title: "Review overlapping productivity tools",
      description:
        "Notion usage overlaps with other collaboration workflows. Consolidation should be evaluated.",
      estimatedSaving: 2400,
      confidence: 67,
      action: DecisionAction.CANCEL,
      status: OpportunityStatus.OPEN,
    },
  ];

  const createdOpportunities = [];

  for (const opportunity of opportunities) {
    const record = await prisma.savingsOpportunity.create({
      data: {
        organizationId: org.id,
        renewalId: opportunity.renewal.id,
        type: opportunity.type,
        title: opportunity.title,
        description: opportunity.description,
        estimatedSaving: opportunity.estimatedSaving,
        confidence: opportunity.confidence,
        recommendedAction: opportunity.action,
        status: opportunity.status,
        updatedAt: new Date(),
      },
    });

    createdOpportunities.push(record);
  }

  console.log(
    `💰 Created ${createdOpportunities.length} savings opportunities.`
  );

  /*
   * ------------------------------------------------------------
   * 9. DECISIONS
   * ------------------------------------------------------------
   */

  const decisionAws = await prisma.decision.create({
    data: {
      id: id(),
      organizationId: org.id,
      renewalId: renewals[0].id,
      recommendedAction: DecisionAction.NEGOTIATE,
      selectedAction: DecisionAction.NEGOTIATE,
      recommendationScore: 91,
      reasoning:
        "The renewal has a significant price increase and high annual spend. Negotiation offers meaningful savings while preserving critical infrastructure.",
      currentAnnualCost: 150000,
      expectedAnnualCost: 142500,
      estimatedSaving: 7500,
      status: DecisionStatus.APPROVED,
      finalizedAt: new Date("2026-08-28"),
      finalizedById: financeUser.id,
      updatedAt: new Date(),
    },
  });

  const decisionHubSpot = await prisma.decision.create({
    data: {
      id: id(),
      organizationId: org.id,
      renewalId: renewals[3].id,
      recommendedAction: DecisionAction.NEGOTIATE,
      selectedAction: DecisionAction.NEGOTIATE,
      recommendationScore: 87,
      reasoning:
        "HubSpot remains important to the sales workflow, but the renewal increase is high enough to justify commercial negotiation before renewal.",
      currentAnnualCost: 18500,
      expectedAnnualCost: 14300,
      estimatedSaving: 4200,
      status: DecisionStatus.PENDING_APPROVAL,
      updatedAt: new Date(),
    },
  });

  const decisionZoom = await prisma.decision.create({
    data: {
      id: id(),
      organizationId: org.id,
      renewalId: renewals[4].id,
      recommendedAction: DecisionAction.REDUCE,
      selectedAction: DecisionAction.REDUCE,
      recommendationScore: 94,
      reasoning:
        "Usage data indicates that 18 Zoom licenses are inactive. Reducing the renewal quantity preserves the service while removing unnecessary spend.",
      currentAnnualCost: 12000,
      expectedAnnualCost: 8400,
      estimatedSaving: 3600,
      status: DecisionStatus.APPROVED,
      finalizedAt: new Date("2026-08-30"),
      finalizedById: financeUser.id,
      updatedAt: new Date(),
    },
  });

  const decisionAdobe = await prisma.decision.create({
    data: {
      id: id(),
      organizationId: org.id,
      renewalId: renewals[2].id,
      recommendedAction: DecisionAction.REDUCE,
      currentAnnualCost: 24000,
      expectedAnnualCost: 17400,
      estimatedSaving: 6600,
      status: DecisionStatus.DRAFT,
      updatedAt: new Date(),
    },
  });

  const decisionFigma = await prisma.decision.create({
    data: {
      id: id(),
      organizationId: org.id,
      renewalId: renewals[5].id,
      recommendedAction: DecisionAction.DOWNGRADE,
      currentAnnualCost: 5400,
      expectedAnnualCost: 4080,
      estimatedSaving: 1320,
      status: DecisionStatus.DRAFT,
      updatedAt: new Date(),
    },
  });

  console.log("🧠 Created renewal decisions.");

  /*
   * ------------------------------------------------------------
   * 10. DECISION SCENARIOS
   * ------------------------------------------------------------
   */

  await prisma.decisionScenario.createMany({
    data: [
      {
        id: id(),
        decisionId: decisionAws.id,
        action: DecisionAction.RENEW,
        licenseCount: 50,
        plan: "Enterprise",
        discountPercent: 0,
        annualCost: 150000,
        estimatedSaving: 0,
        businessRisk: "Low operational risk, highest cost.",
        notes: "Baseline renewal scenario.",
      },
      {
        id: id(),
        decisionId: decisionAws.id,
        action: DecisionAction.NEGOTIATE,
        licenseCount: 50,
        plan: "Enterprise",
        discountPercent: 5,
        annualCost: 142500,
        estimatedSaving: 7500,
        businessRisk: "Low",
        notes: "Recommended scenario based on renewal increase.",
      },
      {
        id: id(),
        decisionId: decisionAws.id,
        action: DecisionAction.REDUCE,
        licenseCount: 45,
        plan: "Enterprise",
        discountPercent: 0,
        annualCost: 135000,
        estimatedSaving: 15000,
        businessRisk: "Medium",
        notes: "Requires infrastructure usage validation.",
      },

      {
        id: id(),
        decisionId: decisionHubSpot.id,
        action: DecisionAction.RENEW,
        licenseCount: 35,
        plan: "Professional",
        discountPercent: 0,
        annualCost: 18500,
        estimatedSaving: 0,
        businessRisk: "Low",
        notes: "Renew at current quoted price.",
      },
      {
        id: id(),
        decisionId: decisionHubSpot.id,
        action: DecisionAction.NEGOTIATE,
        licenseCount: 35,
        plan: "Professional",
        discountPercent: 22.7,
        annualCost: 14300,
        estimatedSaving: 4200,
        businessRisk: "Low",
        notes: "Preferred commercial negotiation scenario.",
      },

      {
        id: id(),
        decisionId: decisionZoom.id,
        action: DecisionAction.RENEW,
        licenseCount: 60,
        plan: "Business",
        annualCost: 12000,
        estimatedSaving: 0,
        businessRisk: "Low",
        notes: "Baseline renewal.",
      },
      {
        id: id(),
        decisionId: decisionZoom.id,
        action: DecisionAction.REDUCE,
        licenseCount: 42,
        plan: "Business",
        annualCost: 8400,
        estimatedSaving: 3600,
        businessRisk: "Low",
        notes: "Remove inactive licenses.",
      },
    ],
  });

  console.log("📊 Created decision scenarios.");

  /*
   * ------------------------------------------------------------
   * 11. APPROVALS
   * ------------------------------------------------------------
   */

  await prisma.approval.create({
    data: {
      id: id(),
      organizationId: org.id,
      decisionId: decisionHubSpot.id,
      approverId: financeUser.id,
      status: ApprovalStatus.PENDING,
      comment: null,
      updatedAt: new Date(),
    },
  });

  await prisma.approval.create({
    data: {
      id: id(),
      organizationId: org.id,
      decisionId: decisionZoom.id,
      approverId: financeUser.id,
      status: ApprovalStatus.APPROVED,
      comment: "Approved after reviewing license utilization.",
      approvedAt: new Date("2026-08-30"),
      updatedAt: new Date(),
    },
  });

  console.log("📋 Created approvals.");

  /*
   * ------------------------------------------------------------
   * 12. SAVINGS RECORDS
   * ------------------------------------------------------------
   */

  await prisma.savingsRecord.createMany({
    data: [
      {
        id: id(),
        organizationId: org.id,
        decisionId: decisionAws.id,
        renewalId: renewals[0].id,
        baselineCost: 150000,
        finalCost: null,
        potentialSaving: 7500,
        realizedSaving: null,
        savingType: "Negotiated Renewal",
        stage: SavingsStage.VALIDATED,
        evidenceNote:
          "Vendor negotiation opportunity validated by finance and procurement.",
        updatedAt: new Date(),
      },
      {
        id: id(),
        organizationId: org.id,
        decisionId: decisionHubSpot.id,
        renewalId: renewals[3].id,
        baselineCost: 18500,
        finalCost: null,
        potentialSaving: 4200,
        realizedSaving: null,
        savingType: "Price Negotiation",
        stage: SavingsStage.APPROVED,
        evidenceNote:
          "Negotiation scenario approved and awaiting vendor execution.",
        updatedAt: new Date(),
      },
      {
        id: id(),
        organizationId: org.id,
        decisionId: decisionZoom.id,
        renewalId: renewals[4].id,
        baselineCost: 12000,
        finalCost: 8400,
        potentialSaving: 3600,
        realizedSaving: 3600,
        savingType: "License Reduction",
        stage: SavingsStage.REALIZED,
        evidenceNote:
          "18 unused licenses removed from renewal and final cost verified.",
        verifiedById: financeUser.id,
        verifiedAt: new Date("2026-09-02"),
        updatedAt: new Date(),
      },
      {
        id: id(),
        organizationId: org.id,
        decisionId: decisionAdobe.id,
        renewalId: renewals[2].id,
        baselineCost: 24000,
        finalCost: null,
        potentialSaving: 6600,
        realizedSaving: null,
        savingType: "Unused Licenses",
        stage: SavingsStage.POTENTIAL,
        evidenceNote:
          "11 low-utilization seats identified for review.",
        updatedAt: new Date(),
      },
      {
        id: id(),
        organizationId: org.id,
        decisionId: decisionFigma.id,
        renewalId: renewals[5].id,
        baselineCost: 5400,
        finalCost: null,
        potentialSaving: 1320,
        realizedSaving: null,
        savingType: "Plan Optimization",
        stage: SavingsStage.POTENTIAL,
        evidenceNote:
          "Current plan may exceed actual team usage requirements.",
        updatedAt: new Date(),
      },
    ],
  });

  console.log("📒 Created savings ledger records.");

  /*
   * ------------------------------------------------------------
   * 13. NOTIFICATIONS
   * ------------------------------------------------------------
   */

  await prisma.notification.createMany({
    data: [
      {
        id: id(),
        organizationId: org.id,
        userId: financeUser.id,
        type: NotificationType.APPROVAL_REQUIRED,
        title: "Approval required",
        message:
          "HubSpot renewal negotiation is waiting for finance approval.",
        relatedRenewalId: renewals[3].id,
        read: false,
      },
      {
        id: id(),
        organizationId: org.id,
        userId: procurementUser.id,
        type: NotificationType.DEADLINE_WARNING,
        title: "Renewal deadline approaching",
        message:
          "Zoom renewal notice deadline is approaching. Review the approved decision.",
        relatedRenewalId: renewals[4].id,
        read: false,
      },
      {
        id: id(),
        organizationId: org.id,
        userId: adminUser.id,
        type: NotificationType.RENEWAL_30_DAYS,
        title: "Renewal intelligence alert",
        message:
          "Multiple software renewals require review within the next 30 days.",
        relatedRenewalId: renewals[0].id,
        read: false,
      },
      {
        id: id(),
        organizationId: org.id,
        userId: financeUser.id,
        type: NotificationType.SAVINGS_VERIFICATION,
        title: "Savings verified",
        message:
          "Zoom license reduction produced $3,600 in verified savings.",
        relatedRenewalId: renewals[4].id,
        read: true,
      },
    ],
  });

  console.log("🔔 Created notifications.");

  /*
   * ------------------------------------------------------------
   * 14. AUDIT LOGS
   * ------------------------------------------------------------
   */

  await prisma.auditLog.createMany({
    data: [
      {
        id: id(),
        organizationId: org.id,
        userId: adminUser.id,
        action: "DEMO_DATA_CREATED",
        entityType: "Organization",
        entityId: org.id,
        reason: "SpendShield demo workspace initialized.",
      },
      {
        id: id(),
        organizationId: org.id,
        userId: financeUser.id,
        action: "DECISION_APPROVED",
        entityType: "Decision",
        entityId: decisionZoom.id,
        reason:
          "Zoom license reduction approved after utilization review.",
      },
      {
        id: id(),
        organizationId: org.id,
        userId: financeUser.id,
        action: "SAVINGS_VERIFIED",
        entityType: "SavingsRecord",
        entityId: decisionZoom.id,
        reason: "Final renewal cost verified against baseline.",
      },
    ],
  });

  console.log("📝 Created audit logs.");

  /*
   * ------------------------------------------------------------
   * 15. SUMMARY
   * ------------------------------------------------------------
   */

  console.log("");
  console.log("══════════════════════════════════════════");
  console.log("🎉 SpendShield demo seed completed!");
  console.log("══════════════════════════════════════════");
  console.log(`🏢 Organization: ${org.name}`);
  console.log(`👥 Users: 3`);
  console.log(`🏬 Departments: 4`);
  console.log(`💳 Subscriptions: ${subscriptions.length}`);
  console.log(`🔄 Renewals: ${renewals.length}`);
  console.log(`💰 Savings Opportunities: ${createdOpportunities.length}`);
  console.log(`🧠 Decisions: 5`);
  console.log(`📊 Decision Scenarios: 7`);
  console.log(`📋 Approvals: 2`);
  console.log(`📒 Savings Records: 5`);
  console.log(`🔔 Notifications: 4`);
  console.log(`📝 Audit Logs: 3`);
  console.log("══════════════════════════════════════════");
}

main()
  .catch((error) => {
    console.error("❌ Error during SpendShield seed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });