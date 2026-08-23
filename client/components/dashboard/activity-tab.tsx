"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useWalletStore } from "@/store/wallet-store";
import { fetchPayments, shortKey, fmtAmount } from "@/lib/stellar";
import { cn } from "@/lib/utils";

export function ActivityTab({ publicKey }: { publicKey: string }) {
  const network = useWalletStore((s) => s.network);
  const { data: records, isLoading } = useQuery({
    queryKey: ["payments", network, publicKey],
    queryFn: () => fetchPayments(network, publicKey),
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-gold-deep" />
      </div>
    );

  if (!records?.length)
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">📜 No payment activity yet.</p>
    );

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-muted">
      {records.map((r) => {
        const isCreate = r.type === "create_account";
        const from = isCreate ? r.funder : r.from;
        const to = isCreate ? r.account : r.to;
        const amount = isCreate ? r.starting_balance : r.amount;
        const code = isCreate || r.asset_type === "native" ? "XLM" : r.asset_code;
        const incoming = to === publicKey;
        return (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3 text-[13.5px]">
            {incoming ? (
              <ArrowDownLeft className="h-5 w-5 shrink-0 text-[#12805C]" />
            ) : (
              <ArrowUpRight className="h-5 w-5 shrink-0 text-destructive" />
            )}
            <div className="min-w-0 flex-1">
              <div>
                {isCreate ? "Account created" : incoming ? "Received" : "Sent"}{" "}
                <span className="text-muted-foreground">
                  · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="break-all font-mono text-[11.5px] text-muted-foreground">
                {incoming ? `from ${shortKey(from, 8)}` : `to ${shortKey(to, 8)}`}
              </div>
            </div>
            <span className={cn("font-bold", incoming ? "text-[#12805C]" : "text-destructive")}>
              {incoming ? "+" : "−"}
              {fmtAmount(amount ?? 0)} {code}
            </span>
          </div>
        );
      })}
    </div>
  );
}
