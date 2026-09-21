"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
Search,
SlidersHorizontal,
Clock3,
CheckCircle2,
AlertTriangle,
FileText,
ChevronRight,
RefreshCw,
Send,
} from "lucide-react";

type DecisionStatus =
| "Needs Review"
| "Awaiting Approval"
| "Approved"
| "Executed";

type Risk = "Critical" | "At Risk" | "On Track";

type ApiDecision = {
id: string;
renewalId: string;
recommendedAction: string;
selectedAction: string | null;
currentAnnualCost: string;
estimatedSaving: string;
status: string;
createdAt: string;
renewal: {
renewalDate: string;
subscription: {
productName: string;
category: string | null;
criticality: string;
};
};
};

type Decision = ApiDecision & {
software: string;
category: string;
renewalDate: string;
daysLeft: number;
spend: string;
potentialSaving: string;
risk: Risk;
displayStatus: DecisionStatus;
action: string;
};

const actionLabels: Record<string, string> = {
RENEW: "Renew",
REDUCE: "Reduce",
DOWNGRADE: "Downgrade",
NEGOTIATE: "Negotiate",
CANCEL: "Cancel",
REPLACE: "Replace",
};

const formatCurrency = (v: string | number) =>
new Intl.NumberFormat("en-US", {
style: "currency",
currency: "USD",
maximumFractionDigits: 0,
}).format(Number(v) || 0);

const daysLeft = (date: string) =>
Math.ceil(
(new Date(date).getTime() - Date.now()) / 86400000
);

const getRisk = (
days: number,
criticality: string
): Risk =>
days <= 14 ||
criticality === "HIGH" ||
criticality === "CRITICAL"
? "Critical"
: days <= 30 || criticality === "MEDIUM"
? "At Risk"
: "On Track";

const getStatus = (
status: string
): DecisionStatus =>
status === "PENDING_APPROVAL"
? "Awaiting Approval"
: status === "APPROVED"
? "Approved"
: status === "EXECUTED"
? "Executed"
: "Needs Review";

export default function DecisionsPage() {
const [decisions, setDecisions] = useState<Decision[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState<
"All" | DecisionStatus

> ("All");

const [sendingApprovalId, setSendingApprovalId] =
useState<string | null>(null);

async function loadDecisions(refresh = false) {
try {
refresh
? setRefreshing(true)
: setLoading(true);


  setError("");

  const response = await fetch(
    "/api/decisions?all=true",
    {
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: {
    success?: boolean;
    data?: ApiDecision[];
    error?: string;
  } = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Server returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        "Failed to load decisions."
    );
  }

  setDecisions(
    (result.data ?? []).map(
      (item: ApiDecision) => {
        const days = daysLeft(
          item.renewal.renewalDate
        );

        return {
          ...item,

          software:
            item.renewal.subscription
              .productName,

          category:
            item.renewal.subscription
              .category ??
            "Uncategorized",

          renewalDate:
            new Date(
              item.renewal.renewalDate
            ).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }
            ),

          daysLeft: days,

          spend: formatCurrency(
            item.currentAnnualCost
          ),

          potentialSaving:
            formatCurrency(
              item.estimatedSaving
            ),

          risk: getRisk(
            days,
            item.renewal.subscription
              .criticality
          ),

          displayStatus:
            getStatus(item.status),

          action:
            actionLabels[
              item.selectedAction ??
                item.recommendedAction
            ] ??
            item.selectedAction ??
            item.recommendedAction,
        };
      }
    )
  );
} catch (e) {
  setError(
    e instanceof Error
      ? e.message
      : "Failed to load decisions."
  );
} finally {
  setLoading(false);
  setRefreshing(false);
}


}

useEffect(() => {
loadDecisions();
}, []);

