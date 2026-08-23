export type NetworkId = "testnet" | "mainnet";

export const NETWORKS: Record<
  NetworkId,
  { label: string; horizon: string; passphrase: string }
> = {
  testnet: {
    label: "Testnet",
    horizon: "https://horizon-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
  },
  mainnet: {
    label: "Mainnet",
    horizon: "https://horizon.stellar.org",
    passphrase: "Public Global Stellar Network ; September 2015",
  },
};

export interface HorizonBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
  limit?: string;
}

export interface HorizonAccount {
  id: string;
  sequence: string;
  balances: HorizonBalance[];
  data: Record<string, string>;
}

export interface PaymentRecord {
  id: string;
  type: string;
  created_at: string;
  from?: string;
  to?: string;
  funder?: string;
  account?: string;
  amount?: string;
  starting_balance?: string;
  asset_type?: string;
  asset_code?: string;
}

export async function fetchAccount(
  network: NetworkId,
  publicKey: string,
): Promise<HorizonAccount | null> {
  const res = await fetch(`${NETWORKS[network].horizon}/accounts/${publicKey}`);
  if (res.status === 404) return null; // unfunded
  if (!res.ok) throw new Error(`Horizon error ${res.status}`);
  return res.json();
}

export async function fetchPayments(
  network: NetworkId,
  publicKey: string,
): Promise<PaymentRecord[]> {
  const res = await fetch(
    `${NETWORKS[network].horizon}/accounts/${publicKey}/payments?order=desc&limit=20`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  const records: PaymentRecord[] = data?._embedded?.records ?? [];
  return records.filter((r) =>
    ["payment", "create_account", "path_payment_strict_send", "path_payment_strict_receive"].includes(
      r.type,
    ),
  );
}

/** Classic-asset NFT heuristic: non-native trustline held with 0 < balance <= 1 */
export function isNFTLike(b: HorizonBalance): boolean {
  return (
    b.asset_type !== "native" && parseFloat(b.balance) > 0 && parseFloat(b.balance) <= 1
  );
}

export async function submitTransaction(network: NetworkId, xdr: string) {
  const res = await fetch(`${NETWORKS[network].horizon}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "tx=" + encodeURIComponent(xdr),
  });
  const result = await res.json();
  if (!res.ok) {
    const codes = result?.extras?.result_codes;
    throw new Error(codes ? JSON.stringify(codes) : result?.title || "Submission failed");
  }
  return result;
}

export const shortKey = (s?: string, n = 6) => (s ? `${s.slice(0, n)}…${s.slice(-n)}` : "");
export const fmtAmount = (n: string | number) =>
  Number(n).toLocaleString("en-US", { maximumFractionDigits: 7 });
