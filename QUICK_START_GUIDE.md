# Quick Start Guide - Contact Automation Feature

## 🚀 Get Started in 5 Steps

### Step 1: Run Database Migration

Open your Supabase SQL Editor and run the migration:

```bash
# File: migrations/create_contact_automation_tables.sql
```

Or via psql:
```bash
psql -h [supabase-host] -U postgres -d postgres -f migrations/create_contact_automation_tables.sql
```

### Step 2: Install Dependencies

```bash
# Install new dependencies
npm install

# Or with pnpm
pnpm install
```

This will install:
- `ts-node` (for running TypeScript workers)
- `@types/puppeteer` (TypeScript types)

### Step 3: Set Environment Variables

Add to `.env.local` (for local development):

```env
# Backend URL (for the worker to communicate with Flask)
BACKEND_URL=http://localhost:5000

# Or use your existing backend URL
# BACKEND_URL=https://web-production-737b.up.railway.app
```

### Step 4: Start All Services

Open **3 terminals**:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd trevnoctilla-backend
python app.py
```

**Terminal 3 - Campaign Worker:**
```bash
npm run worker:campaigns
```

### Step 5: Create Your First Campaign

1. Navigate to http://localhost:3000/campaigns
2. Click "New Campaign"
3. Upload a CSV file (see example below)
4. Set up your message template
5. Click "Start Campaign"

## 📝 Example CSV File

Create a file called `companies.csv`:

```csv
company_name,website_url,contact_email,contact_person
Acme Corporation,https://www.acme.com,info@acme.com,John Smith
Tech Solutions Inc,https://www.techsolutions.io,,Jane Doe
Digital Marketing Co,https://www.digitalmarketing.com,hello@digitalmarketing.com,
```

**Required columns:**
- `company_name`
- `website_url`

**Optional columns:**
- `contact_email`
- `contact_person`
- `phone`
- Any other custom fields

## 📧 Example Message Template

```
Hello {company_name},

I came across your website at {website_url} and was impressed by your work.

{contact_person}, I'd love to discuss a potential partnership opportunity that could benefit both our organizations.

Would you be open to a brief call this week?

Best regards,
Your Name
Your Company
your.email@example.com
```

## 🎯 What Happens Next?

1. **Campaign Created:** Your campaign is saved as "draft"
2. **Start Campaign:** Changes status to "queued"
3. **Worker Picks It Up:** Within 10 seconds, the worker starts processing
4. **Automated Process:**
   - Visits each website
   - Finds the contact page
   - Detects the contact form
   - Fills in the fields
   - Takes a screenshot
   - Updates the database

5. **Real-time Updates:** Dashboard shows progress every 5 seconds
6. **Completion:** Campaign status changes to "completed"

## 📊 Monitor Progress

- **Dashboard:** `/campaigns` - See all your campaigns
- **Campaign Detail:** `/campaigns/[id]` - View company-level results
- **Filter Results:** See which companies succeeded, failed, or had CAPTCHAs

## 🔧 Testing Mode

To test without actually submitting forms, modify the scraper:

In `services/campaign-scraper.ts`, line ~180, the form submission is commented out:

```typescript
// Step 6: Submit form (optional - can be disabled for testing)
// await this.submitForm(page);
```

This way, forms are filled but not submitted, so you can see screenshots without sending actual emails.

## ⚠️ Important Notes

### CAPTCHA Handling
- The system **detects** CAPTCHAs but **does not bypass** them
- Companies with CAPTCHAs are **flagged** for manual review
- This ensures ethical compliance

### Rate Limiting
- Default: 2-5 second delay between requests
- Prevents server overload
- Reduces risk of IP blocking

### Error Handling
- Failed submissions are logged with error messages
- Screenshots captured for debugging
- Submission logs stored for each attempt

## 🐛 Troubleshooting

### Worker Not Starting
```bash
# Check if ts-node is installed
npx ts-node --version

# If not installed:
npm install --save-dev ts-node
```

### Puppeteer Issues on Windows
```bash
# Install Visual C++ Build Tools
npm install --global windows-build-tools
```

### Backend Connection Issues
Make sure `BACKEND_URL` in your environment matches your Flask backend URL:
```bash
# Check Flask is running:
curl http://localhost:5000/health
```

### Database Migration Issues
Make sure you're connected to the right database:
```bash
# Check Supabase connection string
# It should be in your environment or trevnoctilla-backend/database.py
```

## 📁 File Structure

Here's what was added:

```
JUSTPDF/
├── app/
│   ├── api/
│   │   └── campaigns/
│   │       ├── upload/
│   │       │   └── route.ts          # Upload CSV endpoint
│   │       ├── [id]/
│   │       │   ├── route.ts          # Get/Update/Delete campaign
│   │       │   └── start/
│   │       │       └── route.ts      # Start campaign
│   │       └── route.ts              # List/Create campaigns
│   └── campaigns/
│       ├── page.tsx                  # Dashboard
│       ├── upload/
│       │   └── page.tsx              # Upload CSV
│       ├── create/
│       │   └── page.tsx              # Create campaign
│       └── [id]/
│           └── page.tsx              # Campaign detail
│
├── services/
│   ├── campaign-scraper.ts           # Puppeteer automation
│   └── campaign-worker.ts            # Background worker
│
├── scripts/
│   └── start-campaign-worker.js      # Worker startup script
│
├── migrations/
│   └── create_contact_automation_tables.sql
│
├── trevnoctilla-backend/
│   ├── models.py                     # Added Campaign, Company, SubmissionLog models
│   └── api/
│       └── campaigns/
│           └── routes.py             # Flask API routes
│
├── CAMPAIGN_AUTOMATION_README.md     # Full documentation
└── QUICK_START_GUIDE.md             # This file
```

## 🎓 Learn More

For detailed documentation, see:
- [CAMPAIGN_AUTOMATION_README.md](./CAMPAIGN_AUTOMATION_README.md) - Complete feature documentation
- [API Documentation](#) - Full API reference
- [Security & Compliance](#) - Privacy and ethical guidelines

## 💡 Tips for Success

1. **Start Small:** Test with 5-10 companies first
2. **Check Screenshots:** Review results before scaling up
3. **Monitor Logs:** Watch the worker terminal for errors
4. **Respect Websites:** Use appropriate delays between requests
5. **Handle CAPTCHAs:** Review flagged companies manually

## 🆘 Need Help?

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review worker logs in Terminal 3
3. Check campaign detail page for error messages
4. Review the full documentation in `CAMPAIGN_AUTOMATION_README.md`

## ✅ Checklist

Before going live:

- [ ] Database migration completed
- [ ] All 3 services running (Frontend, Backend, Worker)
- [ ] Test campaign with 1-2 companies
- [ ] Review screenshots and logs
- [ ] Configure rate limiting for your needs
- [ ] Set up proper error notifications
- [ ] Review privacy compliance (GDPR/CCPA)

---

**Ready to automate your outreach? Let's go! 🚀**
