"use client";

import { useState, useEffect } from "react";
import { Calculator, ShieldCheck, Sparkles } from "lucide-react";

interface SimulationResult {
  productName: string;
  action: string;
  originalAnnualCost: number;
  simulatedAnnualCost: number;
  estimatedSavings: number;
  businessRisk: string;
  currency: string;
}

interface SubscriptionOption {
  id: string;
  name?: string;
  title?: string;
  vendor?: string;
  annualCost?: number;
}

export default function SimulatorPage() {
  const [subscriptionId, setSubscriptionId] = useState("");
  const [action, setAction] = useState("REDUCE");
  const [targetSeats, setTargetSeats] = useState("5");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionOption[]>([]);
  const [fetchingSubs, setFetchingSubs] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch real active subscriptions from database API
  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const res = await fetch("/api/subscriptions");
        const json = await res.json();
        // Support both json.data and direct array formats
        const subData = json.success ? json.data : (Array.isArray(json) ? json : []);
        
        if (subData && subData.length > 0) {
          setSubscriptions(subData);
          setSubscriptionId(subData[0].id);
        }
      } catch (error) {
        console.error("Failed to load subscriptions for simulator", error);
      } finally {
        setFetchingSubs(false);
      }
    }
    fetchSubscriptions();
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriptionId) {
      setToastMessage("Please select a valid subscription.");
      return;
    }

    setLoading(true);
    setToastMessage(null);

    try {
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          action,
          targetSeats: parseInt(targetSeats) || 0,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.data);
        setToastMessage("Simulation executed successfully!");
      } else {
        setToastMessage(json.error || "Simulation failed. Please verify the selection.");
      }
    } catch (error) {
      console.error("Simulation request failed", error);
      setToastMessage("Network error occurred during simulation.");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const formatMoney = (val: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 relative">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Financial Sandbox
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Business Impact Simulator
        </h2>
        <p className="text-slate-300 text-sm mt-1.5 max-w-xl leading-relaxed">
          Simulate renewal decisions, model license scaling, and evaluate precise financial savings before committing with vendors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Simulation Control Form */}
        <div className="md:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Parameters Configuration
          </h3>

          <form onSubmit={handleSimulate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Subscription
              </label>
              {fetchingSubs ? (
                <div className="text-xs text-slate-400 py-2">Loading active subscriptions...</div>
              ) : subscriptions.length > 0 ? (
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  value={subscriptionId}
                  onChange={(e) => setSubscriptionId(e.target.value)}
                >
                  {subscriptions.map((sub) => {
                    // Safe mapping for real subscription fields with multiple fallbacks
                    const displayName = sub.name || sub.title || "Unnamed Subscription";
                    const displayVendor = sub.vendor ? ` — ${sub.vendor}` : "";
                    return (
                      <option key={sub.id} value={sub.id}>
                        {displayName}{displayVendor}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="text-xs text-rose-500 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                  No active subscriptions found. Please add subscriptions first.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chosen Action
              </label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="RENEW">Renew As-Is</option>
                <option value="REDUCE">Reduce Licenses</option>
                <option value="NEGOTIATE">Negotiate Discount</option>
                <option value="CANCEL">Cancel Subscription</option>
              </select>
            </div>

            {action === "REDUCE" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Seats
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  value={targetSeats}
                  onChange={(e) => setTargetSeats(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || subscriptions.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Calculator className="h-4 w-4" />
              <span>{loading ? "Calculating Impact..." : "Run Simulation"}</span>
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Simulation Outcome Analysis
            </h3>

            {result ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Target Product</span>
                    <span className="text-lg font-bold text-slate-900">{result.productName}</span>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Action: {result.action}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-xs text-slate-500 font-medium block">Original Cost</span>
                    <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                      {formatMoney(result.originalAnnualCost, result.currency)}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-xs text-slate-500 font-medium block">Simulated Cost</span>
                    <span className="text-xl font-extrabold text-indigo-600 mt-1 block">
                      {formatMoney(result.simulatedAnnualCost, result.currency)}
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/60">
                    <span className="text-xs text-emerald-700 font-medium block">Estimated Saving</span>
                    <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
                      {formatMoney(result.estimatedSavings, result.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500 gap-2">
                  <span>
                    Calculated Business Risk:{" "}
                    <strong className="text-slate-800 uppercase bg-slate-100 px-2 py-0.5 rounded ml-1">
                      {result.businessRisk}
                    </strong>
                  </span>
                  <span>Currency Standard: <strong className="text-slate-800">{result.currency}</strong></span>
                </div>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-800 font-semibold text-sm">No simulation executed yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Select a subscription and desired action from the configuration panel to test financial impact scenarios.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs font-semibold text-slate-100">{toastMessage}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-3 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}