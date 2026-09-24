"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, Check, Loader2, Sun, Moon } from "lucide-react";

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
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme state on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

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
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dropdown ke bahار click karne par close ho jaye
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
    <header className="flex h-[76px] items-center justify-between border-b border-[#E7E9F0] dark:border-slate-800 bg-white dark:bg-[#171A21] px-6 relative transition-colors">
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
            border border-[#E7E9F0] dark:border-slate-800
            bg-[#FCFCFE] dark:bg-slate-900
            pl-10 pr-4
            text-[13px] text-[#171A21] dark:text-slate-100
            placeholder:text-[#98A2B3]
            outline-none
            transition-all
            focus:border-[#7C5CFC]
            focus:bg-white dark:focus:bg-slate-900
            focus:ring-4
            focus:ring-[#EEEAFE] dark:focus:ring-indigo-950/50
          "
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-xl border border-[#E7E9F0] dark:border-slate-800
            bg-white dark:bg-slate-900 text-[#667085] dark:text-slate-300
            transition-all duration-200
            hover:bg-[#F7F8FC] dark:hover:bg-slate-800
            hover:text-[#171A21] dark:hover:text-white
          "
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
        </button>

        {/* Notification Bell Container */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="
              relative flex h-10 w-10 items-center justify-center
              rounded-xl border border-[#E7E9F0] dark:border-slate-800
              bg-white dark:bg-slate-900 text-[#667085] dark:text-slate-300
              transition-all duration-200
              hover:bg-[#F7F8FC] dark:hover:bg-slate-800
              hover:text-[#171A21] dark:hover:text-white
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
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-[#E7E9F0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E7E9F0] dark:border-slate-800 px-4 py-3 bg-[#FCFCFE] dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#171A21] dark:text-slate-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#EEEAFE] dark:bg-indigo-950 px-2 py-0.5 text-[11px] font-semibold text-[#7C5CFC] dark:text-indigo-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-medium text-[#7C5CFC] dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Check size={13} /> Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[350px] overflow-y-auto divide-y divide-[#E7E9F0] dark:divide-slate-800">
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
                      className={`p-4 transition-colors cursor-pointer hover:bg-[#F7F8FC] dark:hover:bg-slate-800/50 ${
                        !notif.read ? "bg-[#FAFAFE] dark:bg-slate-800/20" : "opacity-75"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[13px] font-semibold text-[#171A21] dark:text-slate-200">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#98A2B3] whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#667085] dark:text-slate-400 leading-relaxed">
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
        <div className="mx-1 h-7 w-px bg-[#E7E9F0] dark:bg-slate-800" />

        {/* Profile */}
        <button
          className="
            flex items-center gap-3 rounded-xl
            px-2 py-1.5
            transition-colors
            hover:bg-[#F7F8FC] dark:hover:bg-slate-800
          "
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEEAFE] dark:bg-indigo-950">
            <span className="text-xs font-semibold text-[#7C5CFC] dark:text-indigo-300">AI</span>
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-[13px] font-semibold text-[#171A21] dark:text-slate-100">Amna Iqbal</p>
            <p className="text-[11px] text-[#98A2B3]">Finance Admin</p>
          </div>

          <ChevronDown size={15} className="text-[#98A2B3]" />
        </button>
      </div>
    </header>
  );
}