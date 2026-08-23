"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/store/wallet-store";
import {
  type HorizonBalance,
  type NetworkId,
  isNFTLike,
  shortKey,
  fmtAmount,
} from "@/lib/stellar";

const EMOJIS = ["🌌", "🪐", "🌠", "👾", "🛰", "🌟", "🚀", "🌙"];

function NftCard({ nft, index, network }: { nft: HorizonBalance; index: number; network: NetworkId }) {
  const { data } = useQuery({
    queryKey: ["nft-image", network, nft.asset_issuer],
    queryFn: async () => {
      const res = await fetch(`/api/nft-image?issuer=${nft.asset_issuer}&network=${network}`);
      return (await res.json()) as { url: string | null };
    },
    staleTime: 60 * 60 * 1000,
  });

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-gold/25 to-lilac/25 text-4xl">
        {data?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.url}
            alt={nft.asset_code}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          EMOJIS[index % EMOJIS.length]
        )}
      </div>
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-[13.5px] font-bold">
          {nft.asset_code} <Badge>x{fmtAmount(nft.balance)}</Badge>
        </div>
        <div className="mt-0.5 break-all font-mono text-[10.5px] text-muted-foreground">
          {shortKey(nft.asset_issuer, 8)}
        </div>
      </div>
    </div>
  );
}

export function NftsTab({ balances }: { balances: HorizonBalance[] }) {
  const network = useWalletStore((s) => s.network);
  const nfts = balances.filter(isNFTLike);

  if (!nfts.length)
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        <div className="mb-3 text-4xl">🖼</div>
        No NFTs detected on this account (<b>{network.toUpperCase()}</b>).
        <div className="mx-auto mt-4 max-w-md space-y-1.5 text-left text-[12.5px] leading-relaxed">
          <p className="font-bold text-foreground">NFT not showing up? Check the following:</p>
          <p>🔁 <b>Network</b> — if your NFTs are on mainnet, switch to Mainnet above</p>
          <p>
            🧱 <b>Soroban NFTs</b> — smart-contract NFTs do not appear in Horizon balances; only
            classic-asset NFTs are shown (trustline balance ≤ 1)
          </p>
          <p>📍 <b>Address</b> — open the account that actually holds the NFT</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
        {nfts.map((nft, i) => (
          <NftCard key={`${nft.asset_code}-${nft.asset_issuer}`} nft={nft} index={i} network={network} />
        ))}
      </div>
      <p className="mt-3 text-[11.5px] text-muted-foreground">
        ℹ️ Only classic-asset NFTs (balance ≤ 1) are shown — Soroban contract NFTs are not visible via Horizon.
      </p>
    </>
  );
}
