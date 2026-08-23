// E2E test: deploys a token instance on TESTNET from the uploaded WASM,
// exactly like the client's Mint Token flow (minus Pinata).
// Run: cd client && bun ../script/test-mint.mjs
import {
  Address, BASE_FEE, Keypair, Operation, TransactionBuilder,
  nativeToScVal, scValToNative, rpc, Contract,
} from "@stellar/stellar-sdk";
import { Buffer } from "node:buffer";

const WASM_HASH = "a521d37e154dc3a1aa2f5d45755af6813c2d1ab6685c1f312cd954cfc33ca85d";
const PASSPHRASE = "Test SDF Network ; September 2015";
const server = new rpc.Server("https://soroban-testnet.stellar.org");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1) fresh funded account
const kp = Keypair.random();
console.log("admin:", kp.publicKey());
await fetch(`https://friendbot.stellar.org/?addr=${kp.publicKey()}`);
console.log("funded ✅");

// 2) deploy token instance with constructor (mints supply)
const account = await server.getAccount(kp.publicKey());
const decimals = 7;
const supply = 1_000_000n * 10n ** BigInt(decimals);
const op = Operation.createCustomContract({
  address: Address.fromString(kp.publicKey()),
  wasmHash: Buffer.from(WASM_HASH, "hex"),
  salt: Buffer.from(crypto.getRandomValues(new Uint8Array(32))),
  constructorArgs: [
    nativeToScVal(Address.fromString(kp.publicKey())),
    nativeToScVal(decimals, { type: "u32" }),
    nativeToScVal("Astro Test Coin", { type: "string" }),
    nativeToScVal("ATC", { type: "string" }),
    nativeToScVal("ipfs://QmDummyMetadataCid", { type: "string" }),
    nativeToScVal(supply, { type: "i128" }),
  ],
});
let tx = new TransactionBuilder(account, { fee: (Number(BASE_FEE) * 100).toString(), networkPassphrase: PASSPHRASE })
  .addOperation(op).setTimeout(120).build();
tx = await server.prepareTransaction(tx);
tx.sign(kp);
const send = await server.sendTransaction(tx);
if (send.status === "ERROR") throw new Error(JSON.stringify(send.errorResult));
let res = await server.getTransaction(send.hash);
while (res.status === "NOT_FOUND") { await sleep(1500); res = await server.getTransaction(send.hash); }
if (res.status !== "SUCCESS") throw new Error("tx failed: " + res.status);
const contractId = scValToNative(res.returnValue);
console.log("contract deployed ✅", contractId);

// 3) read back: name, symbol, decimals, balance(admin), token_uri
const contract = new Contract(contractId);
async function readCall(method, ...args) {
  const acct = await server.getAccount(kp.publicKey());
  const t = new TransactionBuilder(acct, { fee: BASE_FEE, networkPassphrase: PASSPHRASE })
    .addOperation(contract.call(method, ...args)).setTimeout(60).build();
  const sim = await server.simulateTransaction(t);
  return scValToNative(sim.result.retval);
}
console.log("name:", await readCall("name"));
console.log("symbol:", await readCall("symbol"));
console.log("decimals:", await readCall("decimals"));
console.log("token_uri:", await readCall("token_uri"));
console.log("total_supply:", await readCall("total_supply"));
console.log("admin balance:", await readCall("balance", nativeToScVal(Address.fromString(kp.publicKey()))));
console.log("\n🎉 E2E MINT TEST PASSED");
console.log(`explorer: https://stellar.expert/explorer/testnet/contract/${contractId}`);
