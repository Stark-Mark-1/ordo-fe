import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden flex relative">
      {/* Left Panel (Content) */}
      <div className="w-full lg:w-[60%] h-full flex flex-col p-6 pt-16 lg:px-[120px] lg:pt-[60px] relative z-20 bg-background lg:bg-transparent">
        
        {/* Logo Header */}
        <div className="flex items-center gap-2 mb-12 lg:mb-[12vh]">
          {/* Cutlery Icon in Primary Color */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D95D39" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m20 4-4 4"/>
            <path d="m11 13-3 3"/>
            <path d="M4 20h2l3-3"/>
            <path d="M7 17v-2l3-3"/>
            <path d="M8 8V6l3-3"/>
            <path d="M6 10H4l-3-3"/>
          </svg>
          <span className="font-heading font-semibold text-[26px] tracking-tight text-text">Ordo</span>
        </div>

        {/* Hero Content */}
        <div className="max-w-[540px]">
          <h1 className="font-heading text-[44px] lg:text-[56px] leading-[1.05] mb-6 text-text tracking-tight">Start selling in three<br/>minutes.</h1>
          <p className="text-muted text-[17px] leading-[1.6] mb-12 pr-4 lg:pr-12">
            Frictionless, visually appetizing point-of-sale and storefront builder for independent food vendors. Turn chaotic order-taking into a streamlined, joyful process.
          </p>

          {/* Form */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              {/* Mail Icon */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#8A736A" stroke="#8A736A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <input type="email" placeholder="chef@kitchen.com" 
                     className="w-full h-[56px] pl-[44px] pr-4 bg-surface rounded-[16px] shadow-[var(--shadow-soft)] text-text focus:ring-2 focus:ring-primary border border-transparent focus:border-transparent outline-none transition-all placeholder:text-[#8A736A] placeholder:opacity-70 text-[15px]" />
            </div>
            <Link href="/otp" className="h-[56px] px-8 bg-primary hover:bg-[#c44e2b] text-white font-medium rounded-full transition-colors flex items-center justify-center gap-2 shadow-[var(--shadow-soft)] flex-shrink-0 text-[15px]">
              Get Started 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-2 mt-2 text-[14px] text-muted">
            {/* Solid Green Check Circle */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#5D7B64" stroke="#5D7B64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="#5D7B64" opacity="0.1"/>
              <circle cx="12" cy="12" r="10" fill="#5D7B64" stroke="none" />
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="opacity-80">No credit card required to start</span>
          </div>
        </div>
      </div>

      {/* Right Panel (Background Image with Fade) */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
        {/* Fading Gradient overlay */}
        <div className="absolute inset-y-0 left-[50%] w-[20%] bg-gradient-to-r from-background to-transparent z-10"></div>
        {/* Deep fade for blending */}
        <div className="absolute inset-y-0 left-0 w-[55%] bg-background z-10"></div>
        <Image src="/assets/images/pizza.png" alt="Delicious Food" fill style={{ objectFit: 'cover' }} className="absolute inset-y-0 right-0 !w-[55%] !left-auto h-full" priority />
        {/* Optional Warm Orange Overlay */}
        <div className="absolute inset-y-0 right-0 w-[55%] h-full bg-primary/5 mix-blend-color-burn"></div>
      </div>
    </main>
  );
}
