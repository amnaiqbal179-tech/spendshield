"use client";

import { useState } from "react";
import { FileText, Sparkles, ShieldCheck, AlertTriangle, FileSearch, CheckCircle2, Upload, ArrowRight } from "lucide-react";

export default function ContractsPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [activeContract, setActiveContract] = useState<any>(null);

  const sampleContracts = [
    {
      vendor: "Adobe Creative Cloud",
      fileName: "Adobe_Enterprise_Agreement_2026.pdf",
      fileSize: "2.4 MB",
      uploadDate: "Sep 12, 2026",
      extractedClauses: [
        { title: "Cancellation Notice Period", detail: "60-day written notice required prior to Oct 15 renewal date.", risk: "HIGH", alert: "Auto-renews for 12 months if missed." },
        { title: "Price Hike Cap", detail: "Annual price increase capped at maximum 8% per seat.", risk: "MEDIUM", alert: "Vendor requested 12% hike in latest quote." },
        { title: "Unused License Transfer", detail: "Licenses can be reallocated between departments at zero fee.", risk: "LOW", alert: "Use to reduce seat waste." },
        { title: "Security & Compliance", detail: "SOC2 Type II, ISO27001, GDPR Compliant.", risk: "LOW", alert: "Passed security audit." }
      ],
      aiRecommendation: "Send cancellation notice before Aug 15 or negotiate the 12% price hike down to the 8% contract cap to save $6,000/yr."
    },
    {
      vendor: "GitHub Enterprise",
      fileName: "GitHub_Master_Services_2025.pdf",
      fileSize: "1.8 MB",
      uploadDate: "Aug 04, 2026",
      extractedClauses: [
        { title: "Notice Deadline", detail: "30-day notice prior to renewal date.", risk: "MEDIUM", alert: "Renewal date is in 12 days." },
        { title: "True-up True-down", detail: "Quarterly seat true-down permitted.", risk: "LOW", alert: "6 unused seats can be removed immediately." }
      ],
      aiRecommendation: "Execute quarterly seat true-down immediately to eliminate 6 inactive developer seats and save $600/month."
    }
  ];

  const handleSimulateScan = (contract: any) => {
    setAnalyzing(true);
    setActiveContract(null);
    setTimeout(() => {
      setActiveContract(contract);
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-3">
              <Sparkles size={14} /> AI Contract Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Contract Analyzer & Clause Extractor</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
              Upload vendor agreement PDFs to automatically extract notice periods, price caps, penalty clauses, and SLA guarantees.
            </p>
          </div>
        </div>
      </div>

      {/* Upload & Sample Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Box */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-[#E7E9F0] shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-[#171A21]">Upload Contract PDF</h3>
          <p className="text-xs text-[#667085]">AI will parse hidden cancellation deadlines and price caps.</p>
          
          <div className="border-2 border-dashed border-[#BEB3FF] hover:border-[#7C5CFC] rounded-2xl p-6 text-center bg-[#FAF9FF] hover:bg-[#EEEAFE]/50 transition-all relative">
            <Upload size={32} className="text-[#7C5CFC] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#171A21]">Drag & drop contract PDF here</p>
            <p className="text-[11px] text-[#98A2B3] mt-1">Supports PDF, DOCX up to 25MB</p>
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-2">Or Analyze Sample Contracts:</p>
            <div className="space-y-2">
              {sampleContracts.map((c) => (
                <button
                  key={c.vendor}
                  onClick={() => handleSimulateScan(c)}
                  className="w-full p-3 rounded-xl border border-[#E7E9F0] bg-[#FAFAFC] hover:bg-[#EEEAFE] hover:border-[#7C5CFC] text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-[#7C5CFC]" />
                    <span className="text-xs font-bold text-[#171A21] group-hover:text-[#7C5CFC]">{c.vendor}</span>
                  </div>
                  <ArrowRight size={14} className="text-[#98A2B3] group-hover:text-[#7C5CFC]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis Display */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E7E9F0] shadow-2xs min-h-[400px]">
          {analyzing ? (
            <div className="py-24 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#7C5CFC] border-r-transparent" />
              <p className="text-sm font-bold text-[#171A21]">AI is analyzing contract clauses...</p>
              <p className="text-xs text-[#98A2B3]">Extracting notice periods, price caps, and SLA terms</p>
            </div>
          ) : !activeContract ? (
            <div className="py-24 text-center space-y-2">
              <FileSearch size={40} className="text-[#98A2B3] mx-auto" />
              <h3 className="text-base font-bold text-[#171A21]">No Contract Selected</h3>
              <p className="text-xs text-[#98A2B3] max-w-sm mx-auto">
                Select one of the sample contracts on the left or upload a PDF to view AI extracted legal and financial clauses.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#F2F4F7]">
                <div>
                  <span className="text-[11px] font-bold text-[#7C5CFC] uppercase tracking-wider">AI Extracted Agreement</span>
                  <h2 className="text-xl font-bold text-[#171A21]">{activeContract.vendor}</h2>
                  <p className="text-xs text-[#667085] mt-0.5">{activeContract.fileName} • {activeContract.fileSize}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#027A48] bg-[#D1FADF] px-3 py-1 rounded-full">
                  <ShieldCheck size={14} /> AI Verified
                </span>
              </div>

              {/* AI Executive Recommendation */}
              <div className="bg-[#FAF9FF] border border-[#DCD5FF] p-4 rounded-xl flex items-start gap-3">
                <Sparkles size={20} className="text-[#7C5CFC] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#7C5CFC] uppercase tracking-wider">AI Recommendation</p>
                  <p className="text-xs font-semibold text-[#171A21] mt-1 leading-relaxed">{activeContract.aiRecommendation}</p>
                </div>
              </div>

              {/* Clauses List */}
              <div>
                <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-3">Extracted Key Clauses & Restrictions</h4>
                <div className="space-y-3">
                  {activeContract.extractedClauses.map((clause: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-[#E7E9F0] bg-[#FAFAFC] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#171A21]">{clause.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          clause.risk === "HIGH" ? "bg-[#FEE4E2] text-[#B42318]" : clause.risk === "MEDIUM" ? "bg-[#FEF3D6] text-[#B54708]" : "bg-[#D1FADF] text-[#027A48]"
                        }`}>
                          {clause.risk} RISK
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] leading-relaxed">{clause.detail}</p>
                      <p className="text-[11px] font-semibold text-[#7C5CFC] pt-1 flex items-center gap-1">
                        <CheckCircle2 size={12} /> {clause.alert}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
