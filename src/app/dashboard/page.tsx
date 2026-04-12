"use client";

import { useState } from "react";
import { PlusSquare, History, User, Search, Plus } from "lucide-react";
import { useOrder } from "@/context/OrderContext";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("take-orders");
  const { addItem, orderItems } = useOrder();

  // Mock menu items for the frontend demo
  const menuItems = [
    { id: 1, name: "Avocado Toast", price: "850" },
    { id: 2, name: "Iced Latte", price: "400" },
    { id: 3, name: "Croissant", price: "350" },
    { id: 4, name: "Blueberry Muffin", price: "300" },
    { id: 5, name: "Egg Sandwich", price: "650" },
    { id: 6, name: "Matcha Latte", price: "450" },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getItemQuantity = (id: number) =>
    orderItems.find((i) => i.id === id)?.quantity ?? 0;

  return (
    <main className="min-h-[100dvh] bg-background relative flex flex-col pt-6 pb-40">
      {/* Top Section */}
      <div className="px-6 lg:px-12 w-full max-w-[800px] mx-auto flex-1">
        <div className="mb-6">
          <h1 className="font-heading text-[28px] sm:text-[34px] tracking-tight mb-2 text-text">
            Take Orders
          </h1>
          <p className="text-muted text-[15px]">Select items to add to the current order.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for an item..."
            className="w-full h-[56px] pl-[44px] pr-4 bg-surface shadow-sm rounded-full text-text placeholder:text-[#A99790] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
          />
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-surface rounded-[24px] shadow-sm p-4 flex flex-col justify-between group hover:shadow-[var(--shadow-soft)] transition-shadow border border-transparent hover:border-black/5 aspect-square relative"
                >
                  {/* Quantity badge */}
                  {qty > 0 && (
                    <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center z-10 shadow-sm">
                      {qty}
                    </span>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[18px] text-text leading-tight pr-8">
                      {item.name}
                    </span>
                    <span className="font-body text-[16px] font-semibold text-primary">
                      ₹{item.price}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                      className="w-12 h-12 bg-[#F8F6F2] hover:bg-primary hover:text-white text-text rounded-full flex items-center justify-center transition-colors focus:ring-2 focus:ring-primary/40 focus:outline-none active:scale-95"
                      aria-label={`Add ${item.name}`}
                      id={`add-item-${item.id}`}
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 w-full py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted/60" />
              </div>
              <p className="text-text font-bold text-[18px] mb-1">No items found</p>
              <p className="text-muted text-[15px]">Try a different search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* Instagram-style Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-black/5 rounded-t-[30px] z-50">
        <div className="max-w-[800px] mx-auto px-8 h-[72px] flex items-center justify-between pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => setActiveTab("take-orders")}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${activeTab === "take-orders" ? "text-primary scale-110" : "text-muted hover:bg-muted/10"}`}
          >
            <PlusSquare
              className={`w-7 h-7 ${activeTab === "take-orders" ? "fill-primary/10" : ""}`}
              strokeWidth={activeTab === "take-orders" ? 2.5 : 2}
            />
          </button>

          <button
            onClick={() => setActiveTab("past-orders")}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${activeTab === "past-orders" ? "text-primary scale-110" : "text-muted hover:bg-muted/10"}`}
          >
            <History
              className={`w-7 h-7 ${activeTab === "past-orders" ? "fill-primary/10" : ""}`}
              strokeWidth={activeTab === "past-orders" ? 2.5 : 2}
            />
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${activeTab === "profile" ? "text-primary scale-110" : "text-muted hover:bg-muted/10"}`}
          >
            <User
              className={`w-7 h-7 ${activeTab === "profile" ? "fill-primary/10" : ""}`}
              strokeWidth={activeTab === "profile" ? 2.5 : 2}
            />
          </button>
        </div>
      </nav>
    </main>
  );
}
