import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl, getAuthHeaders } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; companyId: string }> }
) {
  try {
    const { id: campaignId, companyId } = await params;
    const body = await request.json();

    const token = request.headers.get('Authorization')?.split(' ')[1];

    console.log(`[Rapid Process] Starting headless processing for campaign ${campaignId}, company ${companyId}`);

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
        body: JSON.stringify(body),
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
    console.log(`[Rapid Process] Company ${companyId} processed. Status: ${data.status}`);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Rapid Process] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
