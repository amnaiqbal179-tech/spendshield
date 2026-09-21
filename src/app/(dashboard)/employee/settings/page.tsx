"use client";

import { useEffect, useState } from "react";
import { Settings, User, Mail, Save, CheckCircle2 } from "lucide-react";

export default function EmployeeSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setName(data.data.name || "");
          setEmail(data.data.email || "");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching settings:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-[#7C5CFC] border-r-transparent align-[-0.125em]" />
        <p className="text-xs text-[#98A2B3] mt-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10 max-w-4xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9B7BFC] to-[#4F33E6] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-md mb-3">
            <Settings size={14} /> Preferences
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Account Settings</h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl leading-relaxed">
            Manage your personal profile details and workspace preferences.
          </p>
        </div>
      </div>

      {/* Settings Form Card */}
      <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 sm:p-8 shadow-2xs">
        <h3 className="text-lg font-bold text-[#171A21] mb-4">Personal Information</h3>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-[#D1FADF] text-[#027A48] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#98A2B3]">
                <User size={16} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFC] border border-[#E7E9F0] rounded-xl text-xs text-[#171A21] focus:outline-none focus:border-[#7C5CFC]"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">Email Address (Read-only)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#98A2B3]">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                disabled
                className="w-full pl-9 pr-4 py-2.5 bg-[#F2F4F7] border border-[#E7E9F0] rounded-xl text-xs text-[#667085] cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-[#98A2B3] mt-1">Email is managed securely through your authentication provider.</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#7C5CFC] hover:bg-[#6b4ae2] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}