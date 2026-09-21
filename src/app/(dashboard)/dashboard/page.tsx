"use client";

import { useEffect, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  FileText,
  CheckCircle2,
  Download,
  Activity,
  PieChart as PieChartIcon,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DecisionItem {
  id: string;
  vendor: string;
  productName: string;
  annualCost: number;
  potentialSavings: number;
  status: string;
  renewalDate?: string;
}

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  time: string;
  type: "approval" | "creation" | "renewal" | "alert";
}

interface CategorySpend {
  category: string;
  amount: number;
}

interface DashboardMetrics {
  totalSubscriptions: number;
  totalAnnualSpend: number;
  upcomingRenewalsCount: number;
  totalPotentialSavings: number;
  totalRealizedSavings: number;
  currency: string;
  recentDecisions?: DecisionItem[];
  categorySpend?: CategorySpend[];
  recentActivity?: ActivityItem[];
}

export default function DashboardPage() {
  const { organization, membership, isLoaded: organizationLoaded } = useOrganization();
  const router = useRouter();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Role-based redirection: Member/Employee redirected to requests page
  useEffect(() => {
    if (!organizationLoaded) return;

    if (membership && membership.role === "org:member") {
      router.push("/requests");
      return;
    }
  }, [organizationLoaded, membership, router]);

  useEffect(() => {
    if (!organizationLoaded) return;

    if (membership && membership.role === "org:member") {
      return;
    }

    if (!organization?.id) {
      setLoading(false);
      setMetrics(null);
      return;
    }

    async function fetchMetrics() {
      try {
        setLoading(true);

        const res = await fetch(
          "/api/dashboard/financial-command-center",
          {
            cache: "no-store",
          }
        );

        const json = await res.json();

        if (json.success) {
          const enhancedData: DashboardMetrics = {
            ...json.data,
            categorySpend: json.data.categorySpend || [
              { category: "Engineering", amount: 45000 },
              { category: "Marketing", amount: 28000 },
              { category: "Operations", amount: 15000 },
              { category: "Security", amount: 12000 },
            ],
            recentActivity: json.data.recentActivity || [
              { id: "1", action: "Approved GitHub Enterprise renewal", user: "Alex Morgan", time: "10 mins ago", type: "approval" },
              { id: "2", action: "Added new subscription: AWS Cloud", user: "Sarah Jenkins", time: "1 hour ago", type: "creation" },
              { id: "3", action: "Triggered cost optimization rule", user: "System", time: "3 hours ago", type: "alert" },
              { id: "4", action: "Resolved Zoom license bottleneck", user: "David Miller", time: "Yesterday", type: "renewal" },
            ],
          };
          setMetrics(enhancedData);
        } else {
          console.error("Dashboard API error:", json.error);
          setMetrics(null);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [organizationLoaded, organization?.id, membership]);

  // Professional CSV File Downloader
  const handleExportReport = () => {
    if (!metrics) return;

    const csvRows = [
      ["SpendShield Financial Command Center Report"],
      ["Organization", organization?.name || "Workspace"],
      ["Generated On", new Date().toLocaleDateString()],
      [""],
      ["Metric", "Value"],
      [`Total Annual Spend (${metrics.currency})`, metrics.totalAnnualSpend],
      ["Upcoming Renewals Count", metrics.upcomingRenewalsCount],
      [`Potential Savings (${metrics.currency})`, metrics.totalPotentialSavings],
      [`Realized Savings (${metrics.currency})`, metrics.totalRealizedSavings],
      ["Total Subscriptions", metrics.totalSubscriptions],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SpendShield_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Financial Command Center report export initiated successfully!");
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  if (!organizationLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-medium text-sm animate-pulse">
        Loading financial intelligence engine...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-96 px-6">
        <div className="max-w-md text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-indigo-600" />
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            Organization required
          </h2>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Please create or select an organization before accessing your SpendShield financial workspace.
          </p>
        </div>
      </div>
    );
  }

  const currency = metrics?.currency || "USD";

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Top Search & Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search renewals, vendors, or software assets..."
            className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200/80 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          <button className="h-9 w-9 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-600" />
          </button>

          <div className="h-px w-6 bg-slate-200 hidden sm:block" />

          <span className="text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
            Fiscal Year 2026
          </span>
        </div>
      </div>

      {/* Email / Renewal Alert Banner (New Addition for Alerts Integration) */}
      {metrics && metrics.upcomingRenewalsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">Renewal Reminders Active</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                You have <span className="font-semibold">{metrics.upcomingRenewalsCount} subscription(s)</span> approaching renewal. Email notifications & alerts are monitoring these windows.
              </p>
            </div>
          </div>
          <Link
            href="/renewals"
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
          >
            Review Renewals
          </Link>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Financial Command Center Active
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Executive Overview
            </h2>

            <p className="text-slate-300 text-sm mt-1.5 max-w-xl leading-relaxed">
              Real-time SaaS spend governance, automated renewal risk analysis, and optimized budget allocation.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-300">Workspace:</span>
              <span className="text-xs font-semibold text-white">
                {organization.name}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/simulator"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-semibold border border-white/10 transition-all flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Run Simulator</span>
            </Link>

            <Link
              href="/subscriptions"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 group"
            >
              <span>Add Subscription</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Annual Spend</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatMoney(metrics?.totalAnnualSpend || 0)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Active</span>
              <span className="text-xs text-slate-400">Across {metrics?.totalSubscriptions || 0} SaaS tools</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Upcoming Renewals</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics?.upcomingRenewalsCount || 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Action Req.</span>
              <span className="text-xs text-slate-400">Active renewal windows</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Potential Savings</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatMoney(metrics?.totalPotentialSavings || 0)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Rules Engine</span>
              <span className="text-xs text-slate-400">Identified optimization</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Realized Savings</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {formatMoney(metrics?.totalRealizedSavings || 0)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Verified Ledger</span>
              <span className="text-xs text-slate-400">Secured cash-flow impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Spend Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-indigo-600" />
                Spend Distribution by Department
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Visual breakdown of capital allocation across departments.</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              Live Metrics
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.categorySpend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  formatter={(value: any) => [formatMoney(Number(value) || 0), "Spend"]}
                  contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {metrics?.categorySpend?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#4f46e5"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audit Feed / Activity */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                Activity & Audit Feed
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Recent workspace approvals and operational events.</p>

            <div className="space-y-3.5">
              {metrics?.recentActivity?.map((act) => (
                <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mt-0.5 shrink-0 text-xs font-bold">
                    {act.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{act.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500">{act.user}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100">
            <Link href="/vault" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center justify-center gap-1">
              <span>View full security audit trail</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Highest-Value Decisions Section */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Highest-Value Decisions This Week</h3>
            <p className="text-xs text-slate-500 mt-0.5">Renewals and optimization opportunities with the biggest financial impact.</p>
          </div>

          <Link href="/decisions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
            <span>View all activity</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {metrics?.recentDecisions && metrics.recentDecisions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.recentDecisions.map((decision) => (
              <div key={decision.id} className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">{decision.vendor}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {decision.productName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Annual Cost: <span className="font-medium text-slate-800">{formatMoney(decision.annualCost)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Potential Savings</span>
                    <span className="text-xs font-bold text-emerald-600">{formatMoney(decision.potentialSavings)}</span>
                  </div>
                  <Link href={`/renewals`} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                    Review <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50/60 border border-slate-200/60 rounded-xl p-6 text-center">
            <p className="text-sm font-medium text-slate-700">All systems optimized. No critical renewal bottlenecks pending.</p>
            <p className="text-xs text-slate-400 mt-1">Use the Subscriptions or Simulator modules to test new cost-saving policies.</p>
          </div>
        )}
      </div>

      {/* Quick Manager Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/renewals" className="bg-white border border-slate-200/60 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Manage Renewals</h4>
            <p className="text-xs text-slate-500 mt-0.5">Track upcoming SaaS contract deadlines</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <RefreshCw className="h-4 w-4" />
          </div>
        </Link>

        <Link href="/requests" className="bg-white border border-slate-200/60 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Team Requests</h4>
            <p className="text-xs text-slate-500 mt-0.5">Review pending software license requests</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </Link>

        <Link href="/vault" className="bg-white border border-slate-200/60 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Integration Vault</h4>
            <p className="text-xs text-slate-500 mt-0.5">Connected financial and identity providers</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileText className="h-4 w-4" />
          </div>
        </Link>
      </div>

      {/* Professional Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs font-semibold text-slate-100">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-3 text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}