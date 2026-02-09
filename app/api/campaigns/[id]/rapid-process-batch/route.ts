import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl, getAuthHeaders } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow up to 5 minutes for batch processing

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const body = await request.json();
    const { company_ids } = body;

    if (!company_ids || !Array.isArray(company_ids) || company_ids.length === 0) {
      return NextResponse.json(
        { error: 'company_ids array is required' },
        { status: 400 }
      );
    }

    // Get token from header (optional for guest users)
    const token = request.headers.get('Authorization')?.split(' ')[1];

    console.log(`[Batch Process] Starting batch processing for ${company_ids.length} companies`);

    // Call backend batch processing endpoint
    const backendUrl = getApiUrl(
      `/api/campaigns/${campaignId}/rapid-process-batch`
    );
    const response = await fetch(
      backendUrl,
      {
        method: 'POST',
        headers: token ? getAuthHeaders(token) : {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_ids }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error || 'Failed to process batch',
          message: errorData.message,
          daily_used: errorData.daily_used,
          daily_limit: errorData.daily_limit,
          daily_remaining: errorData.daily_remaining,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Batch Process] Completed ${company_ids.length} companies:`, data.companiesProcessed);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Batch Process] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
