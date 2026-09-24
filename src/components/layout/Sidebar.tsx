"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import {
  LayoutDashboard,
  RefreshCw,
  PiggyBank,
  GitBranch,
  CheckCircle2,
  TrendingUp,
  Boxes,
  Building2,
  Settings,
  ChevronDown,
  FileText,
  CheckCircle,
  Package,
  Bell,
  FileSearch,
  Layers,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { organization, membership } = useOrganization();

  // Clerk organization role check ('org:admin' ya 'org:manager' hone par true hoga)
  const role = membership?.role;
  const isAdminOrManager = role === "org:admin" || role === "org:manager";

  // Overview ka link role ke hisab se dynamically change hoga
  const overviewHref = isAdminOrManager ? "/dashboard" : "/employee/overview";

  // Workspace items role ke mutabiq dynamically change honge
  const workspaceItems = isAdminOrManager
    ? [
        { label: "Renewals", icon: RefreshCw, href: "/renewals" },
        { label: "Savings", icon: PiggyBank, href: "/savings" },
        { label: "Decisions", icon: GitBranch, href: "/decisions" },
        { label: "Approvals", icon: CheckCircle2, href: "/approvals" },
        { label: "Forecast", icon: TrendingUp, href: "/forecast" },
        { label: "Notifications", icon: Bell, href: "/notifications" },
      ]
    : [
        { label: "My Requests", icon: FileText, href: "/requests" },
        { label: "Approved Tools", icon: CheckCircle, href: "/employee/my-tools" },
        { label: "Software Catalog", icon: Package, href: "/employee/catalog" },
        { label: "Notifications", icon: Bell, href: "/notifications" },
        { label: "Settings", icon: Settings, href: "/employee/settings" },
      ];

  const manageItems = [
    { label: "Subscriptions", icon: Boxes, href: "/subscriptions" },
    { label: "Organization", icon: Building2, href: "/organization" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/employee/overview") {
      return pathname === href || (href === "/dashboard" && pathname === "/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[250px] flex-col border-r border-[#E7E9F0] bg-white">
      {/* Logo */}
      <div className="flex h-[76px] items-center px-6">
        <Link
          href={overviewHref}
          className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC]/40"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C5CFC] shadow-sm">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <div>
            <h1 className="text-[17px] font-bold tracking-[-0.02em] text-[#171A21]">
              SpendShield
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#98A2B3]">
              Financial Control
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Overview */}
        <div className="mb-6">
          <NavItem
            label="Overview"
            icon={LayoutDashboard}
            href={overviewHref}
            active={isActive(overviewHref)}
          />
        </div>

        {/* Workspace */}
        <NavSection title={isAdminOrManager ? "Workspace" : "Employee Portal"}>
          {workspaceItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={item.href}
              active={isActive(item.href)}
            />
          ))}
        </NavSection>

        {/* Manage (Sirf Admin/Manager ke liye) */}
        {isAdminOrManager && (
          <NavSection title="Manage">
            {manageItems.map((item) => (
              <NavItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                href={item.href}
                active={isActive(item.href)}
              />
            ))}
          </NavSection>
        )}
      </nav>

      {/* Organization Switcher */}
      <div className="border-t border-[#E7E9F0] p-3">
        <Link
          href="/organization"
          className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[#F7F8FC]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEEAFE]">
            <Building2 size={17} strokeWidth={1.8} className="text-[#7C5CFC]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[#171A21]">
              {organization ? organization.name : "Select Organization"}
            </p>
            <p className="truncate text-[11px] text-[#98A2B3]">
              {isAdminOrManager ? "Finance Workspace" : "Employee Portal"}
            </p>
          </div>
          <ChevronDown size={15} className="text-[#98A2B3]" />
        </Link>
      </div>
    </aside>
  );
}

function NavItem({ label, icon: Icon, href, active = false }: { label: string; icon: React.ElementType; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 outline-none ${
        active ? "bg-[#EEEAFE] text-[#7C5CFC]" : "text-[#667085] hover:bg-[#F7F8FC] hover:text-[#171A21]"
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#7C5CFC]" />}
      <Icon size={18} strokeWidth={active ? 2.1 : 1.8} className={active ? "text-[#7C5CFC]" : "text-[#98A2B3] group-hover:text-[#667085]"} />
      <span className={`text-[13px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
    </Link>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}