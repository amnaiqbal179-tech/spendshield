"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, Check, Loader2 } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedRequestId?: string;
}

export default function Topbar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Notifications fetch karein API se
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Har 30 seconds baad automatic refresh ke liye
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dropdown ke bahar click karne par close ho jaye
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Single notification ko "Read" mark karna
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
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  // 3. Sari notifications ko ek sath "Read" mark karna
  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex h-[76px] items-center justify-between border-b border-[#E7E9F0] bg-white px-6 relative">
      {/* Search */}
      <div className="relative w-[320px]">
        <Search
          size={17}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
        />
        <input
          type="text"
          placeholder="Search renewals, vendors..."
          className="
            h-10 w-full rounded-xl
            border border-[#E7E9F0]
            bg-[#FCFCFE]
            pl-10 pr-4
            text-[13px] text-[#171A21]
            placeholder:text-[#98A2B3]
            outline-none
            transition-all
            focus:border-[#7C5CFC]
            focus:bg-white
            focus:ring-4
            focus:ring-[#EEEAFE]
          "
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* Notification Bell Container */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="
              relative flex h-10 w-10 items-center justify-center
              rounded-xl border border-[#E7E9F0]
              bg-white text-[#667085]
              transition-all duration-200
              hover:bg-[#F7F8FC]
              hover:text-[#171A21]
            "
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={1.8} />

            {/* Unread Indicator Dot */}
            {unreadCount > 0 && (
              <span className="absolute right-[9px] top-[8px] h-2 w-2 rounded-full bg-[#E35D6A] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-[#E7E9F0] bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E7E9F0] px-4 py-3 bg-[#FCFCFE]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#171A21]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#EEEAFE] px-2 py-0.5 text-[11px] font-semibold text-[#7C5CFC]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-medium text-[#7C5CFC] hover:underline flex items-center gap-1"
                  >
                    <Check size={13} /> Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[350px] overflow-y-auto divide-y divide-[#E7E9F0]">
                {loading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-[#98A2B3]">
                    <Loader2 className="animate-spin mr-2" size={16} /> Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[#98A2B3]">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                      className={`p-4 transition-colors cursor-pointer hover:bg-[#F7F8FC] ${
                        !notif.read ? "bg-[#FAFAFE]" : "opacity-75"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[13px] font-semibold text-[#171A21]">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#98A2B3] whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#667085] leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-1 h-7 w-px bg-[#E7E9F0]" />

        {/* Profile */}
        <button
          className="
            flex items-center gap-3 rounded-xl
            px-2 py-1.5
            transition-colors
            hover:bg-[#F7F8FC]
          "
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEEAFE]">
            <span className="text-xs font-semibold text-[#7C5CFC]">AI</span>
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-[13px] font-semibold text-[#171A21]">Amna Iqbal</p>
            <p className="text-[11px] text-[#98A2B3]">Finance Admin</p>
          </div>

          <ChevronDown size={15} className="text-[#98A2B3]" />
        </button>
      </div>
    </header>
  );
}