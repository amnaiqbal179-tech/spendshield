"use client";

import { useEffect, useState } from "react";
import { Wrench, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SoftwareTool {
  id: string;
  softwareName: string;
  reason: string;
  estimatedCost: number;
  status: string;
  updatedAt: string;
  department?: {
    name: string;
  };
}

export default function MyToolsPage() {
  const [tools, setTools] = useState<SoftwareTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyTools() {
      try {
        const res = await fetch("/api/my-tools");
        if (res.ok) {
          const data = await res.json();
          setTools(data);
        }
      } catch (error) {
        console.error("Failed to load tools", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMyTools();
  }, []);

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-3">
              <Sparkles size={14} /> My Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Assigned Software & Tools</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
              Access software licenses, SaaS subscriptions, and digital tools approved for your department.
            </p>
          </div>
          <Link
            href="/employee/catalog"
            className="self-start sm:self-auto inline-flex items-center gap-2 bg-white text-[#7C5CFC] hover:bg-[#F4F1FE] text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0"
          >
            Browse Software Catalog
          </Link>
        </div>
      </div>

      {/* Tools List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-[#7C5CFC] border-r-transparent align-[-0.125em]" />
          <p className="text-xs text-[#98A2B3] mt-2">Loading your assigned tools...</p>
        </div>
      ) : tools.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-12 text-center shadow-2xs">
          <div className="h-12 w-12 rounded-full bg-[#F4F5F7] flex items-center justify-center text-[#98A2B3] mx-auto mb-3">
            <Wrench size={22} />
          </div>
          <p className="text-sm font-bold text-[#171A21]">No approved tools found yet</p>
          <p className="text-xs text-[#98A2B3] mt-1 max-w-md mx-auto">
            Once your software requests are approved by your manager, your active licenses will appear right here.
          </p>
          <Link
            href="/requests"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#7C5CFC] hover:bg-[#6b4ae2] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Request New Tool
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white p-5 rounded-2xl border border-[#E7E9F0] shadow-2xs hover:shadow-sm hover:border-[#7C5CFC]/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-[#EEEAFE] text-[#7C5CFC] flex items-center justify-center font-bold text-base">
                    {tool.softwareName.charAt(0).toUpperCase()}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#027A48] bg-[#D1FADF] px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} /> Active License
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#171A21]">{tool.softwareName}</h3>
                <p className="text-xs text-[#98A2B3] mt-0.5">
                  Department: <span className="font-semibold text-[#667085]">{tool.department?.name || "General"}</span>
                </p>
                <div className="mt-3 bg-[#FAFAFC] border border-[#E7E9F0] p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-[#667085]">
                    <span className="font-bold text-[#171A21]">Justification:</span> {tool.reason}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs text-[#98A2B3]">
                <span>Approved on {new Date(tool.updatedAt).toLocaleDateString()}</span>
                <span className="font-bold text-[#7C5CFC] flex items-center gap-1">
                  Ready to use <ExternalLink size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}