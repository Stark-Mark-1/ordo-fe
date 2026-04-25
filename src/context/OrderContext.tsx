"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api, paiseToRupees, rupeesToPaise } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────

export interface MenuItem {
  id: string;       // UUID from backend
  name: string;
  price: string;    // rupees for display: "850"
  description?: string;
}

export interface OrderItem {
  id: string;       // UUID from backend menu item
  name: string;
  price: string;    // rupees for display: "850"
  quantity: number;
}

export interface PastOrder {
  orderId: string;
  createdAt: Date;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number; // rupees
}

interface OrderContextType {
  // Menu
  menuItems: MenuItem[];
  isLoadingMenu: boolean;
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  refreshMenu: () => Promise<void>;

  // Current order (local, in-progress)
  orderItems: OrderItem[];
  addItem: (item: Omit<OrderItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearOrder: () => void;
  totalItems: number;
  totalPrice: number;

  // Past orders
  pastOrders: PastOrder[];
  isLoadingOrders: boolean;
  createOrder: () => Promise<void>;
  refreshPastOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// ─── Adapter helpers ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptMenuItem(raw: any): MenuItem {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? undefined,
    price: paiseToRupees(raw.price),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptOrder(raw: any): PastOrder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: OrderItem[] = raw.lineItems.map((li: any) => ({
    id: li.menuItemId ?? li.id,
    name: li.name,
    price: paiseToRupees(li.price),
    quantity: li.quantity,
  }));
  return {
    orderId: raw.id,
    createdAt: new Date(raw.createdAt),
    items,
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    totalPrice: raw.totalAmount / 100,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────

export function OrderProvider({ children }: { children: ReactNode }) {
  const { storeId, isAuthenticated } = useAuth();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // ── Fetch menu from backend ──────────────────────────────────────────────
  const refreshMenu = useCallback(async () => {
    if (!storeId) return;
    setIsLoadingMenu(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await api.get<{ items: any[] }>(`/stores/${storeId}/menu`);
      setMenuItems(data.items.map(adaptMenuItem));
    } catch {
      // keep existing items on error
    } finally {
      setIsLoadingMenu(false);
    }
  }, [storeId]);

  // ── Fetch past orders ────────────────────────────────────────────────────
  const refreshPastOrders = useCallback(async () => {
    if (!storeId) return;
    setIsLoadingOrders(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await api.get<{ orders: any[] }>(
        `/stores/${storeId}/orders`
      );
      setPastOrders(data.orders.map(adaptOrder));
    } catch {
      // keep existing
    } finally {
      setIsLoadingOrders(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (isAuthenticated && storeId) {
      refreshMenu();
      refreshPastOrders();
    }
    if (!isAuthenticated) {
      setMenuItems([]);
      setPastOrders([]);
      setOrderItems([]);
    }
  }, [storeId, isAuthenticated, refreshMenu, refreshPastOrders]);

  // ── Menu CRUD ────────────────────────────────────────────────────────────

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    if (!storeId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await api.post<{ item: any }>(`/stores/${storeId}/menu`, {
      name: item.name,
      description: item.description,
      price: rupeesToPaise(item.price),
    });
    setMenuItems((prev) => [...prev, adaptMenuItem(data.item)]);
  };

  const updateMenuItem = async (item: MenuItem) => {
    if (!storeId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await api.patch<{ item: any }>(
      `/stores/${storeId}/menu/${item.id}`,
      {
        name: item.name,
        description: item.description,
        price: rupeesToPaise(item.price),
      }
    );
    setMenuItems((prev) =>
      prev.map((m) => (m.id === item.id ? adaptMenuItem(data.item) : m))
    );
  };

  const deleteMenuItem = async (id: string) => {
    if (!storeId) return;
    await api.delete(`/stores/${storeId}/menu/${id}`);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    // Remove from current order too
    setOrderItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ── Current order ────────────────────────────────────────────────────────

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

  const removeItem = (id: string) => {
    setOrderItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
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

  // ── Create order (calls backend) ─────────────────────────────────────────

  const createOrder = async () => {
    if (!storeId || orderItems.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await api.post<{ order: any }>(`/stores/${storeId}/orders`, {
      items: orderItems.map((i) => ({
        menuItemId: i.id,
        quantity: i.quantity,
      })),
    });

    const newOrder = adaptOrder(data.order);
    setPastOrders((prev) => [newOrder, ...prev]);
    setOrderItems([]);
  };

  return (
    <OrderContext.Provider
      value={{
        menuItems,
        isLoadingMenu,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        refreshMenu,
        orderItems,
        addItem,
        removeItem,
        updateQuantity,
        clearOrder,
        totalItems,
        totalPrice,
        pastOrders,
        isLoadingOrders,
        createOrder,
        refreshPastOrders,
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
