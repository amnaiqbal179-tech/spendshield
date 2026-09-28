"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, Send, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

function RequestFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const softwareQuery = searchParams.get("software") || "";

  const [softwareName, setSoftwareName] = useState(softwareQuery);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (softwareQuery) {
      setSoftwareName(softwareQuery);
    }
  }, [softwareQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!softwareName.trim() || !reason.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          softwareName,
          reason,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/employee/requests");
      } else {
        setError(data.error || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Request submission error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-3 text-white">
              <Sparkles size={14} /> New Request
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Request Software</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
              Submit a request for software license or tool required for your work.
            </p>
          </div>
          <Link
            href="/employee/catalog"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all border border-white/20"
          >
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 sm:p-8 shadow-2xs">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#171A21] uppercase tracking-wider mb-2">
              Software / Tool Name
            </label>
            <input
              type="text"
              value={softwareName}
              onChange={(e) => setSoftwareName(e.target.value)}
              placeholder="e.g. Figma, GitHub, Notion"
              className="w-full px-4 py-3 text-sm rounded-xl border border-[#E7E9F0] focus:outline-none focus:border-[#7C5CFC] transition-all bg-[#FAFAFC]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A21] uppercase tracking-wider mb-2">
              Business Justification / Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explain why you need this software and how it helps in your daily workflow..."
              className="w-full px-4 py-3 text-sm rounded-xl border border-[#E7E9F0] focus:outline-none focus:border-[#7C5CFC] transition-all bg-[#FAFAFC] resize-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/employee/catalog"
              className="px-5 py-2.5 text-xs font-bold text-[#667085] hover:bg-[#F2F4F7] rounded-xl transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#7C5CFC] hover:bg-[#6b4ae2] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send size={14} /> Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewSoftwareRequestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#98A2B3]">Loading form...</div>}>
      <RequestFormContent />
    </Suspense>
  );
}