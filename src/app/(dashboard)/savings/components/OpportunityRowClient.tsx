"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Opportunity = {
  id?: string;
  name: string;
  category: string;
  currentSpend: string;
  potentialSaving: string;
  rate: string;
  confidence: string;
  stage: string;
  status: string;
};

export default function OpportunityRowClient({
  item,
  index,
  total,
}: {
  item: Opportunity;
  index: number;
  total: number;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(item.stage);
  const [loading, setLoading] = useState(false);

  const handleUpdateStage = async (newStage: string) => {
    if (!item.id) {
      // Agar ID mojood na ho toh sirf local state update karein
      setCurrentStage(newStage);
      setIsModalOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/savings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
          stage: newStage,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to update stage");
      }

      setCurrentStage(newStage);
      setIsModalOpen(false);
      router.refresh(); // Page ka data re-fetch karwane ke liye
    } catch (error) {
      console.error("Failed to update stage", error);
      alert("Failed to update stage. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`grid grid-cols-1 gap-4 px-5 py-5 transition hover:bg-[#FCFCFE] lg:grid-cols-[1.7fr_1fr_1fr_0.8fr_0.9fr_1fr_1fr] lg:items-center ${
          index !== total - 1 ? "border-b border-[#E7E9F0]" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F5FA] text-sm font-semibold text-[#171A21]">
            {item.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-[#171A21]">{item.name}</p>
            <p className="mt-1 text-xs text-[#98A2B3]">{item.category}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-[#98A2B3] lg:hidden">Current Spend</p>
          <p className="mt-1 text-sm font-medium text-[#171A21]">{item.currentSpend}</p>
        </div>

        <div>
          <p className="text-xs text-[#98A2B3] lg:hidden">Potential Saving</p>
          <p className="mt-1 text-sm font-semibold text-[#22A06B]">{item.potentialSaving}</p>
        </div>

        <div>
          <p className="text-xs text-[#98A2B3] lg:hidden">Rate</p>
          <p className="mt-1 text-sm font-medium text-[#171A21]">{item.rate}</p>
        </div>

        <div>
          <p className="text-xs text-[#98A2B3] lg:hidden">Confidence</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22A06B]" />
            <span className="text-sm text-[#667085]">{item.confidence}</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-[#98A2B3] lg:hidden">Stage</p>
          <span className="mt-1 inline-flex rounded-full bg-[#EEEAFE] px-2.5 py-1 text-xs font-medium text-[#7C5CFC]">
            {currentStage}
          </span>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#7C5CFC] transition hover:text-[#6245DC]"
          >
            Review decision
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#171A21]">
              Review Opportunity: {item.name}
            </h3>
            <p className="mt-1 text-sm text-[#667085]">
              Update the pipeline stage or verify savings for this subscription.
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-[#F8F9FC] p-3 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-[#667085]">Current Spend:</span>
                  <span className="font-semibold text-[#171A21]">{item.currentSpend}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#667085]">Potential Saving:</span>
                  <span className="font-semibold text-[#22A06B]">{item.potentialSaving}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#667085] uppercase tracking-wider mb-2">
                  Move to Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Validated", "Approved", "Implemented", "Realized"].map((stg) => (
                    <button
                      key={stg}
                      disabled={loading}
                      onClick={() => handleUpdateStage(stg)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#E7E9F0] py-2.5 text-xs font-medium text-[#171A21] hover:border-[#7C5CFC] hover:bg-[#F8F6FF] transition disabled:opacity-50"
                    >
                      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#7C5CFC]" />}
                      {stg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={loading}
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-[#667085] hover:bg-[#F4F5FA] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}