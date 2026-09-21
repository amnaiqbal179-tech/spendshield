"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, ShieldCheck, DollarSign } from "lucide-react";

interface ApprovalItem {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_CHANGES";
  comment?: string | null;
  createdAt: string;
  User?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  decision?: {
    softwareName?: string;
    reason?: string;
    estimatedCost?: number;
  } | null;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/approvals");
      if (res.ok) {
        const json = await res.json();
        // /api/approvals direct array return kar raha hai
        setApprovals(Array.isArray(json) ? json : json.data || []);
      }
    } catch (error) {
      console.error("Failed to load approvals", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED" | "NEEDS_CHANGES", comment?: string) => {
    try {
      const res = await fetch("/api/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, comment }),
      });

      if (res.ok) {
        setRejectingId(null);
        setCommentText("");
        await fetchApprovals();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating approval:", error);
    }
  };

  const filteredApprovals = approvals.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  const totalCount = approvals.length;
  const pendingCount = approvals.filter((r) => r.status === "PENDING").length;
  const approvedCount = approvals.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = approvals.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#F7F8FC] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171A21]">Manager Approvals Dashboard</h1>
          <p className="text-sm text-[#667085] mt-1">Review, approve or reject software procurement requests from team members.</p>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter("ALL")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === "ALL" ? "bg-white border-[#7C5CFC] shadow-sm ring-1 ring-[#7C5CFC]/20" : "bg-white border-[#E7E9F0] hover:border-[#98A2B3]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wider">All Requests</span>
            <ShieldCheck size={18} className="text-[#7C5CFC]" />
          </div>
          <p className="text-2xl font-bold text-[#171A21] mt-2">{totalCount}</p>
        </button>

        <button
          onClick={() => setFilter("PENDING")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === "PENDING" ? "bg-white border-amber-500 shadow-sm ring-1 ring-amber-500/20" : "bg-white border-[#E7E9F0] hover:border-[#98A2B3]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wider">Pending</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-[#171A21] mt-2">{pendingCount}</p>
        </button>

        <button
          onClick={() => setFilter("APPROVED")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === "APPROVED" ? "bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/20" : "bg-white border-[#E7E9F0] hover:border-[#98A2B3]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wider">Approved</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-[#171A21] mt-2">{approvedCount}</p>
        </button>

        <button
          onClick={() => setFilter("REJECTED")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === "REJECTED" ? "bg-white border-rose-500 shadow-sm ring-1 ring-rose-500/20" : "bg-white border-[#E7E9F0] hover:border-[#98A2B3]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wider">Rejected</span>
            <XCircle size={18} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-[#171A21] mt-2">{rejectedCount}</p>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#E7E9F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E7E9F0] flex justify-between items-center">
          <h2 className="font-bold text-base text-[#171A21]">
            Software Requests <span className="text-xs font-normal text-[#98A2B3] ml-1">({filteredApprovals.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#98A2B3] text-sm">Loading requests...</div>
        ) : filteredApprovals.length === 0 ? (
          <div className="p-16 text-center text-[#98A2B3] text-sm">No requests found for this filter.</div>
        ) : (
          <div className="divide-y divide-[#E7E9F0]">
            {filteredApprovals.map((item) => {
              const softwareName = item.decision?.softwareName || "Software Request";
              const reason = item.decision?.reason || "No description provided.";
              const cost = item.decision?.estimatedCost ? Number(item.decision.estimatedCost) : 0;
              const requesterName = item.User?.name || item.User?.email || "Team Member";

              return (
                <div key={item.id} className="p-6 space-y-4 hover:bg-[#F7F8FC]/40 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-[#171A21]">{softwareName}</h3>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            item.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#667085]">{reason}</p>
                      <p className="text-xs text-[#98A2B3]">Requested by: <span className="font-medium text-[#667085]">{requesterName}</span></p>
                    </div>

                    {/* Actions for Pending */}
                    {item.status === "PENDING" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={15} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(item.id)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs text-[#98A2B3] pt-2 border-t border-[#E7E9F0]/60">
                    {cost > 0 && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} className="text-[#667085]" />
                        Est. Cost: <strong className="text-[#171A21]">${cost.toLocaleString()}</strong>
                      </span>
                    )}
                    {cost > 0 && <span>•</span>}
                    <span>Requested on: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Rejection / Comment input prompt */}
                  {rejectingId === item.id && (
                    <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3 mt-3">
                      <label className="block text-xs font-semibold text-rose-900">Provide a reason for rejection:</label>
                      <input
                        type="text"
                        placeholder="e.g., Budget constraints for this quarter"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-white border border-rose-300 rounded-xl px-3.5 py-2 text-xs text-[#171A21] focus:outline-none focus:border-rose-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-3 py-1.5 bg-white border border-[#E7E9F0] text-[#667085] text-xs font-semibold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, "REJECTED", commentText)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}

                  {item.comment && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800">
                      <strong>Comment / Reason:</strong> {item.comment}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}