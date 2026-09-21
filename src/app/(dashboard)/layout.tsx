import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import Sidebar from "@/components/layout/Sidebar";
import SyncOrganization from "@/components/SyncOrganization";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Background Auto-Sync for Organization */}
      <SyncOrganization />

      {/* Shared Sidebar with fixed width & shrink-0 to prevent overlapping */}
      <div className="w-64 shrink-0 hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area - Takes remaining full space */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E7E9F0] bg-white px-5 md:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Organization Switcher */}
            <div className="md:hidden">
              <OrganizationSwitcher
                appearance={{
                  elements: {
                    organizationSwitcherTrigger:
                      "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm",
                  },
                }}
              />
            </div>

            {/* Page Header */}
            <h1 className="hidden text-base font-semibold text-slate-800 sm:block">
              SpendShield
            </h1>
          </div>

          {/* Header Right Side */}
          <div className="flex items-center gap-4">
            {/* Database Status */}
            <span className="hidden items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
              Live Neon DB Active
            </span>

            {/* Clerk User */}
            <UserButton />
          </div>
        </header>

        {/* Page Content */}
        <div className="mx-auto w-full max-w-7xl p-5 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}