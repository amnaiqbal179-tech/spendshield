"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Check, TrendingDown, DollarSign, Calculator, ChevronDown, HelpCircle, Layers, CheckCircle2, X } from "lucide-react";
import Link from "next/link";

export default function HomeInteractiveComponents() {
  const [employees, setEmployees] = useState(150);
  const [activeScenario, setActiveScenario] = useState("Reduce");
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic Savings Calculator Math
  const annualSpend = employees * 1200; // Average $1200/employee/yr
  const seatWasteSavings = Math.round(annualSpend * 0.18); // 18% seat waste
  const negotiationSavings = Math.round(annualSpend * 0.12); // 12% negotiation savings
  const consolidationSavings = Math.round(annualSpend * 0.08); // 8% tool consolidation
  const totalSavings = seatWasteSavings + negotiationSavings + consolidationSavings;

  const scenarios = [
    { id: "Renew", title: "Renew as-is", cost: "$24,000", saving: "$0", risk: "Low", text: "Continues current subscription without cost reduction." },
    { id: "Reduce", title: "Reduce Unused Seats", cost: "$17,000", saving: "$7,000", risk: "Low", text: "Removes 35 inactive seats while preserving full operational capacity." },
    { id: "Downgrade", title: "Downgrade Plan Tier", cost: "$15,500", saving: "$8,500", risk: "Medium", text: "Moves from Enterprise to Business tier based on usage metrics." },
    { id: "Negotiate", title: "Negotiate Quote", cost: "$18,000", saving: "$6,000", risk: "Low", text: "Enforces contract price cap clause to eliminate vendor hike." },
  ];

  const currentScenario = scenarios.find(s => s.id === activeScenario) || scenarios[1];

  const workflowStages = [
    { num: "01", title: "Detect", badge: "Urgency Alerts", desc: "Identify upcoming renewals 90/60/30 days before notice deadlines to eliminate unexpected auto-renewals." },
    { num: "02", title: "Analyze", badge: "License Gaps", desc: "Compare active user activity against paid license seats to pinpoint seat bloat and underutilization." },
    { num: "03", title: "Simulate", badge: "Scenario Engine", desc: "Compare 4-6 decision options side-by-side with real-time annual spend and risk calculations." },
    { num: "04", title: "Recommend", badge: "Weighted Formula", desc: "Get an explainable action powered by 5 weighted metrics: Financial (40%), Usage (25%), Criticality (20%), Risk (10%), Effort (5%)." },
    { num: "05", title: "Approve", badge: "Multi-Tier Routing", desc: "Route decision packets to Dept Owners, Finance Managers, and CFOs based on spending thresholds." },
    { num: "06", title: "Measure", badge: "Savings Truth Layer", desc: "Track savings from Potential to Validated, Approved, Implemented, and Realized bottom-line ROI." }
  ];

  const faqs = [
    { q: "How is SpendShield different from a traditional spreadsheet?", a: "Spreadsheets are static records that get outdated. SpendShield is an active decision engine that automates deadline alerts, seat waste detection, scenario simulations, approval routing, and verified savings tracking." },
    { q: "Does SpendShield store sensitive payment card numbers?", a: "No. SpendShield enforces strict payment security and stores only metadata (e.g., Corporate Visa ending in 4821) with full SOC2 compliant access control." },
    { q: "How fast can our team import existing software subscriptions?", a: "You can drag and drop your existing CSV or Excel spreadsheet using our built-in CSV Importer, and your entire inventory will be parsed and analyzed in under 30 seconds." },
    { q: "What is the Savings Truth Layer?", a: "Most software tools confuse potential forecasts with real savings. SpendShield enforces a 5-stage progression pipeline (Potential → Validated → Approved → Implemented → Realized) so Finance teams can prove bottom-line ROI." }
  ];

  return (
    <div className="space-y-24">

      {/* 🚀 Interactive Live Decision Simulator Sandbox */}
      <section className="bg-white rounded-3xl border border-[#DCD5FF] p-6 sm:p-10 shadow-xl shadow-[#7C5CFC]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7C5CFC]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8 border-b border-[#F2F4F7] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEEAFE] px-3 py-1 text-xs font-bold text-[#7C5CFC] uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Interactive Simulator Sandbox
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171A21]">Test Renewal Decision Scenarios</h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-1 max-w-xl">
              Click any decision option below to see how SpendShield calculates real-time cost, savings, and AI justifications.
            </p>
          </div>

          {/* Scenario Buttons */}
          <div className="flex flex-wrap gap-2">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  activeScenario === s.id
                    ? "bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30 scale-105"
                    : "bg-[#FAFAFC] border border-[#E7E9F0] text-[#667085] hover:bg-[#EEEAFE] hover:text-[#7C5CFC]"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Scenario Live Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAF9FF] border border-[#BEB3FF] p-6 rounded-2xl animate-in fade-in duration-200">
          <div>
            <p className="text-[11px] font-bold text-[#7C5CFC] uppercase tracking-wider">Projected Annual Cost</p>
            <p className="text-3xl font-black text-[#171A21] mt-1">{currentScenario.cost}</p>
            <p className="text-xs text-[#98A2B3] mt-1">Based on current license count</p>
          </div>

          <div>
            <p className="text-[11px] font-bold text-[#027A48] uppercase tracking-wider">Estimated Savings</p>
            <p className="text-3xl font-black text-[#027A48] mt-1">{currentScenario.saving}</p>
            <p className="text-xs text-[#027A48] mt-1 font-semibold">Immediate bottom-line impact</p>
          </div>

          <div>
            <p className="text-[11px] font-bold text-[#B54708] uppercase tracking-wider">Business Risk Rating</p>
            <p className="text-3xl font-black text-[#171A21] mt-1">{currentScenario.risk}</p>
            <p className="text-xs text-[#667085] mt-1">{currentScenario.text}</p>
          </div>
        </div>
      </section>

      {/* 💰 Interactive Annual Savings Calculator */}
      <section className="bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 h-80 w-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold tracking-wide uppercase backdrop-blur-md mb-3">
              <Calculator size={14} /> ROI Calculator
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Calculate Your Company’s Avoidable SaaS Waste</h2>
            <p className="text-white/80 text-sm mt-3 leading-relaxed max-w-lg">
              Growing companies lose 25-35% of their software budget to unused seats, unnegotiated price hikes, and duplicate tools.
            </p>

            {/* Slider */}
            <div className="mt-8 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Company Size: <span className="text-yellow-300 font-extrabold">{employees} Employees</span></span>
                <span>Est. Annual SaaS Spend: <span className="text-white font-black">${annualSpend.toLocaleString()}/yr</span></span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full h-3 bg-white/30 rounded-lg appearance-none cursor-pointer accent-yellow-300"
              />
              <div className="flex justify-between text-[11px] text-white/60 font-medium">
                <span>20 Employees</span>
                <span>250 Employees</span>
                <span>500 Employees</span>
              </div>
            </div>
          </div>

          {/* Savings Breakdown Display */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-2xl space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Projected Bottom-Line Savings</p>
            <p className="text-4xl sm:text-5xl font-black text-yellow-300">${totalSavings.toLocaleString()}<span className="text-lg font-bold text-white/80"> / year</span></p>

            <div className="space-y-2 pt-4 border-t border-white/15 text-xs text-white/90">
              <div className="flex justify-between py-1">
                <span>Unused Seat Elimination (18%):</span>
                <span className="font-bold text-white">${seatWasteSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Contract Negotiation Caps (12%):</span>
                <span className="font-bold text-white">${negotiationSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Tool Redundancy Consolidation (8%):</span>
                <span className="font-bold text-white">${consolidationSavings.toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/sign-up"
              className="w-full mt-4 py-3 bg-white text-[#7C5CFC] hover:bg-[#F4F1FE] transition-all text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              Start Unlocking Savings <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 🔄 Interactive 6-Stage Workflow Tabs */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#7C5CFC] uppercase tracking-wider">Structured Financial Process</span>
          <h2 className="text-3xl font-extrabold text-[#171A21] mt-1">The 6-Stage Renewal Decision Workflow</h2>
          <p className="text-sm text-[#667085] mt-2">Click any stage below to inspect the SpendShield automated workflow engine.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {workflowStages.map((stage, idx) => (
            <button
              key={stage.num}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === idx
                  ? "bg-[#7C5CFC] text-white shadow-lg shadow-[#7C5CFC]/30 scale-105"
                  : "bg-white border border-[#E7E9F0] text-[#667085] hover:bg-[#EEEAFE] hover:text-[#7C5CFC]"
              }`}
            >
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === idx ? "bg-white/20 text-white" : "bg-[#EEEAFE] text-[#7C5CFC]"}`}>{stage.num}</span>
              {stage.title}
            </button>
          ))}
        </div>

        {/* Tab Active Card */}
        <div className="bg-white border border-[#E7E9F0] p-8 rounded-3xl shadow-sm max-w-3xl mx-auto text-center space-y-4 animate-in fade-in duration-200">
          <span className="px-3 py-1 bg-[#EEEAFE] text-[#7C5CFC] text-xs font-bold rounded-full uppercase tracking-wider">
            {workflowStages[activeTab].badge}
          </span>
          <h3 className="text-2xl font-bold text-[#171A21]">Stage {workflowStages[activeTab].num}: {workflowStages[activeTab].title}</h3>
          <p className="text-sm text-[#667085] max-w-xl mx-auto leading-relaxed">
            {workflowStages[activeTab].desc}
          </p>
        </div>
      </section>

      {/* ⚔️ Enterprise Competitor Comparison Matrix */}
      <section className="bg-white rounded-3xl border border-[#E7E9F0] p-8 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#7C5CFC] uppercase tracking-wider">Why SpendShield Wins</span>
          <h2 className="text-3xl font-extrabold text-[#171A21] mt-1">SpendShield vs Alternatives</h2>
          <p className="text-xs text-[#667085] mt-1">How SpendShield outperforms traditional spreadsheets and generic trackers.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E7E9F0] bg-[#FAFAFC] text-[#667085]">
                <th className="p-4 font-bold">Feature / Capability</th>
                <th className="p-4 font-bold text-[#7C5CFC] bg-[#EEEAFE]/50">SpendShield Engine</th>
                <th className="p-4 font-bold">Excel / Spreadsheets</th>
                <th className="p-4 font-bold">Generic Tracker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E9F0] text-[#171A21]">
              <tr>
                <td className="p-4 font-bold">8-Stage Decision Workflow</td>
                <td className="p-4 bg-[#EEEAFE]/30 font-bold text-[#027A48] flex items-center gap-1"><CheckCircle2 size={14} /> Full End-to-End</td>
                <td className="p-4 text-red-500 font-semibold">❌ None (Static)</td>
                <td className="p-4 text-amber-600 font-semibold">⚠️ Read-only Catalog</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Explainable Recommendation Engine</td>
                <td className="p-4 bg-[#EEEAFE]/30 font-bold text-[#027A48] flex items-center gap-1"><CheckCircle2 size={14} /> 5-Factor Weighted Formula</td>
                <td className="p-4 text-red-500 font-semibold">❌ Manual Math</td>
                <td className="p-4 text-red-500 font-semibold">❌ Black-box AI</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Savings Truth Layer</td>
                <td className="p-4 bg-[#EEEAFE]/30 font-bold text-[#027A48] flex items-center gap-1"><CheckCircle2 size={14} /> 5-Stage Realized Verification</td>
                <td className="p-4 text-red-500 font-semibold">❌ Confuses Forecast</td>
                <td className="p-4 text-red-500 font-semibold">❌ No Proof Layer</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Multi-Level Approval Hierarchy</td>
                <td className="p-4 bg-[#EEEAFE]/30 font-bold text-[#027A48] flex items-center gap-1"><CheckCircle2 size={14} /> Dept → Finance → CFO</td>
                <td className="p-4 text-red-500 font-semibold">❌ Disjointed Email</td>
                <td className="p-4 text-amber-600 font-semibold">⚠️ Basic Flag</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ❓ Interactive FAQ Accordion */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold text-[#7C5CFC] uppercase tracking-wider">Frequently Asked Questions</span>
          <h2 className="text-2xl font-extrabold text-[#171A21] mt-1">Everything You Need to Know</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-[#E7E9F0] rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm text-[#171A21] flex justify-between items-center hover:bg-[#FAF9FF] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`text-[#7C5CFC] transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-[#667085] leading-relaxed border-t border-[#F2F4F7] pt-3 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
