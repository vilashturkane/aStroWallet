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
  Github,
  ExternalLink,
  Activity,
  Cpu,
  Terminal,
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
        <p className="mt-5 text-[13.5px] text-muted-foreground">
          Built by{" "}
          <a
            href="https://github.com/vilashturkane"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Vilash Turkane
          </a>
          {" · "}
          <a
            href="https://github.com/vilashturkane/aStroWallet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-foreground underline-offset-4 hover:underline"
          >
            <Github className="h-3.5 w-3.5" /> GitHub Repo
          </a>
          {" · "}
          <a
            href="https://a-stro-wallet.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-gold-deep underline-offset-4 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Live App
          </a>
        </p>
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

      {/* ---------- About Stellar ---------- */}
      <section className="py-14">
        <div className="mb-8 text-center">
          <Badge variant="gold" className="mb-4 px-3 py-1 text-xs">
            🌐 The Network
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight">What is Stellar?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Stellar is an open-source, decentralized blockchain protocol built for fast, low-cost
            global payments and asset tokenization. Unlike proof-of-work chains, Stellar uses the{" "}
            <strong>Stellar Consensus Protocol (SCP)</strong> — energy-efficient, with finality in
            ~5 seconds.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <Activity className="mb-3 h-6 w-6 text-gold-deep" />
            <h3 className="font-display font-bold">Stellar Consensus Protocol</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              SCP is a federated Byzantine agreement protocol. No mining, no energy waste —
              validators agree through overlapping quorum slices, giving fast and deterministic
              finality without a single point of control.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Zap className="mb-3 h-6 w-6 text-gold-deep" />
            <h3 className="font-display font-bold">~5s Settlements · $0.0007 Fees</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Transactions confirm in under 5 seconds with a base fee of 100 stroops (~$0.0007).
              Surge pricing only kicks in under extreme load — still orders of magnitude cheaper
              than Ethereum gas fees.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Globe className="mb-3 h-6 w-6 text-gold-deep" />
            <h3 className="font-display font-bold">Global Anchors & Fiat Ramps</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Anchors bridge fiat and Stellar assets via SEP-6 / SEP-24. Users deposit USD or EUR
              and receive tokenized equivalents like USDC directly on-chain — available in 100+
              countries.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Coins className="mb-3 h-6 w-6 text-gold-deep" />
            <h3 className="font-display font-bold">Built-in DEX & AMM</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Stellar has a native decentralized exchange and automated market maker at the protocol
              level. Path payments auto-route through the best available liquidity — no external
              DEX required.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <ShieldCheck className="mb-3 h-6 w-6 text-gold-deep" />
            <h3 className="font-display font-bold">Accounts & Trustlines</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Every Stellar account is an Ed25519 keypair (<code className="font-mono text-xs">G...</code>{" "}
              public / <code className="font-mono text-xs">S...</code> secret). Assets require explicit
              trustlines — you only hold what you explicitly choose to accept.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <FileCode2 className="mb-3 h-6 w-6 text-gold-deep" />
            <h3 className="font-display font-bold">Soroban Smart Contracts</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Stellar's smart contract layer runs Rust-compiled WASM contracts on-chain.
              Deterministic, resource-metered, and simulation-first — you know the exact cost
              before signing any transaction.
            </p>
          </div>
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

      {/* ---------- Contract Details ---------- */}
      <section className="py-14">
        <div className="mb-8 text-center">
          <Badge variant="gold" className="mb-4 px-3 py-1 text-xs">
            📄 On-Chain Contract
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            aStroToken — SEP-41 Contract
          </h2>
          <p className="mt-3 text-muted-foreground">
            The deployed Soroban token contract powering every token minted via aStroWallet.
          </p>
        </div>
        <div className="mb-6 rounded-lg border border-border bg-card p-6 font-mono text-sm">
          <p className="mb-1 font-sans text-xs text-muted-foreground">Testnet WASM Hash</p>
          <p className="break-all text-gold-deep">
            a521d37e154dc3a1aa2f5d45755af6813c2d1ab6685c1f312cd954cfc33ca85d
          </p>
          <div className="mt-3 flex flex-wrap gap-4 font-sans text-xs text-muted-foreground">
            <span>Network: <strong className="text-foreground">Stellar Testnet</strong></span>
            <span>Standard: <strong className="text-foreground">SEP-41</strong></span>
            <span>Language: <strong className="text-foreground">Rust (no_std)</strong></span>
            <span>SDK: <strong className="text-foreground">soroban-sdk v23</strong></span>
            <span>TTL: <strong className="text-foreground">~90 days (auto-bumped)</strong></span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold">Function</th>
                <th className="px-4 py-3 text-left font-semibold">Access</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[13px] text-muted-foreground">
              {[
                { fn: "constructor(...)", access: "Deploy-time", desc: "Init metadata + mint full supply to admin in one transaction" },
                { fn: "transfer(from, to, amount)", access: "Token holder", desc: "Transfer tokens between accounts" },
                { fn: "approve(from, spender, amount)", access: "Token holder", desc: "Approve a spender allowance with expiry ledger" },
                { fn: "transfer_from(spender, from, to)", access: "Spender", desc: "Transfer on behalf of an approved account" },
                { fn: "burn(from, amount)", access: "Token holder", desc: "Permanently destroy tokens" },
                { fn: "mint(to, amount)", access: "Admin only 🔒", desc: "Mint additional tokens after initial deploy" },
                { fn: "set_admin(new_admin)", access: "Admin only 🔒", desc: "Transfer admin role to a new address" },
                { fn: "balance(id)", access: "Public", desc: "Query token balance of any address" },
                { fn: "allowance(from, spender)", access: "Public", desc: "Query approved spending allowance" },
                { fn: "total_supply()", access: "Public", desc: "Get total circulating token supply" },
                { fn: "token_uri()", access: "Public", desc: "IPFS metadata URI — Metaplex-style JSON" },
                { fn: "decimals() / name() / symbol()", access: "Public", desc: "Standard SEP-41 token metadata" },
              ].map((row) => (
                <tr key={row.fn} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-[12px] text-foreground">{row.fn}</td>
                  <td className="px-4 py-3">{row.access}</td>
                  <td className="px-4 py-3">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Soroban & Rust ---------- */}
      <section className="rounded-lg border border-border bg-gradient-to-b from-lilac/10 to-transparent p-8 sm:p-10">
        <div className="mb-8 text-center">
          <Badge variant="gold" className="mb-4 px-3 py-1 text-xs">
            ⚙️ Smart Contracts
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight">Soroban · Rust · WASM</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Soroban is Stellar’s native smart contract platform. Contracts are written in{" "}
            <strong>Rust</strong>, compiled to <strong>WebAssembly (WASM)</strong>, and executed in
            a deterministic, resource-metered sandbox on every validator.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <Cpu className="mb-3 h-6 w-6 text-lilac" />
            <h3 className="font-display font-bold">Why Rust?</h3>
            <ul className="mt-3 space-y-2 text-[13.5px] text-muted-foreground">
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> Memory-safe without a garbage collector — no runtime panics from null pointers</li>
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> Zero-cost abstractions keep the compiled WASM binary tiny</li>
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> <code className="font-mono text-xs">#![no_std]</code> — no standard library overhead inside contracts</li>
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> Ownership model prevents double-spend bugs at compile time</li>
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> Soroban SDK v23 provides all contract primitives natively</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <Terminal className="mb-3 h-6 w-6 text-lilac" />
            <h3 className="font-display font-bold">How Soroban Works</h3>
            <ul className="mt-3 space-y-2 text-[13.5px] text-muted-foreground">
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> Write contract in Rust → compile to <code className="font-mono text-xs">.wasm</code> via Cargo</li>
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> Upload WASM to Stellar network → get a unique WASM hash</li>
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> Deploy an instance from the hash → get a contract address (<code className="font-mono text-xs">C...</code>)</li>
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> Simulate first → see exact resource fees and state diff before signing</li>
              <li className="flex gap-2"><span className="text-gold-deep">❖</span> TTL (time-to-live) keeps contract storage alive on-chain automatically</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Tech ---------- */}
      <section className="py-14">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight">Tech Stack</h2>
        <p className="mt-2 text-center text-muted-foreground">Every layer of aStroWallet, explained.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Next.js 15", icon: "▲",
              desc: "App Router, Server Components, and API routes. The /api/pinata route keeps the Pinata JWT safely server-side.",
              color: "text-foreground",
            },
            {
              name: "Rust + Soroban SDK v23", icon: "⚙️",
              desc: "Smart contract in Rust (#![no_std]), compiled to WASM, unit-tested with 6 snapshot tests, deployed to Stellar testnet.",
              color: "text-orange-400",
            },
            {
              name: "@stellar/stellar-sdk v14", icon: "★",
              desc: "Official JS SDK for building, simulating (prepareTransaction), and submitting Stellar + Soroban transactions.",
              color: "text-blue-400",
            },
            {
              name: "Stellar Wallets Kit", icon: "🔑",
              desc: "Unified wallet modal supporting Freighter, xBull, Albedo, Lobstr, and Hana — one clean API for all of them.",
              color: "text-purple-400",
            },
            {
              name: "Pinata · IPFS", icon: "📌",
              desc: "Token images and metadata JSON are pinned to IPFS server-side. The JWT never reaches the browser bundle.",
              color: "text-pink-400",
            },
            {
              name: "Bun", icon: "🥟",
              desc: "All-in-one JS runtime, package manager, and bundler. Significantly faster cold starts than npm or yarn.",
              color: "text-yellow-400",
            },
            {
              name: "Tailwind CSS", icon: "🎨",
              desc: "Utility-first CSS with a custom dark theme — gold + lilac accent palette, fluid responsive grid layouts.",
              color: "text-cyan-400",
            },
            {
              name: "Zustand", icon: "🐻",
              desc: "Minimal global state for wallet connection status, public key, balances, and dashboard data across routes.",
              color: "text-green-400",
            },
            {
              name: "React Query", icon: "⚡",
              desc: "Async data fetching with caching and background refresh for Horizon API calls — stale-while-revalidate pattern.",
              color: "text-red-400",
            },
          ].map((t) => (
            <div key={t.name} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className={`text-lg ${t.color}`}>{t.icon}</span>
                <h3 className="font-display text-sm font-bold">{t.name}</h3>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
