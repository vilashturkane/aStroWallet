"use client";

import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from "@creit.tech/stellar-wallets-kit";
import type { NetworkId } from "./stellar";

const kits: Partial<Record<NetworkId, StellarWalletsKit>> = {};

export function getWalletKit(network: NetworkId): StellarWalletsKit {
  if (!kits[network]) {
    kits[network] = new StellarWalletsKit({
      network: network === "mainnet" ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    });
  }
  return kits[network]!;
}
