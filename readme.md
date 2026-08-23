# 🚀 aStroWallet

> **Developed by [Vilash Turkane](https://github.com/vilashturkane)**

🌐 **Live App:** [https://a-stro-wallet.vercel.app/](https://a-stro-wallet.vercel.app/)

A full-stack, non-custodial **Stellar** web wallet — generate keys, connect wallets, explore tokens & NFTs, and **mint your own Soroban tokens** (like SPL tokens on Solana) with IPFS images via Pinata.

Built with Next.js 15 · Bun · Rust (Soroban) · Stellar Wallets Kit · Tailwind.

## 📄 Smart Contract

The aStroWallet token contract (`astro-token`) is a **SEP-41** compatible fungible token built with **Rust / Soroban SDK v23** for the Stellar network.

| Property | Value |
|---|---|
| **Contract Name** | `astro-token` |
| **Standard** | SEP-41 (Soroban Token Interface) |
| **Language** | Rust (`#![no_std]`, compiled to WASM) |
| **SDK** | `soroban-sdk` v23 |
| **Testnet WASM Hash** | `a521d37e154dc3a1aa2f5d45755af6813c2d1ab6685c1f312cd954cfc33ca85d` |
| **Network** | Stellar Testnet (Soroban RPC) |

### Contract Interface

| Function | Access | Description |
|---|---|---|
| `constructor(admin, decimal, name, symbol, uri, initial_supply)` | Deploy-time | Initializes token and mints full supply to admin |
| `transfer(from, to, amount)` | Token holder | Transfer tokens between accounts |
| `approve(from, spender, amount, expiration_ledger)` | Token holder | Approve a spender allowance |
| `transfer_from(spender, from, to, amount)` | Approved spender | Transfer on behalf of another account |
| `burn(from, amount)` | Token holder | Burn (destroy) tokens |
| `balance(id)` | Public | Query token balance |
| `allowance(from, spender)` | Public | Query approved allowance |
| `mint(to, amount)` | Admin only | Mint additional tokens |
| `set_admin(new_admin)` | Admin only | Transfer admin role |
| `total_supply()` | Public | Get total token supply |
| `token_uri()` | Public | Get IPFS metadata URI (Metaplex-style) |
| `decimals()` / `name()` / `symbol()` | Public | Token metadata |

### TTL (Time-to-Live) Config

- **Instance TTL:** ~90 days (`17280 ledgers/day × 90`)
- **Balance TTL:** ~90 days per entry
- Entries are bumped automatically on each interaction to prevent expiry

---

## 📁 Structure

```
aStroWallet/
├── client/      # Next.js 15 app (UI + API routes)
├── contract/    # Soroban token smart contract (Rust, SEP-41)
├── script/      # Contract build & deploy script
├── legacy/      # Old single-file HTML version
└── readme.md
```

## ✨ Features

1. **Generate** — BIP-39 secret phrase + SEP-0005 derived Stellar wallets (`m/44'/148'/i'`), verified against official test vectors
2. **Connect** — Stellar Wallets Kit (Freighter, xBull, Albedo, Lobstr, Hana…) or watch-only; dashboard shows XLM, tokens, classic NFTs (with IPFS artwork), payment activity & send
3. **Mint Token** — deploy a Soroban token contract with name / symbol / supply / decimals / image; image + metadata pinned to IPFS via Pinata; full supply minted to your wallet in ONE transaction

## 🛠 Prerequisites

- [Bun](https://bun.sh) ≥ 1.x
- [Rust](https://rustup.rs) + `wasm32v1-none` target (for contract)
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli) — `cargo install stellar-cli`
- [Pinata](https://pinata.cloud) account (free) — API JWT for IPFS uploads

## 🚀 Setup

### 1. Deploy the token contract WASM (one-time per network)

```bash
./script/deploy.sh              # testnet (auto-funds a deployer key)
# ./script/deploy.sh mainnet    # mainnet (needs your funded key)
```

This builds `contract/`, uploads the WASM, and writes `NEXT_PUBLIC_TOKEN_WASM_HASH` into `client/.env.local`.

> ✅ A testnet WASM is already uploaded: `a521d37e154dc3a1aa2f5d45755af6813c2d1ab6685c1f312cd954cfc33ca85d`

### 2. Configure Pinata

Get a JWT from [Pinata → API Keys](https://app.pinata.cloud/developers/api-keys) and add it to `client/.env.local`:

```env
PINATA_JWT=eyJhbGciOi...
PINATA_GATEWAY=gateway.pinata.cloud   # or your dedicated gateway
```

### 3. Run the client

```bash
cd client
bun install
bun run dev        # http://localhost:3000
```

## 🪙 How minting works

```
UI form (name, symbol, supply, decimals, image)
   │
   ├─ 1. POST /api/pinata  → image + metadata JSON pinned to IPFS (server-side, JWT safe)
   │
   └─ 2. createCustomContract op → deploys astro-token instance from uploaded WASM
         constructor(admin, decimal, name, symbol, uri, initial_supply)
         → mints FULL supply to your wallet in the same tx  ✅
```

The contract implements the **SEP-41 token interface** (`transfer`, `approve`, `burn`, `balance`…) plus `mint` (admin-only), `set_admin`, `total_supply` and `token_uri` (IPFS metadata, Metaplex-style).

## 🧪 Testing

```bash
# Contract unit tests (6 tests)
cd contract && cargo test

# SEP-0005 derivation against official test vectors
cd client && bun scripts/verify-sep5.mjs

# Production build
cd client && bun run build
```

## 🔒 Security notes

- Secret keys & mnemonic live only in your browser (localStorage) — never sent to any server
- Pinata JWT stays server-side (API route), never exposed to the browser
- Soroban transactions are simulated (`prepareTransaction`) before signing
- This is a learning/demo project — audit before using with real funds on mainnet