// ==================================================
// SEND DECISION FOR APPROVAL
// ==================================================
async function sendForApproval(
decisionId: string
) {
try {
setSendingApprovalId(decisionId);
setError("");


  const response = await fetch(
    "/api/decisions",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        decisionId,
        status: "PENDING_APPROVAL",
      }),
    }
  );

  // Read response as text first.
  // This prevents "Unexpected end of JSON input"
  // when the server returns an empty response.
  const text = await response.text();

  console.log(
    "Send for Approval API response:",
    response.status,
    text
  );

  let result: {
    success?: boolean;
    error?: string;
  } = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Server returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.error ||
        "Failed to send decision for approval."
    );
  }

  // Refresh decisions from database
  await loadDecisions(true);
} catch (e) {
  console.error(
    "Send for Approval error:",
    e
  );

  setError(
    e instanceof Error
      ? e.message
      : "Failed to send decision for approval."
  );
} finally {
  setSendingApprovalId(null);
}


}

const filtered = useMemo(
() =>
decisions.filter((d) => {
const q = search.toLowerCase();


    return (
      (d.software
        .toLowerCase()
        .includes(q) ||
        d.category
          .toLowerCase()
          .includes(q) ||
        d.action
          .toLowerCase()
          .includes(q)) &&
      (statusFilter === "All" ||
        d.displayStatus === statusFilter)
    );
  }),
[decisions, search, statusFilter]


);

const summary = useMemo(
() => ({
total: decisions.length,

  review: decisions.filter(
    (d) =>
      d.displayStatus ===
      "Needs Review"
  ).length,

  approval: decisions.filter(
    (d) =>
      d.displayStatus ===
      "Awaiting Approval"
  ).length,

  executed: decisions.filter(
    (d) =>
      d.displayStatus ===
      "Executed"
  ).length,
}),
[decisions]


);

const savingsAtRisk = decisions
.filter(
(d) =>
d.displayStatus ===
"Needs Review" ||
d.displayStatus ===
"Awaiting Approval"
)
.reduce(
(n, d) =>
n +
Number(
d.estimatedSaving || 0
),
0
);

