"use client";

import { useRef, useState } from "react";
import { Coins, Loader2, Upload, CheckCircle2, ExternalLink } from "lucide-react";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useWalletStore } from "@/store/wallet-store";
import { mintToken } from "@/lib/soroban";

const WASM_HASH = process.env.NEXT_PUBLIC_TOKEN_WASM_HASH ?? "";

interface MintResult {
  contractId: string;
  txHash: string;
  imageUrl: string;
  metadataUrl: string;
}

export function MintTokenCard() {
  const { network, dash } = useWalletStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [decimals, setDecimals] = useState("7");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState<MintResult | null>(null);

  const connected = dash?.signer === "kit" ? dash : null;

  function pickFile(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleMint() {
    if (!connected) {
      toast({ title: "Pehle wallet connect karo", variant: "destructive" });
      return;
    }
    if (!WASM_HASH) {
      toast({
        title: "Contract WASM not deployed",
        description: "Run ./script/deploy.sh first to upload the token contract",
        variant: "destructive",
      });
      return;
    }
    if (!name.trim() || !symbol.trim()) {
      toast({ title: "Name & symbol required", variant: "destructive" });
      return;
    }
    if (!/^\d+$/.test(supply) || BigInt(supply) <= 0n) {
      toast({ title: "Supply must be a positive whole number", variant: "destructive" });
      return;
    }
    const dec = parseInt(decimals, 10);
    if (isNaN(dec) || dec < 0 || dec > 18) {
      toast({ title: "Decimals must be between 0 and 18", variant: "destructive" });
      return;
    }
    if (!file) {
      toast({ title: "Token image required", variant: "destructive" });
      return;
    }

    setBusy(true);
    setResult(null);
    try {
      // 1) upload image + metadata to Pinata (server-side)
      setStep("Uploading image to Pinata (IPFS)…");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name.trim());
      fd.append("symbol", symbol.trim().toUpperCase());
      fd.append("decimals", String(dec));
      fd.append("supply", supply);
      const pinRes = await fetch("/api/pinata", { method: "POST", body: fd });
      const pin = await pinRes.json();
      if (!pinRes.ok) throw new Error(pin.error || "Pinata upload failed");

      // 2) deploy token contract instance (constructor mints supply)
      const { contractId, txHash } = await mintToken({
        network,
        admin: { publicKey: connected.publicKey, signer: "kit" },
        wasmHash: WASM_HASH,
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        decimals: dec,
        supply,
        uri: pin.uri,
        onStep: setStep,
      });

      setResult({ contractId, txHash, imageUrl: pin.imageUrl, metadataUrl: pin.metadataUrl });
      toast({ title: `✅ ${symbol.trim().toUpperCase()} minted!`, variant: "success" });
      setName(""); setSymbol(""); setSupply(""); setDecimals("7"); pickFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      toast({
        title: "Mint failed",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setStep("");
    }
  }

  // not connected → prompt
  if (!connected) {
    return (
      <Card className="animate-fade-up">
        <CardContent className="py-14 text-center">
          <div className="mb-3 text-5xl">🪙</div>
          <p className="font-display text-lg font-bold">Wallet connect karo pehle</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Token mint karne ke liye ek signing wallet chahiye — Freighter, xBull, Albedo
            waghera.
          </p>
          <ConnectWalletButton className="mt-6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-gold-deep" /> Mint Token
          <Badge variant="gold">{network.toUpperCase()}</Badge>
        </CardTitle>
        <CardDescription>
          SPL-token jaisa — Soroban smart contract deploy hota hai aur poori supply tumhare
          connected wallet me mint ho jaati hai, ek hi transaction me.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* connected admin info */}
        <div className="flex items-center gap-2.5 rounded-md border border-border bg-muted px-3.5 py-2.5 text-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Minting as</span>
          <span className="font-mono font-semibold">
            {connected.publicKey.slice(0, 6)}…{connected.publicKey.slice(-6)}
          </span>
          <Badge>{connected.label}</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tok-name">Name</Label>
            <Input id="tok-name" placeholder="e.g. Astro Coin" value={name}
              onChange={(e) => setName(e.target.value)} disabled={busy} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tok-symbol">Symbol</Label>
            <Input id="tok-symbol" placeholder="e.g. ASTRO" value={symbol} maxLength={12}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())} disabled={busy} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tok-supply">Supply</Label>
            <Input id="tok-supply" type="number" min="1" step="1" placeholder="e.g. 1000000"
              value={supply} onChange={(e) => setSupply(e.target.value)} disabled={busy} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tok-decimals">Decimals</Label>
            <Input id="tok-decimals" type="number" min="0" max="18" placeholder="7"
              value={decimals} onChange={(e) => setDecimals(e.target.value)} disabled={busy} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Token image</Label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted transition-colors hover:border-gold"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="h-full w-full object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
            <div className="text-sm text-muted-foreground">
              {file ? (
                <span className="font-medium text-foreground">{file.name}</span>
              ) : (
                "PNG / JPG / GIF · max 5 MB — Pinata (IPFS) pe upload hogi"
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <Button variant="gold" onClick={handleMint} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Coins />}
          {busy ? step || "Minting…" : "Mint Token 🚀"}
        </Button>

        <p className="text-xs text-muted-foreground">
          💡 Account funded hona chahiye — dashboard me Friendbot se free test XLM le lo.
        </p>

        {result && (
          <div className="space-y-2.5 rounded-lg border border-gold/50 bg-gold/10 p-4 animate-fade-up">
            <p className="flex items-center gap-2 font-display font-bold">
              <CheckCircle2 className="h-5 w-5 text-[#12805C]" /> Token minted successfully!
            </p>
            <div className="space-y-1 text-[13px]">
              <p className="break-all">
                <b>Contract ID:</b> <span className="font-mono">{result.contractId}</span>
              </p>
              <p className="break-all">
                <b>Tx:</b> <span className="font-mono">{result.txHash}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="outline" size="sm">
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${result.contractId}`}
                  target="_blank" rel="noreferrer"
                >
                  <ExternalLink /> View on stellar.expert
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={result.imageUrl} target="_blank" rel="noreferrer">
                  <ExternalLink /> Image (IPFS)
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={result.metadataUrl} target="_blank" rel="noreferrer">
                  <ExternalLink /> Metadata (IPFS)
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
