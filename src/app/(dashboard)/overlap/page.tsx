"use client";

import { useState } from "react";
import { CopyCheck, Sparkles, TrendingDown, Layers, ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ToolOverlapPage() {
  const [resolvedOverlap, setResolvedOverlap] = useState<string[]>([]);

  const overlapItems = [
    {
      id: "overlap-1",
      category: "Design & Prototyping",
      toolA: "Figma Enterprise",
      costA: 14400,
      usersA: 40,
      toolB: "Canva Business",
      costB: 3600,
      usersB: 25,
      overlapType: "Feature Redundancy",
      description: "25 employees use Canva for simple social assets while having full Figma licenses. Consolidating simple design templates into Figma seats can save $3,600/yr.",
      potentialSavings: 3600,
      recommendation: "Standardize on Figma Enterprise and cancel unassigned Canva Business plan."
    },
    {
      id: "overlap-2",
      category: "Video Conferencing",
      toolA: "Zoom Business",
      costA: 9600,
      usersA: 60,
      toolB: "Google Meet (Workspace)",
      costB: 0, // Included in Workspace
      usersB: 60,
      overlapType: "Duplicate Solution",
      description: "Company already pays for Google Workspace Enterprise which includes Google Meet. Zoom Business is duplicating 100% of conferencing capabilities.",
      potentialSavings: 9600,
      recommendation: "Migrate internal video calls to Google Meet and non-renew Zoom."
    },
    {
      id: "overlap-3",
      category: "Project Management",
      toolA: "Jira Software",
      costA: 18000,
      usersA: 85,
      toolB: "Notion Pro",
      costB: 4200,
      usersB: 35,
      overlapType: "Task Tracking Overlap",
      description: "Marketing team uses Notion for task tracking while Engineering uses Jira. Consolidating workflows saves $4,200/yr.",
      potentialSavings: 4200,
      recommendation: "Integrate Marketing roadmap into Jira and downgrade Notion to documentation tier."
    }
  ];

  const handleResolve = (id: string) => {
    setResolvedOverlap([...resolvedOverlap, id]);
  };

  const activeOverlaps = overlapItems.filter(item => !resolvedOverlap.includes(item.id));
  const totalRedundantSpend = activeOverlaps.reduce((sum, item) => sum + item.potentialSavings, 0);

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-3">
              <Sparkles size={14} /> Redundancy Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Software Tool Overlap Engine</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
              Detect duplicate SaaS subscriptions, overlapping features, and multi-vendor waste across departments.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-4 rounded-xl text-right shrink-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Identified Redundant Waste</p>
            <p className="text-2xl font-black text-white">${totalRedundantSpend.toLocaleString()}/yr</p>
          </div>
        </div>
      </div>

      {/* Overlap Cards List */}
      <div className="space-y-4">
        {activeOverlaps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E9F0] p-12 text-center shadow-2xs">
            <CheckCircle2 size={40} className="text-[#027A48] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#171A21]">All Tool Overlaps Resolved! 🎉</h3>
            <p className="text-xs text-[#98A2B3] mt-1 max-w-md mx-auto">
              Your software inventory is fully optimized with zero redundant subscriptions detected.
            </p>
          </div>
        ) : (
          activeOverlaps.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#E7E9F0] p-6 shadow-2xs hover:shadow-sm transition-all space-y-5">
              
              {/* Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2F4F7]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#EEEAFE] text-[#7C5CFC] flex items-center justify-center">
                    <Layers size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7C5CFC] uppercase tracking-wider">{item.category}</span>
                    <h3 className="text-base font-bold text-[#171A21]">{item.toolA} <span className="text-[#98A2B3] font-normal">vs</span> {item.toolB}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FEF3D6] text-[#B54708] text-xs font-bold">
                    {item.overlapType}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#D1FADF] text-[#027A48] text-xs font-bold">
                    Potential Saving: ${item.potentialSavings.toLocaleString()}/yr
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FAFAFC] border border-[#E7E9F0] p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#171A21]">{item.toolA}</span>
                    <span className="text-xs font-semibold text-[#667085]">${item.costA.toLocaleString()}/yr</span>
                  </div>
                  <p className="text-[11px] text-[#98A2B3]">{item.usersA} Active Seats Managed</p>
                </div>

                <div className="bg-[#FAF9FF] border border-[#BEB3FF] p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#7C5CFC]">{item.toolB} (Redundant)</span>
                    <span className="text-xs font-semibold text-[#7C5CFC]">${item.costB.toLocaleString()}/yr</span>
                  </div>
                  <p className="text-[11px] text-[#667085]">{item.usersB} Active Seats Overlapping</p>
                </div>
              </div>

              {/* AI Justification & Action */}
              <div className="bg-[#F8F9FE] border border-[#E7E9F0] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#667085] leading-relaxed">{item.description}</p>
                  <p className="text-xs font-bold text-[#171A21] mt-1">Recommended Consolidation: {item.recommendation}</p>
                </div>

                <button
                  onClick={() => handleResolve(item.id)}
                  className="px-4 py-2 bg-[#7C5CFC] hover:bg-[#6b4ae2] text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center gap-1.5"
                >
                  Consolidate & Save ${item.potentialSavings.toLocaleString()} <ArrowRight size={14} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
