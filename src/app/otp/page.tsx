"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function OTPPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem("ordo_pending_email") ?? ""
      : "";

  // If no email in session (direct navigation), go back to landing
  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("ordo_pending_email")) {
      router.replace("/");
    }
  }, [router]);

  const handleVerify = async () => {
    if (otp.length !== 6 || isLoading) return;
    setIsLoading(true);
    setError(false);
    setErrorMsg("");

    try {
      const data = await api.post<{
        token: string;
        nextRoute: string;
        storeId: string | null;
        user: { id: string; email: string; name: string | null };
      }>("/auth/otp/verify", { email, code: otp });

      login(data.token, data.user, data.storeId);
      setSuccess(true);
      sessionStorage.removeItem("ordo_pending_email");

      setTimeout(() => {
        router.push(data.nextRoute);
      }, 400);
    } catch (err) {
      let msg = "Invalid code. Please try again.";
      if (err instanceof ApiError) {
        if (err.code === "OTP_EXPIRED") msg = "Code expired. Please request a new one.";
        else if (err.code === "RATE_LIMITED") msg = "Too many attempts. Request a new code.";
        else msg = err.message;
      }
      setErrorMsg(msg);
      setError(true);
      setTimeout(() => {
        setOtp("");
        setError(false);
        inputRef.current?.focus();
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendLoading) return;
    setResendLoading(true);
    setResendMsg("");
    try {
      await api.post("/auth/otp/resend", { email });
      setResendMsg("New code sent!");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setResendMsg(err.message);
      } else {
        // If no active OTP, request a fresh one
        await api.post("/auth/otp/request", { email }).catch(() => {});
        setResendMsg("New code sent!");
      }
    } finally {
      setResendLoading(false);
      setTimeout(() => setResendMsg(""), 4000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 6) setOtp(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
    if (e.key === "Enter") handleVerify();
  };

  return (
    <main className="min-h-screen w-screen flex items-center justify-center relative bg-background">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-text hover:text-primary transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
      </Link>

      {/* OTP Card */}
      <div className="bg-surface rounded-3xl shadow-[var(--shadow-soft)] p-8 sm:p-12 max-w-[500px] w-full mx-4 flex flex-col items-center text-center">
        {/* Mail Icon */}
        <div className="w-[52px] h-[52px] rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#D95D39" stroke="#D95D39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>

        <h1 className="font-heading text-[26px] sm:text-[32px] tracking-tight mb-2">
          Check your oven
        </h1>
        <p className="text-muted text-[15px] mb-1 opacity-90">
          We sent a 6-digit code to
        </p>
        <p className="text-text font-semibold text-[15px] mb-8">{email}</p>

        {/* OTP Input */}
        <div className="w-full max-w-[300px] mb-3">
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="123456"
            className={`w-full h-[56px] px-4 text-[20px] text-center bg-surface border border-muted/40 rounded-[12px] outline-none transition-all text-text font-medium placeholder:text-muted/50 tracking-[0.25em] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              success
                ? "border-success ring-1 ring-success"
                : error
                ? "border-red-500 ring-1 ring-red-500"
                : "focus:border-primary focus:ring-1 focus:ring-primary"
            }`}
          />
        </div>

        {errorMsg && (
          <p className="text-red-500 text-[13px] mb-4">{errorMsg}</p>
        )}
        {!errorMsg && <div className="mb-4" />}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isLoading}
          className={`w-full max-w-[300px] h-[52px] font-semibold rounded-[14px] transition-opacity text-[16px] mb-6 ${
            otp.length === 6 && !isLoading
              ? "bg-primary text-surface hover:opacity-90"
              : "bg-muted/20 text-muted/50 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Resend */}
        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="text-primary text-[14px] font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {resendLoading ? "Sending..." : "Resend code"}
        </button>
        {resendMsg && (
          <p className="text-muted text-[13px] mt-2">{resendMsg}</p>
        )}
      </div>
    </main>
  );
}
