import { NextRequest, NextResponse } from "next/server";

const HORIZON: Record<string, string> = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org",
};
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

// Resolves classic-asset NFT artwork (SEP-39 style) from the ISSUER account's
// manage_data entries (ipfshash / url / image keys). Runs server-side to avoid
// CORS issues & keep gateways swappable.
export async function GET(req: NextRequest) {
  const issuer = req.nextUrl.searchParams.get("issuer") ?? "";
  const network = req.nextUrl.searchParams.get("network") ?? "testnet";
  if (!/^G[A-Z2-7]{55}$/.test(issuer) || !HORIZON[network]) {
    return NextResponse.json({ url: null }, { status: 400 });
  }
  try {
    const res = await fetch(`${HORIZON[network]}/accounts/${issuer}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return NextResponse.json({ url: null });
    const acct = await res.json();
    const data: Record<string, string> = acct.data ?? {};
    const key = Object.keys(data).find((k) => /ipfs|hash|url|image/i.test(k));
    if (!key) return NextResponse.json({ url: null });
    const val = Buffer.from(data[key], "base64").toString("utf-8");
    let url: string | null = null;
    if (/^https?:\/\//i.test(val)) url = val;
    else if (/^ipfs:\/\//i.test(val)) url = IPFS_GATEWAY + val.slice(7);
    else if (/^(Qm[a-zA-Z0-9]{44}|baf[a-z0-9]+)/.test(val)) url = IPFS_GATEWAY + val;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ url: null });
  }
}
