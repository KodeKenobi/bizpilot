-- Migration: Contact Automation Feature
-- Creates tables for campaigns, companies, and submission logs

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    message_template TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    spreadsheet_filename VARCHAR(500),
    spreadsheet_path VARCHAR(500),
    
    -- Statistics
    total_companies INTEGER NOT NULL DEFAULT 0,
    processed_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    captcha_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create indexes for campaigns
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    company_name VARCHAR(300) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    contact_email VARCHAR(200),
    contact_person VARCHAR(200),
    phone VARCHAR(50),
    additional_data JSONB,
    
    -- Processing status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    
    -- Contact page detection
    contact_page_url VARCHAR(500),
    contact_page_found BOOLEAN DEFAULT FALSE,
    form_found BOOLEAN DEFAULT FALSE,
    
    -- Submission details
    submitted_at TIMESTAMP,
    screenshot_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Create indexes for companies
CREATE INDEX idx_companies_campaign_id ON companies(campaign_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- Create submission_logs table
CREATE TABLE IF NOT EXISTS submission_logs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Attempt details
    attempt_number INTEGER NOT NULL DEFAULT 1,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    message TEXT,
    details JSONB,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for submission_logs
CREATE INDEX idx_submission_logs_company_id ON submission_logs(company_id);
CREATE INDEX idx_submission_logs_created_at ON submission_logs(created_at);

-- Add comments
COMMENT ON TABLE campaigns IS 'Contact automation campaigns created by users';
COMMENT ON TABLE companies IS 'Companies to be contacted in each campaign';
COMMENT ON TABLE submission_logs IS 'Detailed logs of each submission attempt';

-- Grant permissions (adjust based on your Supabase setup)
-- GRANT ALL ON campaigns TO authenticated;
-- GRANT ALL ON companies TO authenticated;
-- GRANT ALL ON submission_logs TO authenticated;
