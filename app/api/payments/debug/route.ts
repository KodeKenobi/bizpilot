import { NextResponse } from "next/server";
import { getLastITNAttempt } from "@/lib/payfast-debug";

export async function GET() {
  const lastITN = getLastITNAttempt();
  
  return NextResponse.json({
    lastITN,
    timestamp: new Date().toISOString(),
  });
}
