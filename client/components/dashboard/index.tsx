"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, X, Droplets } from "lucide-react";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useWalletStore } from "@/store/wallet-store";
import { fetchAccount, fmtAmount } from "@/lib/stellar";
import { TokensTab } from "./tokens-tab";
import { NftsTab } from "./nfts-tab";
import { ActivityTab } from "./activity-tab";
import { SendTab } from "./send-tab";

export function Dashboard() {
  const { network, dash, setDash } = useWalletStore();
  const queryClient = useQueryClient();
  const [funding, setFunding] = useState(false);

  const { data: account, isLoading, refetch } = useQuery({
    queryKey: ["account", network, dash?.publicKey],
    queryFn: () => fetchAccount(network, dash!.publicKey),
    enabled: !!dash,
  });

  if (!dash)
    return (
      <Card className="animate-fade-up">
        <CardContent className="py-14 text-center">
          <div className="mb-3 text-5xl">📊</div>
          <p className="font-display text-lg font-bold">No account selected</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Connect your wallet — your dashboard will load here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ConnectWalletButton />
          </div>
        </CardContent>
      </Card>
    );

  const native = account?.balances.find((b) => b.asset_type === "native");

  async function fundFriendbot() {
    setFunding(true);
    try {
      const res = await fetch("/api/friendbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: dash!.publicKey }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Funding failed");
      toast({ title: "Account funded with 10,000 test XLM 💧", variant: "success" });
      refetch();
    } catch (e) {
      toast({
        title: "Funding failed",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setFunding(false);
    }
  }

  return (
    <Card className="animate-fade-up">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>📊 {dash.label}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="gold">{network.toUpperCase()}</Badge>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw /> Refresh
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDash(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Balance hero */}
        <div className="mb-5 rounded-lg border border-border bg-gradient-to-b from-gold/20 to-transparent px-4 py-7 text-center">
          {isLoading ? (
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-gold-deep" />
          ) : account ? (
            <>
              <div className="font-display text-4xl font-extrabold tracking-tight">
                {fmtAmount(native?.balance ?? 0)}{" "}
                <span className="text-xl text-gold-deep">XLM</span>
              </div>
              <button
                className="mt-1.5 break-all font-mono text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  navigator.clipboard.writeText(dash.publicKey);
                  toast({ title: "Address copied ✅", variant: "success" });
                }}
              >
                {dash.publicKey}
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl">💤</div>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                This account is not funded yet (needs min 1 XLM reserve).
              </p>
              {network === "testnet" && (
                <Button variant="gold" size="sm" onClick={fundFriendbot} disabled={funding}>
                  {funding ? <Loader2 className="animate-spin" /> : <Droplets />}
                  Fund with Friendbot (testnet)
                </Button>
              )}
            </>
          )}
        </div>

        {account && (
          <Tabs defaultValue="tokens">
            <TabsList>
              <TabsTrigger value="tokens">💰 Tokens</TabsTrigger>
              <TabsTrigger value="nfts">🖼 NFTs</TabsTrigger>
              <TabsTrigger value="activity">📜 Activity</TabsTrigger>
              {dash.signer !== false && <TabsTrigger value="send">✈️ Send</TabsTrigger>}
            </TabsList>
            <TabsContent value="tokens">
              <TokensTab balances={account.balances} />
            </TabsContent>
            <TabsContent value="nfts">
              <NftsTab balances={account.balances} />
            </TabsContent>
            <TabsContent value="activity">
              <ActivityTab publicKey={dash.publicKey} />
            </TabsContent>
            {dash.signer !== false && (
              <TabsContent value="send">
                <SendTab target={dash} />
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
