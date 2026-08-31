# 🚀 aStroWallet

[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/vilashturkane/aStroWallet/ci.yml?branch=main&label=CI%2FCD%20Pipeline&logo=githubactions&logoColor=white)](https://github.com/vilashturkane/aStroWallet/actions/workflows/ci.yml)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-7B36D9?logo=stellar&logoColor=white)](https://stellar.expert/explorer/testnet/contract-wasm/a521d37e154dc3a1aa2f5d45755af6813c2d1ab6685c1f312cd954cfc33ca85d)
[![Rust](https://img.shields.io/badge/Rust-soroban--sdk%2023-DEA584?logo=rust&logoColor=black)](contract/src/lib.rs)
[![Next.js](https://img.shields.io/badge/Next.js-15%20(App%20Router)-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-runtime-FBF0DF?logo=bun&logoColor=black)](https://bun.sh)
[![Stellar SDK](https://img.shields.io/badge/%40stellar%2Fstellar--sdk-14-FDDA24?logo=stellar&logoColor=black)](https://www.npmjs.com/package/@stellar/stellar-sdk)
[![StellarWalletsKit](https://img.shields.io/badge/StellarWalletsKit-Freighter%20%C2%B7%20xBull%20%C2%B7%20Albedo%20%2B%20more-6E56CF)](https://stellarwalletskit.dev)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-state-443E38?logo=react&logoColor=white)](https://zustand.docs.pmnd.rs)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://a-stro-wallet.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-97CA00)](LICENSE)

A full-stack, non-custodial **Stellar** web wallet — generate keys, connect wallets, explore tokens & NFTs, and **mint your own Soroban tokens** (like SPL tokens on Solana) with IPFS images via Pinata.

| | |
|---|---|
| 🔗 **Live App** | [a-stro-wallet.vercel.app](https://a-stro-wallet.vercel.app/) |
| 📜 **Stellar Contract (Testnet)** | [`CAJ5XY4W...H2PZJVG`](https://stellar.expert/explorer/testnet/contract/CAJ5XY4W57N7M2IFSDA7Z7TTBRBCNBMFEVM6SEHIGF424CE3UH2PZJVG) |
| 👨‍💻 **Developed by** | [@vilashturkane](https://github.com/vilashturkane) |
| 🎬 **Video Demo** | [Google Drive](https://drive.google.com/file/d/17gmQRsMs9ZHhmMpRR5cxEwe4THMiphyE/view) |

---

## 📄 Smart Contract

The `astro-token` contract is a **SEP-41** compatible fungible token built with **Rust / Soroban SDK v23** for the Stellar network. Works like an SPL token on Solana — deploy one instance per token, constructor mints the full supply to the admin in the same transaction.

| Property | Value |
|---|---|
| **Contract Name** | `astro-token` |
| **Standard** | SEP-41 (Soroban Token Interface) |
| **Language** | Rust (`#![no_std]`, compiled to WASM) |
| **SDK** | `soroban-sdk` v23 |
| **Contract ID** | [`CAJ5XY4W57N7M2IFSDA7Z7TTBRBCNBMFEVM6SEHIGF424CE3UH2PZJVG`](https://stellar.expert/explorer/testnet/contract/CAJ5XY4W57N7M2IFSDA7Z7TTBRBCNBMFEVM6SEHIGF424CE3UH2PZJVG) |
| **Testnet WASM Hash** | [`a521d37e154dc3a1aa2f5d45755af6813c2d1ab6685c1f312cd954cfc33ca85d`](https://stellar.expert/explorer/testnet/contract-wasm/a521d37e154dc3a1aa2f5d45755af6813c2d1ab6685c1f312cd954cfc33ca85d) |
| **Network** | Stellar Testnet (Soroban RPC) |
| **Instance TTL** | ~90 days (auto-bumped on every interaction) |

### Contract Interface

| Function | Access | Description |
|---|---|---|
| `__constructor(admin, decimal, name, symbol, uri, initial_supply)` | Deploy-time | Initializes metadata and mints full supply to admin |
| `transfer(from, to, amount)` | Token holder | Transfer tokens between accounts |
| `approve(from, spender, amount, expiration_ledger)` | Token holder | Approve a spender allowance with expiry |
| `transfer_from(spender, from, to, amount)` | Approved spender | Transfer on behalf of another account |
| `burn(from, amount)` | Token holder | Permanently destroy tokens, reduces total supply |
| `burn_from(spender, from, amount)` | Approved spender | Burn on behalf using allowance |
| `mint(to, amount)` | Admin only 🔒 | Mint additional tokens after deploy |
| `set_admin(new_admin)` | Admin only 🔒 | Transfer admin role to a new address |
| `balance(id)` | Public | Query token balance of any address |
| `allowance(from, spender)` | Public | Query approved spending allowance |
| `total_supply()` | Public | Get total circulating supply |
| `token_uri()` | Public | IPFS metadata URI (Metaplex-style JSON) |
| `decimals()` / `name()` / `symbol()` | Public | Standard SEP-41 token metadata |
| `admin()` | Public | Returns current admin address |

---

## 📁 Structure

```
aStroWallet/
├── .github/workflows/   # GitHub Actions CI pipeline
├── client/              # Next.js 15 app (UI + API routes)
├── contract/            # Soroban token smart contract (Rust, SEP-41)
├── script/              # Contract build & deploy scripts
└── readme.md
```

---

## ✨ Features

1. **Generate** — BIP-39 secret phrase + SEP-0005 derived Stellar wallets (`m/44'/148'/i'`), verified against official test vectors
2. **Connect** — Stellar Wallets Kit (Freighter, xBull, Albedo, Lobstr, Hana…) or watch-only; dashboard shows XLM, tokens, classic NFTs (with IPFS artwork), payment activity & send
3. **Mint Token** — deploy a Soroban token contract with name / symbol / supply / decimals / image; image + metadata pinned to IPFS via Pinata; full supply minted to your wallet in ONE transaction

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v3 |
| Wallets | `@creit.tech/stellar-wallets-kit` — Freighter, xBull, Albedo, Lobstr, Hana + more |
| Chain (JS) | `@stellar/stellar-sdk` v14 — Horizon + Soroban RPC |
| Smart Contract | Rust (`#![no_std]`) + `soroban-sdk` v23, compiled to WASM |
| IPFS | Pinata — token images + metadata JSON pinned server-side |
| Server state | TanStack Query v5 — async fetching, caching, background refresh |
| Client state | Zustand — wallet session, balances, dashboard data |
| Runtime | Bun — package manager, runtime, bundler |

---

## 🚀 Setup

### 1. Deploy the token contract WASM (one-time per network)

```bash
./script/deploy.sh              # testnet (auto-funds a deployer key)
# ./script/deploy.sh mainnet    # mainnet (needs your funded key)
```

This builds `contract/`, uploads the WASM, and writes `NEXT_PUBLIC_TOKEN_WASM_HASH` into `client/.env.local`.

> ✅ A testnet WASM is already uploaded: [`a521d37e...c33ca85d`](https://stellar.expert/explorer/testnet/contract-wasm/a521d37e154dc3a1aa2f5d45755af6813c2d1ab6685c1f312cd954cfc33ca85d)

### 2. Configure Pinata

Get a JWT from [Pinata → API Keys](https://app.pinata.cloud/developers/api-keys) and add it to `client/.env.local`:

```env
PINATA_JWT=eyJhbGciOi...
PINATA_GATEWAY=gateway.pinata.cloud
NEXT_PUBLIC_TOKEN_WASM_HASH=a521d37e...
```

### 3. Run the client

```bash
cd client
bun install
bun run dev        # http://localhost:3000
```

---

## 🪙 How Minting Works

```
UI form (name, symbol, supply, decimals, image)
   │
   ├─ 1. POST /api/pinata  → image + metadata JSON pinned to IPFS (server-side, JWT safe)
   │
   └─ 2. createCustomContract op → deploys astro-token instance from uploaded WASM
         __constructor(admin, decimal, name, symbol, uri, initial_supply)
         → mints FULL supply to your wallet in the same tx  ✅
```

---

## 🧪 Testing

```bash
# Contract unit tests (6 tests — transfer, mint, burn, approve, transfer_from, insufficient)
cd contract && cargo test

# SEP-0005 derivation against official Stellar test vectors
cd client && bun scripts/verify-sep5.mjs

# Lint — must exit 0
cd client && bun run lint

# Type check
cd client && bun run typecheck

# Production build
cd client && bun run build
```

---

## ⚙️ CI / CD

Every push and pull request to `main` runs the GitHub Actions pipeline defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

| Job | Steps |
|---|---|
| **Frontend** | `bun install --frozen-lockfile` → `bun run lint` (ESLint) → `bun run typecheck` (tsc) → `bun run build` (Next.js production build) |
| **Contract** | Rust stable toolchain + cargo cache → `cargo test` (all 6 Soroban unit tests) |

Nothing lands on `main` broken — a lint error, type error, failed build, or failing contract test turns the pipeline red.

**Continuous deployment** is handled by Vercel's Git integration: every push to `main` that passes CI is automatically built and deployed to [a-stro-wallet.vercel.app](https://a-stro-wallet.vercel.app/). The smart contract deploys separately via `./script/deploy.sh` — frontend deploys never touch the chain.

### Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel.
2. Set the project's **Root Directory** to `client`.
3. Add environment variables in Vercel dashboard: `NEXT_PUBLIC_TOKEN_WASM_HASH`, `PINATA_JWT`, `PINATA_GATEWAY`.
4. Deploy — the contract lives on Stellar Testnet independently of the frontend host.

---

## 🔒 Security

- Secret keys & mnemonics live only in your browser (localStorage) — never sent to any server
- Pinata JWT stays server-side (Next.js API route) — never exposed to the browser bundle
- All Soroban transactions are simulated (`prepareTransaction`) before signing — exact fee shown upfront
- SEP-0005 key derivation verified against official Stellar test vectors
- This is a learning / demo project on **Testnet** — audit the contract before using with real funds on mainnet
