"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  DollarSign,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  ChevronRight,
  RefreshCw,
  Target,
  TrendingDown,
  Copy,
  Download,
  Lock,
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

interface Scenario {
  title: string;
  description: string;
  cost: number;
  saving: number;
  recommended: boolean;
}

interface SavedDecision {
  action: string;
  scenario: string;
  estimatedSaving: number;
  savedAt: string;
}

export default function RenewalDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [renewal, setRenewal] = useState<Renewal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedScenario, setSelectedScenario] =
    useState("Negotiate");

  const [decision, setDecision] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  const [renewalId, setRenewalId] = useState("");

  const [savingDecision, setSavingDecision] = useState(false);

  const [saveError, setSaveError] = useState("");
  const [savedDecision, setSavedDecision] = useState<SavedDecision | null>(null);
  const saveInProgressRef = useRef(false);

  useEffect(() => {
    async function loadRenewal() {
      try {
        const resolvedParams = await params;
        const currentId = resolvedParams.id;
        setRenewalId(currentId);

        let foundRenewal: Renewal | null = null;

        try {
          const res = await fetch("/api/renewals");
          const json = await res.json();

          if (res.ok && json.success && Array.isArray(json.data)) {
            foundRenewal = json.data.find(
              (item: Renewal) => item.id === currentId
            );
          }
        } catch (apiErr) {
          console.warn("API fetch failed, falling back to mock data:", apiErr);
        }

        // Safe Fallback agar API mein data na mile ya fetch fail ho jaye
        if (!foundRenewal) {
          foundRenewal = {
            id: currentId,
            vendorName: "Github",
            productName: "Github Enterprise",
            category: "developer tools",
            renewalDate: "2026-10-15",
            daysUntilRenewal: 12,
            previousCost: "1200",
            currentCost: "1200",
            priceIncreasePercent: "0.0",
            readinessScore: 0,
            status: "DECISION_PENDING",
            urgency: "CRITICAL",
            criticality: "HIGH",
            autoRenew: false,
            totalSeats: 12,
            activeSeats: 6,
            unusedSeats: 6,
            potentialSaving: "600",
            opportunityCount: 2,
            currency: "USD",
          };
        }

        setRenewal(foundRenewal);

        try {
          const decisionRes = await fetch(
            `/api/decisions?renewalId=${encodeURIComponent(currentId)}`,
            { cache: "no-store" }
          );

          const decisionJson = await decisionRes.json();

          if (decisionRes.ok && decisionJson.success && decisionJson.data) {
            const saved = decisionJson.data;

            const scenarioMap: Record<string, string> = {
              RENEW: "Renew as-is",
              REDUCE: "Reduce",
              DOWNGRADE: "Downgrade",
              NEGOTIATE: "Negotiate",
              CANCEL: "Cancel",
              REPLACE: "Replace",
            };

            const scenarioFromApi =
              saved.selectedScenario?.notes
                ?.replace(/^Selected scenario:\s*/i, "")
                ?.trim();

            const scenario =
              scenarioFromApi ||
              scenarioMap[saved.selectedAction] ||
              "Negotiate";

            const workflowMatch = String(saved.reasoning ?? "").match(
              /Workflow action:\s*([^.]*)/i
            );

            const workflowAction =
              workflowMatch?.[1]?.trim() || "Decision saved";

            setSelectedScenario(scenario);
            setDecision(workflowAction);

            setSavedDecision({
              action: workflowAction,
              scenario,
              estimatedSaving: Number(saved.estimatedSaving ?? 0),
              savedAt:
                saved.createdAt ||
                saved.updatedAt ||
                new Date().toISOString(),
            });
          }
        } catch (decisionError) {
          console.warn("Failed to load existing decision:", decisionError);
        }
      } catch (err) {
        console.error("Failed to load renewal:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load renewal"
        );
      } finally {
        setLoading(false);
      }
    }

    loadRenewal();
  }, [params]);

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
        month: "long",
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
      return "1 day remaining";
    }

    return `${days} days remaining`;
  };

  const getUrgencyClasses = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "bg-[#FDECEE] text-[#E35D6A]";

      case "HIGH":
        return "bg-[#FFF6DD] text-[#D99A16]";

      case "MEDIUM":
        return "bg-[#FFF9E8] text-[#B7791F]";

      default:
        return "bg-[#F4F5FA] text-[#667085]";
    }
  };

  const scenarios = useMemo<Scenario[]>(() => {
    if (!renewal) {
      return [];
    }

    const currentCost = Number(
      renewal.currentCost || 0
    );

    const potentialSaving = Number(
      renewal.potentialSaving || 0
    );

    const unusedSaving =
      Number(renewal.unusedSeats || 0) *
      (Number(renewal.totalSeats || 0) > 0
        ? currentCost / Number(renewal.totalSeats)
        : 0);

    const negotiateSaving = Math.min(
      potentialSaving,
      currentCost * 0.25
    );

    const downgradeSaving = Math.min(
      potentialSaving,
      Math.max(
        unusedSaving,
        currentCost * 0.2
      )
    );

    return [
      {
        title: "Renew as-is",
        description:
          "Continue the current subscription without changes.",
        cost: currentCost,
        saving: 0,
        recommended: false,
      },
      {
        title: "Negotiate",
        description:
          "Negotiate pricing or contract terms before renewal.",
        cost: Math.max(
          currentCost - negotiateSaving,
          0
        ),
        saving: negotiateSaving,
        recommended:
          potentialSaving > 0,
      },
      {
        title: "Downgrade",
        description:
          "Reduce seats or plan level based on current usage.",
        cost: Math.max(
          currentCost - downgradeSaving,
          0
        ),
        saving: downgradeSaving,
        recommended:
          Number(renewal.unusedSeats || 0) > 0 &&
          downgradeSaving > negotiateSaving,
      },
      {
        title: "Cancel",
        description:
          "End the subscription before the renewal date.",
        cost: 0,
        saving: currentCost,
        recommended: false,
      },
    ];
  }, [renewal]);

  const selectedScenarioData = scenarios.find(
    (scenario) =>
      scenario.title === selectedScenario
  );

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "APPROVED":
        return "bg-[#E8F7F0] text-[#22A06B]";

      case "DECISION_PENDING":
      case "APPROVAL_PENDING":
        return "bg-[#FFF6DD] text-[#D99A16]";

      case "IN_REVIEW":
        return "bg-[#EEEAFE] text-[#7C5CFC]";

      default:
        return "bg-[#F4F5FA] text-[#667085]";
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

  const handleDecision = (action: string) => {
    setDecision(action);
    setSaveError("");
    setToastMessage(`${action} for the ${selectedScenario} scenario.`);
    setShowToast(true);

    window.setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleSaveDecision = async () => {
    if (saveInProgressRef.current || savedDecision) {
      return;
    }

    if (
      !renewalId ||
      !decision ||
      !selectedScenarioData
    ) {
      return;
    }

    saveInProgressRef.current = true;

    try {
      setSavingDecision(true);
      setSaveError("");

      const scenarioActionMap: Record<
        string,
        | "RENEW"
        | "REDUCE"
        | "DOWNGRADE"
        | "NEGOTIATE"
        | "CANCEL"
        | "REPLACE"
      > = {
        "Renew as-is": "RENEW",
        Negotiate: "NEGOTIATE",
        Downgrade: "DOWNGRADE",
        Cancel: "CANCEL",
      };

      const action =
        scenarioActionMap[selectedScenario] || "NEGOTIATE";

      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          renewalId,
          action,
          selectedScenario,
          estimatedSaving:
            selectedScenarioData.saving,
          notes: `Workflow action: ${decision}. Selected scenario: ${selectedScenario}.`,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error || "Failed to save decision"
        );
      }

      setSavedDecision({
        action: decision,
        scenario: selectedScenario,
        estimatedSaving: selectedScenarioData.saving,
        savedAt: new Date().toISOString(),
      });

      setSaveError("");
      setToastMessage("Decision successfully recorded and saved.");
      setShowToast(true);

      window.setTimeout(() => {
        setShowToast(false);
      }, 4000);
    } catch (error) {
      console.error(
        "Failed to save decision:",
        error
      );

      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save decision"
      );
      setToastMessage("Failed to save decision.");
      setShowToast(true);
    } finally {
      saveInProgressRef.current = false;
      setSavingDecision(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin text-[#7C5CFC]" />
          Loading renewal details...
        </div>
      </main>
    );
  }

  if (error || !renewal) {
    return (
      <main className="p-6 lg:p-8">
        <Link
          href="/renewals"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#667085] transition hover:text-[#7C5CFC]"
        >
          <ArrowLeft size={16} />
          Back to renewals
        </Link>

        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-6 text-center">
          <AlertTriangle className="h-8 w-8 text-[#E35D6A]" />

          <h2 className="mt-4 text-lg font-semibold text-[#171A21]">
            Unable to load renewal
          </h2>

          <p className="mt-2 max-w-md text-sm text-[#667085]">
            {error || "This renewal could not be found."}
          </p>

          <Link
            href="/renewals"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7C5CFC] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6E4FE8]"
          >
            Return to renewals
          </Link>
        </div>
      </main>
    );
  }

  const currency = renewal.currency || "USD";

  return (
    <main className="p-6 lg:p-8">
      <Link
        href="/renewals"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#667085] transition hover:text-[#7C5CFC]"
      >
        <ArrowLeft size={16} />
        Back to renewals
      </Link>

      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-[#98A2B3]">
            <span>Renewals</span>
            <ChevronRight size={14} />
            <span className="text-[#667085]">
              {renewal.productName}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F4F5FA] text-xl font-semibold text-[#171A21]">
              {(renewal.vendorName || "V")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#171A21]">
                {renewal.productName}
              </h1>

              <p className="mt-1 text-sm text-[#667085]">
                {renewal.category} ·{" "}
                {renewal.vendorName}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getUrgencyClasses(
                    renewal.urgency
                  )}`}
                >
                  <AlertTriangle size={12} />
                  {renewal.urgency} Priority
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6DD] px-2.5 py-1 text-xs font-medium text-[#D99A16]">
                  <Clock3 size={12} />
                  {getDaysLabel(
                    renewal.daysUntilRenewal
                  )}
                </span>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                    renewal.status
                  )}`}
                >
                  {formatStatus(renewal.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEvidenceModal(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E7E9F0] bg-white px-4 text-sm font-medium text-[#667085] transition hover:bg-[#F4F5FA]"
        >
          <FileText size={16} />
          View evidence
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Annual spend"
          value={formatCurrency(
            renewal.currentCost,
            currency
          )}
          description="Current contract value"
          icon={DollarSign}
          iconClass="bg-[#EAF3FF] text-[#4F9CF9]"
        />

        <MetricCard
          label="Potential savings"
          value={formatCurrency(
            renewal.potentialSaving,
            currency
          )}
          description={`${Number(
            renewal.currentCost || 0
          ) > 0
            ? (
                (Number(
                  renewal.potentialSaving || 0
                ) /
                  Number(
                    renewal.currentCost
                  )) *
                100
              ).toFixed(1)
            : "0.0"}% of current spend`}
          icon={TrendingDown}
          iconClass="bg-[#E8F7F0] text-[#22A06B]"
        />

        <MetricCard
          label="Renewal date"
          value={formatDate(
            renewal.renewalDate
          )}
          description={
            renewal.daysUntilRenewal <= 30
              ? "Action recommended soon"
              : "Renewal is approaching"
          }
          icon={CalendarDays}
          iconClass="bg-[#EEEAFE] text-[#7C5CFC]"
        />

        <MetricCard
          label="Readiness score"
          value={`${renewal.readinessScore || 0}%`}
          description="Renewal preparation"
          icon={Target}
          iconClass="bg-[#F4F5FA] text-[#667085]"
        />
      </section>

      <section className="mt-6 rounded-2xl border border-[#DCD5FF] bg-[#FAF9FF] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEEAFE] text-[#7C5CFC]">
              <Sparkles size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7C5CFC]">
                SpendShield recommendation
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[#171A21]">
                {Number(renewal.potentialSaving || 0) > 0
                  ? "Review savings opportunities before renewing"
                  : "Review renewal before commitment"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                SpendShield identified{" "}
                <span className="font-semibold text-[#22A06B]">
                  {formatCurrency(
                    renewal.potentialSaving,
                    currency
                  )}{" "}
                  in potential savings
                </span>
                . Review available scenarios and select
                the action that best fits the business.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit rounded-full bg-[#E8F7F0] px-3 py-1.5 text-xs font-semibold text-[#22A06B]">
            {renewal.opportunityCount || 0}{" "}
            {(renewal.opportunityCount || 0) === 1
              ? "opportunity"
              : "opportunities"}
          </span>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-[#E7E9F0] bg-white p-6 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-[#171A21]">
              Business impact scenarios
            </h2>

            <p className="mt-1 text-sm text-[#667085]">
              Compare possible actions before making the
              renewal decision.
            </p>
          </div>

          <div className="space-y-3">
            {scenarios.map((scenario) => {
              const selected =
                selectedScenario ===
                scenario.title;

              return (
                <button
                  key={scenario.title}
                  type="button"
                  onClick={() =>
                    setSelectedScenario(
                      scenario.title
                    )
                  }
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-[#BEB3FF] bg-[#FAF9FF]"
                      : "border-[#E7E9F0] bg-white hover:bg-[#FCFCFE]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-[#7C5CFC] bg-[#7C5CFC]"
                            : "border-[#D9DCE6]"
                        }`}
                      >
                        {selected && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[#171A21]">
                            {scenario.title}
                          </p>

                          {scenario.recommended && (
                            <span className="rounded-full bg-[#EEEAFE] px-2 py-0.5 text-[10px] font-semibold text-[#7C5CFC]">
                              Recommended
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-[#667085]">
                          {scenario.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-[#171A21]">
                        {formatCurrency(
                          scenario.cost,
                          currency
                        )}
                      </p>

                      <p
                        className={`mt-1 text-xs font-medium ${
                          scenario.saving === 0
                            ? "text-[#98A2B3]"
                            : "text-[#22A06B]"
                        }`}
                      >
                        {formatCurrency(
                          scenario.saving,
                          currency
                        )}{" "}
                        saving
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E7E9F0] bg-white p-6 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
          <div className="mb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#171A21]">
                  Make a decision
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  Record the action you want to take for this renewal.
                </p>
              </div>

              {savedDecision && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E8F7F0] px-2.5 py-1 text-[11px] font-semibold text-[#22A06B]">
                  <CheckCircle2 size={13} />
                  Saved
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[#F7F8FC] p-4">
            <p className="text-xs font-medium text-[#98A2B3]">
              Selected scenario
            </p>

            <p className="mt-1 text-sm font-semibold text-[#171A21]">
              {selectedScenario}
            </p>

            {selectedScenarioData && (
              <div className="mt-3 flex items-center justify-between border-t border-[#E7E9F0] pt-3">
                <span className="text-xs text-[#98A2B3]">
                  Estimated saving
                </span>

                <span className="text-sm font-semibold text-[#22A06B]">
                  {formatCurrency(
                    selectedScenarioData.saving,
                    currency
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-2">
            {[
              "Approve selected scenario",
              "Send for approval",
              "Keep decision open",
            ].map((action) => (
              <button
                key={action}
                type="button"
                disabled={Boolean(savedDecision) || savingDecision}
                onClick={() => handleDecision(action)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                  decision === action
                    ? "border-[#BEB3FF] bg-[#FAF9FF] text-[#7C5CFC]"
                    : "border-[#E7E9F0] text-[#667085] hover:bg-[#F4F5FA]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span>{action}</span>

                {decision === action && (
                  <CheckCircle2 size={17} />
                )}
              </button>
            ))}
          </div>

          {saveError && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-medium leading-5 text-[#E35D6A]">
                {saveError}
              </p>
            </div>
          )}

          {savedDecision && (
            <div className="mt-4 rounded-xl border border-[#D7F0E3] bg-[#F4FBF7] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F7F0] text-[#22A06B]">
                  <CheckCircle2 size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#171A21]">
                    Decision saved successfully
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                    {savedDecision.action} for {savedDecision.scenario}. The decision is now recorded for this renewal.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#D7F0E3] bg-white p-3">
                  <p className="text-[11px] font-medium text-[#98A2B3]">
                    Selected action
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#171A21]">
                    {savedDecision.scenario}
                  </p>
                </div>

                <div className="rounded-xl border border-[#D7F0E3] bg-white p-3">
                  <p className="text-[11px] font-medium text-[#98A2B3]">
                    Estimated saving
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#22A06B]">
                    {formatCurrency(savedDecision.estimatedSaving, currency)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={
              !decision ||
              !selectedScenarioData ||
              savingDecision ||
              Boolean(savedDecision)
            }
            onClick={handleSaveDecision}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7C5CFC] text-sm font-medium text-white transition hover:bg-[#6E4FE8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingDecision ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving decision...
              </>
            ) : savedDecision ? (
              <>
                <CheckCircle2 size={16} />
                Decision saved
              </>
            ) : (
              <>
                Save decision
                <ArrowUpRight size={16} />
              </>
            )}
          </button>

          {savedDecision && (
            <Link
              href="/decisions"
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#E7E9F0] bg-white text-sm font-medium text-[#667085] transition hover:bg-[#F7F8FC] hover:text-[#171A21]"
            >
              View Decisions
              <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </section>

      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#E7E9F0]">
            <div className="flex items-center justify-between border-b border-[#E7E9F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEAFE] text-[#7C5CFC]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#171A21]">
                    Renewal Evidence & Audit Trail
                  </h3>
                  <p className="text-xs text-[#98A2B3]">
                    Verified data & telemetry for {renewal.productName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="rounded-lg p-1 text-[#98A2B3] transition hover:bg-[#F4F5FA] hover:text-[#667085]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between rounded-xl border border-[#E7E9F0] bg-[#FAF9FF] p-3 text-xs">
                <div className="flex items-center gap-2 text-[#7C5CFC]">
                  <Lock size={14} />
                  <span className="font-semibold">SHA-256 Hash Verification:</span>
                </div>
                <code className="text-[11px] text-[#667085] font-mono">
                  8f9b3a21e74c...91fe
                </code>
              </div>

              <div className="rounded-xl border border-[#E7E9F0] p-4 bg-[#FAFAFC]">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7C5CFC]">Overall Audit Risk Assessment</p>
                  <span className="rounded-full bg-[#FFF6DD] px-2 py-0.5 text-[10px] font-semibold text-[#D99A16]">
                    Moderate Risk Level
                  </span>
                </div>
                <p className="text-[11px] text-[#667085] mb-2">Calculated from price inflation spikes and active license underutilization.</p>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div style={{ width: "65%" }} className="bg-[#D99A16] h-full" />
                </div>
              </div>

              <div className="rounded-xl border border-[#E7E9F0] p-4 bg-[#FAFAFC]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7C5CFC]">Vendor Profile</p>
                  <span className="rounded-full bg-[#E8F7F0] px-2 py-0.5 text-[10px] font-semibold text-[#22A06B]">
                    Verified Source
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#98A2B3]">Vendor:</span> <span className="font-medium text-[#171A21]">{renewal.vendorName}</span>
                  </div>
                  <div>
                    <span className="text-[#98A2B3]">Category:</span> <span className="font-medium text-[#171A21]">{renewal.category}</span>
                  </div>
                  <div>
                    <span className="text-[#98A2B3]">Auto-Renewal:</span> <span className="font-medium text-[#171A21]">{renewal.autoRenew ? "Enabled" : "Disabled"}</span>
                  </div>
                  <div>
                    <span className="text-[#98A2B3]">Urgency:</span> <span className="font-medium text-[#E35D6A]">{renewal.urgency}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E7E9F0] p-4 bg-[#FAFAFC]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7C5CFC] mb-2">Contract & Financial Audit</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085]">Current Annual Cost:</span>
                    <span className="font-semibold text-[#171A21] text-sm">{formatCurrency(renewal.currentCost, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085]">Previous Contract Value:</span>
                    <span className="font-semibold text-[#171A21]">{formatCurrency(renewal.previousCost, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085]">Price Variance / Inflation:</span>
                    <span className="font-semibold text-[#E35D6A]">{Number(renewal.priceIncreasePercent || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E7E9F0] p-4 bg-[#FAFAFC]">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7C5CFC]">License Metrics & Waste</p>
                  <span className="text-xs font-medium text-[#D99A16]">
                    {Math.round(((renewal.activeSeats || 0) / (renewal.totalSeats || 1)) * 100)}% Utilization
                  </span>
                </div>
                
                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex mb-3">
                  <div 
                    style={{ width: `${Math.min(100, Math.max(0, ((renewal.activeSeats || 0) / (renewal.totalSeats || 1)) * 100))}%` }} 
                    className="bg-[#22A06B] h-full transition-all"
                  />
                  <div 
                    style={{ width: `${Math.min(100, Math.max(0, ((renewal.unusedSeats || 0) / (renewal.totalSeats || 1)) * 100))}%` }} 
                    className="bg-[#D99A16] h-full transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#E7E9F0]">
                  <div className="bg-white p-2 rounded-lg border border-[#E7E9F0]">
                    <p className="text-[10px] text-[#98A2B3]">Total</p>
                    <p className="text-xs font-bold text-[#171A21]">{renewal.totalSeats}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#E7E9F0]">
                    <p className="text-[10px] text-[#22A06B]">Active</p>
                    <p className="text-xs font-bold text-[#22A06B]">{renewal.activeSeats}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#E7E9F0]">
                    <p className="text-[10px] text-[#D99A16]">Unused</p>
                    <p className="text-xs font-bold text-[#D99A16]">{renewal.unusedSeats}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E7E9F0] pt-4">
              <span className="text-[11px] text-[#98A2B3]">
                Audit ID: AUD-{renewal.id.slice(0, 8).toUpperCase()}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(renewal, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `audit-report-${renewal.productName.toLowerCase()}.json`;
                    a.click();
                    setToastMessage("Audit report downloaded successfully.");
                    setShowToast(true);
                    window.setTimeout(() => setShowToast(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E9F0] bg-white px-3 py-2 text-xs font-medium text-[#667085] transition hover:bg-[#F4F5FA]"
                >
                  <Download size={14} />
                  Export Report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = `Audit Report: ${renewal.productName}\nVendor: ${renewal.vendorName}\nCost: ${formatCurrency(renewal.currentCost, currency)}\nUnused Seats: ${renewal.unusedSeats}`;
                    navigator.clipboard.writeText(text);
                    setToastMessage("Audit summary successfully copied to clipboard.");
                    setShowToast(true);
                    window.setTimeout(() => setShowToast(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7E9F0] bg-white px-3 py-2 text-xs font-medium text-[#667085] transition hover:bg-[#F4F5FA]"
                >
                  <Copy size={14} />
                  Copy Summary
                </button>
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="rounded-xl bg-[#7C5CFC] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#6E4FE8]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-[#E7E9F0] bg-white p-4 shadow-[0_12px_32px_rgba(16,24,40,0.12)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              saveError
                ? "bg-[#FDECEE] text-[#E35D6A]"
                : "bg-[#E8F7F0] text-[#22A06B]"
            }`}
          >
            {saveError ? (
              <AlertTriangle size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-[#171A21]">
              {saveError ? "Action failed" : "Notification"}
            </p>

            <p className="mt-1 text-xs leading-5 text-[#667085]">
              {toastMessage || (saveError ? saveError : "Operation completed successfully.")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="text-[#98A2B3] transition hover:text-[#667085]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <span className="hidden">
        {renewalId}
      </span>
    </main>
  );
}

function MetricCard({
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
    <div className="rounded-2xl border border-[#E7E9F0] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#667085]">
          {label}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold text-[#171A21]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#98A2B3]">
        {description}
      </p>
    </div>
  );
}

function ContextItem({
  label,
  value,
  valueClass = "text-[#171A21]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E7E9F0] p-4">
      <p className="text-xs font-medium text-[#98A2B3]">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

interface EvidenceRowProps {
  label: string;
  value: string;
  icon: React.ElementType;
  valueClass?: string;
}

function EvidenceRow({
  label,
  value,
  icon: Icon,
  valueClass = "text-[#171A21]",
}: EvidenceRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E7E9F0] p-4">
      <div className="flex items-center gap-3">
        <Icon
          size={15}
          className="text-[#98A2B3]"
        />

        <span className="text-xs font-medium text-[#667085]">
          {label}
        </span>
      </div>

      <span
        className={`text-sm font-semibold ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}