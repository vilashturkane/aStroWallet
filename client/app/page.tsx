"use client";

import Link from "next/link";
import {
  Sparkles,
  Link2,
  Coins,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  LayoutDashboard,
  ImageIcon,
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectWalletButton, useConnectWallet } from "@/components/connect-wallet-button";

const STATS = [
  { icon: Zap, value: "~5s", label: "Settlement time on Stellar" },
  { icon: Coins, value: "$0.0007", label: "Average transaction cost" },
  { icon: Globe, value: "100+", label: "Countries with on/off ramps" },
  { icon: ShieldCheck, value: "100%", label: "Non-custodial — your keys, your crypto" },
];

const STEPS = [
  {
    icon: ImageIcon,
    title: "1 · Upload to IPFS",
    desc: "Token ki image aur metadata JSON Pinata pe pin hoti hai — server-side, credentials kabhi browser me nahi aate.",
  },
  {
    icon: FileCode2,
    title: "2 · Deploy contract",
    desc: "Uploaded WASM se ek naya SEP-41 token contract instance deploy hota hai — Rust me likha, unit-tested.",
  },
  {
    icon: Sparkles,
    title: "3 · Supply minted",
    desc: "Constructor same transaction me poori supply tumhare wallet me mint kar deta hai. Done. 🎉",
  },
];

const CARD_CLASS =
  "group flex flex-col rounded-lg border border-border bg-card p-6 text-left transition-all hover:-translate-y-1";

function FeaturePoints({ points }: { points: string[] }) {
  return (
    <ul className="mt-3 flex-1 space-y-2 text-[13.5px] text-muted-foreground">
      {points.map((p) => (
        <li key={p} className="flex gap-2">
          <span className="text-gold-deep">✦</span> {p}
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const { connect } = useConnectWallet();

  return (
    <div className="animate-fade-up">
      {/* ---------- Hero ---------- */}
      <section className="py-16 text-center sm:py-20">
        <Badge variant="gold" className="mb-5 px-3 py-1 text-xs">
          ✨ Powered by Stellar + Soroban · Testnet
        </Badge>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Your gateway to the{" "}
          <span className="bg-gradient-to-r from-[#C79A00] via-[#E08700] to-lilac bg-clip-text text-transparent">
            Stellar blockchain
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Connect any Stellar wallet, explore your tokens & NFTs, and mint your own Soroban
          tokens with IPFS images — all non-custodial, right in your browser.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ConnectWalletButton size="lg" />
          <Button asChild variant="ghost" size="lg">
            <Link href="/mint">
              <Coins /> Mint a Token
            </Link>
          </Button>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-5 text-center">
            <s.icon className="mx-auto mb-2 h-5 w-5 text-gold-deep" />
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ---------- Features ---------- */}
      <section className="py-14">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight">
          Everything a web3 wallet needs
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Connect karo, explore karo, mint karo — sab kuch testnet pe.
        </p>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {/* Connect — opens the wallet modal directly */}
          <button onClick={connect} className={`${CARD_CLASS} hover:border-lilac`}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-lilac/15 text-lilac">
              <Link2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold">Connect Wallet</h3>
            <FeaturePoints
              points={[
                "Freighter · xBull · Albedo · Lobstr · Hana",
                "One-click via Stellar Wallets Kit modal",
                "Keys stay in YOUR wallet — non-custodial",
                "Connect hote hi dashboard khul jaata hai",
              ]}
            />
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
              Connect <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          {/* Mint */}
          <Link href="/mint" className={`${CARD_CLASS} hover:border-gold`}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold/20 text-gold-deep">
              <Coins className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold">Mint Tokens</h3>
            <FeaturePoints
              points={[
                "SPL-style tokens via Soroban smart contract",
                "Name, symbol, supply, decimals & image",
                "Image + metadata pinned to IPFS (Pinata)",
                "Full supply minted to you in ONE transaction",
              ]}
            />
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
              Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          {/* Dashboard */}
          <Link href="/dashboard" className={`${CARD_CLASS} hover:border-gold`}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold/20 text-gold-deep">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold">Explore Dashboard</h3>
            <FeaturePoints
              points={[
                "XLM balance & all trustline tokens",
                "Classic NFTs with IPFS artwork",
                "Payment history with live timestamps",
                "Send XLM signed by your connected wallet",
              ]}
            />
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
              Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* ---------- How minting works ---------- */}
      <section className="rounded-lg border border-border bg-gradient-to-b from-gold/10 to-transparent p-8 sm:p-10">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight">
          How token minting works
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Solana ke SPL token jaisa — lekin Stellar pe, Soroban smart contract ke saath.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-lg border border-border bg-card p-6">
              <s.icon className="mb-3 h-6 w-6 text-gold-deep" />
              <h3 className="font-display font-bold">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="gold">
            <Link href="/mint">
              <Coins /> Mint your first token
            </Link>
          </Button>
        </div>
      </section>

      {/* ---------- Tech ---------- */}
      <section className="py-14 text-center">
        <h2 className="font-display text-xl font-bold text-muted-foreground">Built with</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            "Next.js 15",
            "Bun",
            "Rust · Soroban SDK",
            "@stellar/stellar-sdk v14",
            "Stellar Wallets Kit",
            "Pinata · IPFS",
            "Tailwind CSS",
            "Zustand",
            "React Query",
          ].map((t) => (
            <Badge key={t} className="px-3 py-1.5 text-xs">
              {t}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
