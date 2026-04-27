import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl, getAuthHeaders } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    // Get token from header (optional for guest users)
    const token = request.headers.get('Authorization')?.split(' ')[1];

    console.log(`[Rapid Process] Starting headless processing for company ${companyId}`);

    // Call backend rapid-process endpoint
    const backendUrl = getApiUrl(
      `/api/campaigns/${campaignId}/companies/${companyId}/rapid-process`
    );
    const response = await fetch(
      backendUrl,
      {
        method: 'POST',
        headers: token ? getAuthHeaders(token) : {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ captureScreenshot: true }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to process company' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Rapid Process] Company ${companyId} completed:`, data.status);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Rapid Process] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
