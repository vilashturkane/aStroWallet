// Quick verification of the derivation logic used in index.html
// against the official SEP-0005 test vector 1.
import { createHmac, pbkdf2Sync, createPrivateKey, createPublicKey } from 'node:crypto';

const MNEMONIC = 'illness spike retreat truth genius clock brain pass fit cave bargain toe';
const EXPECTED = [
  ['GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6', 'SBGWSG6BTNCKCOB3DIFBGCVMUPQFYPA2G4O34RMTB343OYPXU5DJDVMN'],
  ['GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX', 'SCEPFFWGAG5P2VX5DHIYK3XEMZYLTYWIPWYEKXFHSK25RVMIUNJ7CTIS'],
  ['GAY5PRAHJ2HIYBYCLZXTHID6SPVELOOYH2LBPH3LD4RUMXUW3DOYTLXW', 'SDAILLEZCSA67DUEP3XUPZJ7NYG7KGVRM46XA7K5QWWUIGADUZCZWTJP'],
];

// same logic as index.html
const seed = pbkdf2Sync(MNEMONIC.normalize('NFKD'), 'mnemonic', 2048, 64, 'sha512');
function hmac512(key, data) { return createHmac('sha512', key).update(data).digest(); }
function derive(seed, account) {
  let I = hmac512('ed25519 seed', seed);
  let key = I.subarray(0, 32), chain = I.subarray(32);
  for (const idx of [44, 148, account]) {
    const data = Buffer.alloc(37);
    key.copy(data, 1);
    data.writeUInt32BE((idx + 0x80000000) >>> 0, 33);
    I = hmac512(chain, data);
    key = I.subarray(0, 32); chain = I.subarray(32);
  }
  return key;
}

// strkey encode (base32 + CRC16-XModem)
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32(buf) {
  let bits = 0, val = 0, out = '';
  for (const b of buf) { val = (val << 8) | b; bits += 8;
    while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits) out += B32[(val << (5 - bits)) & 31];
  return out;
}
function crc16(buf) {
  let crc = 0;
  for (const b of buf) { crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff; }
  return crc;
}
function strkey(version, payload) {
  const data = Buffer.concat([Buffer.from([version]), payload]);
  const c = crc16(data);
  return base32(Buffer.concat([data, Buffer.from([c & 0xff, c >> 8])]));
}
function pubFromSeed(raw) {
  const pkcs8 = Buffer.concat([Buffer.from('302e020100300506032b657004220420', 'hex'), raw]);
  const priv = createPrivateKey({ key: pkcs8, format: 'der', type: 'pkcs8' });
  const spki = createPublicKey(priv).export({ format: 'der', type: 'spki' });
  return spki.subarray(spki.length - 32);
}

let pass = true;
EXPECTED.forEach(([expPub, expSec], i) => {
  const raw = derive(seed, i);
  const sec = strkey(0x90, raw);            // 'S'
  const pub = strkey(0x30, pubFromSeed(raw)); // 'G'
  const ok = pub === expPub && sec === expSec;
  pass &&= ok;
  console.log(`account ${i}: ${ok ? 'PASS ✅' : 'FAIL ❌'}\n  pub ${pub}\n  sec ${sec}`);
});
process.exit(pass ? 0 : 1);
