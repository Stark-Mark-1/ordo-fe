"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { api, ApiError } from "@/lib/api";

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
}

export interface ApiStore {
  id: string;
  name: string;
  location: string | null;
  contactNumber: string | null;
  onboardingStep: string;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  token: string | null;
  user: ApiUser | null;
  storeId: string | null;
  store: ApiStore | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    token: string,
    user: ApiUser,
    storeId: string | null,
    store?: ApiStore | null
  ) => void;
  logout: () => void;
  setStore: (store: ApiStore) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [store, setStoreState] = useState<ApiStore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("ordo_token");
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    // Validate against GET /me
    api
      .get<{
        user: ApiUser;
        store: ApiStore | null;
        nextRoute: string;
      }>("/me")
      .then((data) => {
        setToken(savedToken);
        setUser(data.user);
        setStoreState(data.store);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("ordo_token");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    (
      newToken: string,
      newUser: ApiUser,
      storeId: string | null,
      newStore?: ApiStore | null
    ) => {
      localStorage.setItem("ordo_token", newToken);
      if (storeId) localStorage.setItem("ordo_store_id", storeId);
      setToken(newToken);
      setUser(newUser);
      setStoreState(newStore ?? null);
    },
    []
  );

  const logout = useCallback(() => {
    // Best-effort server logout
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("ordo_token");
    localStorage.removeItem("ordo_store_id");
    setToken(null);
    setUser(null);
    setStoreState(null);
  }, []);

  const setStore = useCallback((s: ApiStore) => {
    setStoreState(s);
    localStorage.setItem("ordo_store_id", s.id);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        storeId: store?.id ?? null,
        store,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        setStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
