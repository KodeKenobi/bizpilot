import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // TODO: Implement your backup run logic here
    return NextResponse.json({
      success: true,
      message: "Backup started successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to start backup" },
      { status: 500 }
    );
  }
}
