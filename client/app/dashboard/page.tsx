import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard — aStroWallet",
  description: "Your Stellar account: XLM balance, tokens, NFTs, activity and payments.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1.5 text-muted-foreground">
          Balances, tokens, NFTs, activity and payments — all in one place.
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
