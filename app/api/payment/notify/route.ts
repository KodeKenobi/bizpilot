import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAYFAST_CONFIG = {
  MERCHANT_ID:
    process.env.PAYFAST_MERCHANT_ID ||
    process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID ||
    "",
  MERCHANT_KEY:
    process.env.PAYFAST_MERCHANT_KEY ||
    process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY ||
    "",
  PASSPHRASE:
    process.env.PAYFAST_PASSPHRASE ||
    process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE ||
    "",
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
};

function md5(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex");
}

function verifyPayfastSignature(data: Record<string, string>) {
  const received = (data.signature || "").toLowerCase();

  const filtered: Record<string, string> = {};
  Object.keys(data).forEach((k) => {
    if (k === "signature") return;
    const v = data[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      filtered[k] = String(v).trim();
    }
  });

  // ITN verification: sorted keys, raw values
  const sortedKeys = Object.keys(filtered).sort();
  let paramString = sortedKeys.map((k) => `${k}=${filtered[k]}`).join("&");

  if (PAYFAST_CONFIG.PASSPHRASE.trim()) {
    paramString += `&passphrase=${PAYFAST_CONFIG.PASSPHRASE.trim()}`;
  }

  const expected = md5(paramString).toLowerCase();
  return received === expected;
}

async function callUpgradeEndpoint(payload: {
  user_email: string;
  amount: number;
  payment_id: string;
}) {
  const backendUrl =
    PAYFAST_CONFIG.API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://web-production-737b.up.railway.app"
      : "http://localhost:5000");

  const res = await fetch(`${backendUrl}/api/payment/upgrade-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_email: payload.user_email,
      amount: payload.amount,
      payment_id: payload.payment_id,
      plan_id: "pro_lifetime",
      plan_name: "LeakFinder Pro Lifetime",
      is_extension_lifetime: true,
      source: "payfast_itn",
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Upgrade failed: ${t}`);
  }

  return res.json().catch(() => ({}));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = String(value);
    });

    // 1) Merchant checks
    if (
      data.merchant_id !== PAYFAST_CONFIG.MERCHANT_ID ||
      data.merchant_key !== PAYFAST_CONFIG.MERCHANT_KEY
    ) {
      return new NextResponse("INVALID", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 2) Signature check
    if (!verifyPayfastSignature(data)) {
      return new NextResponse("INVALID", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 3) Only complete payments should unlock
    const paymentStatus = (data.payment_status || "").toUpperCase();
    if (paymentStatus !== "COMPLETE") {
      return new NextResponse("VALID", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 4) Extract identity fields
    const userEmail = (data.email_address || "").trim();
    const paymentId = (data.pf_payment_id || data.m_payment_id || "").trim();
    const amount = parseFloat(data.amount_gross || "0") || 0;
    const itemName = (data.item_name || "").toLowerCase();
    const customStr1 = (data.custom_str1 || "").toLowerCase();

    // 5) Only process LeakFinder lifetime purchases in this path
    const isLeakFinderLifetime =
      itemName.includes("leakfinder") ||
      itemName.includes("lifetime") ||
      customStr1.includes("leakfinder") ||
      customStr1.includes("lifetime") ||
      customStr1.includes("pro_lifetime");

    if (!isLeakFinderLifetime) {
      return new NextResponse("VALID", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (!userEmail || !paymentId) {
      return new NextResponse("INVALID", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 6) Upsert lifetime license through backend endpoint (idempotent there)
    await callUpgradeEndpoint({
      user_email: userEmail,
      amount,
      payment_id: paymentId,
    });

    return new NextResponse("VALID", {
      status: 200,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-cache" },
    });
  } catch {
    return new NextResponse("INVALID", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// Optional: quick health test
export async function GET() {
  return new NextResponse("ENDPOINT_ACCESSIBLE", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
