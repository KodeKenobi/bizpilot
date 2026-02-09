# Contact Automation Campaign Feature

## Overview

This feature allows users to automatically visit websites, find contact pages, fill out contact forms, and submit them with personalized messages. It's a powerful SaaS feature for automated outreach campaigns.

## Features

### ✅ Completed Features

1. **Spreadsheet Upload**
   - Support for CSV, XLS, and XLSX files
   - Validation of required columns (company_name, website_url)
   - Preview of uploaded data
   - Handles optional fields (contact_email, contact_person, phone)

2. **Campaign Management**
   - Create campaigns with custom names
   - Message templates with variable substitution
   - Campaign status tracking (draft, queued, processing, completed, failed, paused)
   - Real-time progress monitoring
   - Statistics dashboard (success, failed, CAPTCHA counts)

3. **Message Personalization**
   - Variable system using `{variable_name}` syntax
   - Support for all columns from uploaded spreadsheet
   - Live preview of personalized messages
   - Dynamic variable detection

4. **Automated Form Submission**
   - Intelligent contact page detection
   - Dynamic form field detection and filling
   - Support for various field types (name, email, phone, subject, message)
   - CAPTCHA detection (flags for manual review)
   - Screenshot capture for verification

5. **Dashboard & Analytics**
   - Campaign list with status and progress
   - Detailed campaign view with company-level results
   - Filter by status (pending, processing, success, failed, CAPTCHA)
   - Real-time updates for processing campaigns
   - Submission logs and error tracking

6. **Database Schema**
   - `campaigns` table for campaign data
   - `companies` table for company information
   - `submission_logs` table for detailed action logs
   - PostgreSQL/Supabase integration

## Architecture

### Frontend (Next.js)
- **Upload Page** (`/app/campaigns/upload/page.tsx`)
  - Drag-and-drop file upload
  - CSV validation and preview
  - Mobile-responsive design

- **Create Campaign Page** (`/app/campaigns/create/page.tsx`)
  - Message template editor with variables
  - Live preview
  - Campaign name input

- **Dashboard** (`/app/campaigns/page.tsx`)
  - List all campaigns
  - Status badges and progress bars
  - Quick actions (view, delete)

- **Campaign Detail** (`/app/campaigns/[id]/page.tsx`)
  - Company-level status
  - Real-time progress updates
  - Filter by status
  - Start/pause controls

### Backend (Flask)
- **API Routes** (`/trevnoctilla-backend/api/campaigns/routes.py`)
  - `GET /api/campaigns` - List campaigns
  - `POST /api/campaigns` - Create campaign
  - `GET /api/campaigns/:id` - Get campaign details
  - `PATCH /api/campaigns/:id` - Update campaign
  - `DELETE /api/campaigns/:id` - Delete campaign
  - `POST /api/campaigns/:id/start` - Start campaign
  - `GET /api/campaigns/:id/companies` - List companies
  - `PATCH /api/campaigns/companies/:id` - Update company (worker)
  - `POST /api/campaigns/companies/:id/logs` - Add logs (worker)

### Scraper Service (Puppeteer)
- **Campaign Scraper** (`/services/campaign-scraper.ts`)
  - Headless browser automation
  - Contact page detection using heuristics
  - Dynamic form field detection
  - CAPTCHA detection
  - Screenshot capture
  - Error handling and logging

- **Campaign Worker** (`/services/campaign-worker.ts`)
  - Background job processor
  - Polls for queued campaigns
  - Processes companies sequentially
  - Updates database with results
  - Rate limiting (2-5 second delays)

## Setup Instructions

### 1. Database Migration

Run the SQL migration to create necessary tables:

```bash
# Connect to your Supabase database
psql -h [your-supabase-host] -U postgres -d postgres -f migrations/create_contact_automation_tables.sql
```

Or use the Supabase dashboard to run the SQL directly.

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Or with pnpm
pnpm install

# This will install:
# - puppeteer (already installed)
# - ts-node (for running TypeScript)
# - @types/puppeteer (TypeScript types)
```

### 3. Environment Variables

Add to your `.env.local`:

```env
# Backend URL for the worker
BACKEND_URL=http://localhost:5000  # For local development
# BACKEND_URL=https://your-backend.railway.app  # For production

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Start the Application

**Development:**

```bash
# Terminal 1: Start Next.js frontend
npm run dev

# Terminal 2: Start Flask backend
cd trevnoctilla-backend
python app.py

# Terminal 3: Start campaign worker
npm run worker:campaigns
```

**Production:**

```bash
# Build Next.js
npm run build
npm start

# Start Flask backend
cd trevnoctilla-backend
gunicorn app:app

# Start campaign worker (run as background service)
npm run worker:campaigns
```

## Usage Guide

### 1. Create a Campaign

1. Navigate to `/campaigns`
2. Click "New Campaign"
3. Upload a CSV, XLS, or XLSX file with columns:
   - `company_name` (required)
   - `website_url` (required)
   - `contact_email` (optional)
   - `contact_person` (optional)
   - `phone` (optional)

Example CSV:
```csv
company_name,website_url,contact_email,contact_person
Acme Corp,https://acme.com,contact@acme.com,John Smith
Tech Solutions,https://techsolutions.io,,
```

