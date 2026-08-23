import type { Metadata } from "next";
import { MintTokenCard } from "@/components/mint-token-card";

export const metadata: Metadata = {
  title: "Mint Token — aStroWallet",
  description: "Deploy a Soroban token contract with your name, symbol, supply and IPFS image.",
};

export default function MintPage() {
  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Mint Token</h1>
        <p className="mt-1.5 text-muted-foreground">
          SPL-token jaisa experience — Soroban smart contract deploy hota hai aur poori supply
          tumhare wallet me aa jaati hai, ek hi transaction me.
        </p>
      </div>
      <MintTokenCard />
    </div>
  );
}
