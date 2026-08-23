import { NextRequest, NextResponse } from "next/server";

// Server-side friendbot proxy — funds a testnet account with 10,000 XLM.
export async function POST(req: NextRequest) {
  const { address } = await req.json().catch(() => ({}));
  if (!address || typeof address !== "string" || !/^G[A-Z2-7]{55}$/.test(address)) {
    return NextResponse.json({ error: "Invalid Stellar public key" }, { status: 400 });
  }
  const res = await fetch(
    `https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return NextResponse.json(
      { error: body?.detail || "Friendbot funding failed" },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
