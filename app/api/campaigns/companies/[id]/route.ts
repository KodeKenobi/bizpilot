import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || "https://web-production-737b.up.railway.app";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const params = await props.params;
    const companyId = params.id;

    const response = await fetch(
      `${BACKEND_URL}/api/campaigns/companies/${companyId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json().catch(() => ({
      error: "Invalid response from backend",
    }));

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to update company" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
