"use client";

import { Badge } from "@/components/ui/badge";
import { type HorizonBalance, isNFTLike, shortKey, fmtAmount } from "@/lib/stellar";

const PASTELS = ["#FDDA24", "#C9BEFF", "#B3E5C8", "#BFE0F5", "#FFD9A8", "#F5C6DD"];
const pastel = (s: string) =>
  PASTELS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % PASTELS.length];

export function TokensTab({ balances }: { balances: HorizonBalance[] }) {
  const tokens = balances.filter((b) => b.asset_type === "native" || !isNFTLike(b));
  if (!tokens.length)
    return <p className="py-10 text-center text-sm text-muted-foreground">🪙 No tokens found.</p>;

  return (
    <div className="space-y-2.5">
      {tokens.map((b, i) => {
        const isNative = b.asset_type === "native";
        const code = isNative ? "XLM" : b.asset_code ?? "?";
        return (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-lg border border-border bg-muted px-3.5 py-3"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
              style={{ background: isNative ? "#FDDA24" : pastel(code) }}
            >
              {isNative ? "✦" : code.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[14.5px] font-bold">
                {code} {isNative && <Badge variant="gold">NATIVE</Badge>}
              </div>
              <div className="break-all font-mono text-[11.5px] text-muted-foreground">
                {isNative ? "Native · Stellar Lumens" : shortKey(b.asset_issuer, 8)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[15px] font-bold">{fmtAmount(b.balance)}</div>
              {b.limit && (
                <div className="text-xs text-muted-foreground">limit {fmtAmount(b.limit)}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
