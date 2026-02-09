# Trevnoctilla Automated Backup & Ad Service Setup

This guide covers setting up automated database backups and the automated ad view service.

## 🚀 Quick Setup

### 1. Database Schema Updates (Supabase SQL Editor)

Run the following SQL commands in your Supabase dashboard:

```sql
-- Add session_id column for guest user isolation
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_session_id
ON campaigns(session_id);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access their own campaigns"
ON campaigns FOR ALL
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Guests can access campaigns by session_id"
ON campaigns FOR ALL
USING (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND session_id = current_setting('app.session_id', true)
);
```

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration (uses existing Resend setup)
BACKUP_NOTIFICATION_EMAIL=admin@trevnoctilla.com
ADMIN_NOTIFICATION_EMAIL=admin@trevnoctilla.com

# Database Backup (uses existing DB config)
BACKUP_RETENTION_DAYS=30

# Ad Service Configuration
AD_VIEWS_PER_DAY=12
AD_VIEW_RANDOMNESS=true
```

### 3. Deploy Backend Changes

The backup service will start automatically when you deploy the updated backend code.

## 📧 Email Notifications

The system sends emails for:
- **Backup completion**: Sent after each successful backup with file details
- **Backup failures**: Sent immediately if backup fails
- **Ad service progress**: Sent every 10 ad views with statistics

## 🔄 Automated Schedules

- **Backups**: Daily at 12:00 AM and 12:00 PM
- **Ad views**: 12 views per day, randomly distributed throughout the day

## 🎛️ Admin Controls

Access service management in `/admin/testing`:

### Backup Service
- **Run Manual Backup**: Trigger immediate backup
- **View Backup Status**: See recent backups and storage info

### Ad Service
- **Start/Stop Service**: Control automated ad views
- **Reset Statistics**: Clear view counters
- **View Status**: Monitor progress and recent activity

## 📁 Backup Storage

Backups are stored in the `backups/` directory on your server with:
- Compression: gzip (.gz files)
- Naming: `trevnoctilla_backup_YYYYMMDD_HHMMSS.sql.gz`
- Retention: 30 days (configurable)
- Size monitoring: Email alerts for large files

## 🔒 Security

- Backups contain full database dumps
- Email notifications include download links
- Admin-only access to service controls
- Guest campaign isolation prevents data leakage

## 🐛 Troubleshooting

### Backup Issues
- Check database connection settings
- Verify pg_dump is available on server
- Check disk space for backup storage

### Ad Service Issues
- Verify frontend URL is accessible
- Check email configuration for notifications
- Monitor server logs for automation errors

### Email Issues
- Verify Resend API key is valid
- Check SMTP fallback settings
- Ensure notification email addresses are correct

## 📊 Monitoring

Both services provide comprehensive logging:
- Console output for real-time monitoring
- Email notifications for important events
- Admin dashboard for status overview
- Activity history and statistics