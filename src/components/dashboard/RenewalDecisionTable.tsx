"use client";

import {
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
} from "lucide-react";

const decisions = [
  {
    vendor: "Adobe Creative Cloud",
    initials: "A",
    renewal: "18 days",
    date: "Sep 22, 2026",
    spend: "$6.8K",
    savings: "$1.2K",
    risk: "High",
    status: "Review",
  },
  {
    vendor: "HubSpot",
    initials: "H",
    renewal: "24 days",
    date: "Sep 28, 2026",
    spend: "$4.2K",
    savings: "$840",
    risk: "Medium",
    status: "Negotiating",
  },
  {
    vendor: "Zoom",
    initials: "Z",
    renewal: "11 days",
    date: "Sep 15, 2026",
    spend: "$2.1K",
    savings: "$420",
    risk: "High",
    status: "Pending",
  },
  {
    vendor: "Figma",
    initials: "F",
    renewal: "32 days",
    date: "Oct 6, 2026",
    spend: "$1.7K",
    savings: "$310",
    risk: "Low",
    status: "Ready",
  },
];

function getRiskStyles(risk: string) {
  if (risk === "High") {
    return "bg-[#FDECEE] text-[#E35D6A]";
  }

  if (risk === "Medium") {
    return "bg-[#FFF6DD] text-[#D99A16]";
  }

  return "bg-[#E8F7F0] text-[#22A06B]";
}

function getStatusStyles(status: string) {
  if (status === "Review") {
    return "bg-[#EEEAFE] text-[#7C5CFC]";
  }

  if (status === "Negotiating") {
    return "bg-[#EAF3FF] text-[#4F9CF9]";
  }

  if (status === "Pending") {
    return "bg-[#FFF6DD] text-[#D99A16]";
  }

  return "bg-[#E8F7F0] text-[#22A06B]";
}

export default function RenewalDecisionTable() {
  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#98A2B3]">
            Decision Queue
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#171A21]">
            Renewal decisions
          </h2>

          <p className="mt-1 text-sm text-[#667085]">
            Prioritize renewals based on timing, risk, and savings potential.
          </p>
        </div>

        <button className="hidden items-center gap-1 rounded-lg border border-[#E7E9F0] bg-white px-3.5 py-2 text-sm font-medium text-[#667085] transition hover:border-[#D9DCE6] hover:bg-[#F4F5FA] sm:flex">
          View all
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E7E9F0] bg-white shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
        {/* Table Header */}
        <div className="hidden grid-cols-[2fr_1.2fr_1fr_1.2fr_0.8fr_1fr] border-b border-[#E7E9F0] bg-[#FCFCFE] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#98A2B3] lg:grid">
          <div>Vendor</div>
          <div>Renewal</div>
          <div>Spend</div>
          <div>Potential saving</div>
          <div>Risk</div>
          <div>Status</div>
        </div>

        {/* Rows */}
        {decisions.map((decision, index) => (
          <div
            key={decision.vendor}
            className={`px-5 py-4 transition hover:bg-[#FCFCFE] ${
              index !== decisions.length - 1
                ? "border-b border-[#E7E9F0]"
                : ""
            }`}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1.2fr_1fr_1.2fr_0.8fr_1fr] lg:items-center">
              {/* Vendor */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5FA] text-sm font-semibold text-[#171A21]">
                  {decision.initials}
                </div>

                <div>
                  <p className="text-sm font-medium text-[#171A21]">
                    {decision.vendor}
                  </p>

                  <p className="mt-0.5 text-xs text-[#98A2B3]">
                    Software subscription
                  </p>
                </div>
              </div>

              {/* Renewal */}
              <div className="flex items-center gap-2">
                <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-[#F4F5FA] lg:flex">
                  <CalendarDays size={15} className="text-[#667085]" />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#171A21]">
                    {decision.renewal}
                  </p>

                  <p className="mt-0.5 text-xs text-[#98A2B3]">
                    {decision.date}
                  </p>
                </div>
              </div>

              {/* Spend */}
              <div>
                <p className="text-sm font-semibold text-[#171A21]">
                  {decision.spend}
                </p>

                <p className="mt-0.5 text-xs text-[#98A2B3]">
                  annual spend
                </p>
              </div>

              {/* Savings */}
              <div>
                <p className="text-sm font-semibold text-[#22A06B]">
                  {decision.savings}
                </p>

                <p className="mt-0.5 text-xs text-[#98A2B3]">
                  estimated opportunity
                </p>
              </div>

              {/* Risk */}
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getRiskStyles(
                    decision.risk
                  )}`}
                >
                  {decision.risk === "High" && <CircleAlert size={12} />}
                  {decision.risk === "Medium" && <Clock3 size={12} />}
                  {decision.risk === "Low" && <Clock3 size={12} />}
                  {decision.risk}
                </span>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                    decision.status
                  )}`}
                >
                  {decision.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View All */}
      <button className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[#E7E9F0] bg-white px-4 py-2.5 text-sm font-medium text-[#667085] transition hover:bg-[#F4F5FA] sm:hidden">
        View all decisions
        <ChevronRight size={15} />
      </button>
    </section>
  );
}