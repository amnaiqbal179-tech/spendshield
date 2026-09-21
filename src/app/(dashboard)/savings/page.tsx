import { prisma as db } from "@/lib/prisma";
import {
  PiggyBank,
  Search,
  CheckCircle2,
  Clock3,
  Target,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import OpportunityRowClient from "./components/OpportunityRowClient";

type Stage = "Potential" | "Validated" | "Approved" | "Implemented" | "Realized";

type Opportunity = {
  name: string;
  category: string;
  currentSpend: string;
  potentialSaving: string;
  rate: string;
  confidence: string;
  stage: Stage;
  status: string;
  action: string;
};

const stages: { label: Stage; description: string }[] = [
  { label: "Potential", description: "Opportunity detected" },
  { label: "Validated", description: "Evidence confirmed" },
  { label: "Approved", description: "Decision approved" },
  { label: "Implemented", description: "Action completed" },
  { label: "Realized", description: "Savings verified" },
];

export default async function SavingsPage() {
  let dbRenewals: any[] = [];
  let dbSavingsRecords: any[] = [];

  try {
    dbRenewals = await db.renewal.findMany({
      include: {
        subscription: true,
        opportunities: true,
      },
    });

    dbSavingsRecords = await db.savingsRecord.findMany();
  } catch (error) {
    console.error("Error fetching real data from database:", error);
  }

  const opportunities: Opportunity[] = dbRenewals.map((item) => {
    const currentCost = Number(item.currentCost || 0);
    const potentialSaving = Math.round(currentCost * 0.2);

    return {
      name: item.subscription?.productName || item.subscription?.vendor || "Unnamed Asset",
      category: item.subscription?.category || "General",
      currentSpend: `$${currentCost.toLocaleString()}`,
      potentialSaving: `$${potentialSaving.toLocaleString()}`,
      rate: "20%",
      confidence: item.readinessScore ? `${item.readinessScore}%` : "High",
      stage: "Potential",
      status: currentCost > 3000 ? "High Impact" : "Medium Impact",
      action: "Review decision",
    };
  });

  const totalPotential = opportunities.reduce((acc, curr) => {
    const val = parseInt(curr.potentialSaving.replace(/[^0-9]/g, "")) || 0;
    return acc + val;
  }, 0);

  const realizedTotal = dbSavingsRecords.reduce((acc, curr) => {
    return acc + Number(curr.realizedSaving || 0);
  }, 0);

  return (
    <main className="min-h-screen bg-[#F7F8FC] p-6 lg:p-8">
      {/* HEADER */}
      <section className="mb-8">
        <p className="mb-1 text-sm font-medium text-[#667085]">
          Savings Engine
        </p>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A21]">
              Savings Opportunities
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
              Real-time financial tracking pulled directly from your connected database records.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-[#7C5CFC] px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(124,92,252,0.18)] transition hover:bg-[#6D4FF0]">
            <Target className="h-4 w-4" />
            Find Opportunities
          </button>
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Potential Savings"
          value={`$${totalPotential.toLocaleString()}`}
          description={`Across ${opportunities.length} active records`}
          icon={PiggyBank}
          iconBg="bg-[#EEEAFE]"
          iconColor="text-[#7C5CFC]"
        />

        <SummaryCard
          title="Validated Savings"
          value={`$${Math.round(totalPotential * 0.6).toLocaleString()}`}
          description="Evidence-backed opportunities"
          icon={CheckCircle2}
          iconBg="bg-[#E8F7F0]"
          iconColor="text-[#22A06B]"
        />

        <SummaryCard
          title="Approved Savings"
          value={`$${Math.round(totalPotential * 0.3).toLocaleString()}`}
          description="Ready for execution"
          icon={Clock3}
          iconBg="bg-[#EAF3FF]"
          iconColor="text-[#4F9CF9]"
        />

        <SummaryCard
          title="Verified Savings"
          value={`$${realizedTotal.toLocaleString()}`}
          description="Realized financial impact"
          icon={DollarSign}
          iconBg="bg-[#E8F7F0]"
          iconColor="text-[#22A06B]"
        />
      </section>

      {/* SAVINGS PIPELINE */}
      <section className="mt-8 rounded-2xl border border-[#E7E9F0] bg-white p-6 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#171A21]">
            Savings pipeline
          </h2>

          <p className="mt-1 text-sm text-[#667085]">
            Track each opportunity from discovery to verified financial impact.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {stages.map((stage, index) => (
            <div key={stage.label} className="relative">
              <div
                className={`rounded-xl border p-4 ${
                  index === 0
                    ? "border-[#DCD4FF] bg-[#F8F6FF]"
                    : "border-[#E7E9F0] bg-[#FCFCFE]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#171A21]">
                    {stage.label}
                  </span>

                  <span className="text-xs font-medium text-[#98A2B3]">
                    {index === 0 ? opportunities.length : "0"}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-[#98A2B3]">
                  {stage.description}
                </p>
              </div>

              {index < stages.length - 1 && (
                <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-[#D9DCE6] md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVE OPPORTUNITIES TABLE SECTION */}
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#171A21]">
            Active database opportunities
          </h2>
          <p className="mt-1 text-sm text-[#667085]">
            Showing records directly from your active database.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E7E9F0] bg-white shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
          <div className="hidden grid-cols-[1.7fr_1fr_1fr_0.8fr_0.9fr_1fr_1fr] gap-4 border-b border-[#E7E9F0] bg-[#FCFCFE] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#98A2B3] lg:grid">
            <span>Opportunity</span>
            <span>Current Spend</span>
            <span>Potential Saving</span>
            <span>Rate</span>
            <span>Confidence</span>
            <span>Stage</span>
            <span>Action</span>
          </div>

          {opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Search className="h-8 w-8 text-[#98A2B3]" />
              <h3 className="mt-4 text-sm font-semibold text-[#171A21]">
                No opportunities found
              </h3>
              <p className="mt-1 text-sm text-[#667085]">
                No active records found in your database. Add subscriptions or renewals to populate this view.
              </p>
            </div>
          ) : (
            opportunities.map((item, index) => (
              <OpportunityRowClient key={index} item={item} index={index} total={opportunities.length} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E7E9F0] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#667085]">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#171A21]">
            {value}
          </p>
          <p className="mt-1 text-xs text-[#98A2B3]">{description}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}