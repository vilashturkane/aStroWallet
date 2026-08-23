import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { Github, ExternalLink } from "lucide-react";
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
            <footer className="border-t border-border pb-6 pt-10 text-center text-[13px] text-muted-foreground">
              <div className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
                <a
                  href="https://github.com/vilashturkane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-foreground transition-colors hover:text-gold-deep"
                >
                  <Github className="h-4 w-4" /> Vilash Turkane
                </a>
                <a
                  href="https://github.com/vilashturkane/aStroWallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Github className="h-4 w-4" /> GitHub Repo
                </a>
                <a
                  href="https://a-stro-wallet.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-gold-deep transition-colors hover:underline"
                >
                  <ExternalLink className="h-4 w-4" /> Live App
                </a>
                <a
                  href="https://stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Stellar Network
                </a>
                <a
                  href="https://developers.stellar.org/docs/build/smart-contracts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Soroban Docs
                </a>
              </div>
              <p className="text-xs text-muted-foreground/80">
                Designed & Developed by{" "}
                <strong className="text-foreground">Vilash Turkane</strong> · aStroWallet 🚀 ·
                Stellar Testnet ·{" "}
                <span className="font-mono">non-custodial · keys never leave your browser</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground/50">© 2025 aStroWallet · MIT License</p>
            </footer>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
