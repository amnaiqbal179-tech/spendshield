"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
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
            <Bell size={14} /> Updates & Alerts
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
            Stay updated with real-time alerts regarding your software requests and workspace updates.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 space-y-3 shadow-2xs">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-[#7C5CFC] border-r-transparent align-[-0.125em]" />
            <p className="text-xs text-[#98A2B3] mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-[#171A21]">No notifications found.</p>
            <p className="text-xs text-[#98A2B3] mt-1">You're all caught up! Updates will appear here.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isApproved = n.type.includes("APPROVED");
            const isRejected = n.type.includes("REJECTED");

            return (
              <div key={n.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#FAFAFC] border border-[#E7E9F0] hover:border-[#7C5CFC]/30 transition-all">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isApproved ? 'bg-[#D1FADF] text-[#027A48]' : isRejected ? 'bg-[#FEE4E2] text-[#B42318]' : 'bg-[#FEF08A] text-[#A16207]'
                }`}>
                  {isApproved ? <CheckCircle2 size={16} /> : isRejected ? <XCircle size={16} /> : <AlertCircle size={16} />}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#171A21]">{n.title}</h4>
                  <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-[#98A2B3] mt-2 block font-medium">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}