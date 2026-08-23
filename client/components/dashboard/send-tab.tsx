"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Rocket } from "lucide-react";
import {
  Account,
  Asset,
  BASE_FEE,
  Memo,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useWalletStore, type DashTarget } from "@/store/wallet-store";
import { NETWORKS, fetchAccount, submitTransaction } from "@/lib/stellar";
import { getWalletKit } from "@/lib/wallet-kit";

export function SendTab({ target }: { target: DashTarget }) {
  const network = useWalletStore((s) => s.network);
  const queryClient = useQueryClient();
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    if (!StrKey.isValidEd25519PublicKey(dest.trim())) {
      toast({ title: "Invalid destination address ❌", variant: "destructive" });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const source = await fetchAccount(network, target.publicKey);
      if (!source) throw new Error("Source account not found / unfunded");
      const destination = dest.trim();
      const destExists = (await fetchAccount(network, destination)) !== null;

      const builder = new TransactionBuilder(
        new Account(target.publicKey, source.sequence),
        { fee: BASE_FEE, networkPassphrase: NETWORKS[network].passphrase },
      ).addOperation(
        destExists
          ? Operation.payment({ destination, asset: Asset.native(), amount })
          : Operation.createAccount({ destination, startingBalance: amount }),
      );
      if (memo.trim()) builder.addMemo(Memo.text(memo.trim().slice(0, 28)));
      const tx = builder.setTimeout(120).build();

      if (target.signer !== "kit") throw new Error("Watch-only account cannot sign");
      const kit = getWalletKit(network);
      const { signedTxXdr: signedXdr } = await kit.signTransaction(
        tx.toEnvelope().toXDR("base64"),
        {
          address: target.publicKey,
          networkPassphrase: NETWORKS[network].passphrase,
        },
      );

      await submitTransaction(network, signedXdr);
      toast({
        title: `✅ Sent ${amount} XLM!`,
        description: destExists ? undefined : "New account created for destination",
        variant: "success",
      });
      setDest("");
      setAmount("");
      setMemo("");
      queryClient.invalidateQueries({ queryKey: ["account", network, target.publicKey] });
      queryClient.invalidateQueries({ queryKey: ["payments", network, target.publicKey] });
    } catch (e) {
      toast({
        title: "Send failed",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  if (target.signer === false)
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        👀 Watch-only accounts cannot sign transactions here.
      </p>
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Send XLM from this wallet. Transaction is built, signed via your connected wallet &
        submitted to Horizon.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="send-dest">Destination address</Label>
        <Input
          id="send-dest"
          className="font-mono"
          placeholder="G..."
          value={dest}
          onChange={(e) => setDest(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <div className="space-y-1.5">
          <Label htmlFor="send-memo">Memo (optional)</Label>
          <Input
            id="send-memo"
            placeholder="e.g. payment for coffee ☕"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="send-amount">Amount (XLM)</Label>
          <Input
            id="send-amount"
            type="number"
            min="0"
            step="any"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>
      <Button variant="gold" onClick={handleSend} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Rocket />}
        Sign & Send
      </Button>
    </div>
  );
}
