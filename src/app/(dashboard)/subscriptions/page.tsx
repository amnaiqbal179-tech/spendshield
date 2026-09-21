"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Database,
  Calendar,
  Users,
  RefreshCw,
  CreditCard,
  Search,
  Trash2,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

interface Subscription {
  id: string;
  vendorName: string;
  productName: string;
  category: string;
  seatCount: number;
  activeSeats: number;
  cost: string;
  currency: string;
  billingCycle: string;
  renewalDate: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [formData, setFormData] = useState({
    vendor: "",
    productName: "",
    category: "",
    seatCount: "10",
    activeSeats: "8",
    annualCost: "1200",
    currency: "USD",
    billingCycle: "YEARLY",
    renewalDate: new Date().toISOString().split("T")[0],
  });

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/subscriptions");
      const json = await res.json();

      if (json.success) {
        setSubscriptions(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage("");

    try {
      const res = await fetch("/api/auth/sync", {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Sync failed");
      }

      setSyncMessage("Account synced successfully ✅");
      await fetchSubscriptions();
    } catch (error) {
      console.error("Clerk sync failed:", error);
      setSyncMessage(
        error instanceof Error ? error.message : "Failed to sync account"
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setSaveMessage("");

    try {
      const payload = {
        ...formData,
        seatCount: Number(formData.seatCount),
        activeSeats: Number(formData.activeSeats),
        annualCost: Number(formData.annualCost),
      };

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error?.message || json.error || "Failed to create subscription"
        );
      }

      setShowModal(false);
      setSaveMessage("Subscription saved successfully ✅");

      await fetchSubscriptions();

      setFormData({
        vendor: "",
        productName: "",
        category: "",
        seatCount: "10",
        activeSeats: "8",
        annualCost: "1200",
        currency: "USD",
        billingCycle: "YEARLY",
        renewalDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Failed to create subscription", error);
      setSaveMessage(
        error instanceof Error ? error.message : "Failed to save subscription"
      );
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (id: string) => {
    setSubscriptionToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!subscriptionToDelete) return;

    const id = subscriptionToDelete;
    setDeletingId(id);
    setDeleteModalOpen(false);

    try {
      const res = await fetch(`/api/subscriptions?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
      } else {
        console.error(json.error || "Failed to delete subscription");
      }
    } catch (error) {
      console.error("Failed to delete subscription", error);
    } finally {
      setDeletingId(null);
      setSubscriptionToDelete(null);
    }
  };

  const formatBillingCycle = (cycle: string) => {
    if (cycle === "MONTHLY") return "Monthly";
    if (cycle === "YEARLY") return "Yearly";
    return cycle;
  };

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSpend = subscriptions.reduce(
    (acc, sub) => acc + Number(sub.cost || 0),
    0
  );

  const totalActiveSeats = subscriptions.reduce(
    (acc, sub) => acc + Number(sub.activeSeats || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Software Subscriptions
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your inventory, active seats, vendor contracts, and billing cycles.
          </p>

          {syncMessage && (
            <p className="text-sm text-indigo-600 mt-2 font-medium">
              {syncMessage}
            </p>
          )}

          {saveMessage && (
            <p className="text-sm text-emerald-600 mt-2 font-medium">
              {saveMessage}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={syncing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            <span>{syncing ? "Syncing..." : "Sync Account"}</span>
          </button>

          <button
            onClick={() => {
              setSaveMessage("");
              setShowModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Subscriptions</span>
            <Database className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{subscriptions.length}</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated Total Cost</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">${totalSpend.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Seats Managed</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {totalActiveSeats}
          </p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-sm max-w-md">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by product, vendor, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm text-slate-900 focus:outline-none bg-transparent"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Loading subscriptions inventory...
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-800 font-medium">No subscriptions found</p>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery ? "Try searching for something else." : "Get started by adding your first software subscription."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Vendor / Product</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Seats (Active/Total)</th>
                  <th className="py-3.5 px-6">Cost</th>
                  <th className="py-3.5 px-6">Billing Cycle</th>
                  <th className="py-3.5 px-6">Renewal Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900 block">{sub.productName}</span>
                      <span className="text-xs text-slate-400">{sub.vendorName}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {sub.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{sub.activeSeats} / {sub.seatCount}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      ${Number(sub.cost).toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-400">{sub.currency}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatBillingCycle(sub.billingCycle)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(sub.renewalDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => promptDelete(sub.id)}
                        disabled={deletingId === sub.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Subscription"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Subscription</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this subscription? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSubscriptionToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Software Subscription</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GitHub"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GitHub Enterprise"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Developer Tools"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total Seats Purchased</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    value={formData.seatCount}
                    onChange={(e) => setFormData({ ...formData, seatCount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Active Seats Used</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    value={formData.activeSeats}
                    onChange={(e) => setFormData({ ...formData, activeSeats: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cost (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    value={formData.annualCost}
                    onChange={(e) => setFormData({ ...formData, annualCost: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Billing Cycle</label>
                  <select
                    required
                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  >
                    <option value="YEARLY">Yearly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Renewal Date</label>
                <input
                  type="date"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  value={formData.renewalDate}
                  onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}