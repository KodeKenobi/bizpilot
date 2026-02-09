import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAndClearPendingPayment } from "@/lib/pending-payments";

export async function POST(request: NextRequest) {
  try {
    // Get user email from session
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User must be authenticated" },
        { status: 401 }
      );
    }

    // Check for pending payment
    const pendingPayment = getAndClearPendingPayment(userEmail);

    if (!pendingPayment) {
      return NextResponse.json({
        hasPendingPayment: false,
      });
    }

    // Call backend to upgrade subscription
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://web-production-737b.up.railway.app"
        : "http://localhost:5000");

    

    const upgradeResponse = await fetch(
      `${backendUrl}/api/payment/upgrade-subscription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: userEmail,
          plan_id: pendingPayment.plan,
          plan_name: `${
            pendingPayment.plan.charAt(0).toUpperCase() +
            pendingPayment.plan.slice(1)
          } Plan`,
          amount: parseFloat(pendingPayment.amount),
          payment_id: `pending_${Date.now()}`,
        }),
      }
    );

    if (upgradeResponse.ok) {
      const upgradeData = await upgradeResponse.json();
      
      return NextResponse.json({
        hasPendingPayment: true,
        upgraded: true,
        plan: pendingPayment.plan,
        upgradeData,
      });
    } else {
      const errorData = await upgradeResponse.json();
      
      return NextResponse.json(
        {
          hasPendingPayment: true,
          upgraded: false,
          error: errorData.error || "Failed to upgrade subscription",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    
    return NextResponse.json(
      {
        error: `Failed to check pending payment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
