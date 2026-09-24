
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDemoData } from "@/lib/demo-data";
import HomeInteractiveComponents from "@/components/home/HomeInteractiveComponents";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";

const workflow = [
  {
    number: "01",
    title: "Detect",
    description:
      "Identify upcoming renewals, cancellation deadlines, cost changes, and high-risk subscriptions before they become urgent.",
    icon: BellRing,
  },
  {
    number: "02",
    title: "Analyze",
    description:
      "Understand license usage, annual cost, price increases, business criticality, and potential financial impact.",
    icon: BarChart3,
  },
  {
    number: "03",
    title: "Simulate",
    description:
      "Compare renew, reduce, downgrade, negotiate, cancel, or replace scenarios before committing company spend.",
    icon: Target,
  },
  {
    number: "04",
    title: "Recommend",
    description:
      "Get an explainable recommendation based on financial benefit, usage fit, risk, criticality, and effort.",
    icon: Sparkles,
  },
  {
    number: "05",
    title: "Approve",
    description:
      "Route the decision through the right department, finance, procurement, or leadership approval flow.",
    icon: FileCheck2,
  },
  {
    number: "06",
    title: "Measure",
    description:
      "Track what was implemented and separate potential savings from the savings actually realized.",
    icon: CircleDollarSign,
  },
];

const features = [
  {
    title: "Renewal Intelligence",
    description:
      "Know which renewals need attention and why, with readiness scores and deadline intelligence.",
    icon: RefreshCw,
  },
  {
    title: "Savings Opportunities",
    description:
      "Surface unused licenses, expensive plans, price increases, and other potential savings opportunities.",
    icon: TrendingDown,
  },
  {
    title: "Business Impact Simulator",
    description:
      "Compare different renewal decisions and see estimated cost, savings, and business risk.",
    icon: BarChart3,
  },
  {
    title: "Explainable Recommendations",
    description:
      "Every recommendation comes with the evidence behind it instead of being a black-box decision.",
    icon: Sparkles,
  },
  {
    title: "Approval Workflow",
    description:
      "Move important renewal decisions through the right internal approval hierarchy.",
    icon: FileCheck2,
  },
  {
    title: "Savings Ledger",
    description:
      "Track savings from potential to validated, approved, implemented, and finally realized.",
    icon: ShieldCheck,
  },
];

const pricing = [
  {
    name: "Starter",
    price: "$79",
    description:
      "For small teams getting control of recurring software spend.",
    features: [
      "Subscription management",
      "Renewal tracking",
      "Savings opportunities",
      "Basic decision workflow",
    ],
  },
  {
    name: "Growth",
    price: "$199",
    description:
      "For growing companies that need structured renewal decisions.",
    features: [
      "Everything in Starter",
      "Renewal intelligence",
      "Decision simulator",
      "Approval workflows",
      "Savings ledger",
    ],
    popular: true,
  },
  {
    name: "Business",
    price: "$499",
    description:
      "For larger organizations with more complex financial workflows.",
    features: [
      "Everything in Growth",
      "Advanced controls",
      "Multi-level approvals",
      "Financial forecasting",
      "Priority support",
    ],
  },
];

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number, currency: string) {
  const symbol =
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? "$";

  if (Math.abs(value) >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    const decimals = value >= 100_000 ? 0 : 1;
    return `${symbol}${(value / 1_000).toFixed(decimals)}K`;
  }

  return formatCurrency(value, currency);
}

