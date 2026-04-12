"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth, ApiStore } from "@/context/AuthContext";

export default function SetupPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, store, setStore } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/");
    // Pre-fill from existing store if user has one (editing)
    if (store) {
      setStoreName(store.name);
      setLocation(store.location ?? "");
      setContactNumber(store.contactNumber ?? "");
    }
  }, [isLoading, isAuthenticated, store, router]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
    setContactNumber(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      let newStore: ApiStore;

      if (store) {
        // Update existing store, advance onboarding to "menu" step
        const data = await api.patch<{ store: ApiStore }>(
          `/stores/${store.id}`,
          {
            name: storeName,
            location,
            contactNumber,
            onboardingStep: "menu",
          }
        );
        newStore = data.store;
      } else {
        // Create the store
        const created = await api.post<{ store: ApiStore }>("/stores", {
          name: storeName,
          location,
          contactNumber,
        });
        newStore = created.store;

        // Immediately advance to "menu" onboarding step
        const advanced = await api.patch<{ store: ApiStore }>(
          `/stores/${newStore.id}`,
          { onboardingStep: "menu" }
        );
        newStore = advanced.store;
      }

      setStore(newStore);
      router.push("/menu-builder");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen w-screen flex items-center justify-center relative bg-background">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-text hover:text-primary transition-colors flex items-center justify-center w-10 h-10 bg-surface rounded-full shadow-[var(--shadow-soft)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
      </Link>

      {/* Setup Card */}
      <div className="bg-surface rounded-3xl shadow-[var(--shadow-soft)] p-6 sm:p-10 max-w-[500px] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[#A99790] text-[12px] font-bold tracking-[0.15em] uppercase mb-2">
            Step 1 of 2
          </p>
          <h1 className="font-heading text-[26px] sm:text-[32px] tracking-tight mb-2 text-text">
            Set up your storefront
          </h1>
          <p className="text-muted text-[15px] opacity-90">
            Let&apos;s get the basics down so you can start selling.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Store Name */}
          <div className="flex flex-col gap-2">
            <label className="text-text font-bold text-[13px] ml-1">
              Store Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. The Daily Bread"
              className="w-full h-[56px] px-4 bg-[#F8F6F2] rounded-[16px] text-text placeholder:text-[#A99790] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <label className="text-text font-bold text-[13px] ml-1">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A99790" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Neighborhood, or Street"
                className="w-full h-[56px] pl-[40px] pr-4 bg-[#F8F6F2] rounded-[16px] text-text placeholder:text-[#A99790] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
              />
            </div>
          </div>

          {/* Contact Number */}
          <div className="flex flex-col gap-2 mb-2">
            <label className="text-text font-bold text-[13px] ml-1">
              Contact Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A99790" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={11}
                value={contactNumber}
                onChange={handleNumberChange}
                placeholder="1234567890"
                className="w-full h-[56px] pl-[40px] pr-4 bg-[#F8F6F2] rounded-[16px] text-text placeholder:text-[#A99790] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-[13px]">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[56px] bg-primary hover:bg-[#c44e2b] disabled:opacity-60 text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2 shadow-[var(--shadow-soft)]"
          >
            {submitting ? "Saving..." : "Build Menu"}
            {!submitting && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
