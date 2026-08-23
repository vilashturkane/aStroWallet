"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Rocket, Copy, LogOut } from "lucide-react";
import { useWalletStore } from "@/store/wallet-store";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useConnectWallet } from "@/components/connect-wallet-button";
import { Loader2 } from "lucide-react";

const NAV = [
  { href: "/mint", label: "Mint" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { dash, setDash } = useWalletStore();
  const { connect, connecting } = useConnectWallet();

  const copyAddress = () => {
    if (!dash) return;
    navigator.clipboard.writeText(dash.publicKey);
    toast({ title: "Address copied ✅", variant: "success" });
  };

  const disconnect = async () => {
    if (dash?.signer === "kit") {
      try {
        const { getWalletKit } = await import("@/lib/wallet-kit");
        await getWalletKit("testnet").disconnect();
      } catch {
        // best-effort — kit may not support disconnect for every wallet
      }
    }
    setDash(null);
    toast({ title: "Wallet disconnected", variant: "destructive" });
    router.push("/");
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-6">
      <Link href="/" className="flex items-center gap-2.5">
        <Rocket className="h-7 w-7 text-gold-deep" />
        <h1 className="font-display text-2xl font-bold tracking-tight">aStroWallet</h1>
      </Link>

      <nav className="order-3 flex w-full justify-center gap-1 rounded-full border border-border bg-card p-1 sm:order-none sm:w-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
              pathname === item.href
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        {/* Testnet badge */}
        <span className="rounded-md border border-gold/70 bg-gold/15 px-3 py-1.5 text-[13px] font-bold text-gold-deep">
          Testnet
        </span>

        {dash ? (
          /* connected pill: ● GAM3...LXKC  [copy] [disconnect] */
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[13px] font-semibold">
              {dash.publicKey.slice(0, 4)}...{dash.publicKey.slice(-4)}
            </span>
            <button
              onClick={copyAddress}
              title="Copy address"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={disconnect}
              title="Disconnect"
              className="text-destructive/80 transition-colors hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={connecting}
            className="flex items-center gap-2 rounded-md bg-foreground px-4 py-1.5 text-[13px] font-bold text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {connecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
