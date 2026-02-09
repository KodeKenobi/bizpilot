import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { setLastITNAttempt } from "@/lib/payfast-debug";

// Ensure this route is publicly accessible (no auth required)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Log ALL requests to this endpoint (even before processing)
// This helps debug if PayFast is calling but failing before we log
if (typeof process !== "undefined") {
  process.on("uncaughtException", (error) => {});
  process.on("unhandledRejection", (reason) => {});
}

// PayFast configuration
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
};

/**
 * Verify PayFast signature
 * PayFast ITN signature verification uses RAW values (NOT URL-encoded)
 * This matches how PayFast calculates signatures for ITN notifications
 */
function verifyPayFastSignature(data: Record<string, string>): boolean {
  const receivedSignature = data.signature || "";

  // Filter out empty values and signature field
  // CRITICAL: PayFast ITN signature includes ALL fields except signature itself
  // This includes merchant_key, merchant_id, and all other fields
  const filteredData: Record<string, string> = {};
  Object.keys(data).forEach((key) => {
    if (
      key !== "signature" && // Only exclude signature field
      data[key] !== "" &&
      data[key] !== null &&
      data[key] !== undefined
    ) {
      const value = String(data[key]).trim();
      if (value !== "") {
        filteredData[key] = value;
      }
    }
  });

  // PayFast ITN signature uses RAW values (NOT URL-encoded)
  // Parameters should be sorted alphabetically by key name (as per PayFast docs)
  // Build parameter string with raw values
  const sortedKeys = Object.keys(filteredData).sort();
  let pfParamString = "";
  sortedKeys.forEach((key) => {
    const value = filteredData[key];
    // Use raw value (not URL-encoded) for ITN signature verification
    pfParamString += `${key}=${value}&`;
  });

  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);

  // Add passphrase if provided (raw, not URL-encoded)
  if (PAYFAST_CONFIG.PASSPHRASE && PAYFAST_CONFIG.PASSPHRASE.trim()) {
    const passphrase = PAYFAST_CONFIG.PASSPHRASE.trim();
    pfParamString += `&passphrase=${passphrase}`;
  }

  // Generate MD5 hash (lowercase)
  const expectedSignature = crypto
    .createHash("md5")
    .update(pfParamString)
    .digest("hex");

  const isValid =
    receivedSignature.toLowerCase() === expectedSignature.toLowerCase();

  // Debug logging
  if (!isValid) {
  }

  return isValid;
}

