"use client";

import { useState, useMemo } from "react";
import { ArrowRight, X, Clock, Hash, ShoppingBag, ChevronDown } from "lucide-react";
import { useOrder, PastOrder, OrderItem } from "@/context/OrderContext";

/* ─── Sort / filter chips ─────────────────────────────────────────── */
type SortKey = "newest" | "oldest" | "highest" | "lowest";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest",  label: "Newest first" },
  { key: "oldest",  label: "Oldest first" },
  { key: "highest", label: "Highest value" },
  { key: "lowest",  label: "Lowest value" },
];

function sortOrders(orders: PastOrder[], sort: SortKey): PastOrder[] {
  return [...orders].sort((a, b) => {
    if (sort === "newest")  return b.createdAt.getTime() - a.createdAt.getTime();
    if (sort === "oldest")  return a.createdAt.getTime() - b.createdAt.getTime();
    if (sort === "highest") return b.totalPrice - a.totalPrice;
    if (sort === "lowest")  return a.totalPrice - b.totalPrice;
    return 0;
  });
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── Order Detail Popup ──────────────────────────────────────────── */
function OrderDetailPopup({ order, onClose }: { order: PastOrder; onClose: () => void }) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Blur layer */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[6px]" onClick={onClose} />

      {/* Card — fixed height so it never grows */}
      <div className="relative z-10 w-full max-w-[480px] bg-[#2C1A14] text-white rounded-[28px] shadow-[0_24px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
           style={{ maxHeight: "min(88dvh, 640px)" }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-heading text-[20px] tracking-tight">Order Details</p>
              <p className="text-white/50 text-[14px] mt-0.5">{order.orderId}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-[13px]">
              <Clock className="w-3.5 h-3.5 text-white/60" />
              {formatTime(order.createdAt)} · {formatDate(order.createdAt)}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-[13px]">
              <ShoppingBag className="w-3.5 h-3.5 text-white/60" />
              {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {/* Scrollable item list */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[15px] truncate">{item.name}</p>
                <p className="text-white/50 text-[13px] mt-0.5">₹{item.price} × {item.quantity}</p>
              </div>
              <span className="font-semibold text-[15px] shrink-0">
                ₹{(Number(item.price) * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Footer total */}
        <div className="px-6 py-5 border-t border-white/10 shrink-0 flex items-center justify-between">
          <span className="text-white/60 text-[15px]">Total</span>
          <span className="font-heading text-[24px] tracking-tight text-primary">
            ₹{order.totalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Single order card (horizontal) ─────────────────────────────── */
function OrderCard({ order, onOpen }: { order: PastOrder; onOpen: () => void }) {
  return (
    <div className="bg-surface rounded-[20px] shadow-sm px-5 py-4 flex items-center gap-4 border border-black/5 hover:shadow-[var(--shadow-soft)] transition-shadow">
      {/* Left: time block */}
      <div className="shrink-0 w-[52px] text-center">
        <p className="font-bold text-[15px] text-text leading-tight">
          {formatTime(order.createdAt)}
        </p>
        <p className="text-muted text-[11px] leading-tight mt-0.5">
          {formatDate(order.createdAt)}
        </p>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-black/8 shrink-0" />

      {/* Centre: order id + item count */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Hash className="w-3.5 h-3.5 text-muted shrink-0" />
          <span className="text-[13px] text-muted font-medium tracking-wide">{order.orderId}</span>
        </div>
        <p className="text-[14px] text-text font-medium">
          {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Right: amount + arrow */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-heading text-[20px] tracking-tight text-text">
          ₹{order.totalPrice.toLocaleString()}
        </span>
        <button
          onClick={onOpen}
          className="w-10 h-10 rounded-full bg-[#2C1A14] hover:bg-primary flex items-center justify-center transition-colors shrink-0 shadow-sm"
          aria-label={`View details for ${order.orderId}`}
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-0 pb-20 text-center">
      <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="w-8 h-8 text-muted/50" />
      </div>
      <p className="font-bold text-[18px] text-text mb-1">No orders yet</p>
      <p className="text-muted text-[15px]">Orders you create will appear here.</p>
    </div>
  );
}

/* ─── Main screen ────────────────────────────────────────────────── */
export default function PastOrdersScreen() {
  const { pastOrders, isLoadingOrders } = useOrder();
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedOrder, setSelectedOrder] = useState<PastOrder | null>(null);

  const sorted = useMemo(() => sortOrders(pastOrders, sort), [pastOrders, sort]);

  if (isLoadingOrders) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-[28px] sm:text-[34px] tracking-tight mb-2 text-text">
          Past Orders
        </h1>
        <p className="text-muted text-[15px]">
          {pastOrders.length === 0
            ? "Your completed orders will show up here."
            : `${pastOrders.length} order${pastOrders.length !== 1 ? "s" : ""} placed.`}
        </p>
      </div>

      {/* Filter chips */}
      {pastOrders.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all border ${
                sort === opt.key
                  ? "bg-[#2C1A14] text-white border-transparent shadow-sm"
                  : "bg-surface text-muted border-black/8 hover:border-black/20"
              }`}
            >
              {opt.label}
              {sort === opt.key && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {sorted.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {sorted.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onOpen={() => setSelectedOrder(order)}
            />
          ))}
        </div>
      )}

      {/* Detail popup */}
      {selectedOrder && (
        <OrderDetailPopup
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
