"use client";

import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle2, XCircle, PlusCircle, ArrowRight, Sparkles, Activity } from "lucide-react";
import Link from "next/link";

export default function EmployeeOverviewPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRequests(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching requests:", err);
        setLoading(false);
      });
  }, []);

  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "PENDING").length;
  const approvedRequests = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="w-full space-y-6 pb-10">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-3">
              <Sparkles size={14} /> Employee Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome to Your Workspace</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
              Track your software requests, monitor real-time approvals, and streamline your workflow productivity.
            </p>
          </div>
          <Link
            href="/requests"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#7C5CFC] shadow-md hover:bg-[#F4F1FE] transition-all shrink-0"
          >
            <PlusCircle size={18} className="text-[#7C5CFC]" />
            <span className="text-[#7C5CFC]">New Software Request</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={loading ? "..." : totalRequests}
          icon={FileText}
          borderColor="border-l-[#7C5CFC]"
          iconBg="bg-[#EEEAFE] text-[#7C5CFC]"
        />
        <StatCard
          title="Pending Approval"
          value={loading ? "..." : pendingRequests}
          icon={Clock}
          borderColor="border-l-[#F79009]"
          iconBg="bg-[#FEF3D6] text-[#F79009]"
        />
        <StatCard
          title="Approved Tools"
          value={loading ? "..." : approvedRequests}
          icon={CheckCircle2}
          borderColor="border-l-[#039855]"
          iconBg="bg-[#D1FADF] text-[#039855]"
        />
        <StatCard
          title="Rejected Requests"
          value={loading ? "..." : rejectedRequests}
          icon={XCircle}
          borderColor="border-l-[#F04438]"
          iconBg="bg-[#FEE4E2] text-[#F04438]"
        />
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Action Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E9F0] shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-[#7C5CFC]/40 transition-all">
          <div>
            <div className="h-11 w-11 rounded-xl bg-[#EEEAFE] flex items-center justify-center text-[#7C5CFC] mb-4">
              <Activity size={22} />
            </div>
            <h3 className="text-base font-bold text-[#171A21]">Need a new tool?</h3>
            <p className="text-sm text-[#667085] mt-1.5 leading-relaxed">
              Submit your request for any software, plugin, or SaaS subscription required for your daily tasks. Management will review it shortly.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#F2F4F7]">
            <Link
              href="/requests"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#7C5CFC] hover:text-[#6A48EE] transition-colors"
            >
              Go to Request Manager <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E7E9F0] shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#171A21]">Recent Requests History</h3>
              <p className="text-xs text-[#98A2B3] mt-0.5">Your latest software submissions</p>
            </div>
            <Link 
              href="/requests" 
              className="text-xs font-semibold text-[#7C5CFC] bg-[#EEEAFE] px-3 py-1.5 rounded-lg hover:bg-[#E3DCFE] transition-colors"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-[#7C5CFC] border-r-transparent align-[-0.125em]" />
              <p className="text-xs text-[#98A2B3] mt-2">Loading your requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#E7E9F0] rounded-xl">
              <p className="text-sm font-medium text-[#171A21]">No software requests found</p>
              <p className="text-xs text-[#98A2B3] mt-1">Get started by creating your first request.</p>
              <Link
                href="/requests"
                className="inline-flex items-center gap-2 mt-3 text-xs font-bold text-white bg-[#7C5CFC] px-3.5 py-2 rounded-lg shadow-2xs hover:bg-[#6c48fc] transition-all"
              >
                <PlusCircle size={14} /> Create Request
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#E7E9F0] bg-[#FAFAFC] hover:bg-white hover:shadow-2xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white border border-[#E7E9F0] flex items-center justify-center text-[#7C5CFC] font-bold text-sm shadow-2xs">
                      {req.softwareName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#171A21]">{req.softwareName}</h4>
                      <p className="text-xs text-[#98A2B3] mt-0.5">
                        Cost: <span className="font-semibold text-[#667085]">${req.estimatedCost || 0}</span> • {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full tracking-wide ${
                        req.status === "PENDING"
                          ? "bg-[#FEF3D6] text-[#B54708]"
                          : req.status === "APPROVED"
                          ? "bg-[#D1FADF] text-[#027A48]"
                          : "bg-[#FEE4E2] text-[#B42318]"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

function StatCard({ title, value, icon: Icon, borderColor, iconBg }: { title: string; value: string | number; icon: any; borderColor: string; iconBg: string }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-[#E7E9F0] border-l-4 ${borderColor} shadow-2xs flex items-center justify-between transition-all hover:shadow-sm`}>
      <div>
        <p className="text-xs font-semibold tracking-wide text-[#667085] uppercase">{title}</p>
        <h4 className="text-2xl font-black text-[#171A21] mt-1">{value}</h4>
      </div>
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} shadow-2xs`}>
        <Icon size={22} strokeWidth={2.2} />
      </div>
    </div>
  );
}