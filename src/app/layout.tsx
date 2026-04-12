import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "@/context/OrderContext";
import CurrentOrderBar from "@/app/components/CurrentOrderBar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["600"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Ordo",
  description: "Frictionless, visually appetizing point-of-sale and storefront builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex w-screen overflow-x-hidden font-body bg-background text-text">
        <OrderProvider>
          {children}
          <CurrentOrderBar />
        </OrderProvider>
      </body>
    </html>
  );
}
