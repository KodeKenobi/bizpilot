import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Lazy initialization to avoid build-time errors
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, cc, subject, html, text, attachments } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    if (attachments && attachments.length > 0) {
      // Process attachments
    }

    // Format FROM_EMAIL properly: "Name <email@domain.com>"
    let fromEmail =
      process.env.FROM_EMAIL || "Trevnoctilla <onboarding@resend.dev>";

    // Ensure proper format if FROM_EMAIL doesn't have name
    if (!fromEmail.includes("<") && !fromEmail.includes(">")) {
      // If it's just an email, add the name
      fromEmail = `Trevnoctilla <${fromEmail}>`;
    }

    // Ensure 'to' is an array (Resend accepts both string and array)
    const toArray = Array.isArray(to) ? to : [to];

    const emailPayload: any = {
      from: fromEmail,
      to: toArray,
      subject,
      html,
      text,
    };

    // Add CC if provided (Resend expects array for CC; verified domain may be required for CC to deliver)
    if (cc) {
      if (Array.isArray(cc) && cc.length > 0) {
        emailPayload.cc = cc;
      } else if (typeof cc === "string" && cc.trim()) {
        emailPayload.cc = [cc.trim()];
      }
      if (emailPayload.cc?.length) {
        console.log("[EMAIL] CC recipients:", emailPayload.cc);
      }
    }

    // Add attachments if provided
    // Format: [{ filename: "invoice.pdf", content: base64String, contentType: "application/pdf" }]
    // Resend expects content as Buffer from base64 string
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      emailPayload.attachments = attachments.map((att: any) => {
        // Convert base64 string to Buffer for Resend SDK
        const contentBuffer = Buffer.from(att.content, "base64");
        return {
          filename: att.filename,
          content: contentBuffer, // Resend SDK expects Buffer, not base64 string
        };
      });
      attachments.forEach((att: any, index: number) => {
        // Process attachment
      });
    }

    // Log attachment details before sending
    if (emailPayload.attachments && emailPayload.attachments.length > 0) {
      emailPayload.attachments.forEach((att: any, index: number) => {
        const sizeKB =
          att.content instanceof Buffer
            ? Math.round(att.content.length / 1024)
            : "unknown";
      });
    }

    const resend = getResend();

    // Log email payload for debugging (without sensitive data)
    console.log("📧 [EMAIL] Sending email:", {
      from: fromEmail,
      to: toArray,
      cc: emailPayload.cc || "none",
      subject,
      hasHtml: !!html,
      hasText: !!text,
      hasAttachments: !!(attachments && attachments.length > 0),
    });

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error("❌ [EMAIL] Resend API error:", {
        message: error.message,
        name: error.name,
        error: JSON.stringify(error, null, 2),
      });
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to send email",
          details: error,
        },
        { status: 500 }
      );
    }

    console.log("✅ [EMAIL] Email sent successfully:", {
      emailId: data?.id,
      to: toArray,
      cc: emailPayload.cc || "none",
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      email_id: data?.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
