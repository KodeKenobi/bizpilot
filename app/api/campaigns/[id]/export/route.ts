import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns/[id]/export
 * Export campaign results as color-coded Excel spreadsheet
 * Query parameters:
 * - completedColor: hex color for completed rows (default: #FEF3C7 - yellow)
 * - failedColor: hex color for failed/broken rows (default: #FECACA - red)
 * - includeComments: boolean to include comments column (default: true)
 * - commentStyle: 'success' | 'detailed' | 'minimal' (default: 'success')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const completedColor = searchParams.get('completedColor') || '#FEF3C7'; // Light yellow
    const failedColor = searchParams.get('failedColor') || '#FECACA'; // Light red
    const includeComments = searchParams.get('includeComments') !== 'false'; // Default true
    const commentStyle = searchParams.get('commentStyle') || 'success'; // 'success', 'detailed', 'minimal'

    // Get backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || 'https://web-production-737b.up.railway.app';

    // Fetch campaign data
    const campaignResponse = await fetch(`${backendUrl}/api/campaigns/${campaignId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!campaignResponse.ok) {
      const errorData = await campaignResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch campaign' },
        { status: campaignResponse.status }
      );
    }

    const campaignData = await campaignResponse.json();
    const campaign = campaignData.campaign;

    // Fetch companies data
    const companiesResponse = await fetch(`${backendUrl}/api/campaigns/${campaignId}/companies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!companiesResponse.ok) {
      const errorData = await companiesResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch companies' },
        { status: companiesResponse.status }
      );
    }

    const companiesData = await companiesResponse.json();
    const companies = companiesData.companies || [];

    // Collect all unique column names from companies (including additional_data)
    const allColumnKeys = new Set<string>();
    companies.forEach((company: any) => {
      // Add standard fields
      if (company.company_name) allColumnKeys.add('company_name');
      if (company.website_url) allColumnKeys.add('website_url');
      if (company.contact_email) allColumnKeys.add('contact_email');
      if (company.contact_person) allColumnKeys.add('contact_person');
      if (company.phone) allColumnKeys.add('phone');
      
      // Add fields from additional_data
      if (company.additional_data && typeof company.additional_data === 'object') {
        Object.keys(company.additional_data).forEach(key => allColumnKeys.add(key));
      }
    });

    // Define column order: standard fields first, then additional_data fields, then status/comments
    const standardFields = ['company_name', 'website_url', 'contact_email', 'contact_person', 'phone'];
    const additionalFields = Array.from(allColumnKeys).filter(key => !standardFields.includes(key)).sort();
    
    // Build columns array preserving original order
    const baseColumns: any[] = [];
    
    // Add standard fields in order (only if they exist in data)
    standardFields.forEach(field => {
      if (allColumnKeys.has(field)) {
        const width = field === 'website_url' ? 30 : field === 'company_name' ? 25 : field === 'contact_email' ? 25 : 20;
        baseColumns.push({ 
          header: field.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
          key: field, 
          width 
        });
      }
    });
    
    // Add additional_data fields
    additionalFields.forEach(field => {
      baseColumns.push({ 
        header: field.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
        key: field, 
        width: 20 
      });
    });
    
    // Add status column
    baseColumns.push({ header: 'Status', key: 'status', width: 15 });

    // Add comments column if requested
    const columns = includeComments
      ? [...baseColumns, { header: 'Comments', key: 'comments', width: 40 }]
      : baseColumns;

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Campaign Results');
    worksheet.columns = columns;

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }, // Dark gray
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data rows with color coding
    companies.forEach((company: any, index: number) => {
      const rowData: any = {
        status: company.status,
      };
      
      // Add standard fields
      if (allColumnKeys.has('company_name')) rowData.company_name = company.company_name || '';
      if (allColumnKeys.has('website_url')) rowData.website_url = company.website_url || '';
      if (allColumnKeys.has('contact_email')) rowData.contact_email = company.contact_email || '';
      if (allColumnKeys.has('contact_person')) rowData.contact_person = company.contact_person || '';
      if (allColumnKeys.has('phone')) rowData.phone = company.phone || '';
      
      // Add additional_data fields
      if (company.additional_data && typeof company.additional_data === 'object') {
        Object.keys(company.additional_data).forEach(key => {
          if (allColumnKeys.has(key)) {
            rowData[key] = company.additional_data[key] || '';
          }
        });
      }
      
      // Add comments if requested
      if (includeComments) {
        rowData.comments = generateComment(company, commentStyle);
      }
      
      const row = worksheet.addRow(rowData);

      // Apply color coding based on status
      const fillColor = getStatusColor(company.status, completedColor, failedColor);
      if (fillColor) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor.replace('#', 'FF') },
        };
      }

      // Style the status column
      const statusCell = row.getCell('status');
      statusCell.font = { bold: true };
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: getStatusTextColor(company.status) },
      };
    });

    // Auto-fit columns (ExcelJS doesn't have auto-fit, but we can estimate)
    worksheet.columns.forEach((column) => {
      if (column.width) {
        column.width = column.width;
      }
    });

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${campaign.name.replace(/[^a-zA-Z0-9]/g, '_')}_results_${timestamp}.xlsx`;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return Excel file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('[Campaign Export] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export campaign' },
      { status: 500 }
    );
  }
}

/**
 * Generate comment based on company status and style preference
 */
function generateComment(company: any, style: string): string {
  switch (style) {
    case 'detailed':
      switch (company.status) {
        case 'completed':
          return `✓ Successfully processed - Contact form submitted on ${company.website_url}. ${company.contact_email ? `Email: ${company.contact_email}` : ''}`;
        case 'failed':
          return `✗ Failed to process - ${company.error_message || 'Unknown error occurred'}`;
        case 'captcha':
          return `⚠ CAPTCHA detected - Manual review required. Contact form found but CAPTCHA blocked submission.`;
        case 'processing':
          return `⟳ Currently being processed`;
        case 'pending':
          return `⏳ Waiting to be processed`;
        default:
          return company.status;
      }

    case 'minimal':
      switch (company.status) {
        case 'completed':
          return '✓ Done';
        case 'failed':
          return '✗ Failed';
        case 'captcha':
          return '⚠ CAPTCHA';
        case 'processing':
          return '⟳ Processing';
        case 'pending':
          return '⏳ Pending';
        default:
          return company.status;
      }

    case 'success':
    default:
      switch (company.status) {
        case 'completed':
          return '✓ Successfully completed - Contact form submitted';
        case 'failed':
          return `✗ Failed - ${company.error_message || 'Processing error'}`;
        case 'captcha':
          return '⚠ CAPTCHA required - Manual submission needed';
        case 'processing':
          return '⟳ In progress';
        case 'pending':
          return '⏳ Pending processing';
        default:
          return company.status;
      }
  }
}

/**
 * Get background color for row based on status
 */
function getStatusColor(status: string, completedColor: string, failedColor: string): string | null {
  switch (status) {
    case 'completed':
      return completedColor;
    case 'failed':
    case 'captcha':
      return failedColor;
    default:
      return null; // No background for pending/processing
  }
}

/**
 * Get text color for status cell
 */
function getStatusTextColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'FF059669'; // Green text
    case 'failed':
      return 'FFDC2626'; // Red text
    case 'captcha':
      return 'FFD97706'; // Orange text
    case 'processing':
      return 'FF2563EB'; // Blue text
    default:
      return 'FF6B7280'; // Gray text
  }
}