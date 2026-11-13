import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

// Initialize event bus subscribers (notifications, etc.) at app startup.
// This ensures the MercurJS subscriber pattern is active for all requests.
import "@/lib/notify";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

/**
 * Display face — Fraunces, self-hosted (latin variable subset in
 * public/fonts). next/font/local is build-safe: no runtime or build-time
 * requests to third-party servers.
 */
const fraunces = localFont({
  src: "../public/fonts/Fraunces-Variable.woff2",
  weight: "300 900",
  style: "normal",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  variable: "--font-display-fraunces",
});

export const metadata: Metadata = {
  title: "VAN",
  description: "Everything a farm needs. In one place.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
