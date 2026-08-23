// SEP-0005 key derivation: SLIP-0010 ed25519 at m/44'/148'/index'
// Verified against the official SEP-0005 test vectors.
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

async function hmacSha512(keyBytes: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, data as BufferSource));
}

export async function deriveStellarRawSeed(
  seed: Uint8Array,
  accountIndex: number,
): Promise<Uint8Array> {
  let I = await hmacSha512(new TextEncoder().encode("ed25519 seed"), seed);
  let key = I.slice(0, 32);
  let chain = I.slice(32);
  for (const idx of [44, 148, accountIndex]) {
    const data = new Uint8Array(37);
    data.set(key, 1);
    const i = (idx + 0x80000000) >>> 0;
    data[33] = (i >>> 24) & 0xff;
    data[34] = (i >>> 16) & 0xff;
    data[35] = (i >>> 8) & 0xff;
    data[36] = i & 0xff;
    I = await hmacSha512(chain, data);
    key = I.slice(0, 32);
    chain = I.slice(32);
  }
  return key;
}

export async function deriveKeypair(seed: Uint8Array, accountIndex: number): Promise<Keypair> {
  const raw = await deriveStellarRawSeed(seed, accountIndex);
  return Keypair.fromRawEd25519Seed(Buffer.from(raw));
}