return ( <main className="min-h-screen bg-[#F7F8FC] p-6 lg:p-8">
{/* HEADER */} <section className="mb-8"> <p className="mb-1 text-sm font-medium text-[#667085]">
Renewal Decision Engine </p>


    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#171A21]">
          Renewal Decisions
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
          Turn upcoming renewals into clear
          financial decisions with evidence,
          risk, savings, and approval context.
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          loadDecisions(true)
        }
        disabled={refreshing}
        className="flex items-center justify-center gap-2 rounded-xl border border-[#E7E9F0] bg-white px-4 py-2.5 text-sm font-medium text-[#667085] shadow-[0_2px_6px_rgba(16,24,40,0.03)] hover:bg-[#F4F5FA] disabled:opacity-60"
      >
        <RefreshCw
          className={`h-4 w-4 ${
            refreshing
              ? "animate-spin"
              : ""
          }`}
        />

        {refreshing
          ? "Refreshing..."
          : "Refresh Decisions"}
      </button>
    </div>
  </section>

  {/* ERROR */}
  {error && (
    <section className="mb-6 rounded-2xl border border-[#F2B8BE] bg-[#FFF5F6] p-4">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-[#E35D6A]" />

        <div>
          <p className="text-sm font-semibold">
            Something went wrong
          </p>

          <p className="mt-1 text-sm text-[#667085]">
            {error}
          </p>
        </div>
      </div>
    </section>
  )}

  {/* SUMMARY */}
  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <DecisionMetric
      title="Total Decisions"
      value={
        loading
          ? "—"
          : String(summary.total)
      }
      description="Saved renewal decisions"
      icon={FileText}
      iconBg="bg-[#EEEAFE]"
      iconColor="text-[#7C5CFC]"
    />

    <DecisionMetric
      title="Needs Review"
      value={
        loading
          ? "—"
          : String(summary.review)
      }
      description="Require action"
      icon={AlertTriangle}
      iconBg="bg-[#FDECEE]"
      iconColor="text-[#E35D6A]"
    />

    <DecisionMetric
      title="Awaiting Approval"
      value={
        loading
          ? "—"
          : String(summary.approval)
      }
      description="Pending decision owners"
      icon={Clock3}
      iconBg="bg-[#FFF6DD]"
      iconColor="text-[#D99A16]"
    />

    <DecisionMetric
      title="Executed"
      value={
        loading
          ? "—"
          : String(summary.executed)
      }
      description="Decisions completed"
      icon={CheckCircle2}
      iconBg="bg-[#E8F7F0]"
      iconColor="text-[#22A06B]"
    />
  </section>

  {/* PIPELINE */}
  <section className="mt-8 rounded-2xl border border-[#E7E9F0] bg-white p-6 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
    <div className="mb-6">
      <h2 className="text-lg font-semibold">
        Decision pipeline
      </h2>

      <p className="mt-1 text-sm text-[#667085]">
        Every renewal moves through a
        structured decision process.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <FlowStep
        number="01"
        title="Review"
        description="Understand spend and usage"
        count={
          loading
            ? "—"
            : String(summary.review)
        }
        active
      />

      <FlowStep
        number="02"
        title="Analyze"
        description="Compare savings scenarios"
        count={
          loading
            ? "—"
            : String(decisions.length)
        }
      />

      <FlowStep
        number="03"
        title="Approve"
        description="Assign decision authority"
        count={
          loading
            ? "—"
            : String(summary.approval)
        }
      />

      <FlowStep
        number="04"
        title="Execute"
        description="Complete and verify"
        count={
          loading
            ? "—"
            : String(summary.executed)
        }
      />
    </div>
  </section>

  {/* DECISION QUEUE */}
  <section className="mt-8">
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-semibold">
          Decision queue
        </h2>

        <p className="mt-1 text-sm text-[#667085]">
          Prioritize renewals based on
          deadline, risk, and financial impact.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search decisions..."
            className="h-10 w-full rounded-xl border border-[#E7E9F0] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#C8BFFF] sm:w-64"
          />
        </div>

        {/* FILTER */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | "All"
                  | DecisionStatus
              )
            }
            className="h-10 appearance-none rounded-xl border border-[#E7E9F0] bg-white pl-9 pr-9 text-sm text-[#667085] outline-none"
          >
            <option>All</option>
            <option>
              Needs Review
            </option>
            <option>
              Awaiting Approval
            </option>
            <option>
              Approved
            </option>
            <option>
              Executed
            </option>
          </select>
        </div>
      </div>
    </div>

    {/* TABLE */}
    <div className="overflow-hidden rounded-2xl border border-[#E7E9F0] bg-white shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
      <div className="hidden grid-cols-[1.55fr_1fr_.8fr_.9fr_.9fr_1fr_1.1fr] gap-4 border-b border-[#E7E9F0] bg-[#FCFCFE] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#98A2B3] lg:grid">
        <span>Software</span>
        <span>Renewal</span>
        <span>Spend</span>
        <span>Saving</span>
        <span>Risk</span>
        <span>Status</span>
        <span>Action</span>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#7C5CFC]" />

          <p className="mt-4 text-sm font-semibold">
            Loading decisions...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center">
          <Search className="mx-auto h-8 w-8 text-[#98A2B3]" />

          <p className="mt-4 text-sm font-semibold">
            {decisions.length
              ? "No decisions found"
              : "No saved decisions yet"}
          </p>

          <p className="mt-1 text-sm text-[#667085]">
            {decisions.length
              ? "Try changing your search or status filter."
              : "Save a decision from a renewal detail page and it will appear here."}
          </p>
        </div>
      ) : (
        filtered.map((d, i) => (
          <DecisionRow
            key={d.id}
            decision={d}
            last={
              i ===
              filtered.length - 1
            }
            onSendForApproval={
              sendForApproval
            }
            sendingApprovalId={
              sendingApprovalId
            }
          />
        ))
      )}
    </div>
  </section>

  {/* INSIGHTS */}
  <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
    <div className="rounded-2xl border border-[#E7E9F0] bg-white p-6 lg:col-span-2">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDECEE] text-[#E35D6A]">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold">
            Decision priority
          </p>

          <p className="mt-2 text-sm leading-6 text-[#667085]">
            {decisions.length
              ? `${
                  decisions.filter(
                    (d) =>
                      d.risk ===
                      "Critical"
                  ).length
                } critical decision${
                  decisions.filter(
                    (d) =>
                      d.risk ===
                      "Critical"
                  ).length === 1
                    ? ""
                    : "s"
                } currently require close attention based on renewal timing and risk.`
              : "Saved renewal decisions will appear here with their financial and deadline context."}
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-[#E7E9F0] bg-white p-6">
      <p className="text-sm font-medium text-[#667085]">
        Savings at risk
      </p>

      <p className="mt-3 text-3xl font-semibold">
        {loading
          ? "—"
          : formatCurrency(
              savingsAtRisk
            )}
      </p>

      <p className="mt-3 text-xs text-[#98A2B3]">
        Potential savings connected to
        unresolved decisions.
      </p>
    </div>
  </section>
</main>


);
}

