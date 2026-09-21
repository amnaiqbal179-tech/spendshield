"use client";

import { OrganizationProfile, useOrganization } from "@clerk/nextjs";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OrganizationPage() {
  const { organization, isLoaded } = useOrganization();

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500 font-medium animate-pulse">
          Loading organization settings...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <span>{organization ? organization.name : "Organization Settings"}</span>
          </div>
        </div>

        {/* Clerk Organization Profile Component with Hash Routing */}
        <div className="flex justify-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <OrganizationProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full max-w-none shadow-none",
                cardBox: "shadow-none border-none w-full",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}