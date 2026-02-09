"use client";

import React, { useRef, useEffect, useState } from "react";
import { API_CONFIG } from "@/lib/config";

interface PayFastFormProps {
  amount: string;
  item_name: string;
  item_description?: string;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
  fica_idnumber?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  cell_number?: string;
  custom_str1?: string;
  custom_str2?: string;
  // Subscription fields
  subscription_type?: "1" | "2";
  billing_date?: string;
  recurring_amount?: string;
  frequency?: "1" | "2" | "3" | "4" | "5" | "6";
  cycles?: string;
  subscription_notify_email?: boolean;
  subscription_notify_webhook?: boolean;
  subscription_notify_buyer?: boolean;
  autoSubmit?: boolean;
  className?: string;
  formRef?: React.RefObject<HTMLFormElement>;
  onPaymentDataLoaded?: () => void;
}

/**
 * PayFastForm - For SUBSCRIPTIONS ONLY
 * This component is specifically designed for PayFast subscription payments.
 * For simple $1 payments, use PayFastDollarForm instead.
 */
export default function PayFastForm({
  amount,
  item_name,
  item_description,
  return_url,
  cancel_url,
  notify_url,
  fica_idnumber,
  name_first,
  name_last,
  email_address,
  cell_number,
  custom_str1,
  custom_str2,
  subscription_type,
  billing_date,
  recurring_amount,
  frequency,
  cycles,
  subscription_notify_email,
  subscription_notify_webhook,
  subscription_notify_buyer,
  autoSubmit = false,
  className = "hidden",
  formRef: externalFormRef,
  onPaymentDataLoaded,
}: PayFastFormProps) {
  const internalFormRef = useRef<HTMLFormElement>(null);
  const formRef = externalFormRef || internalFormRef;
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // CRITICAL: PayFastForm is for SUBSCRIPTIONS ONLY
  // Require subscription_type to be provided
  if (!subscription_type) {
    return (
      <div className="text-red-500 p-4">
        <p className="font-bold">
          Error: PayFastForm requires subscription_type
        </p>
        <p className="text-sm">
          PayFastForm is for subscriptions only. Use PayFastDollarForm for
          simple payments.
        </p>
      </div>
    );
  }

  // Payment data comes from API response (includes signature)
  // This ensures the signature matches the exact data sent to PayFast
  const [paymentData, setPaymentData] = useState<Record<string, string> | null>(
    null
  );
  const [isLoadingSignature, setIsLoadingSignature] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment data and signature from server-side API (passphrase stays on server)
  // CRITICAL: Use the payment data returned from API, not client-side built data
  // The signature must match the exact payment data sent to PayFast
  useEffect(() => {
    // CRITICAL: Ensure amount is valid before making API call
    if (!amount || parseFloat(amount) <= 0) {
      setError("Invalid payment amount");
      setIsLoadingSignature(false);
      return;
    }

    const fetchPaymentData = async () => {
      try {
        setIsLoadingSignature(true);

        // Build request data from props (what we want to send)
        const requestData: Record<string, any> = {
          amount: parseFloat(amount).toFixed(2),
          item_name: String(item_name).trim(),
        };

        if (item_description)
          requestData.item_description = item_description.trim();
        if (custom_str1) requestData.custom_str1 = custom_str1.trim();
        if (custom_str2) requestData.custom_str2 = custom_str2.trim();
        // CRITICAL WORKAROUND: Never send name_first, name_last, email_address, or cell_number
        // These cause signature mismatch when logged in - PayFast calculates signature differently
        // Even if props are passed, we exclude them to match $1 payment exactly
        // if (name_first) requestData.name_first = name_first.trim();
        // if (name_last) requestData.name_last = name_last.trim();
        // if (email_address) requestData.email_address = email_address.trim();
        // if (cell_number) requestData.cell_number = cell_number.trim();

        // Add return URLs for all payments
        // PayFast requires return_url in payload to redirect users back
        // Always include return_url and cancel_url for redirects
        if (return_url) requestData.return_url = return_url.trim();
        if (cancel_url) requestData.cancel_url = cancel_url.trim();

        // For subscriptions, notify_url is included (API handles this)
        if (notify_url) requestData.notify_url = notify_url.trim();

        // Add subscription fields (required for PayFastForm)
        if (subscription_type) {
          requestData.subscription_type = subscription_type;
          if (subscription_type === "1") {
            // Subscription fields - frequency and cycles are REQUIRED
            if (frequency) {
              requestData.frequency = frequency;
            } else {
            }
            if (cycles !== undefined && cycles !== null) {
              requestData.cycles = cycles;
            } else {
            }
            if (billing_date) requestData.billing_date = billing_date.trim();
            if (recurring_amount)
              requestData.recurring_amount =
                parseFloat(recurring_amount).toFixed(2);
            if (subscription_notify_email !== undefined)
              requestData.subscription_notify_email = subscription_notify_email;
            if (subscription_notify_webhook !== undefined)
              requestData.subscription_notify_webhook =
                subscription_notify_webhook;
            if (subscription_notify_buyer !== undefined)
              requestData.subscription_notify_buyer = subscription_notify_buyer;
          }
        }

        const response = await fetch("/api/payments/payfast/initiate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to generate signature: ${response.statusText}`
          );
        }

        const data = await response.json();
        // CRITICAL: Use the payment_data from API response, not client-side built data
        // The signature is calculated on the server's payment_data, so we must use that
        if (data.payment_data) {
          setPaymentData(data.payment_data);

          // Notify parent that payment data is loaded
          if (onPaymentDataLoaded) {
            onPaymentDataLoaded();
          }
        } else {
          throw new Error("No payment_data in response");
        }
      } catch (error) {
        // Set error state so parent can handle it
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
      } finally {
        setIsLoadingSignature(false);
      }
    };

    fetchPaymentData();
  }, [
    amount,
    item_name,
    item_description,
    custom_str1,
    custom_str2,
    name_first,
    name_last,
    email_address,
    cell_number,
    subscription_type,
    billing_date,
    recurring_amount,
    frequency,
    cycles,
    subscription_notify_email,
    subscription_notify_webhook,
    subscription_notify_buyer,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  // Auto-submit if requested - but only after payment data is loaded
  useEffect(() => {
    if (
      autoSubmit &&
      !hasAutoSubmitted &&
      formRef.current &&
      paymentData &&
      !isLoadingSignature
    ) {
      // Wait a bit to ensure form is fully rendered with all fields
      setTimeout(() => {
        if (formRef.current && paymentData && !hasAutoSubmitted) {
          // Verify form has all required fields before submitting
          const requiredFields = [
            "merchant_id",
            "merchant_key",
            "amount",
            "item_name",
            "signature",
          ];
          const allFieldsPresent = requiredFields.every((field) => {
            const input = formRef.current?.querySelector(
              `input[name="${field}"]`
            );
            return input && (input as HTMLInputElement).value;
          });

          if (allFieldsPresent) {
            setHasAutoSubmitted(true);
            formRef.current.submit();
          }
        }
      }, 500);
    }
  }, [autoSubmit, paymentData, isLoadingSignature, hasAutoSubmitted]);

  // Render inputs in EXACT order as per PayFast documentation
  // CRITICAL: Use paymentData from API response (includes signature)
  // Render fields in the EXACT order they appear in paymentData object
  // This ensures the form matches what the signature was calculated on
  const renderInputs = () => {
    if (!paymentData) {
      return null; // Don't render form until payment data is loaded
    }

    const inputs: JSX.Element[] = [];

    // Iterate through paymentData in insertion order (as it appears in the object)
    // This matches the order used for signature calculation
    for (const key in paymentData) {
      const value = paymentData[key];
      if (value !== undefined && value !== null && value !== "") {
        inputs.push(
          <input key={key} type="hidden" name={key} value={String(value)} />
        );
      }
    }

    return inputs;
  };

  // Ensure form is in DOM and log payment data when ready
  useEffect(() => {
    if (formRef.current && paymentData) {
      // Verify all fields are in the form
      const requiredFields = [
        "merchant_id",
        "merchant_key",
        "amount",
        "item_name",
        "signature",
      ];
      requiredFields.forEach((field) => {
        const input = formRef.current?.querySelector(`input[name="${field}"]`);
        if (input) {
          // Input found
        }
      });
    }
  }, [paymentData]);

  return (
    <form
      ref={formRef as React.RefObject<HTMLFormElement>}
      action={API_CONFIG.PAYFAST.PAYFAST_URL}
      method="post"
      encType="application/x-www-form-urlencoded"
      acceptCharset="UTF-8"
      onSubmit={handleSubmit}
      className={className}
    >
      {renderInputs()}
    </form>
  );
}
