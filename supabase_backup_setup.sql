-- Trevnoctilla Database Backup Setup for Supabase
-- Run these commands in your Supabase SQL Editor

-- 1. Add session_id column to campaigns table (for guest user isolation)
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100);

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_session_id
ON campaigns(session_id);

-- 3. Optional: Update existing guest campaigns (if any)
-- UPDATE campaigns
-- SET session_id = 'legacy_guest_campaign'
-- WHERE user_id IS NULL AND session_id IS NULL;

-- 4. Create backup storage function (optional - for Supabase storage integration)
-- This creates a function that could be used to store backups in Supabase Storage
-- CREATE OR REPLACE FUNCTION create_backup_notification()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- This would trigger a backup process when called
--   -- For now, it's just a placeholder for future automation
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- 5. Enable Row Level Security (if not already enabled)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for campaign access
-- Policy for authenticated users to access their own campaigns
CREATE POLICY "Users can access their own campaigns"
ON campaigns FOR ALL
USING (auth.uid()::text = user_id::text);

-- Policy for guest users to access campaigns by session_id
CREATE POLICY "Guests can access campaigns by session_id"
ON campaigns FOR ALL
USING (
  user_id IS NULL
  AND session_id IS NOT NULL
  AND session_id = current_setting('app.session_id', true)
);

-- 7. Grant necessary permissions
GRANT ALL ON campaigns TO authenticated;
GRANT SELECT, INSERT ON campaigns TO anon;

-- Backup verification queries (run these to verify setup)
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name='campaigns' AND column_name='session_id';
--
-- SELECT indexname FROM pg_indexes
-- WHERE tablename = 'campaigns' AND indexname = 'idx_campaigns_session_id';

COMMIT;