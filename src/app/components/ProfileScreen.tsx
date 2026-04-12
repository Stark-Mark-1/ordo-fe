"use client";

import { useState, useEffect } from "react";
import { Edit2, ArrowRightCircle, LogOut, MapPin, Phone, Store, X, Menu as MenuIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, ApiStore } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

interface WeeklyDataPoint {
  date: string;        // "YYYY-MM-DD"
  label: string;       // "Mon", "Tue", etc.
  totalPaise: number;  // paise from backend
  orderCount: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { store, setStore, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [editForm, setEditForm] = useState({
    storeName: store?.name ?? "",
    location: store?.location ?? "",
    contactNumber: store?.contactNumber ?? "",
  });

  // Analytics
  const [chartData, setChartData] = useState<WeeklyDataPoint[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (!store) return;
    setAnalyticsLoading(true);
    api
      .get<{ days: WeeklyDataPoint[] }>(
        `/stores/${store.id}/analytics/weekly`
      )
      .then((res) => {
        setChartData(res.days);
      })
      .catch(() => {
        // keep empty chart
      })
      .finally(() => setAnalyticsLoading(false));
  }, [store]);

  const maxSales = chartData.length > 0 ? Math.max(...chartData.map((d) => d.totalPaise / 100), 1) : 1;
  const totalSales = chartData.reduce((acc, d) => acc + d.totalPaise / 100, 0);

  const openEdit = () => {
    setEditForm({
      storeName: store?.name ?? "",
      location: store?.location ?? "",
      contactNumber: store?.contactNumber ?? "",
    });
    setSaveError("");
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!store) return;
    setSaving(true);
    setSaveError("");
    try {
      const data = await api.patch<{ store: ApiStore }>(`/stores/${store.id}`, {
        name: editForm.storeName,
        location: editForm.location,
        contactNumber: editForm.contactNumber,
      });
      setStore(data.store);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof ApiError) setSaveError(err.message);
      else setSaveError("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-in fade-in pb-8">
        <div className="mb-2">
          <h1 className="font-heading text-[28px] sm:text-[34px] tracking-tight text-text">
            Profile
          </h1>
          <p className="text-muted text-[15px]">Manage your store settings and view analytics.</p>
        </div>

        {/* Store Info Card */}
        <div className="bg-surface rounded-[24px] shadow-[var(--shadow-soft)] p-6 relative group border border-transparent hover:border-black/5 transition-colors">
          <button
            onClick={openEdit}
            className="absolute top-6 right-6 w-10 h-10 bg-background border border-black/5 shadow-sm hover:bg-primary hover:text-white text-muted rounded-full flex items-center justify-center transition-colors z-10"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#F8F6F2] border border-black/5 rounded-full flex items-center justify-center text-primary shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-[22px] text-text pr-12">{store?.name ?? "Your Store"}</h2>
              <div className="mt-1">
                <span className="text-[12px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full inline-block">Online</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {store?.location && (
              <div className="flex items-center gap-3 text-text bg-background border border-black/5 rounded-2xl p-3 px-4 shadow-sm">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium text-[15px] truncate">{store.location}</span>
              </div>
            )}
            {store?.contactNumber && (
              <div className="flex items-center gap-3 text-text bg-background border border-black/5 rounded-2xl p-3 px-4 shadow-sm">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium text-[15px] truncate">{store.contactNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="bg-surface rounded-[24px] shadow-[var(--shadow-soft)] p-6 relative border border-transparent hover:border-black/5 transition-colors flex flex-col gap-6">
          <div className="flex flex-row items-center justify-between">
            <h2 className="font-bold text-[20px] text-text">Weekly Analytics</h2>
            <button className="text-primary hover:text-[#c44e2b] transition-colors focus:outline-none focus:scale-110 active:scale-95 duration-200">
              <ArrowRightCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-muted text-[14px] font-medium">Total Sales This Week</p>
            <p className="font-bold text-[32px] text-text tracking-tight animate-in slide-in-from-bottom-2">
              {analyticsLoading ? "—" : `₹${totalSales.toLocaleString()}`}
            </p>
          </div>

          {/* Bar Chart */}
          {analyticsLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-[180px] w-full flex items-end justify-between gap-1.5 sm:gap-2 mt-2">
              {chartData.map((data, index) => {
                const rupees = data.totalPaise / 100;
                const heightPercentage = (rupees / maxSales) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 gap-2 group h-full justify-end">
                    <div className="w-full max-w-[40px] relative flex items-end justify-center h-[140px] rounded-lg bg-background border border-black/5 overflow-hidden">
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-text text-white text-[12px] font-bold py-1.5 px-2.5 rounded-[10px] opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap shadow-xl pointer-events-none">
                        ₹{rupees.toLocaleString()}
                      </div>
                      <div
                        className="w-full bg-primary/70 group-hover:bg-primary transition-all duration-300 rounded-t-md relative z-0 origin-bottom"
                        style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                      >
                        <div className="absolute inset-x-0 top-0 h-2 bg-white/20 rounded-t-md" />
                      </div>
                    </div>
                    <span className="text-[12px] sm:text-[13px] font-semibold text-muted group-hover:text-text transition-colors">
                      {data.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-muted text-[14px]">
              No sales data yet.
            </div>
          )}
        </div>

        {/* Edit Menu Option */}
        <Link
          href="/edit-menu"
          className="bg-surface rounded-[24px] shadow-[var(--shadow-soft)] p-6 relative border border-transparent hover:border-black/5 transition-colors flex items-center justify-between cursor-pointer group active:scale-[0.99] block"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <MenuIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[18px] text-text">Edit Menu</h2>
              <p className="text-muted text-[14px]">Add or remove items</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full h-[60px] text-[#D95D39] bg-red-50 hover:bg-red-100 font-bold text-[16px] rounded-[20px] flex items-center justify-center gap-2 transition-all hover:shadow-sm active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      {/* Edit Popup Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-[420px] rounded-[32px] p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-background border border-black/5 hover:bg-muted/10 text-muted hover:text-text rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-heading text-[28px] font-bold mb-6 text-text pr-8 leading-tight">Edit Profile</h2>

            <div className="flex flex-col gap-5 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-text ml-1 opacity-90">Store Name</label>
                <input
                  type="text"
                  value={editForm.storeName}
                  onChange={(e) => setEditForm({ ...editForm, storeName: e.target.value })}
                  className="w-full h-[56px] px-5 bg-background border border-black/10 rounded-[18px] text-text font-semibold text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm"
                  placeholder="Enter store name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-text ml-1 opacity-90">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full h-[56px] px-5 bg-background border border-black/10 rounded-[18px] text-text font-semibold text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm"
                  placeholder="Enter store location"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-text ml-1 opacity-90">Contact Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={editForm.contactNumber}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      contactNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 11),
                    })
                  }
                  className="w-full h-[56px] px-5 bg-background border border-black/10 rounded-[18px] text-text font-semibold text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm"
                  placeholder="Enter contact number"
                />
              </div>
              {saveError && <p className="text-red-500 text-[13px]">{saveError}</p>}
            </div>

            <button
              onClick={handleUpdate}
              disabled={saving || !editForm.storeName.trim()}
              className="w-full h-[60px] bg-primary hover:bg-[#c44e2b] disabled:opacity-60 text-white font-bold text-[17px] rounded-[20px] transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center"
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
