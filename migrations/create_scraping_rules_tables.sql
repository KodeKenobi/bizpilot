-- Migration: Add Scraping Rules and Sessions Tables
-- Created: 2026-01-17
-- Description: Professional-grade scraping rules management and live monitoring

-- Scraping Rules Table
CREATE TABLE IF NOT EXISTS scraping_rules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Rule definition
    name VARCHAR(200) NOT NULL,
    description TEXT,
    domain VARCHAR(500),
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('cookie', 'contact_page', 'form_field', 'submit_button', 'captcha')),
    
    -- Matching criteria
    selector VARCHAR(500),
    xpath VARCHAR(500),
    text_pattern VARCHAR(500),
    url_pattern VARCHAR(500),
    
    -- Action
    action VARCHAR(50) NOT NULL CHECK (action IN ('click', 'fill', 'wait', 'navigate')),
    action_value VARCHAR(500),
    
    -- Priority and conditions
    priority INTEGER NOT NULL DEFAULT 100,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    language VARCHAR(10),
    
    -- Metadata
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Scraping Sessions Table (for live monitoring)
CREATE TABLE IF NOT EXISTS scraping_sessions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Session state
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'stopped')),
    current_step VARCHAR(200),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Detected information
    detected_language VARCHAR(10),
    contact_page_url VARCHAR(500),
    contact_page_found BOOLEAN NOT NULL DEFAULT FALSE,
    cookie_modal_handled BOOLEAN NOT NULL DEFAULT FALSE,
    captcha_detected BOOLEAN NOT NULL DEFAULT FALSE,
    form_found BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Live monitoring data
    current_url VARCHAR(500),
    current_screenshot_url VARCHAR(500),
    video_recording_url VARCHAR(500),
    
    -- Timestamps
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    last_update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scraping_rules_user_id ON scraping_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_rules_domain ON scraping_rules(domain);
CREATE INDEX IF NOT EXISTS idx_scraping_rules_type ON scraping_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_scraping_rules_enabled ON scraping_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_scraping_rules_priority ON scraping_rules(priority);
CREATE INDEX IF NOT EXISTS idx_scraping_rules_created_at ON scraping_rules(created_at);

CREATE INDEX IF NOT EXISTS idx_scraping_sessions_company_id ON scraping_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_scraping_sessions_campaign_id ON scraping_sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_scraping_sessions_status ON scraping_sessions(status);
CREATE INDEX IF NOT EXISTS idx_scraping_sessions_started_at ON scraping_sessions(started_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for scraping_rules
CREATE TRIGGER update_scraping_rules_updated_at BEFORE UPDATE ON scraping_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for scraping_sessions
CREATE TRIGGER update_scraping_sessions_updated_at BEFORE UPDATE ON scraping_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default global rules
INSERT INTO scraping_rules (user_id, name, description, domain, rule_type, selector, action, priority, language) VALUES
-- Cookie consent handlers
(NULL, 'Generic Accept All Cookies', 'Handles most cookie consent banners', NULL, 'cookie', 'button:has-text("Accept all"), button:has-text("Accept All"), #onetrust-accept-btn-handler', 'click', 10, NULL),
(NULL, 'Cookiebot Accept', 'Handles Cookiebot consent', NULL, 'cookie', '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', 'click', 20, NULL),
(NULL, 'Cookie Consent Dismiss', 'Generic cookie consent dismiss', NULL, 'cookie', '.cc-dismiss, .cookie-dismiss', 'click', 30, NULL),

-- Contact page patterns (English)
(NULL, 'Contact Us Link (EN)', 'Standard contact us link', NULL, 'contact_page', 'a[href*="contact"]', 'navigate', 10, 'en'),
(NULL, 'Get in Touch (EN)', 'Alternative contact link text', NULL, 'contact_page', 'a:has-text("Get in touch"), a:has-text("get in touch")', 'navigate', 20, 'en'),

-- Contact page patterns (Spanish)
(NULL, 'Contacto Link (ES)', 'Spanish contact link', NULL, 'contact_page', 'a[href*="contacto"], a:has-text("Contacto")', 'navigate', 10, 'es'),

-- Contact page patterns (French)
(NULL, 'Contact Link (FR)', 'French contact link', NULL, 'contact_page', 'a[href*="contact"], a:has-text("Contact")', 'navigate', 10, 'fr'),

-- Form fields
(NULL, 'Name Field', 'Detect name input field', NULL, 'form_field', 'input[name*="name"], input[id*="name"], input[placeholder*="name"]', 'fill', 10, NULL),
(NULL, 'Email Field', 'Detect email input field', NULL, 'form_field', 'input[type="email"], input[name*="email"]', 'fill', 10, NULL),
(NULL, 'Message Field', 'Detect message textarea', NULL, 'form_field', 'textarea[name*="message"], textarea[id*="message"]', 'fill', 10, NULL),

-- Submit buttons
(NULL, 'Submit Button', 'Standard submit button', NULL, 'submit_button', 'button[type="submit"], input[type="submit"]', 'click', 10, NULL),
(NULL, 'Send Button (EN)', 'Send button with text', NULL, 'submit_button', 'button:has-text("Send"), button:has-text("Submit")', 'click', 20, 'en')
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE scraping_rules IS 'Custom scraping rules for handling different website patterns';
COMMENT ON TABLE scraping_sessions IS 'Live scraping sessions for real-time monitoring';
COMMENT ON COLUMN scraping_rules.user_id IS 'NULL for global rules, user-specific otherwise';
COMMENT ON COLUMN scraping_rules.priority IS 'Lower number = higher priority';
COMMENT ON COLUMN scraping_sessions.progress_percentage IS 'Real-time progress of scraping (0-100)';
