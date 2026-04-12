"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrder } from "@/context/OrderContext";
import { useAuth, ApiStore } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function MenuBuilderPage() {
  const router = useRouter();
  const { menuItems, addMenuItem, deleteMenuItem, isLoadingMenu } = useOrder();
  const { store, setStore } = useAuth();
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [addError, setAddError] = useState("");

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    setAddingItem(true);
    setAddError("");
    try {
      await addMenuItem({ name: newItemName.trim(), price: newItemPrice });
      setNewItemName("");
      setNewItemPrice("");
    } catch {
      setAddError("Failed to add item. Please try again.");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem(id);
    } catch {
      // silent — item stays in list if delete fails
    }
  };

  const handleFinish = async () => {
    if (!store || menuItems.length === 0) return;
    setFinishing(true);
    try {
      const data = await api.patch<{ store: ApiStore }>(`/stores/${store.id}`, {
        onboardingStep: "completed",
        onboardingCompleted: true,
      });
      setStore(data.store);
      router.push("/dashboard");
    } catch {
      setFinishing(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background pb-20">

      {/* Top Navigation */}
      <header className="w-full flex items-center justify-between py-4 px-5 sm:py-6 sm:px-8 lg:px-12 bg-background sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/setup" className="text-text hover:text-primary transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D95D39" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[24px] sm:h-[24px]">
              <path d="m20 4-4 4"/>
              <path d="m11 13-3 3"/>
              <path d="M4 20h2l3-3"/>
              <path d="M7 17v-2l3-3"/>
              <path d="M8 8V6l3-3"/>
              <path d="M6 10H4l-3-3"/>
            </svg>
            <span className="font-heading font-semibold text-[18px] sm:text-[22px] tracking-tight">Ordo</span>
          </div>
        </div>
        <button
          onClick={handleFinish}
          disabled={menuItems.length === 0 || finishing}
          className={`rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 font-semibold transition-colors shadow-sm text-[12px] sm:text-[14px] whitespace-nowrap mr-3 sm:mr-0 ${
            menuItems.length === 0 || finishing
              ? "bg-muted/20 text-muted/50 cursor-not-allowed shadow-none"
              : "bg-primary text-white hover:bg-[#c44e2b] cursor-pointer"
          }`}
        >
          {finishing ? "Setting up..." : "Start Taking Orders"}
        </button>
      </header>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 mt-8">

        {/* Page Title */}
        <div className="mb-8 lg:mb-10">
          <h1 className="font-heading text-[30px] sm:text-[38px] tracking-tight mb-2 text-text">Build Your Menu</h1>
          <p className="text-muted text-[16px]">Add your delicious offerings to get started.</p>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">

          {/* Left Column: Form */}
          <div className="w-full max-w-[420px] mx-auto lg:mx-0 lg:max-w-none lg:w-[40%] bg-surface rounded-[24px] shadow-[var(--shadow-soft)] p-6 lg:p-8">
            <h2 className="font-heading text-[22px] font-semibold mb-6">Add New Item</h2>

            <form onSubmit={handleAddItem} className="flex flex-col gap-5">

              <div className="flex flex-col gap-2">
                <label className="text-text font-bold text-[13px] ml-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Avocado Toast"
                  className="w-full h-[52px] px-4 bg-[#F8F6F2] rounded-[16px] text-text placeholder:text-[#A99790] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-text font-bold text-[13px] ml-1">Price (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-[#A99790] font-medium">₹</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="0"
                    className="w-full h-[52px] pl-[34px] pr-4 bg-[#F8F6F2] rounded-[16px] text-text placeholder:text-[#A99790] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
                  />
                </div>
              </div>

              {addError && <p className="text-red-500 text-[13px]">{addError}</p>}

              <button
                type="submit"
                disabled={addingItem}
                className="w-full h-[56px] bg-[#FDF0EA] hover:bg-[#F9E2D8] disabled:opacity-60 text-primary font-bold rounded-full transition-colors mt-2 text-[15px]"
              >
                {addingItem ? "Adding..." : "Add Item"}
              </button>
            </form>
          </div>

          {/* Right Column: List */}
          <div className="w-full lg:w-[60%] flex flex-col">
            <h3 className="font-heading text-[20px] font-semibold mb-6 opacity-90">Menu Preview</h3>

            {isLoadingMenu ? (
              <div className="w-full h-[200px] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-surface rounded-[20px] shadow-[0_4px_20px_rgba(44,26,20,0.03)] p-4 flex items-center justify-between group hover:shadow-[var(--shadow-soft)] transition-shadow">
                    <div className="flex items-center gap-5">
                      <div className="w-[80px] h-[80px] rounded-[16px] bg-[#FDF0EA] flex items-center justify-center text-[38px] shadow-sm">
                        🍽️
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[17px] text-text">{item.name}</span>
                        <span className="font-body text-[15px] font-semibold text-primary">₹{item.price}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-3 text-muted/50 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 mr-2 focus:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                ))}

                {menuItems.length === 0 && (
                  <div className="w-full h-[200px] flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-muted/20 text-muted/60 font-medium">
                    No items added yet.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
