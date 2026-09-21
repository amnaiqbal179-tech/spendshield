"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  DollarSign,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

type MonthlyForecastItem = {
  month: string;
  spend: string;
  savings: string;
  width: string;
};

type RenewalItem = {
  name: string;
  date: string;
  spend: string;
  savings: string;
  risk: "Critical" | "At Risk" | "On Track";
};

export default function ForecastPage() {
  const [monthlyForecast, setMonthlyForecast] = useState<MonthlyForecastItem[]>([]);
  const [upcomingRenewals, setUpcomingRenewals] = useState<RenewalItem[]>([]);
  const [metrics, setMetrics] = useState({
    projectedSpend: "$272.6K",
    projectedSavings: "$47.3K",
    savingsCoverage: "17.4%",
    spendExposure: "+8.6%",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/forecast")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setMonthlyForecast(resData.data.monthlyForecast);
          setUpcomingRenewals(resData.data.upcomingRenewals);
          setMetrics(resData.data.metrics);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch forecast data:", err);
        setLoading(false);
      });
  }, []);

  // Helper function to parse currency strings like "$12.5K", "$1,200", "$2.4M" into raw numbers for accurate chart scaling
  const parseAmountToNumber = (val: string) => {
    if (!val) return 0;
    const cleanStr = val.replace(/[^0-9.]/g, "");
    let num = parseFloat(cleanStr) || 0;
    if (val.toUpperCase().includes("K")) num *= 1000;
    if (val.toUpperCase().includes("M")) num *= 1000000;
    return num;
  };

  // Calculate real maximum value across all months for dynamic proportional scaling
  const maxSpendValue = monthlyForecast.length > 0
    ? Math.max(...monthlyForecast.map((item) => parseAmountToNumber(item.spend)), 1)
    : 1000;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC] text-sm font-medium text-[#667085]">
        Loading forecast...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] p-6 lg:p-8">
      {/* HEADER */}
      <section className="mb-8">
        <p className="mb-1 text-sm font-medium text-[#667085]">
          Financial Planning
        </p>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#171A21]">
              Financial Forecast
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
              See how upcoming renewals may affect software spend and where
              identified savings could improve your financial outlook.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#E7E9F0] bg-white px-4 py-2.5 shadow-[0_2px_6px_rgba(16,24,40,0.03)]">
            <CalendarDays className="h-4 w-4 text-[#7C5CFC]" />

            <div>
              <p className="text-xs text-[#98A2B3]">Forecast period</p>
              <p className="text-sm font-medium text-[#171A21]">
                Sep 2026 — Feb 2027
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORECAST METRICS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ForecastMetric
          title="Projected Renewal Spend"
          value={metrics.projectedSpend}
          description="Next 6 months"
          icon={DollarSign}
          iconBg="bg-[#EEEAFE]"
          iconColor="text-[#7C5CFC]"
        />

        <ForecastMetric
          title="Projected Savings"
          value={metrics.projectedSavings}
          description="If identified opportunities are captured"
          icon={PiggyBank}
          iconBg="bg-[#E8F7F0]"
          iconColor="text-[#22A06B]"
        />

        <ForecastMetric
          title="Savings Coverage"
          value={metrics.savingsCoverage}
          description="Of projected renewal spend"
          icon={TrendingUp}
          iconBg="bg-[#EAF3FF]"
          iconColor="text-[#4F9CF9]"
        />

        <ForecastMetric
          title="Spend Exposure"
          value={metrics.spendExposure}
          description="Compared with previous period"
          icon={ArrowUpRight}
          iconBg="bg-[#FFF6DD]"
          iconColor="text-[#D99A16]"
        />
      </section>

      {/* FORECAST CHART */}
      <section className="mt-8 rounded-2xl border border-[#E7E9F0] bg-white p-6 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-lg font-semibold text-[#171A21]">
              Renewal spend forecast
            </h2>
            <p className="mt-1 text-sm text-[#667085]">
              Projected renewal spend and savings opportunities by month based on live data.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#667085]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D9DCE6]" />
              Renewal spend
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#7C5CFC]" />
              Savings
            </div>
          </div>
        </div>

        {/* REAL DYNAMIC SCALED CHART CONTAINER */}
        <div className="mt-8">
          <div className="flex h-[280px] items-end gap-3 border-b border-l border-[#E7E9F0] px-3 pb-2 sm:gap-5">
            {monthlyForecast && monthlyForecast.length > 0 ? (
              monthlyForecast.map((item) => {
                const spendNum = parseAmountToNumber(item.spend);
                const savingsNum = parseAmountToNumber(item.savings);

                // Dynamically calculate height percentage relative to the maximum spend in database (Max container height ~220px)
                const spendHeightPct = Math.max(12, Math.min(100, (spendNum / maxSpendValue) * 100));
                const savingsHeightPct = Math.max(8, Math.min(100, (savingsNum / maxSpendValue) * 100));

                return (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 flex-col justify-end"
                  >
                    <div className="flex h-full items-end justify-center gap-1 sm:gap-2">
                      {/* Spend Bar (Dynamic scaling based on real database values) */}
                      <div
                        className="w-4 rounded-t-md bg-[#D9DCE6] transition-all duration-300 hover:bg-[#C9CCD6] sm:w-7"
                        style={{ height: `${spendHeightPct}%` }}
                        title={`${item.spend} projected spend`}
                      />
                      {/* Savings Bar (Dynamic scaling based on real database values) */}
                      <div
                        className="w-4 rounded-t-md bg-[#7C5CFC] transition-all duration-300 hover:bg-[#6D4FF0] sm:w-7"
                        style={{ height: `${savingsHeightPct}%` }}
                        title={`${item.savings} projected savings`}
                      />
                    </div>

                    <div className="mt-3 text-center">
                      <p className="text-xs font-medium text-[#667085]">
                        {item.month}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[#98A2B3]">
                No monthly forecast data available.
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {monthlyForecast?.map((item) => (
              <div key={item.month} className="rounded-xl bg-[#FCFCFE] p-3">
                <p className="text-xs font-medium text-[#98A2B3]">{item.month}</p>
                <p className="mt-1 text-sm font-semibold text-[#171A21]">
                  {item.spend}
                </p>
                <p className="mt-1 text-xs font-medium text-[#22A06B]">
                  {item.savings} savings
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCIAL OUTLOOK */}
      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#E7E9F0] bg-white p-6 shadow-[0_4px_12px_rgba(16,24,40,0.04)] lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#171A21]">
                Financial outlook
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                Current forecast compared with expected optimized spend.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F0] text-[#22A06B]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <OutlookItem
              label="Baseline Spend"
              value={metrics.projectedSpend}
              description="Without optimization"
            />
            <OutlookItem
              label="Optimized Spend"
              value="$225.3K"
              description="After identified savings"
            />
            <OutlookItem
              label="Potential Impact"
              value={metrics.projectedSavings}
              description="17.4% improvement"
              positive
            />
          </div>

          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#667085]">
                Potential optimization
              </span>
              <span className="text-xs font-semibold text-[#22A06B]">17.4%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#F4F5FA]">
              <div className="h-full w-[68%] rounded-full bg-[#22A06B]" />
            </div>
          </div>
        </div>

        {/* FORECAST NOTE */}
        <div className="rounded-2xl border border-[#E7E9F0] bg-white p-6 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEEAFE] text-[#7C5CFC]">
            <PiggyBank className="h-5 w-5" />
          </div>

          <h3 className="mt-5 text-sm font-semibold text-[#171A21]">
            Forecast insight
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            The largest savings opportunity is concentrated around upcoming renewals. 
            Earlier decisions give the team more time to negotiate or consolidate spend.
          </p>

          <div className="mt-5 rounded-xl bg-[#F8F6FF] p-4">
            <p className="text-xs font-medium text-[#7C5CFC]">Potential savings</p>
            <p className="mt-1 text-xl font-semibold text-[#171A21]">{metrics.projectedSavings}</p>
            <p className="mt-1 text-xs text-[#667085]">
              Reflected from live database records.
            </p>
          </div>
        </div>
      </section>

      {/* UPCOMING RENEWALS */}
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#171A21]">
            Upcoming financial exposure
          </h2>
          <p className="mt-1 text-sm text-[#667085]">
            Renewals that currently contribute to the near-term forecast.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E7E9F0] bg-white shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
          <div className="hidden grid-cols-[1.6fr_1fr_0.9fr_0.9fr_0.9fr_0.7fr] gap-4 border-b border-[#E7E9F0] bg-[#FCFCFE] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#98A2B3] lg:grid">
            <span>Software</span>
            <span>Renewal Date</span>
            <span>Spend</span>
            <span>Potential Saving</span>
            <span>Risk</span>
            <span>Open</span>
          </div>

          {upcomingRenewals.map((renewal, index) => (
            <div
              key={renewal.name + index}
              className={`grid grid-cols-1 gap-4 px-5 py-5 transition hover:bg-[#FCFCFE] lg:grid-cols-[1.6fr_1fr_0.9fr_0.9fr_0.9fr_0.7fr] lg:items-center ${
                index !== upcomingRenewals.length - 1
                  ? "border-b border-[#E7E9F0]"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5FA] text-sm font-semibold text-[#171A21]">
                  {renewal.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-[#171A21]">{renewal.name}</p>
                  <p className="mt-1 text-xs text-[#98A2B3]">Renewal exposure</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#98A2B3] lg:hidden">Renewal Date</p>
                <p className="mt-1 text-sm font-medium text-[#171A21]">
                  {renewal.date}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#98A2B3] lg:hidden">Spend</p>
                <p className="mt-1 text-sm font-medium text-[#171A21]">
                  {renewal.spend}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#98A2B3] lg:hidden">Potential Saving</p>
                <p className="mt-1 text-sm font-semibold text-[#22A06B]">
                  {renewal.savings}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#98A2B3] lg:hidden">Risk</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    renewal.risk === "Critical"
                      ? "bg-[#FDECEE] text-[#E35D6A]"
                      : renewal.risk === "At Risk"
                      ? "bg-[#FFF6DD] text-[#D99A16]"
                      : "bg-[#E8F7F0] text-[#22A06B]"
                  }`}
                >
                  {renewal.risk}
                </span>
              </div>

              <div>
                <button className="flex items-center gap-1.5 text-sm font-medium text-[#7C5CFC] transition hover:text-[#6245DC]">
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="mt-8 rounded-2xl border border-[#E7E9F0] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FF] text-[#4F9CF9]">
            <ArrowDownRight className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#171A21]">
              Forecasts are decision-support estimates
            </p>
            <p className="mt-1 text-xs leading-5 text-[#667085]">
              Projected savings are based on currently identified opportunities
              and should be treated as estimates until opportunities are
              implemented and verified.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function ForecastMetric({
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
    <div className="rounded-2xl border border-[#E7E9F0] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,24,40,0.07)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#667085]">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[#171A21]">
            {value}
          </p>
          <p className="mt-1 text-xs text-[#98A2B3]">{description}</p>
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

function OutlookItem({
  label,
  value,
  description,
  positive = false,
}: {
  label: string;
  value: string;
  description: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#E7E9F0] bg-[#FCFCFE] p-4">
      <p className="text-xs font-medium text-[#98A2B3]">{label}</p>
      <p
        className={`mt-2 text-xl font-semibold ${
          positive ? "text-[#22A06B]" : "text-[#171A21]"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-[#98A2B3]">{description}</p>
    </div>
  );
}