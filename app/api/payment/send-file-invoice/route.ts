import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      downloadUrl,
      fileName,
      amount,
      paymentId,
      itemName,
      paymentDate,
    } = body;

    if (!email || !downloadUrl) {
      return NextResponse.json(
        { success: false, error: "Email and download URL are required" },
        { status: 400 }
      );
    }

    const attachments: any[] = [];

    // 1. Download the file
    let fileContent: Buffer | null = null;
    let fileMimeType = "application/octet-stream";
    let finalFileName = fileName || "download";

    try {
      if (downloadUrl.startsWith("data:")) {
        // Handle data URL
        const matches = downloadUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          fileMimeType = matches[1];
          const base64Data = matches[2];
          fileContent = Buffer.from(base64Data, "base64");
          // Try to get filename from mime type
          if (fileMimeType.includes("pdf")) {
            finalFileName = finalFileName.endsWith(".pdf")
              ? finalFileName
              : `${finalFileName}.pdf`;
          } else if (fileMimeType.includes("image")) {
            const ext = fileMimeType.split("/")[1] || "png";
            finalFileName = finalFileName.includes(".")
              ? finalFileName
              : `${finalFileName}.${ext}`;
          }
        }
      } else {
        // Handle HTTP URL
        const response = await fetch(downloadUrl);
        if (response.ok) {
          fileContent = Buffer.from(await response.arrayBuffer());
          const contentType = response.headers.get("content-type");
          if (contentType) {
            fileMimeType = contentType;
          }
          // Try to get filename from Content-Disposition header
          const contentDisposition = response.headers.get(
            "content-disposition"
          );
          if (contentDisposition) {
            const filenameMatch =
              contentDisposition.match(/filename="?([^"]+)"?/i);
            if (filenameMatch) {
              finalFileName = filenameMatch[1];
            }
          }
        }
      }

      if (fileContent) {
        const fileBase64 = fileContent.toString("base64");
        attachments.push({
          filename: finalFileName,
          content: fileBase64,
          contentType: fileMimeType,
        });
      }
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: "Failed to download file" },
        { status: 500 }
      );
    }

    // 2. Generate invoice PDF via backend
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://web-production-737b.up.railway.app"
        : "http://localhost:5000");

    let invoicePdf: Buffer | null = null;
    try {
      const invoiceResponse = await fetch(
        `${backendUrl}/api/payment/generate-invoice-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tier: "free", // $1 payments are not subscriptions
            amount: amount || 1.0,
            user_email: email,
            payment_id: paymentId || `payment-${Date.now()}`,
            payment_date: paymentDate,
            item_description: itemName || "File Download",
          }),
        }
      );

      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        if (invoiceData.pdf_base64) {
          invoicePdf = Buffer.from(invoiceData.pdf_base64, "base64");
          const dateStr = paymentDate
            ? new Date(paymentDate)
                .toISOString()
                .split("T")[0]
                .replace(/-/g, "")
            : new Date().toISOString().split("T")[0].replace(/-/g, "");
          attachments.push({
            filename: `invoice_${dateStr}.pdf`,
            content: invoiceData.pdf_base64,
            contentType: "application/pdf",
          });
        }
      } else {
      }
    } catch (error: any) {
      // Continue without invoice if generation fails
    }

    // 3. Get email HTML from backend template
    let emailHtml: string;
    try {
      const emailHtmlResponse = await fetch(
        `${backendUrl}/api/payment/get-file-invoice-email-html`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_name: itemName || "File Download",
            amount: amount || 1.0,
            payment_id: paymentId || "",
          }),
        }
      );

      if (emailHtmlResponse.ok) {
        const emailHtmlData = await emailHtmlResponse.json();
        if (emailHtmlData.success && emailHtmlData.html) {
          emailHtml = emailHtmlData.html;
        } else {
          throw new Error("Failed to get email HTML from backend");
        }
      } else {
        throw new Error(
          `Failed to get email HTML: ${emailHtmlResponse.status}`
        );
      }
    } catch (error: any) {
      // Fallback to simple HTML if template fails
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #ffffff; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px;">
              <h1 style="color: #333; margin-bottom: 20px;">Thank You for Your Purchase!</h1>
              <p style="color: #666; margin-bottom: 20px;">
                Your payment has been processed successfully. Please find your file and invoice attached to this email.
              </p>
              <p style="color: #666; margin-bottom: 20px;">
                <strong>Item:</strong> ${itemName || "File Download"}<br />
                <strong>Amount:</strong> $${(amount || 1.0).toFixed(2)}<br />
                ${
                  paymentId
                    ? `<strong>Payment ID:</strong> ${paymentId}<br />`
                    : ""
                }
              </p>
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Important:</strong> Please download and save your file. Files are stored on our servers for a maximum of 7 days and will be automatically deleted after that period.
                </p>
              </div>
              <p style="color: #666; margin-top: 30px;">
                If you have any questions, please contact us at info@trevnoctilla.com
              </p>
              <p style="color: #999; margin-top: 40px; font-size: 14px; text-align: center;">
                Best regards,<br />
                The Trevnoctilla Team
              </p>
            </div>
          </body>
        </html>
      `;
    }

    // 4. Send email using existing email service
    const emailSubject = `Your File and Invoice - ${
      itemName || "File Download"
    }`;

    // Use internal API route (same server)
    // Get base URL from request URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const emailResponse = await fetch(`${baseUrl}/api/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: emailSubject,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
      }),
    });

    const emailData = await emailResponse.json();

    if (emailResponse.ok && emailData.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        attachments_sent: attachments.length,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: emailData.error || "Failed to send email",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
