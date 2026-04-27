// Simple in-memory store for pending payments
// Maps user email to payment plan
const pendingPayments = new Map<
  string,
  {
    plan: string;
    timestamp: number;
    amount: string;
  }
>();

// Store pending payment
export function storePendingPayment(
  email: string,
  plan: string,
  amount: string
) {
  pendingPayments.set(email.toLowerCase().trim(), {
    plan,
    timestamp: Date.now(),
    amount,
  });
}

// Get and clear pending payment
export function getAndClearPendingPayment(
  email: string
): { plan: string; amount: string } | null {
  const key = email.toLowerCase().trim();
  const payment = pendingPayments.get(key);

  if (payment) {
    // Clear it after retrieving
    pendingPayments.delete(key);

    return {
      plan: payment.plan,
      amount: payment.amount,
    };
  }

  return null;
}

// Check if payment exists (without clearing)
export function hasPendingPayment(email: string): boolean {
  return pendingPayments.has(email.toLowerCase().trim());
}

// Clean up old payments (older than 1 hour)
export function cleanupOldPayments() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  let cleaned = 0;

  for (const [email, payment] of Array.from(pendingPayments.entries())) {
    if (payment.timestamp < oneHourAgo) {
      pendingPayments.delete(email);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[PendingPayments] Cleaned up ${cleaned} old payment(s)`);
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldPayments, 10 * 60 * 1000);
}
