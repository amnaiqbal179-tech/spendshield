"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CalendarDays,
  DollarSign,
  Users,
  AlertTriangle,
  Clock3,
  ShieldCheck,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

interface Renewal {
  id: string;
  vendorName: string;
  productName: string;
  category: string;
  renewalDate: string;
  daysUntilRenewal: number;
  previousCost: string;
  currentCost: string;
  priceIncreasePercent: string;
  readinessScore: number;
  status: string;
  urgency: string;
  criticality: string;
  autoRenew: boolean;
  totalSeats: number;
  activeSeats: number;
  unusedSeats: number;
  potentialSaving: string;
  opportunityCount: number;
  currency: string;
}

type FilterType = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");

  useEffect(() => {
    async function fetchRenewals() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/renewals");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(
            json.error || "Failed to fetch renewals"
          );
        }

        setRenewals(json.data || []);
      } catch (err) {
        console.error("Failed to fetch renewals:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load renewals"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRenewals();
  }, []);

  const filteredRenewals = useMemo(() => {
    return renewals.filter((renewal) => {
      const query = search.toLowerCase();

      const matchesSearch =
        renewal.vendorName?.toLowerCase().includes(query) ||
        renewal.productName?.toLowerCase().includes(query) ||
        renewal.category?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "ALL" ||
        renewal.urgency === filter;

      return matchesSearch && matchesFilter;
    });
  }, [renewals, search, filter]);

  const summary = useMemo(() => {
    const upcomingSpend = renewals.reduce(
      (total, renewal) =>
        total + Number(renewal.currentCost || 0),
      0
    );

    const potentialSavings = renewals.reduce(
      (total, renewal) =>
        total + Number(renewal.potentialSaving || 0),
      0
    );

    const critical = renewals.filter(
      (renewal) => renewal.urgency === "CRITICAL"
    ).length;

    const high = renewals.filter(
      (renewal) => renewal.urgency === "HIGH"
    ).length;

    return {
      upcomingSpend,
      potentialSavings,
      critical,
      high,
    };
  }, [renewals]);

  const formatCurrency = (
    value: number | string,
    currency = "USD"
  ) => {
    const symbol =
      currency === "USD"
        ? "$"
        : currency === "GBP"
          ? "£"
          : currency === "EUR"
            ? "€"
            : `${currency} `;

    return `${symbol}${Number(value || 0).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const getDaysLabel = (days: number) => {
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    }

    if (days === 0) {
      return "Due today";
    }

    if (days === 1) {
      return "1 day left";
    }

    return `${days} days left`;
  };

  const getUrgencyClasses = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-100";

      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-100";

      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-100";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700";

      case "APPROVAL_PENDING":
      case "DECISION_PENDING":
        return "bg-amber-50 text-amber-700";

      case "IN_REVIEW":
        return "bg-indigo-50 text-indigo-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return "Unknown";
    return status
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
          Loading renewal intelligence...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEEAFE]">
              <RefreshCw
                className="h-4.5 w-4.5 text-[#7C5CFC]"
                strokeWidth={2}
              />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Renewal Intelligence
            </h2>
          </div>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Monitor upcoming renewals, identify financial risk,
            and surface savings opportunities before contracts
            renew.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-semibold">
              Unable to load renewals
            </p>

            <p className="mt-1 text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Upcoming Renewal Spend"
          value={formatCurrency(
            summary.upcomingSpend,
            renewals[0]?.currency || "USD"
          )}
          description={`${renewals.length} renewal cycles tracked`}
          icon={DollarSign}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <SummaryCard
          label="Potential Savings"
          value={formatCurrency(
            summary.potentialSavings,
            renewals[0]?.currency || "USD"
          )}
          description="Estimated savings opportunities"
          icon={TrendingSavingsIcon}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          label="Critical Renewals"
          value={summary.critical.toString()}
          description="Due within 7 days"
          icon={AlertTriangle}
          iconClass="bg-red-50 text-red-600"
        />

        <SummaryCard
          label="High Priority"
          value={summary.high.toString()}
          description="Due within 30 days"
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Search / Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search vendor, product, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />

          {(
            [
              "ALL",
              "CRITICAL",
              "HIGH",
              "MEDIUM",
              "LOW",
            ] as FilterType[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`
                whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all
                ${
                  filter === item
                    ? "bg-[#EEEAFE] text-[#7C5CFC]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }
              `}
            >
              {item === "ALL"
                ? "All"
                : item.charAt(0) +
                  item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Renewals Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Upcoming Renewals
            </h3>

            <p className="mt-0.5 text-xs text-slate-400">
              {filteredRenewals.length} renewal
              {filteredRenewals.length === 1
                ? ""
                : "s"} displayed
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Renewal decisions tracked
          </div>
        </div>

        {filteredRenewals.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <RefreshCw className="h-5 w-5 text-slate-400" />
            </div>

            <h4 className="text-sm font-semibold text-slate-800">
              No renewals found
            </h4>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
              {search || filter !== "ALL"
                ? "Try changing your search or priority filter."
                : "Add a subscription with a renewal date to start tracking renewal decisions."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Vendor / Product
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Renewal
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Current Cost
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Seats
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Potential Saving
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Readiness
                  </th>

                  <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="w-12 px-2 py-3.5"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRenewals.map((renewal) => (
                  <tr
                    key={renewal.id}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    {/* Vendor / Product */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/renewals/${renewal.id}`}
                        className="block outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC]/30"
                      >
                        <p className="font-semibold text-slate-900 group-hover:text-[#7C5CFC] transition-colors">
                          {renewal.productName}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {renewal.vendorName}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-slate-300" />

                          <span className="text-[10px] font-medium text-slate-400">
                            {renewal.category}
                          </span>
                        </div>
                      </Link>
                    </td>

                    {/* Renewal */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/renewals/${renewal.id}`}
                        className="flex items-start gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC]/30"
                      >
                        <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />

                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {formatDate(renewal.renewalDate)}
                          </p>

                          <div className="mt-1">
                            <span
                              className={`
                                inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold
                                ${getUrgencyClasses(
                                  renewal.urgency
                                )}
                              `}
                            >
                              {getDaysLabel(
                                renewal.daysUntilRenewal
                              )}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Cost */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/renewals/${renewal.id}`}
                        className="block outline-none"
                      >
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(
                            renewal.currentCost,
                            renewal.currency
                          )}
                        </p>

                        {Number(
                          renewal.priceIncreasePercent || 0
                        ) > 0 && (
                          <p className="mt-1 text-[10px] font-medium text-red-500">
                            +
                            {Number(
                              renewal.priceIncreasePercent
                            ).toFixed(1)}
                            % increase
                          </p>
                        )}
                      </Link>
                    </td>

                    {/* Seats */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/renewals/${renewal.id}`}
                        className="flex items-center gap-2 outline-none"
                      >
                        <Users className="h-4 w-4 text-slate-400" />

                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {renewal.activeSeats} /{" "}
                            {renewal.totalSeats}
                          </p>

                          {renewal.unusedSeats > 0 && (
                            <p className="text-[10px] font-medium text-amber-600">
                              {renewal.unusedSeats} unused
                            </p>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Potential Saving */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/renewals/${renewal.id}`}
                        className="block outline-none"
                      >
                        <p className="font-semibold text-emerald-600">
                          {formatCurrency(
                            renewal.potentialSaving,
                            renewal.currency
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {renewal.opportunityCount || 0}{" "}
                          opportunit
                          {renewal.opportunityCount === 1
                            ? "y"
                            : "ies"}
                        </p>
                      </Link>
                    </td>

                    {/* Readiness */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/renewals/${renewal.id}`}
                        className="block outline-none"
                      >
                        <div className="w-24">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">
                              {renewal.readinessScore || 0}%
                            </span>

                            <span className="text-[10px] text-slate-400">
                              Ready
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    renewal.readinessScore || 0,
                                    0
                                  ),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/renewals/${renewal.id}`}
                        className="block outline-none"
                      >
                        <span
                          className={`
                            inline-flex items-center rounded-lg px-2.5 py-1.5 text-[10px] font-semibold
                            ${getStatusClasses(
                              renewal.status
                            )}
                          `}
                        >
                          {formatStatus(renewal.status)}
                        </span>

                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                          <span>{renewal.criticality}</span>

                          {renewal.autoRenew && (
                            <>
                              <span>•</span>
                              <span>Auto-renew</span>
                            </>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Detail Action */}
                    <td className="px-2 py-5">
                      <Link
                        href={`/renewals/${renewal.id}`}
                        aria-label={`Open ${renewal.productName} renewal details`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-all hover:bg-[#EEEAFE] hover:text-[#7C5CFC] group-hover:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC]/30"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Summary Card
   ========================================================= */

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   Savings Icon
   ========================================================= */

function TrendingSavingsIcon(
  props: React.ComponentProps<"svg">
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}