// ==================================================
// DECISION METRIC
// ==================================================

function DecisionMetric({
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
return ( <div className="rounded-2xl border border-[#E7E9F0] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.04)]"> <div className="flex items-start justify-between"> <div> <p className="text-sm font-medium text-[#667085]">
{title} </p>


      <p className="mt-3 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#98A2B3]">
        {description}
      </p>
    </div>

    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
    >
      <Icon className="h-5 w-5" />
    </div>
  </div>
</div>


);
}

// ==================================================
// FLOW STEP
// ==================================================

function FlowStep({
number,
title,
description,
count,
active = false,
}: {
number: string;
title: string;
description: string;
count: string;
active?: boolean;
}) {
return (
<div
className={`rounded-xl border p-4 ${
        active
          ? "border-[#DCD4FF] bg-[#F8F6FF]"
          : "border-[#E7E9F0] bg-[#FCFCFE]"
      }`}
> <div className="flex justify-between">
<span
className={`text-xs font-semibold ${
            active
              ? "text-[#7C5CFC]"
              : "text-[#98A2B3]"
          }`}
>
{number} </span>


    <span className="rounded-full bg-white px-2 py-1 text-xs text-[#667085]">
      {count}
    </span>
  </div>

  <h3 className="mt-4 text-sm font-semibold">
    {title}
  </h3>

  <p className="mt-1 text-xs leading-5 text-[#98A2B3]">
    {description}
  </p>
</div>

);
}

// ==================================================
// DECISION ROW
// ==================================================

function DecisionRow({
decision,
last,
onSendForApproval,
sendingApprovalId,
}: {
decision: Decision;
last: boolean;
onSendForApproval: (
decisionId: string
) => void;
sendingApprovalId: string | null;
}) {
const riskStyle =
decision.risk === "Critical"
? "bg-[#FDECEE] text-[#E35D6A]"
: decision.risk === "At Risk"
? "bg-[#FFF6DD] text-[#D99A16]"
: "bg-[#E8F7F0] text-[#22A06B]";

const statusStyle =
decision.displayStatus ===
"Needs Review"
? "bg-[#FDECEE] text-[#E35D6A]"
: decision.displayStatus ===
"Awaiting Approval"
? "bg-[#FFF6DD] text-[#D99A16]"
: decision.displayStatus ===
"Approved"
? "bg-[#EEEAFE] text-[#7C5CFC]"
: "bg-[#E8F7F0] text-[#22A06B]";

const isSending =
sendingApprovalId ===
decision.id;

return (
<div
className={`grid grid-cols-1 gap-4 px-5 py-5 hover:bg-[#FCFCFE] lg:grid-cols-[1.55fr_1fr_.8fr_.9fr_.9fr_1fr_1.1fr] lg:items-center ${
        last
          ? ""
          : "border-b border-[#E7E9F0]"
      }`}
>
{/* SOFTWARE */} <div className="flex items-center gap-3"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5FA] text-sm font-semibold">
{decision.software.charAt(0)} </div>


    <div>
      <Link
        href={`/renewals/${decision.renewalId}`}
        className="font-medium hover:text-[#7C5CFC]"
      >
        {decision.software}
      </Link>

      <p className="mt-1 text-xs text-[#98A2B3]">
        {decision.category}
      </p>

      <p className="mt-1 text-xs font-medium text-[#7C5CFC]">
        Action: {decision.action}
      </p>
    </div>
  </div>

  {/* RENEWAL */}
  <div>
    <p className="text-xs text-[#98A2B3] lg:hidden">
      Renewal
    </p>

    <p className="mt-1 text-sm font-medium">
      {decision.renewalDate}
    </p>

    <p
      className={`mt-1 text-xs font-medium ${
        decision.daysLeft <= 14
          ? "text-[#E35D6A]"
          : "text-[#98A2B3]"
      }`}
    >
      {decision.daysLeft < 0
        ? "Renewal date passed"
        : `${decision.daysLeft} days left`}
    </p>
  </div>

  {/* SPEND */}
  <div>
    <p className="text-xs text-[#98A2B3] lg:hidden">
      Spend
    </p>

    <p className="mt-1 text-sm font-medium">
      {decision.spend}
    </p>
  </div>

  {/* SAVING */}
  <div>
    <p className="text-xs text-[#98A2B3] lg:hidden">
      Potential Saving
    </p>

    <p className="mt-1 text-sm font-semibold text-[#22A06B]">
      {decision.potentialSaving}
    </p>
  </div>

  {/* RISK */}
  <div>
    <p className="text-xs text-[#98A2B3] lg:hidden">
      Risk
    </p>

    <span
      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${riskStyle}`}
    >
      {decision.risk}
    </span>
  </div>

  {/* STATUS */}
  <div>
    <p className="text-xs text-[#98A2B3] lg:hidden">
      Status
    </p>

    <span
      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle}`}
    >
      {decision.displayStatus}
    </span>
  </div>

  {/* ACTION */}
  <div className="flex flex-col items-start gap-2">
    {decision.displayStatus ===
      "Needs Review" && (
      <button
        type="button"
        onClick={() =>
          onSendForApproval(
            decision.id
          )
        }
        disabled={isSending}
        className="inline-flex h-9 min-w-[148px] items-center justify-center gap-2 rounded-lg border border-[#6F52E8] bg-[#7C5CFC] px-3.5 text-[13px] font-semibold text-white shadow-[0_2px_6px_rgba(124,92,252,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#6D4FF0] hover:shadow-[0_4px_10px_rgba(124,92,252,0.22)] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isSending ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            Send for Approval
          </>
        )}
      </button>
    )}

    {decision.displayStatus ===
      "Awaiting Approval" && (
      <span className="inline-flex h-9 items-center rounded-lg border border-[#F1D99A] bg-[#FFF9E8] px-3.5 text-[13px] font-medium text-[#B77908]">
        Waiting for approval
      </span>
    )}

    {decision.displayStatus ===
      "Approved" && (
      <span className="inline-flex h-9 items-center rounded-lg border border-[#DCD4FF] bg-[#F7F4FF] px-3.5 text-[13px] font-medium text-[#6B4FE8]">
        Approved
      </span>
    )}

    {decision.displayStatus ===
      "Executed" && (
      <span className="inline-flex h-9 items-center rounded-lg border border-[#BFE8D3] bg-[#F1FBF6] px-3.5 text-[13px] font-medium text-[#168A59]">
        Completed
      </span>
    )}

    <Link
      href={`/renewals/${decision.renewalId}`}
      className="inline-flex items-center gap-1 text-sm font-medium text-[#7C5CFC] transition-colors hover:text-[#5F3FE5]"
    >
      Open
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  </div>
</div>

);
}
