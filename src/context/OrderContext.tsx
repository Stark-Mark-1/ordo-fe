"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface MenuItem {
  id: number;
  name: string;
  price: string;
}

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
  // Menu items
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: number) => void;
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

const defaultMenuItems: MenuItem[] = [
  { id: 1, name: "Avocado Toast",   price: "850" },
  { id: 2, name: "Iced Latte",      price: "400" },
  { id: 3, name: "Croissant",       price: "350" },
  { id: 4, name: "Blueberry Muffin",price: "300" },
  { id: 5, name: "Egg Sandwich",    price: "650" },
  { id: 6, name: "Matcha Latte",    price: "450" },
];

export function OrderProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);

  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    setMenuItems((prev) => [
      ...prev,
      { ...item, id: prev.length > 0 ? Math.max(...prev.map((i) => i.id)) + 1 : 1 },
    ]);
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const deleteMenuItem = (id: number) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
  };

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
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
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
