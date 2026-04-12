"use client";

import { useState, useEffect, useRef } from "react";
import { Minus, Plus, ShoppingBag, X, ArrowRight, CheckCircle } from "lucide-react";
import { useOrder } from "@/context/OrderContext";

/* ─── Open Bag SVG (bag with open top / flap open) ─────────────────────── */
function BagOpen({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* bag body */}
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      {/* open flap line */}
      <line x1="3" y1="6" x2="21" y2="6" />
      {/* no handle — open top feel */}
    </svg>
  );
}

/* ─── Order Success Overlay ──────────────────────────────────────────────── */
function OrderSuccessOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [phase, setPhase] = useState<"in" | "show" | "out">("in");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Phase: animate in → show → auto-out after 5s
    const inTimer = setTimeout(() => setPhase("show"), 50);

    timerRef.current = setTimeout(() => {
      setPhase("out");
      setTimeout(onDismiss, 500);
    }, 5000);

    return () => {
      clearTimeout(inTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("out");
    setTimeout(onDismiss, 500);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-500 ${
        phase === "in"
          ? "opacity-0 backdrop-blur-0 bg-black/0"
          : phase === "show"
          ? "opacity-100 backdrop-blur-[12px] bg-black/30"
          : "opacity-0 backdrop-blur-0 bg-black/0"
      }`}
    >
      {/* Card */}
      <div
        className={`flex flex-col items-center gap-6 transition-all duration-500 ${
          phase === "show" ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-8"
        }`}
      >
        {/* Animated check ring */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Pulsing glow rings */}
          <span className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-green-400/15 animate-ping [animation-delay:150ms]" />
          {/* Solid circle */}
          <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.4)]">
            <CheckCircle className="w-12 h-12 text-green-500 stroke-[1.5]" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="font-heading text-white text-[28px] tracking-tight drop-shadow-lg">
            Order Created!
          </p>
        </div>

        {/* Dismiss cross */}
        <button
          onClick={handleDismiss}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function CurrentOrderBar() {
  const { orderItems, totalItems, totalPrice, updateQuantity, clearOrder, createOrder } = useOrder();
  const [expanded, setExpanded] = useState(false);
  const [animatingIn, setAnimatingIn] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (totalItems > 0 && prevCount === 0) {
      setAnimatingIn(true);
      setTimeout(() => setAnimatingIn(false), 50);
    }
    if (totalItems === 0) setExpanded(false);
    setPrevCount(totalItems);
  }, [totalItems]);

  const handleCreateOrder = () => {
    createOrder();        // snapshot → pastOrders, clears current
    setExpanded(false);
    setShowSuccess(true);
  };

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    // order already cleared by createOrder()
  };

  if (totalItems === 0 && !showSuccess) return null;

  return (
    <>
      {/* ── Success overlay ── */}
      {showSuccess && <OrderSuccessOverlay onDismiss={handleSuccessDismiss} />}

      {/* ── Dim backdrop behind expanded card ── */}
      {expanded && !showSuccess && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* ── Floating order bar ── */}
      {totalItems > 0 && !showSuccess && (
        <div
          className={`fixed left-0 right-0 z-50 px-4 transition-all duration-300 ease-out ${
            animatingIn ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{ bottom: "calc(72px + env(safe-area-inset-bottom) + 12px)" }}
        >
          <div className="max-w-[800px] mx-auto">
            <div className="bg-[#2C1A14] text-white rounded-[24px] shadow-[0_8px_40px_rgba(44,26,20,0.30)] overflow-hidden">

              {/* ── Expanded detail panel ── */}
              {expanded && (
                <div className="px-5 pt-5 pb-3 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading text-[17px] tracking-tight opacity-90">
                      Current Order
                    </span>
                    <button
                      onClick={clearOrder}
                      className="text-[13px] text-red-400 hover:text-red-300 transition-colors font-medium flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[15px] leading-snug truncate">
                            {item.name}
                          </p>
                          <p className="text-[13px] text-white/50 mt-0.5">
                            ₹{item.price} each
                          </p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            aria-label={`Remove one ${item.name}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center font-bold text-[16px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            aria-label={`Add one more ${item.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line total */}
                        <span className="text-[14px] font-semibold text-white/80 w-16 text-right shrink-0">
                          ₹{(Number(item.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Summary row ── */}
              <div className="flex items-center justify-between px-5 py-4 gap-3">

                {/* Left: bag icon (toggles expand) + counts */}
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                  aria-label={expanded ? "Collapse order" : "Expand order"}
                  aria-expanded={expanded}
                >
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 active:scale-90">
                    {expanded ? (
                      <BagOpen className="w-5 h-5 text-white" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[15px] leading-tight">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </p>
                    <p className="text-[13px] text-white/50 leading-tight">Current order</p>
                  </div>
                </button>

                {/* Centre: total price */}
                <span className="font-heading text-[20px] tracking-tight shrink-0">
                  ₹{totalPrice.toLocaleString()}
                </span>

                {/* Right: create order arrow button */}
                <button
                  onClick={handleCreateOrder}
                  className="w-10 h-10 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center shrink-0 transition-all duration-150 active:scale-90 shadow-[0_4px_16px_rgba(217,93,57,0.4)]"
                  aria-label="Create order"
                  id="create-order-btn"
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
