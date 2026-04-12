"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
}

export interface PastOrder {
  orderId: string;
  createdAt: Date;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
}

interface OrderContextType {
  // Current order
  orderItems: OrderItem[];
  addItem: (item: Omit<OrderItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearOrder: () => void;
  totalItems: number;
  totalPrice: number;
  // Past orders
  pastOrders: PastOrder[];
  createOrder: () => void; // finalises current order → pastOrders
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function generateOrderId() {
  return "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);

  const addItem = (item: Omit<OrderItem, "quantity">) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setOrderItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setOrderItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearOrder = () => setOrderItems([]);

  const totalItems = orderItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = orderItems.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0
  );

  const createOrder = () => {
    if (orderItems.length === 0) return;
    const snapshot: PastOrder = {
      orderId: generateOrderId(),
      createdAt: new Date(),
      items: [...orderItems],
      totalItems,
      totalPrice,
    };
    setPastOrders((prev) => [snapshot, ...prev]);
    setOrderItems([]);
  };

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        addItem,
        removeItem,
        updateQuantity,
        clearOrder,
        totalItems,
        totalPrice,
        pastOrders,
        createOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within an OrderProvider");
  return ctx;
}