function getDaysUntil(date: string | Date) {
  const renewalDate = new Date(date);
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startOfRenewal = new Date(
    renewalDate.getFullYear(),
    renewalDate.getMonth(),
    renewalDate.getDate()
  );

  return Math.max(
    0,
    Math.ceil(
      (startOfRenewal.getTime() - startOfToday.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

export default async function Home() {
  const { isSignedIn, orgId } = await auth();

  if (isSignedIn) {
    if (orgId) {
      redirect("/dashboard");
    }

    redirect("/organization");
  }

  const demo = await getDemoData();

  const { organization, metrics, priorityRenewals } = demo;

  const currency = organization.currency || "USD";

  const savingsProgress =
    metrics.potentialSavings > 0
      ? Math.min(
          100,
          Math.round(
            (metrics.verifiedSavings / metrics.potentialSavings) * 100
          )
        )
      : 0;

  const dashboardMetrics = [
    [
      formatCompactCurrency(metrics.renewalSpend, currency),
      "Renewal spend",
    ],
    [
      formatCompactCurrency(metrics.potentialSavings, currency),
      "Potential savings",
    ],
    [String(metrics.highPriorityRenewals), "High priority"],
    [
      formatCompactCurrency(metrics.verifiedSavings, currency),
      "Verified savings",
    ],
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8FC] text-[#171A21]">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute right-[-200px] top-[700px] h-[500px] w-[500px] rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/[0.05] bg-[#F7F8FC]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635BFF] text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={20} strokeWidth={2.2} />
            </div>

            <div>
              <div className="text-[17px] font-bold tracking-tight">
                SpendShield
              </div>

              <div className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400 sm:block">
                Renewal Intelligence
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-500 lg:flex">
            <a href="#product" className="transition hover:text-gray-900">
              Product
            </a>

            <a href="#workflow" className="transition hover:text-gray-900">
              How It Works
            </a>

            <a href="#savings" className="transition hover:text-gray-900">
              Savings
            </a>

            <a href="#pricing" className="transition hover:text-gray-900">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-gray-900 sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/sign-up"
              className="group flex items-center gap-2 rounded-xl bg-[#635BFF] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:bg-[#554DF0]"
            >
              Get started

              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-8 sm:pt-12 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-24 lg:pt-12">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-indigo-600 shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              SaaS Renewal Savings & Decision Engine
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[68px]">
              Turn every software renewal into a{" "}
              <span className="bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] bg-clip-text text-transparent">
                measurable financial decision.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#667085] sm:text-xl">
              SpendShield helps growing companies detect renewal risk,
              uncover savings opportunities, compare decisions, manage
              approvals, and verify the savings they actually achieve.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-[#554DF0]"
              >
                Start saving

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#workflow"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300"
              >
                See how it works
                <ChevronRight size={16} />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs font-medium text-gray-400">
              <span className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" />
                Built for 50–500 employee companies
              </span>

              <span className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" />
                No raw card data stored
              </span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[32px] bg-indigo-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-300/30">
              {/* Browser top */}
              <div className="flex h-11 items-center gap-2 border-b border-gray-100 px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />

                <div className="ml-3 flex h-6 flex-1 items-center rounded-md bg-gray-50 px-3 font-mono text-[10px] text-gray-400">
                  app.spendshield.io/dashboard
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      Financial Command Center
                    </p>

                    <h3 className="mt-1 text-xl font-bold tracking-tight">
                      Renewal Overview
                    </h3>
                  </div>

                  <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600">
                    This month
                  </div>
                </div>

                {/* Dynamic database metrics */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {dashboardMetrics.map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-gray-100 bg-[#FAFBFD] p-3"
                    >
                      <p className="text-lg font-bold tracking-tight">
                        {value}
                      </p>

                      <p className="mt-1 text-[9px] font-medium text-gray-400">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Dynamic savings progress */}
                <div className="mt-5 rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-400">
                        Savings progress
                      </p>

                      <p className="mt-1 text-sm font-bold">
                        {formatCurrency(
                          metrics.verifiedSavings,
                          currency
                        )}{" "}
                        realized
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-emerald-600">
                      {savingsProgress}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#635BFF] transition-all"
                      style={{
                        width: `${savingsProgress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 text-[9px] text-gray-400">
                    <span>Potential</span>
                    <span>Validated</span>
                    <span>Implemented</span>
                    <span>Realized</span>
                  </div>
                </div>

                {/* Dynamic priority renewals */}
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500">
                      Priority renewals
                    </p>

                    <span className="text-[10px] font-semibold text-indigo-600">
                      View all
                    </span>
                  </div>

                  <div className="space-y-2">
                    {priorityRenewals.slice(0, 3).map((renewal) => {
                      const days = getDaysUntil(renewal.renewalDate);

                      return (
                        <div
                          key={renewal.id}
                          className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-600">
                              {renewal.vendor
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-xs font-semibold">
                                {renewal.vendor}
                              </p>

                              <p className="text-[9px] text-gray-400">
                                {formatCurrency(
                                  renewal.annualCost,
                                  currency
                                )}{" "}
                                · {days} days
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-bold text-emerald-600">
                              +
                              {formatCurrency(
                                renewal.potentialSaving,
                                currency
                              )}
                            </p>

                            <p className="text-[9px] text-gray-400">
                              potential
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / positioning */}
      <section className="border-y border-gray-200/70 bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-7 text-center sm:flex-row sm:text-left lg:px-8">
          <p className="text-sm font-medium text-gray-500">
            Built around one financial question:
          </p>

          <p className="text-sm font-bold text-gray-800">
            What should we do about this renewal — and what did we actually
            save?
          </p>
        </div>
      </section>

      {/* Interactive Live Engines & Sandbox */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <HomeInteractiveComponents />
      </section>

      {/* Problem */}
      <section
        id="product"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              The problem
            </p>

            <h2 className="mt-4 max-w-lg text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
              Software renewals shouldn&apos;t run on spreadsheets and
              last-minute decisions.
            </h2>

            <p className="mt-6 max-w-lg leading-7 text-[#667085]">
              As companies grow, subscription information becomes fragmented
              across departments, contracts, invoices, spreadsheets, and
              emails. The result is expensive decisions made under time
              pressure.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Unused licenses",
                text: "Companies keep paying for seats that are no longer actively used.",
                icon: Users,
              },
              {
                title: "Expensive plans",
                text: "Teams may pay for capacity or features that their current needs do not justify.",
                icon: TrendingDown,
              },
              {
                title: "Price increases",
                text: "Vendor price changes can create unexpected renewal costs.",
                icon: Zap,
              },
              {
                title: "Missed deadlines",
                text: "Late cancellation or notice decisions can trigger another billing period.",
                icon: BellRing,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={19} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-y border-gray-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              The SpendShield workflow
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
              From upcoming renewals to verified savings.
            </h2>

            <p className="mt-5 leading-7 text-[#667085]">
              SpendShield connects the entire renewal decision process in one
              structured financial workflow.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflow.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.number}
                  className="relative rounded-2xl border border-gray-200 bg-[#FAFBFD] p-6 transition hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest text-gray-300">
                      {item.number}
                    </span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="mt-6 text-xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Savings */}
      <section id="savings" className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Savings truth
              </p>

              <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Potential savings are not the same as realized savings.
              </h2>

              <p className="mt-6 max-w-xl leading-7 text-[#667085]">
                SpendShield keeps financial forecasts honest by tracking
                savings through a clear progression — from the first
                opportunity to the amount the company actually realizes.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Potential Saving",
                  "Validated",
                  "Approved",
                  "Implemented",
                  "Realized",
                ].map((stage, index) => (
                  <div
                    key={stage}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                      {index + 1}
                    </div>

                    <span className="text-sm font-semibold text-gray-700">
                      {stage}
                    </span>

                    {index === 4 && (
                      <span className="ml-auto text-xs font-bold text-emerald-600">
                        Financial result
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-200/50 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Savings ledger
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    $5,900
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Verified realized savings
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600">
                  Verified
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  ["Potential", "$8,000", 100],
                  ["Validated", "$6,500", 81],
                  ["Approved", "$6,500", 81],
                  ["Implemented", "$5,900", 74],
                  ["Realized", "$5,900", 74],
                ].map(([label, amount, width]) => (
                  <div key={label as string}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-500">
                        {label}
                      </span>

                      <span className="font-bold text-gray-800">
                        {amount}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#635BFF]"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-[#F7F8FC] p-5">
                <p className="text-xs font-semibold text-gray-400">
                  The SpendShield principle
                </p>

                <p className="mt-2 text-sm font-bold leading-6 text-gray-800">
                  Measure what was actually saved — not just what the system
                  predicted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-gray-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Built for decisions
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
              Everything needed to make renewal decisions with confidence.
            </h2>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-200 p-6 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-gray-200/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={19} />
                  </div>

                  <h3 className="mt-6 text-lg font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="relative overflow-hidden rounded-3xl bg-[#171A21] px-6 py-16 text-center shadow-2xl sm:px-12">
            <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-300">
                <ShieldCheck size={23} />
              </div>

              <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-[-0.035em] text-white sm:text-5xl">
                Make your next renewal a financial decision — not an
                automatic expense.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-400">
                Bring subscriptions, renewal intelligence, decisions,
                approvals, and verified savings into one workflow.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-gray-900 transition hover:-translate-y-0.5 hover:bg-gray-100"
                >
                  Get started

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-t border-gray-200/70 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Simple pricing
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
              A plan that grows with your company.
            </h2>

            <p className="mt-5 leading-7 text-[#667085]">
              Start with the workflow you need today and expand as your
              financial operations mature.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-7 ${
                  plan.popular
                    ? "border-indigo-300 bg-indigo-50/30 shadow-xl shadow-indigo-100/40"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-5 top-5 rounded-full bg-[#635BFF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most popular
                  </div>
                )}

                <p className="text-sm font-bold text-gray-800">
                  {plan.name}
                </p>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>

                  <span className="pb-1 text-sm text-gray-400">
                    /month
                  </span>
                </div>

                <p className="mt-4 min-h-[48px] text-sm leading-6 text-gray-500">
                  {plan.description}
                </p>

                <Link
                  href="/sign-up"
                  className={`mt-7 flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-[#635BFF] text-white hover:bg-[#554DF0]"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Get started
                </Link>

                <div className="mt-7 border-t border-gray-200 pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Includes
                  </p>

                  <div className="mt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2.5 text-sm text-gray-600"
                      >
                        <Check
                          size={15}
                          className="shrink-0 text-emerald-500"
                        />

                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Pricing shown is illustrative for the project proposal and can
            be adjusted after customer validation.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#F7F8FC]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF] text-white">
                  <ShieldCheck size={17} />
                </div>

                <span className="font-bold tracking-tight">
                  SpendShield
                </span>
              </Link>

              <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
                SaaS Renewal Savings & Decision Engine.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-gray-500">
              <a href="#product" className="hover:text-gray-900">
                Product
              </a>

              <a href="#workflow" className="hover:text-gray-900">
                How it works
              </a>

              <a href="#savings" className="hover:text-gray-900">
                Savings
              </a>

              <a href="#pricing" className="hover:text-gray-900">
                Pricing
              </a>

              <Link href="/dashboard" className="hover:text-gray-900">
                Command Center
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-gray-200 pt-6 text-xs text-gray-400 sm:flex-row">
            <p>© 2026 SpendShield. All rights reserved.</p>

            <div className="flex items-center gap-2">
              <LockKeyhole size={13} />
              Organization-level data isolation
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
