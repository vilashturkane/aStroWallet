import { NextRequest, NextResponse } from "next/server";

// Uploads the token image + metadata JSON to Pinata (IPFS).
//
// Prefers the current v3 Files API (uploads.pinata.cloud) with PINATA_JWT.
// Falls back to the legacy pinning API with PINATA_KEY/PINATA_SECRET.
// Credentials never reach the browser — this runs server-side only.
const V3_UPLOAD_URL = "https://uploads.pinata.cloud/v3/files";
const LEGACY_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const LEGACY_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

async function uploadV3(jwt: string, file: File, name: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("network", "public"); // v3 defaults to private — public needed for IPFS gateways
  fd.append("name", name);
  const res = await fetch(V3_UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: fd,
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(
      body?.error?.message || body?.error || `Pinata v3 upload failed (${res.status})`,
    );
  }
  return body.data.cid as string;
}

async function uploadLegacyFile(key: string, secret: string, file: File, name: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("pinataMetadata", JSON.stringify({ name }));
  const res = await fetch(LEGACY_FILE_URL, {
    method: "POST",
    headers: { pinata_api_key: key, pinata_secret_api_key: secret },
    body: fd,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.details || body?.error || "Pinata upload failed");
  return body.IpfsHash as string;
}

async function uploadLegacyJSON(key: string, secret: string, content: unknown, name: string): Promise<string> {
  const res = await fetch(LEGACY_JSON_URL, {
    method: "POST",
    headers: {
      pinata_api_key: key,
      pinata_secret_api_key: secret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pinataMetadata: { name }, pinataContent: content }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.details || "Pinata metadata upload failed");
  return body.IpfsHash as string;
}

export async function POST(req: NextRequest) {
  const jwt = process.env.PINATA_JWT;
  const key = process.env.PINATA_KEY;
  const secret = process.env.PINATA_SECRET;
  if (!jwt && !(key && secret)) {
    return NextResponse.json(
      { error: "Configure PINATA_JWT (or PINATA_KEY + PINATA_SECRET) in client/.env.local" },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const name = String(form.get("name") ?? "");
  const symbol = String(form.get("symbol") ?? "");
  const decimals = Number(form.get("decimals") ?? 7);
  const supply = String(form.get("supply") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
  }

  const gateway = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";
  const label = symbol || name || "astro-token";

  try {
    // 1) pin the image
    const imageCid = jwt
      ? await uploadV3(jwt, file, `${label}-image`)
      : await uploadLegacyFile(key!, secret!, file, `${label}-image`);

    // 2) pin metadata JSON (SPL/Metaplex-style)
    const metadata = {
      name,
      symbol,
      decimals,
      supply,
      image: `ipfs://${imageCid}`,
      network: "stellar",
      standard: "astro-token-v1",
      createdAt: new Date().toISOString(),
    };
    const metadataCid = jwt
      ? await uploadV3(
          jwt,
          new File([JSON.stringify(metadata, null, 2)], "metadata.json", {
            type: "application/json",
          }),
          `${label}-metadata`,
        )
      : await uploadLegacyJSON(key!, secret!, metadata, `${label}-metadata`);

    return NextResponse.json({
      imageCid,
      metadataCid,
      uri: `ipfs://${metadataCid}`,
      imageUrl: `https://${gateway}/ipfs/${imageCid}`,
      metadataUrl: `https://${gateway}/ipfs/${metadataCid}`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 502 },
    );
  }
}
