"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ShieldAlert,
} from "lucide-react";

const riskItems = [
  {
    vendor: "Zoom",
    initials: "Z",
    days: 11,
    risk: "Critical",
    reason: "Renewal is approaching and approval is still pending.",
    action: "Review decision",
  },
  {
    vendor: "Adobe Creative Cloud",
    initials: "A",
    days: 18,
    risk: "At Risk",
    reason: "Unused licenses detected before renewal.",
    action: "Optimize seats",
  },
  {
    vendor: "HubSpot",
    initials: "H",
    days: 24,
    risk: "At Risk",
    reason: "Plan usage suggests a lower tier may be suitable.",
    action: "Compare plans",
  },
  {
    vendor: "Figma",
    initials: "F",
    days: 32,
    risk: "On Track",
    reason: "Owner, budget and renewal decision are ready.",
    action: "View decision",
  },
];

function getRiskStyles(risk: string) {
  if (risk === "Critical") {
    return {
      badge: "bg-[#FDECEE] text-[#E35D6A]",
      icon: "bg-[#FDECEE] text-[#E35D6A]",
    };
  }

  if (risk === "At Risk") {
    return {
      badge: "bg-[#FFF6DD] text-[#D99A16]",
      icon: "bg-[#FFF6DD] text-[#D99A16]",
    };
  }

  return {
    badge: "bg-[#E8F7F0] text-[#22A06B]",
    icon: "bg-[#E8F7F0] text-[#22A06B]",
  };
}

export default function RenewalRiskRadar() {
  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDECEE]">
              <ShieldAlert size={16} className="text-[#E35D6A]" />
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#98A2B3]">
              Renewal Intelligence
            </p>
          </div>

          <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#171A21]">
            Renewal risk radar
          </h2>

          <p className="mt-1 text-sm text-[#667085]">
            See which renewals need attention before they become costly.
          </p>
        </div>

        <button className="hidden items-center gap-1 rounded-lg border border-[#E7E9F0] bg-white px-3.5 py-2 text-sm font-medium text-[#667085] transition hover:border-[#D9DCE6] hover:bg-[#F4F5FA] sm:flex">
          View all
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border border-[#E7E9F0] bg-white shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
        {/* Risk Summary */}
        <div className="grid grid-cols-1 border-b border-[#E7E9F0] bg-[#FCFCFE] sm:grid-cols-3">
          <div className="border-b border-[#E7E9F0] px-5 py-5 sm:border-b-0 sm:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDECEE]">
                <AlertTriangle
                  size={18}
                  className="text-[#E35D6A]"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-xs text-[#98A2B3]">Critical</p>
                <p className="mt-0.5 text-xl font-semibold text-[#171A21]">
                  1
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-[#E7E9F0] px-5 py-5 sm:border-b-0 sm:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF6DD]">
                <Clock3
                  size={18}
                  className="text-[#D99A16]"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-xs text-[#98A2B3]">At Risk</p>
                <p className="mt-0.5 text-xl font-semibold text-[#171A21]">
                  2
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F0]">
                <CheckCircle2
                  size={18}
                  className="text-[#22A06B]"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-xs text-[#98A2B3]">On Track</p>
                <p className="mt-0.5 text-xl font-semibold text-[#171A21]">
                  1
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Items */}
        <div>
          {riskItems.map((item, index) => {
            const styles = getRiskStyles(item.risk);

            return (
              <div
                key={item.vendor}
                className={`px-5 py-5 transition hover:bg-[#FCFCFE] ${
                  index !== riskItems.length - 1
                    ? "border-b border-[#E7E9F0]"
                    : ""
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Vendor */}
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${styles.icon}`}
                    >
                      {item.initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-[#171A21]">
                          {item.vendor}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${styles.badge}`}
                        >
                          {item.risk}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-[#667085]">
                        {item.reason}
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-2 lg:min-w-[110px]">
                    <Clock3 size={14} className="text-[#98A2B3]" />

                    <div>
                      <p className="text-sm font-medium text-[#171A21]">
                        {item.days} days
                      </p>

                      <p className="text-[11px] text-[#98A2B3]">
                        until renewal
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <button className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#E7E9F0] bg-white px-3.5 py-2 text-xs font-medium text-[#667085] transition hover:border-[#D9DCE6] hover:bg-[#F4F5FA]">
                    {item.action}
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}