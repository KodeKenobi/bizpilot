import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // TODO: Implement your ad service stop logic here
    return NextResponse.json({
      success: true,
      message: "Ad service stopped successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to stop ad service" },
      { status: 500 }
    );
  }
}