4. Review the uploaded data
5. Click "Continue to Create Campaign"

### 2. Set Up Message Template

1. Enter a campaign name
2. Write your message template using variables:
   ```
   Hello {company_name},

   I came across your website at {website_url} and wanted to reach out about a potential partnership opportunity.

   Looking forward to hearing from you!

   Best regards,
   Your Name
   ```
3. Preview the message with real data
4. Click "Create Campaign"

### 3. Start the Campaign

1. View your campaign details
2. Click "Start Campaign"
3. The campaign worker will automatically:
   - Visit each website
   - Find the contact page
   - Fill the contact form
   - Take a screenshot
   - Update the status

### 4. Monitor Progress

- View real-time progress on the dashboard
- Check individual company status
- Review error messages for failed submissions
- Download screenshots for verification

## Security & Compliance

### CAPTCHA Handling
- System **detects** CAPTCHAs but does **not** attempt to bypass them
- Companies with CAPTCHAs are flagged for manual review
- Ensures ethical compliance with website anti-bot measures

### Rate Limiting
- 2-5 second delay between requests
- Prevents server overload and IP blocking
- Configurable per campaign

### Data Privacy
- User data encrypted in database
- Compliance with GDPR/CCPA
- No storage of sensitive form data
- Screenshots stored securely in Supabase Storage

## Troubleshooting

### Worker Not Processing Campaigns

Check the worker logs:
```bash
npm run worker:campaigns
```

Common issues:
- Backend URL not set correctly
- Database connection issues
- Puppeteer installation issues

### Puppeteer Installation Issues (Windows)

If Puppeteer fails to install on Windows:

```bash
# Install Visual C++ Build Tools
npm install --global windows-build-tools

# Or download from Microsoft:
# https://visualstudio.microsoft.com/downloads/
```

### Companies Stuck in "Processing"

This can happen if the worker crashes. To reset:

```sql
UPDATE companies 
SET status = 'pending' 
WHERE status = 'processing' AND campaign_id = [campaign_id];
```

## Future Enhancements

### Planned Features

1. **Supabase Storage Integration**
   - Upload screenshots to Supabase Storage
   - Serve images via CDN
   - Automatic cleanup of old screenshots

2. **Advanced Queue System**
   - BullMQ integration
   - Redis-backed job queue
   - Priority queuing
   - Retry logic with exponential backoff

3. **Rate Limiting & Throttling**
   - Per-user rate limits
   - Configurable delays
   - IP rotation support
   - Proxy integration

4. **Analytics & Reporting**
   - Campaign performance metrics
   - Success rate trends
   - Export reports (CSV, PDF)
   - Email notifications

5. **AI-Powered Form Detection**
   - Machine learning for better form detection
   - Handle complex multi-step forms
   - Support for non-standard form layouts

6. **Multi-Campaign Management**
   - Campaign templates
   - Bulk operations
   - Campaign scheduling
   - A/B testing messages

## API Documentation

### Create Campaign

```typescript
POST /api/campaigns
Content-Type: application/json

{
  "name": "Q1 Outreach Campaign",
  "message_template": "Hello {company_name}...",
  "companies": [
    {
      "company_name": "Acme Corp",
      "website_url": "https://acme.com",
      "contact_email": "contact@acme.com"
    }
  ]
}

Response: 201 Created
{
  "success": true,
  "campaign": {
    "id": 1,
    "name": "Q1 Outreach Campaign",
    "status": "draft",
    ...
  }
}
```

### Start Campaign

```typescript
POST /api/campaigns/:id/start

Response: 200 OK
{
  "success": true,
  "message": "Campaign started successfully",
  "campaign": {
    "id": 1,
    "status": "queued",
    ...
  }
}
```

### Get Campaign Status

```typescript
GET /api/campaigns/:id?include_companies=true

Response: 200 OK
{
  "success": true,
  "campaign": {
    "id": 1,
    "name": "Q1 Outreach Campaign",
    "status": "processing",
    "progress_percentage": 45,
    "success_count": 20,
    "failed_count": 3,
    "captcha_count": 2,
    ...
  }
}
```

## Technical Details

### Form Detection Algorithm

1. **Contact Page Detection:**
   - Try common paths: `/contact`, `/contact-us`, `/get-in-touch`
   - Search for links with keywords: "contact", "get in touch", "reach us"
   - Use regex patterns for flexible matching

2. **Form Field Detection:**
   - Name field: matches "name", "full name", "your name"
   - Email field: type="email" or matches "email", "e-mail"
   - Message field: textarea with "message", "comment", "inquiry"
   - Phone field: matches "phone", "tel", "mobile"
   - Subject field: matches "subject", "topic", "regarding"

3. **CAPTCHA Detection:**
   - Check for reCAPTCHA iframe
   - Check for hCaptcha elements
   - Look for class/id containing "captcha"

### Variable Replacement

Variables are replaced using regex:
```javascript
message = message.replace(/\{company_name\}/g, company.company_name);
```

Supports:
- `{company_name}`
- `{website_url}`
- `{contact_email}`
- `{contact_person}`
- `{phone}`
- Any custom column from spreadsheet

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs from the worker
3. Check database for error messages
4. Contact support with campaign ID and error details

## License

This feature is part of the Trevnoctilla platform and follows the same license as the main application.
