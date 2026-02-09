import { NextRequest, NextResponse } from "next/server";

// DELETE /api/enterprise/team/[id] - Remove a team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const teamMemberId = parseInt(resolvedParams.id);

    if (isNaN(teamMemberId)) {
      return NextResponse.json({ error: "Invalid team member ID" }, { status: 400 });
    }

    // Get backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || 'https://web-production-737b.up.railway.app';

    // Send removal request to backend
    const response = await fetch(`${backendUrl}/api/enterprise/team/${teamMemberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to remove team member' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}