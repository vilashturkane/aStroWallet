"use client";

import {
  Address,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
  Transaction,
  nativeToScVal,
  scValToNative,
  rpc,
} from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { NETWORKS, type NetworkId } from "./stellar";
import { getWalletKit } from "./wallet-kit";

export const SOROBAN_RPC: Record<NetworkId, string> = {
  testnet: "https://soroban-testnet.stellar.org",
  mainnet: "https://mainnet.sorobanrpc.com",
};

export interface MintTokenParams {
  network: NetworkId;
  /** funded account that pays, becomes admin & receives supply */
  admin: { publicKey: string; secret?: string; signer: "local" | "kit" };
  wasmHash: string;
  name: string;
  symbol: string;
  decimals: number;
  /** human amount, e.g. "1000000" — will be scaled by decimals */
  supply: string;
  /** ipfs:// metadata uri (image etc.) */
  uri: string;
  onStep?: (step: string) => void;
}

export interface MintTokenResult {
  contractId: string;
  txHash: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Deploys a new instance of the aStroToken contract from the uploaded WASM.
 * The contract constructor mints the full supply to the admin in the SAME
 * transaction — one-shot token creation, like an SPL mint on Solana.
 */
export async function mintToken(params: MintTokenParams): Promise<MintTokenResult> {
  const { network, admin, wasmHash, name, symbol, decimals, supply, uri, onStep } = params;
  const server = new rpc.Server(SOROBAN_RPC[network]);

  onStep?.("Loading account…");
  const account = await server.getAccount(admin.publicKey);

  // scale supply by decimals (integers only, i128 range)
  const scaled = BigInt(supply) * 10n ** BigInt(decimals);
  const salt = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));

  const op = Operation.createCustomContract({
    address: Address.fromString(admin.publicKey),
    wasmHash: Buffer.from(wasmHash, "hex"),
    salt,
    constructorArgs: [
      nativeToScVal(Address.fromString(admin.publicKey)), // admin
      nativeToScVal(decimals, { type: "u32" }),
      nativeToScVal(name, { type: "string" }),
      nativeToScVal(symbol, { type: "string" }),
      nativeToScVal(uri, { type: "string" }),
      nativeToScVal(scaled, { type: "i128" }),
    ],
  });

  let tx: Transaction = new TransactionBuilder(account, {
    fee: (Number(BASE_FEE) * 100).toString(),
    networkPassphrase: NETWORKS[network].passphrase,
  })
    .addOperation(op)
    .setTimeout(120)
    .build();

  onStep?.("Simulating & preparing transaction…");
  tx = (await server.prepareTransaction(tx)) as Transaction;

  onStep?.("Signing…");
  if (admin.signer === "local" && admin.secret) {
    tx.sign(Keypair.fromSecret(admin.secret));
  } else if (admin.signer === "kit") {
    const kit = getWalletKit(network);
    const { signedTxXdr } = await kit.signTransaction(tx.toXDR(), {
      address: admin.publicKey,
      networkPassphrase: NETWORKS[network].passphrase,
    });
    tx = TransactionBuilder.fromXDR(signedTxXdr, NETWORKS[network].passphrase) as Transaction;
  } else {
    throw new Error("No signer available for this account");
  }

  onStep?.("Submitting to the network…");
  const send = await server.sendTransaction(tx);
  if (send.status === "ERROR") {
    throw new Error(`Submission failed: ${JSON.stringify(send.errorResult ?? send.status)}`);
  }

  onStep?.("Waiting for confirmation…");
  let result = await server.getTransaction(send.hash);
  for (let i = 0; i < 30 && result.status === rpc.Api.GetTransactionStatus.NOT_FOUND; i++) {
    await sleep(1500);
    result = await server.getTransaction(send.hash);
  }
  if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Transaction failed on-chain (${result.status})`);
  }

  const contractId = scValToNative(result.returnValue!) as string; // C... address
  return { contractId, txHash: send.hash };
}