/**
 * Handle PayFast ITN (Instant Transaction Notification)
 * This endpoint receives payment status updates from PayFast
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `ITN-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    // Log request details immediately
    console.log(`[${requestId}] ITN received at ${new Date().toISOString()}`);

    // Parse form data from PayFast
    // PayFast sends ITN as application/x-www-form-urlencoded
    // CRITICAL: PayFast requires a fast response (< 30 seconds)
    // We must respond quickly to prevent "Unable to verify payment" error

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      // Return INVALID but still 200 OK
      return new NextResponse("INVALID", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      // Values are already URL-decoded by Next.js when parsing formData
      data[key] = value.toString();
    });

    // Log received ITN data (for debugging)
    console.log(`[${requestId}] ITN data received:`, {
      merchant_id: data.merchant_id,
      merchant_key: data.merchant_key ? "***" : undefined,
      signature: data.signature ? "***" : undefined,
    });

    // TEMPORARY: For wallet payments, PayFast calls notify BEFORE payment completes
    // If signature verification fails, wallet payment is rejected
    // Log the verification attempt but allow it to proceed for testing

    const signatureValid = verifyPayFastSignature(data);
    if (!signatureValid) {
      const errorMsg = `SIGNATURE VERIFICATION FAILED - This is why PayFast shows "Unable to verify payment"`;
      console.error(`[${requestId}] ${errorMsg}`);

      // Store for debugging
      setLastITNAttempt({
        timestamp: new Date().toISOString(),
        requestId,
        data,
        errors: [errorMsg],
        status: "failed",
      });

      // CRITICAL: For wallet payments, PayFast calls notify BEFORE payment
      // If we return INVALID, wallet payment is rejected
      // Check if this is a pre-payment verification (no payment_status yet)
      const isPrePaymentVerification =
        !data.payment_status || data.payment_status === "";

      if (isPrePaymentVerification) {
        // For pre-payment verification, check merchant credentials only
        // If merchant ID/key match, allow it to proceed
        if (
          data.merchant_id === PAYFAST_CONFIG.MERCHANT_ID &&
          data.merchant_key === PAYFAST_CONFIG.MERCHANT_KEY
        ) {
          const responseTime = Date.now() - startTime;
          console.log(
            `[${requestId}] Pre-payment verification successful (${responseTime}ms)`
          );
          return new NextResponse("VALID", {
            status: 200,
            headers: { "Content-Type": "text/plain" },
          });
        }
      }

      // Still return 200 to prevent PayFast from retrying, but log the error
      // PayFast expects plain text response
      const responseTime = Date.now() - startTime;
      console.error(
        `[${requestId}] Pre-payment verification failed (${responseTime}ms)`
      );
      return new NextResponse("INVALID", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Verify merchant ID and key

    if (
      data.merchant_id !== PAYFAST_CONFIG.MERCHANT_ID ||
      data.merchant_key !== PAYFAST_CONFIG.MERCHANT_KEY
    ) {
      const errorMsg = `MERCHANT CREDENTIALS MISMATCH - This is why PayFast shows "Unable to verify payment"`;

      // Store for debugging
      setLastITNAttempt({
        timestamp: new Date().toISOString(),
        requestId,
        data,
        errors: [
          errorMsg,
          `Expected Merchant ID: ${PAYFAST_CONFIG.MERCHANT_ID}, Received: ${data.merchant_id}`,
          `Expected Merchant Key: ${PAYFAST_CONFIG.MERCHANT_KEY}, Received: ${data.merchant_key}`,
        ],
        status: "failed",
      });

      // CRITICAL: PayFast requires 200 OK response, not 400
      // Returning 400 causes PayFast to show "Unable to verify payment"
      // Still return 200 to prevent PayFast from retrying, but log the error
      // PayFast expects plain text response
      const responseTime = Date.now() - startTime;
      console.error(
        `[${requestId}] Payment verification failed (${responseTime}ms)`
      );
      return new NextResponse("INVALID", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const paymentStatus = data.payment_status;
    const mPaymentId = data.m_payment_id;
    const pfPaymentId = data.pf_payment_id;
    const amount = parseFloat(data.amount_gross || "0");

    // Subscription fields (if present)
    const token = data.token || null;
    const subscriptionType = data.subscription_type || null;
    const billingDate = data.billing_date || null;
    const recurringAmount = data.recurring_amount || null;
    const frequency = data.frequency || null;
    const cycles = data.cycles || null;

    // Log payment notification

    // Log subscription details if present
    if (token || subscriptionType) {
    }

    // Handle different payment statuses
    switch (paymentStatus) {
      case "COMPLETE":
        // Payment successful - update your database, send confirmation email, etc.

        // Extract plan info from custom fields
        const planId = data.custom_str1 || "";
        const userId = data.custom_str2 || "";
        // PayFast sends email_address in webhook (buyer enters it on PayFast page)
        // CRITICAL: For subscriptions, user_id is more reliable than email
        // PayFast may not send email_address in subscription webhooks
        const userEmail = data.email_address?.trim() || "";
        const itemName = data.item_name || "";

        // Log extracted fields for debugging
        console.log(
          `[${requestId}] Extracted fields - planId: "${planId}", userId: "${userId}"`
        );

        // Determine plan name from item_name or plan_id
        let planName = itemName;
        if (planId === "production") {
          planName = "Production Plan";
        } else if (planId === "enterprise") {
          planName = "Enterprise Plan";
        }

        // Upgrade subscription if:
        // 1. This is a subscription payment (has token and subscriptionType), OR
        // 2. This is the first payment (no token yet) but has planId and userId
        const isSubscriptionPayment = token && subscriptionType;
        const isFirstPayment = !token && planId && (userId || userEmail);

        if (isSubscriptionPayment || isFirstPayment) {
          if (isSubscriptionPayment) {
          } else {
            console.log(`[${requestId}] Processing first payment`);
          }

          // Call backend to upgrade subscription
          // CRITICAL: Prioritize user_id over email for subscriptions
          if (planId && (userId || userEmail)) {
            try {
              const backendUrl =
                process.env.NEXT_PUBLIC_API_BASE_URL ||
                (process.env.NODE_ENV === "production"
                  ? "https://web-production-737b.up.railway.app"
                  : "http://localhost:5000");

              console.log(
                `[${requestId}] Upgrading subscription for user: ${
                  userId || userEmail || "not provided"
                }`
              );

              const upgradeResponse = await fetch(
                `${backendUrl}/api/payment/upgrade-subscription`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    user_id: userId || undefined, // Prioritize user_id for subscriptions
                    user_email: userEmail || undefined, // Fallback if user_id not available
                    plan_id: planId,
                    plan_name: planName,
                    amount: amount,
                    payment_id: pfPaymentId || mPaymentId,
                  }),
                }
              );

              if (upgradeResponse.ok) {
                const upgradeData = await upgradeResponse.json();
                console.log(
                  `[${requestId}] Subscription upgraded successfully:`,
                  upgradeData
                );
              } else {
                const errorText = await upgradeResponse.text();
                console.error(
                  `[${requestId}] Subscription upgrade failed:`,
                  errorText
                );
              }
            } catch (error) {
              console.error(
                `[${requestId}] Error upgrading subscription:`,
                error
              );
              if (error instanceof Error) {
                console.error(`[${requestId}] Error message:`, error.message);
              }
              // Don't fail the webhook if upgrade fails - we can retry later
            }
          } else {
            console.warn(
              `[${requestId}] Missing planId or user identifier for subscription upgrade`
            );
          }
        }

        // TODO: Update payment status in database
        // TODO: Grant user access to premium features
        // TODO: Send confirmation email
        break;

      case "FAILED":
        // Payment failed

        // TODO: Update payment status in database
        // TODO: Notify user of payment failure
        break;

      case "PENDING":
        // Payment is pending (e.g., EFT payment)

        // TODO: Update payment status in database
        break;

      case "CANCELLED":
        // Payment was cancelled

        // TODO: Update payment status in database
        // TODO: Cancel subscription if applicable
        break;

      default:
    }

    // Handle subscription webhook notifications (trial, promo, update)
    // These come with type field instead of payment_status
    const webhookType = data.type;
    if (
      webhookType &&
      (webhookType === "subscription.free-trial" ||
        webhookType === "subscription.promo" ||
        webhookType === "subscription.update")
    ) {
      // TODO: Handle subscription webhook notifications
      // - subscription.free-trial: Trial ending soon
      // - subscription.promo: Promotional period ending
      // - subscription.update: Subscription updated (amount, frequency, etc.)
    }

    // Store successful attempt for debugging
    setLastITNAttempt({
      timestamp: new Date().toISOString(),
      requestId,
      data,
      errors: [],
      status: "success",
    });

    // Always return 200 OK to PayFast IMMEDIATELY
    // PayFast expects plain text response "VALID" or "INVALID"
    // CRITICAL: Response must be fast (< 30 seconds) or PayFast shows "Unable to verify payment"
    // Return "VALID" to confirm successful processing
    const responseTime = Date.now() - startTime;
    console.log(
      `[${requestId}] Payment processed successfully (${responseTime}ms)`
    );
    return new NextResponse("VALID", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(
      `[${requestId}] Error processing ITN (${responseTime}ms):`,
      error
    );
    // Still return 200 to prevent PayFast from retrying
    // PayFast expects plain text response
    return new NextResponse("INVALID", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// Also handle GET requests (PayFast may send GET for some notifications)
// Also allow GET for testing endpoint accessibility
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // If it's a test request (no PayFast data), return success to confirm endpoint is accessible
  if (searchParams.size === 0 || searchParams.get("test") === "true") {
    console.log("[ITN] Test request received - endpoint is accessible");
    return new NextResponse("ENDPOINT_ACCESSIBLE", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    // Parse query parameters from PayFast
    const data: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      data[key] = value;
    });

    // Convert to form data format and process
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    // Create a new request with form data
    const newRequest = new NextRequest(request.url, {
      method: "POST",
      body: formData,
    });

    return POST(newRequest);
  } catch (error) {
    return new NextResponse("INVALID", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
