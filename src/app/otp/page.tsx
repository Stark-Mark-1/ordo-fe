"use client";

import { useState, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const correctOtp = "123456";

  const handleVerify = () => {
    if (otp === correctOtp) {
      setSuccess(true);
      setError(false);
      setTimeout(() => {
        router.push('/setup');
      }, 500);
    } else {
      setError(true);
      setTimeout(() => {
        setOtp("");
        setError(false);
        inputRef.current?.focus();
      }, 600);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <main className="min-h-screen w-screen flex items-center justify-center relative bg-background">
      {/* Back Button */}
      <Link href="/" className="absolute top-8 left-8 text-text hover:text-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
      </Link>

      {/* OTP Card */}
      <div className="bg-surface rounded-3xl shadow-[var(--shadow-soft)] p-8 sm:p-12 max-w-[500px] w-full mx-4 flex flex-col items-center text-center">
        
        {/* Mail Icon Highlight */}
        <div className="w-[52px] h-[52px] rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#D95D39" stroke="#D95D39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>

        {/* Headings */}
        <h1 className="font-heading text-[26px] sm:text-[32px] tracking-tight mb-2">Check your oven</h1>
        <p className="text-muted text-[15px] mb-8 opacity-90">We sent a 6-digit code to your email</p>

        {/* OTP Input */}
        <div className="w-full max-w-[300px] mb-8">
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

        {/* Verify Button */}
        <button 
          onClick={handleVerify}
          disabled={otp.length !== 6}
          className={`w-full max-w-[300px] h-[52px] font-semibold rounded-[14px] transition-opacity text-[16px] mb-6 ${
            otp.length === 6 ? "bg-primary text-surface hover:opacity-90" : "bg-muted/20 text-muted/50 cursor-not-allowed"
          }`}
        >
          Verify OTP
        </button>

        {/* Resend Link */}
        <button className="text-primary text-[14px] font-semibold hover:opacity-80 transition-opacity">
          Resend code
        </button>

      </div>
    </main>
  );
}
