"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NetworkId } from "@/lib/stellar";

export interface DashTarget {
  publicKey: string;
  label: string;
  /** 'kit' = connected via Stellar Wallets Kit, false = watch-only */
  signer: "kit" | false;
}

interface WalletState {
  network: NetworkId;
  dash: DashTarget | null;
  setNetwork: (n: NetworkId) => void;
  setDash: (d: DashTarget | null) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      network: "testnet",
      dash: null,
      setNetwork: (network) => set({ network }),
      setDash: (dash) => set({ dash }),
    }),
    {
      name: "astro-wallet",
      // Avoid SSR hydration mismatch: server renders defaults, then we
      // rehydrate from localStorage after mount (see Providers).
      skipHydration: true,
      // v1: dropped mnemonic/derived-wallet state (connect-only wallet now)
      version: 1,
      migrate: () => ({ network: "testnet" as const, dash: null }),
      partialize: (s) => ({ network: s.network, dash: s.dash }),
    },
  ),
);
