"use client";

import { useEffect, useState } from "react";
import { Sparkles, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import Link from "next/link";

interface RequestItem {
  id: string;
  softwareName: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/requests");
        if (res.ok) {
          const data = await res.json();
          setRequests(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load requests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#027A48] bg-[#D1FADF] px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B42318] bg-[#FEE4E2] px-2.5 py-1 rounded-full">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B54708] bg-[#FEF0C7] px-2.5 py-1 rounded-full">
            <Clock size={12} /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-3 text-white">
              <Sparkles size={14} /> Tracking
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Software Requests</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
              Track the approval status of your software and license requests.
            </p>
          </div>
          <Link
            href="/employee/catalog"
            className="inline-flex items-center gap-2 bg-white text-[#7C5CFC] hover:bg-[#F4F1FE] text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 !text-[#7C5CFC]"
          >
            <Plus size={14} /> New Request
          </Link>
        </div>
      </div>

      {/* Requests Table / List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-[#7C5CFC] border-r-transparent align-[-0.125em]" />
          <p className="text-xs text-[#98A2B3] mt-2">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-12 text-center shadow-2xs">
          <p className="text-sm font-bold text-[#171A21]">No requests submitted yet</p>
          <p className="text-xs text-[#98A2B3] mt-1">Browse software catalog to request tools you need.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {requests.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-[#E7E9F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#171A21]">{item.softwareName}</h3>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-xs text-[#667085] mt-1">
                  <span className="font-semibold">Reason:</span> {item.reason}
                </p>
              </div>
              <div className="text-xs text-[#98A2B3] shrink-0">
                Requested on {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}