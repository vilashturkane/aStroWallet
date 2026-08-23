// BIP-39 mnemonic generation/validation using Web Crypto (client-side only).
import WORDLIST from "./wordlist.json";

const toBits = (bytes: Uint8Array) =>
  [...bytes].map((b) => b.toString(2).padStart(8, "0")).join("");

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
}

export async function generateMnemonic(): Promise<string> {
  const entropy = crypto.getRandomValues(new Uint8Array(16)); // 128 bits → 12 words
  const cs = toBits(await sha256(entropy)).slice(0, 4);
  const bits = toBits(entropy) + cs;
  const words: string[] = [];
  for (let i = 0; i < bits.length; i += 11) {
    words.push(WORDLIST[parseInt(bits.slice(i, i + 11), 2)]);
  }
  return words.join(" ");
}

export async function validateMnemonic(mnemonic: string): Promise<boolean> {
  const words = mnemonic.trim().toLowerCase().split(/\s+/);
  if (![12, 15, 18, 21, 24].includes(words.length)) return false;
  const idxs = words.map((w) => WORDLIST.indexOf(w));
  if (idxs.includes(-1)) return false;
  const bits = idxs.map((i) => i.toString(2).padStart(11, "0")).join("");
  const entBits = (words.length * 11 * 32) / 33;
  const entropy = new Uint8Array(entBits / 8);
  for (let i = 0; i < entropy.length; i++) {
    entropy[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  const expected = toBits(await sha256(entropy)).slice(0, bits.length - entBits);
  return bits.slice(entBits) === expected;
}

export async function mnemonicToSeed(mnemonic: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(mnemonic.normalize("NFKD")) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode("mnemonic") as BufferSource,
      iterations: 2048,
      hash: "SHA-512",
    },
    key,
    512,
  );
  return new Uint8Array(bits);
}
