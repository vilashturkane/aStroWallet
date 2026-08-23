import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata: Metadata = {
  title: "aStroWallet — Stellar Web Wallet",
  description:
    "Non-custodial Stellar wallet: generate SEP-0005 keys, connect Freighter/xBull, explore your XLM, tokens & NFTs, and mint Soroban tokens with IPFS images.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: browser extensions (Grammarly, ColorZilla)
          inject attributes into <body> and falsely trigger hydration errors */}
      <body
        className={`${inter.variable} ${grotesk.variable} font-sans`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="container flex min-h-screen flex-col pb-10">
            <Header />
            <div className="flex-1">{children}</div>
            <footer className="pt-14 text-center text-[13px] text-muted-foreground">
              Designed & Developed for <b className="text-foreground">Stellar</b> · aStroWallet 🚀 ·{" "}
              <span className="font-mono text-[11px]">
                non-custodial · keys never leave your browser
              </span>
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
