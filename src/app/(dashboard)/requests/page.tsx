"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Clock, CheckCircle2, XCircle, FileText, DollarSign } from "lucide-react";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface SoftwareRequestItem {
  id: string;
  softwareName: string;
  reason: string;
  estimatedCost: number;
  status: RequestStatus;
  rejectionReason?: string | null;
  createdAt: string;
}

export default function EmployeeRequestsPage() {
  const [requests, setRequests] = useState<SoftwareRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [softwareName, setSoftwareName] = useState("");
  const [reason, setReason] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/requests");
      if (res.ok) {
        const json = await res.json();
        setRequests(json.data || []);
      }
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!softwareName.trim() || !reason.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          softwareName,
          reason,
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
        }),
      });

      if (res.ok) {
        setSoftwareName("");
        setReason("");
        setEstimatedCost("");
        await fetchMyRequests();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics counts
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#F7F8FC] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#171A21]">My Software Requests</h1>
          <p className="text-sm text-[#667085] mt-1">Request new tools for your workflow and track approval progress.</p>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E7E9F0] shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#EEEAFE] flex items-center justify-center text-[#7C5CFC]">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-[#98A2B3]">Total Requests</p>
            <p className="text-xl font-bold text-[#171A21] mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E9F0] shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-[#98A2B3]">Pending</p>
            <p className="text-xl font-bold text-[#171A21] mt-0.5">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E9F0] shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-[#98A2B3]">Approved</p>
            <p className="text-xl font-bold text-[#171A21] mt-0.5">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E9F0] shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-[#98A2B3]">Rejected</p>
            <p className="text-xl font-bold text-[#171A21] mt-0.5">{rejectedCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Submission Form (Left/Top) */}
        <div className="lg:col-span-1 bg-white border border-[#E7E9F0] rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-[#171A21] mb-4 flex items-center gap-2">
            <PlusCircle size={18} className="text-[#7C5CFC]" />
            New Software Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">Software Name *</label>
              <input
                type="text"
                placeholder="e.g., Figma, Notion"
                value={softwareName}
                onChange={(e) => setSoftwareName(e.target.value)}
                className="w-full bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl px-3.5 py-2.5 text-sm text-[#171A21] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C5CFC] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">Estimated Cost ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3] text-sm">$</span>
                <input
                  type="number"
                  placeholder="15"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-[#171A21] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C5CFC] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1.5">Reason for Request *</label>
              <textarea
                placeholder="Explain why you need this tool..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl px-3.5 py-2.5 text-sm text-[#171A21] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C5CFC] transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#7C5CFC] hover:bg-[#6c48fc] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>

        {/* Requests History List (Right/Bottom) */}
        <div className="lg:col-span-2 bg-white border border-[#E7E9F0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E7E9F0] font-bold text-[#171A21] flex justify-between items-center">
            <span>Request History</span>
            <span className="text-xs font-medium bg-[#F7F8FC] text-[#667085] px-2.5 py-1 rounded-lg border border-[#E7E9F0]">
              {requests.length} total
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#98A2B3] text-sm">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-[#98A2B3] text-sm">No software requests submitted yet.</div>
          ) : (
            <div className="divide-y divide-[#E7E9F0] overflow-y-auto max-h-[500px]">
              {requests.map((item) => (
                <div key={item.id} className="p-5 space-y-3 hover:bg-[#F7F8FC]/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-base text-[#171A21]">{item.softwareName}</h3>
                      <p className="text-sm text-[#667085] mt-1">{item.reason}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold shrink-0 ${
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

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#98A2B3] pt-1">
                    <span>Est. Cost: <strong className="text-[#171A21]">${Number(item.estimatedCost).toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Requested on: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {item.status === "REJECTED" && item.rejectionReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                      <strong>Rejection Reason:</strong> {item.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}