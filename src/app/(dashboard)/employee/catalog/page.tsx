"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SoftwareCatalogPage() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCatalog(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching catalog:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full space-y-6 pb-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-3">
            <Sparkles size={14} /> Available Tools
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Software Catalog</h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
            Browse and request company software and licenses for your daily workflow.
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-[#7C5CFC] border-r-transparent align-[-0.125em]" />
          <p className="text-xs text-[#98A2B3] mt-2">Loading software catalog...</p>
        </div>
      ) : catalog.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-12 text-center shadow-2xs">
          <p className="text-sm font-medium text-[#171A21]">No software available in the catalog yet.</p>
          <p className="text-xs text-[#98A2B3] mt-1">Check back later when management adds active subscriptions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-[#E7E9F0] shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="h-10 w-10 rounded-xl bg-[#EEEAFE] text-[#7C5CFC] flex items-center justify-center mb-3">
                  <Package size={20} />
                </div>
                <span className="text-[11px] font-bold text-[#7C5CFC] uppercase tracking-wider">
                  {item.category || "General"} • {item.vendor}
                </span>
                <h3 className="text-base font-bold text-[#171A21] mt-0.5">{item.productName}</h3>
                <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                  Plan: <span className="font-medium text-[#171A21]">{item.plan || "Standard"}</span>
                </p>
              </div>
              
              <Link
                href={`/requests/new?software=${encodeURIComponent(item.productName)}`}
                className="w-full py-2.5 bg-[#EEEAFE] text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white transition-all text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Request This Tool
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}