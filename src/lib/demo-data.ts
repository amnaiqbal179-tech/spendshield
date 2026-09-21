import { prisma } from "@/lib/prisma";

export async function getDemoData() {
  const organization = await prisma.organization.findUnique({
    where: {
      slug: "acme-technologies",
    },
  });

  if (!organization) {
    throw new Error("Demo organization not found");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      organizationId: organization.id,
      status: "ACTIVE",
    },
    include: {
      renewals: {
        include: {
          opportunities: true,
        },
      },
    },
    orderBy: {
      renewalDate: "asc",
    },
  });

  const savingsRecords = await prisma.savingsRecord.findMany({
    where: {
      organizationId: organization.id,
    },
  });

  const renewalSpend = subscriptions.reduce(
    (total, subscription) =>
      total + Number(subscription.annualCost),
    0
  );

  const potentialSavings = savingsRecords.reduce(
    (total, record) =>
      total + Number(record.potentialSaving),
    0
  );

  const verifiedSavings = savingsRecords.reduce(
    (total, record) =>
      total + Number(record.realizedSaving ?? 0),
    0
  );

  const highPriorityRenewals = subscriptions.filter(
    (subscription) =>
      subscription.criticality === "HIGH"
  ).length;

  const priorityRenewals = subscriptions
    .filter(
      (subscription) =>
        subscription.criticality === "HIGH" ||
        subscription.criticality === "MEDIUM"
    )
    .slice(0, 5)
    .map((subscription) => {
      const renewal = subscription.renewals[0];

      return {
        id: subscription.id,
        vendor: subscription.vendor,
        productName: subscription.productName,
        category: subscription.category,
        annualCost: Number(subscription.annualCost),
        renewalDate: subscription.renewalDate,
        criticality: subscription.criticality,
        potentialSaving: renewal
          ? Math.max(
              ...renewal.opportunities.map((opportunity) =>
                Number(opportunity.estimatedSaving)
              ),
              0
            )
          : 0,
      };
    });

  return {
    organization: {
      name: organization.name,
      currency: organization.currency,
    },

    metrics: {
      renewalSpend,
      potentialSavings,
      verifiedSavings,
      highPriorityRenewals,
    },

    priorityRenewals,
  };
}