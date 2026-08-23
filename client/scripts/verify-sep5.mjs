// Verifies the same derivation logic used in lib/bip39.ts + lib/sep5.ts
// against the official SEP-0005 test vector 1, using the installed stellar-sdk.
import { webcrypto as crypto } from "node:crypto";
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "node:buffer";

const MNEMONIC = "illness spike retreat truth genius clock brain pass fit cave bargain toe";
const EXPECTED = [
  ["GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6", "SBGWSG6BTNCKCOB3DIFBGCVMUPQFYPA2G4O34RMTB343OYPXU5DJDVMN"],
  ["GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX", "SCEPFFWGAG5P2VX5DHIYK3XEMZYLTYWIPWYEKXFHSK25RVMIUNJ7CTIS"],
  ["GAY5PRAHJ2HIYBYCLZXTHID6SPVELOOYH2LBPH3LD4RUMXUW3DOYTLXW", "SDAILLEZCSA67DUEP3XUPZJ7NYG7KGVRM46XA7K5QWWUIGADUZCZWTJP"],
];

// --- mirrors lib/bip39.ts mnemonicToSeed ---
async function mnemonicToSeed(mnemonic) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(mnemonic.normalize("NFKD")), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode("mnemonic"), iterations: 2048, hash: "SHA-512" }, key, 512);
  return new Uint8Array(bits);
}
// --- mirrors lib/sep5.ts ---
async function hmacSha512(keyBytes, data) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
}
async function deriveStellarRawSeed(seed, accountIndex) {
  let I = await hmacSha512(new TextEncoder().encode("ed25519 seed"), seed);
  let key = I.slice(0, 32), chain = I.slice(32);
  for (const idx of [44, 148, accountIndex]) {
    const data = new Uint8Array(37);
    data.set(key, 1);
    const i = (idx + 0x80000000) >>> 0;
    data[33] = (i >>> 24) & 0xff; data[34] = (i >>> 16) & 0xff; data[35] = (i >>> 8) & 0xff; data[36] = i & 0xff;
    I = await hmacSha512(chain, data);
    key = I.slice(0, 32); chain = I.slice(32);
  }
  return key;
}

const seed = await mnemonicToSeed(MNEMONIC);
let pass = true;
for (let i = 0; i < EXPECTED.length; i++) {
  const raw = await deriveStellarRawSeed(seed, i);
  const kp = Keypair.fromRawEd25519Seed(Buffer.from(raw));
  const ok = kp.publicKey() === EXPECTED[i][0] && kp.secret() === EXPECTED[i][1];
  pass &&= ok;
  console.log(`account ${i}: ${ok ? "PASS ✅" : "FAIL ❌"}  ${kp.publicKey()}`);
}
process.exit(pass ? 0 : 1);
