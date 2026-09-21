"use client";

import {
  ArrowUpRight,
  ChevronRight,
  CircleDollarSign,
  Sparkles,
  TrendingDown,
} from "lucide-react";

const opportunities = [
  {
    vendor: "Adobe Creative Cloud",
    category: "Unused licenses",
    currentSpend: "$6,800",
    potentialSaving: "$1,200",
    savingRate: "17.6%",
    action: "Reduce seats",
    priority: "High",
  },
  {
    vendor: "HubSpot",
    category: "Plan optimization",
    currentSpend: "$4,200",
    potentialSaving: "$840",
    savingRate: "20%",
    action: "Review plan",
    priority: "Medium",
  },
  {
    vendor: "Zoom",
    category: "Seat optimization",
    currentSpend: "$2,100",
    potentialSaving: "$420",
    savingRate: "20%",
    action: "Remove inactive seats",
    priority: "Medium",
  },
];

function getPriorityStyles(priority: string) {
  if (priority === "High") {
    return "bg-[#FDECEE] text-[#E35D6A]";
  }

  return "bg-[#FFF6DD] text-[#D99A16]";
}

export default function SavingsOpportunities() {
  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEEAFE]">
              <Sparkles size={16} className="text-[#7C5CFC]" />
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#98A2B3]">
              Savings Engine
            </p>
          </div>

          <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#171A21]">
            Savings opportunities
          </h2>

          <p className="mt-1 text-sm text-[#667085]">
            Opportunities identified from your current software spend.
          </p>
        </div>

        <button className="hidden items-center gap-1 rounded-lg border border-[#E7E9F0] bg-white px-3.5 py-2 text-sm font-medium text-[#667085] transition hover:border-[#D9DCE6] hover:bg-[#F4F5FA] sm:flex">
          View all
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Main Savings Card */}
      <div className="overflow-hidden rounded-2xl border border-[#E7E9F0] bg-white shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
        {/* Summary */}
        <div className="border-b border-[#E7E9F0] bg-[#FCFCFE] px-5 py-5">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F7F0]">
                <CircleDollarSign
                  size={23}
                  className="text-[#22A06B]"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-[#667085]">
                  Total potential savings
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <h3 className="text-2xl font-semibold tracking-tight text-[#171A21]">
                    $31.7K
                  </h3>

                  <span className="text-xs font-medium text-[#22A06B]">
                    17 opportunities
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[#E8F7F0] px-3 py-2">
              <TrendingDown size={15} className="text-[#22A06B]" />

              <span className="text-xs font-medium text-[#22A06B]">
                17.2% average opportunity
              </span>
            </div>
          </div>
        </div>

        {/* Opportunity Rows */}
        <div>
          {opportunities.map((opportunity, index) => (
            <div
              key={opportunity.vendor}
              className={`px-5 py-5 transition hover:bg-[#FCFCFE] ${
                index !== opportunities.length - 1
                  ? "border-b border-[#E7E9F0]"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Vendor */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5FA] text-sm font-semibold text-[#171A21]">
                    {opportunity.vendor.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-[#171A21]">
                        {opportunity.vendor}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getPriorityStyles(
                          opportunity.priority
                        )}`}
                      >
                        {opportunity.priority}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#98A2B3]">
                      {opportunity.category}
                    </p>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:min-w-[430px] lg:grid-cols-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#98A2B3]">
                      Current spend
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#171A21]">
                      {opportunity.currentSpend}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#98A2B3]">
                      Potential saving
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#22A06B]">
                      {opportunity.potentialSaving}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#98A2B3]">
                      Opportunity
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#171A21]">
                      {opportunity.savingRate}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <button className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#E7E9F0] bg-white px-3.5 py-2 text-xs font-medium text-[#667085] transition hover:border-[#D9DCE6] hover:bg-[#F4F5FA]">
                  {opportunity.action}
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Button */}
      <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[#E7E9F0] bg-white px-4 py-2.5 text-sm font-medium text-[#667085] transition hover:bg-[#F4F5FA] sm:hidden">
        View all opportunities
        <ChevronRight size={15} />
      </button>
    </section>
  );
}