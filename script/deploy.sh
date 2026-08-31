#!/usr/bin/env bash
# ============================================================
# aStroWallet — Soroban token contract deploy script
#
# Builds the contract, uploads the WASM to the chosen network,
# and writes the WASM hash into client/.env.local so the UI
# can deploy new token instances from it.
#
# Usage:
#   ./script/deploy.sh            # testnet (default)
#   ./script/deploy.sh mainnet    # mainnet (needs funded key)
# ============================================================
set -euo pipefail

NETWORK="${1:-testnet}"
KEY_NAME="${2:-astro-deployer}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTRACT_DIR="$ROOT/contract"
ENV_FILE="$ROOT/client/.env.local"

command -v stellar >/dev/null || { echo "❌ stellar CLI not found — install: cargo install stellar-cli"; exit 1; }
command -v cargo  >/dev/null || { echo "❌ cargo not found — install Rust: https://rustup.rs"; exit 1; }

# Ensure the wasm32v1-none target is installed (required by stellar contract build)
if ! rustup target list --installed 2>/dev/null | grep -q "wasm32v1-none"; then
  echo "📥 Installing wasm32v1-none target..."
  rustup target add wasm32v1-none
fi

echo "🔨 Building contract..."
cd "$CONTRACT_DIR"
stellar contract build

WASM="$CONTRACT_DIR/target/wasm32v1-none/release/astro_token.wasm"
[ -f "$WASM" ] || WASM="$CONTRACT_DIR/target/wasm32-unknown-unknown/release/astro_token.wasm"
[ -f "$WASM" ] || { echo "❌ WASM not found after build"; exit 1; }

if [ "$NETWORK" = "testnet" ]; then
  echo "🔑 Ensuring deployer key exists (funded via friendbot)..."
  stellar keys generate "$KEY_NAME" --network testnet --fund 2>/dev/null || true
else
  echo "⚠️  Mainnet: make sure key '$KEY_NAME' exists and is funded (stellar keys add $KEY_NAME)"
fi

echo "📦 Uploading WASM to $NETWORK..."
WASM_HASH="$(stellar contract upload --wasm "$WASM" --network "$NETWORK" --source "$KEY_NAME")"

echo ""
echo "✅ WASM hash: $WASM_HASH"

# write/update client/.env.local
touch "$ENV_FILE"
grep -v "^NEXT_PUBLIC_TOKEN_WASM_HASH=" "$ENV_FILE" > "$ENV_FILE.tmp" || true
mv "$ENV_FILE.tmp" "$ENV_FILE"
echo "NEXT_PUBLIC_TOKEN_WASM_HASH=$WASM_HASH" >> "$ENV_FILE"

echo "📝 Saved to client/.env.local (NEXT_PUBLIC_TOKEN_WASM_HASH)"
echo ""
echo "Next steps:"
echo "  1. Add PINATA_JWT=<your-jwt> to client/.env.local"
echo "  2. cd client && bun install && bun run dev"
echo ""
echo "Deploy completed at: $(date)"
