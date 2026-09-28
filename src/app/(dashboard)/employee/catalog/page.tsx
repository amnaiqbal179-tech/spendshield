"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Sparkles,
  Loader2,
  Search,
  CheckCircle2,
  Filter,
  X,
  Send,
  Layers,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";

interface CatalogItem {
  id: string;
  productName: string;
  vendor: string;
  category: string;
  plan: string;
  description?: string;
  estimatedCost?: string;
}

export default function SoftwareCatalogPage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [selectedTool, setSelectedTool] = useState<CatalogItem | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch("/api/catalog");
        const json = await res.json();
        if (json.success && json.data) {
          setCatalog(json.data);
        }
      } catch (err) {
        console.error("Error fetching catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  // Filter Categories dynamically
  const categories = ["All", ...Array.from(new Set(catalog.map((i) => i.category || "General")))];

  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || (item.category || "General").toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleOpenRequestModal = (tool: CatalogItem) => {
    setSelectedTool(tool);
    setReason("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCloseModal = () => {
    setSelectedTool(null);
    setReason("");
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !reason.trim()) {
      setErrorMessage("Please provide a justification for this request.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          softwareName: selectedTool.productName,
          reason: reason,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(`Request for ${selectedTool.productName} submitted successfully!`);
        setTimeout(() => {
          handleCloseModal();
        }, 1800);
      } else {
        setErrorMessage(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6366F1] via-[#7C5CFC] to-[#4F46E5] p-6 sm:p-10 text-white shadow-lg">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md text-white border border-white/20 shadow-xs">
              <Sparkles size={14} /> Software Management Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Software & Tool Catalog</h1>
            <p className="text-white/85 text-sm leading-relaxed">
              Discover approved tools, request license access, and manage subscriptions tailored for your daily workflow.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs text-white/70 font-medium">Compliance Check</p>
              <p className="text-xs font-bold text-white">Pre-Approved Vendors Only</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Header */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E9F0] shadow-2xs space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name, category, or vendor..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E7E9F0] focus:outline-none focus:border-[#7C5CFC] transition-all bg-[#FAFAFC] font-medium text-[#171A21]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#171A21]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#7C5CFC] text-white shadow-xs"
                  : "bg-[#F4F5F8] text-[#667085] hover:bg-[#EAECEF] hover:text-[#171A21]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-[#E7E9F0]">
          <Loader2 className="h-8 w-8 animate-spin text-[#7C5CFC] mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#667085]">Loading software catalog...</p>
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-12 text-center shadow-2xs">
          <div className="h-12 w-12 rounded-2xl bg-[#F4F5F8] text-[#98A2B3] flex items-center justify-center mx-auto mb-3">
            <Layers size={24} />
          </div>
          <p className="text-sm font-bold text-[#171A21]">No software matching your search</p>
          <p className="text-xs text-[#98A2B3] mt-1">Try adjusting your category filter or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCatalog.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E7E9F0] shadow-2xs hover:shadow-md hover:border-[#D1D5DB] transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                {/* Header Icon + Badges */}
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#EEEAFE] to-[#E0D9FF] text-[#7C5CFC] flex items-center justify-center font-bold text-lg shadow-2xs group-hover:scale-105 transition-transform">
                    {item.productName.charAt(0).toUpperCase()}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#027A48] bg-[#D1FADF] px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={12} /> Available
                  </span>
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#7C5CFC] uppercase tracking-wider mb-1">
                    <span>{item.category || "General"}</span>
                    <span>•</span>
                    <span>{item.vendor || "Enterprise"}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#171A21] group-hover:text-[#7C5CFC] transition-colors">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-[#667085] mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description || "Standard enterprise licensed software tool available for eligible team members."}
                  </p>
                </div>

                {/* Metadata details */}
                <div className="pt-3 border-t border-[#F2F4F7] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#98A2B3] text-[11px] font-medium block">License Plan</span>
                    <span className="font-bold text-[#171A21]">{item.plan || "Standard Plan"}</span>
                  </div>
                  <div>
                    <span className="text-[#98A2B3] text-[11px] font-medium block">Approval Flow</span>
                    <span className="font-bold text-[#171A21]">Auto / Admin</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-[#FAFAFC] border-t border-[#E7E9F0]">
                <button
                  onClick={() => handleOpenRequestModal(item)}
                  className="w-full py-2.5 bg-[#7C5CFC] hover:bg-[#6847F3] active:scale-[0.99] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Plus size={14} /> Request This Tool
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Dialog Component */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E7E9F0] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#7C5CFC] to-[#4F33E6] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-base backdrop-blur-md">
                  {selectedTool.productName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold">Request Access</h2>
                  <p className="text-xs text-white/80">{selectedTool.productName} ({selectedTool.plan})</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-5">
              {successMessage ? (
                <div className="py-6 text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-[#D1FADF] text-[#027A48] flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-base font-bold text-[#171A21]">Request Submitted</h3>
                  <p className="text-xs text-[#667085]">{successMessage}</p>
                </div>
              ) : (
                <>
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <div className="bg-[#FAFAFC] p-4 rounded-xl border border-[#E7E9F0] space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#667085]">Category:</span>
                      <span className="font-semibold text-[#171A21]">{selectedTool.category || "General"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#667085]">Vendor:</span>
                      <span className="font-semibold text-[#171A21]">{selectedTool.vendor || "Standard"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171A21] uppercase tracking-wider mb-2">
                      Business Justification <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      placeholder="Explain why you need this tool and how it relates to your projects or role..."
                      className="w-full px-4 py-3 text-xs rounded-xl border border-[#E7E9F0] focus:outline-none focus:border-[#7C5CFC] transition-all bg-[#FAFAFC] text-[#171A21]"
                      required
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 text-xs font-bold text-[#667085] hover:bg-[#F2F4F7] rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-[#7C5CFC] hover:bg-[#6847F3] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 disabled:opacity-50"
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
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}