"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Package, 
  CheckCheck, 
  RefreshCw, 
  ArrowRight,
  Filter
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedRequestId?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "REQUESTS" | "DECISIONS">("ALL");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000); // 8-second real-time polling
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "REQUESTS") return n.type === "REQUEST_SUBMITTED";
    if (filter === "DECISIONS") return n.type === "REQUEST_APPROVED" || n.type === "REQUEST_REJECTED";
    return true;
  });

  const getIcon = (type: string, title: string) => {
    if (title.includes("Budget Exceeded") || type.includes("BUDGET")) {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
          <AlertTriangle size={18} />
        </div>
      );
    }
    if (type === "REQUEST_APPROVED") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
          <CheckCircle2 size={18} />
        </div>
      );
    }
    if (type === "REQUEST_REJECTED") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
          <XCircle size={18} />
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEEAFE] border border-[#7C5CFC]/20 text-[#7C5CFC]">
        <Package size={18} />
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-3">
              <Bell size={14} /> Workspace Activity Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Notifications & Alerts</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
              Real-time software request updates, manager approval decisions, and budget alerts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="inline-flex items-center gap-1.5 bg-white text-[#7C5CFC] hover:bg-white/90 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                <CheckCheck size={15} />
                {markingAll ? "Marking..." : "Mark All Read"}
              </button>
            )}
            <button
              onClick={() => {
                setLoading(true);
                fetchNotifications();
              }}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-xl backdrop-blur-md transition-all border border-white/20"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E9F0] pb-4">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-[#98A2B3]" />
          <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Filter:</span>
          {(["ALL", "UNREAD", "REQUESTS", "DECISIONS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === tab
                  ? "bg-[#7C5CFC] text-white shadow-sm"
                  : "bg-white text-[#667085] border border-[#E7E9F0] hover:bg-[#F7F8FC]"
              }`}
            >
              {tab === "ALL" && `All (${notifications.length})`}
              {tab === "UNREAD" && `Unread (${unreadCount})`}
              {tab === "REQUESTS" && "New Requests"}
              {tab === "DECISIONS" && "Approvals & Rejections"}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#98A2B3] font-medium">
          Auto-sync active • Refreshing every 8s
        </span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E9F0] p-12 text-center">
            <div className="inline-block h-7 w-7 animate-spin rounded-full border-3 border-solid border-[#7C5CFC] border-r-transparent align-[-0.125em]" />
            <p className="text-xs text-[#98A2B3] mt-3 font-medium">Fetching real-time notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E9F0] p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F8FC] text-[#98A2B3] mb-3">
              <Bell size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#171A21]">No notifications found</h3>
            <p className="text-xs text-[#98A2B3] mt-1 max-w-sm mx-auto">
              {filter === "UNREAD"
                ? "You have read all notifications! Great job staying up to date."
                : "No notifications recorded yet. Any new software request or manager review will appear here instantly."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && handleMarkAsRead(notif.id)}
              className={`group relative flex items-start gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
                !notif.read
                  ? "bg-white border-[#7C5CFC]/30 shadow-[0_2px_12px_-3px_rgba(124,92,252,0.1)] hover:border-[#7C5CFC]"
                  : "bg-white border-[#E7E9F0] hover:border-[#D0D5DD] opacity-85"
              }`}
            >
              {/* Unread Indicator Bar */}
              {!notif.read && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1.5 rounded-r-full bg-[#7C5CFC]" />
              )}

              {/* Icon */}
              {getIcon(notif.type, notif.title)}

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#171A21]">{notif.title}</h3>
                    {!notif.read && (
                      <span className="rounded-full bg-[#EEEAFE] px-2 py-0.5 text-[10px] font-bold text-[#7C5CFC]">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-[#98A2B3]">
                    {new Date(notif.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-[#475467] leading-relaxed">
                  {notif.message}
                </p>

                {/* Related Request Link */}
                {notif.relatedRequestId && (
                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href="/approvals"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C5CFC] hover:text-[#4F33E6] transition-colors"
                    >
                      <span>View Request Details</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Mark Read Action Button */}
              {!notif.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notif.id);
                  }}
                  title="Mark as read"
                  className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F7F8FC] text-[#98A2B3] hover:bg-[#EEEAFE] hover:text-[#7C5CFC] transition-colors"
                >
                  <CheckCheck size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
