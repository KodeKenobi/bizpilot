/**
 * Campaign Worker
 * Processes queued campaigns and updates database
 */

import { CampaignScraper } from './campaign-scraper';

interface Campaign {
  id: number;
  user_id: number;
  name: string;
  message_template: string;
  status: string;
}

interface Company {
  id: number;
  campaign_id: number;
  company_name: string;
  website_url: string;
  contact_email?: string;
  contact_person?: string;
  phone?: string;
  additional_data?: Record<string, any>;
  status: string;
}

class CampaignWorker {
  private scraper: CampaignScraper;
  private backendUrl: string;
  private processing = false;

  constructor(backendUrl: string) {
    this.scraper = new CampaignScraper();
    this.backendUrl = backendUrl;
  }

  /**
   * Start the worker
   */
  async start() {
    console.log('[WORKER] Campaign Worker Started');
    console.log(`[INFO] Backend URL: ${this.backendUrl}`);

    // Poll for queued campaigns every 10 seconds
    setInterval(async () => {
      if (!this.processing) {
        await this.processQueuedCampaigns();
      }
    }, 10000);

    // Process immediately on start
    await this.processQueuedCampaigns();
  }

  /**
   * Process all queued campaigns
   */
  private async processQueuedCampaigns() {
    try {
      this.processing = true;

      // Fetch queued campaigns from backend
      const campaigns = await this.fetchQueuedCampaigns();

      if (campaigns.length === 0) {
        return;
      }

      console.log(`[INFO] Found ${campaigns.length} queued campaign(s)`);

      for (const campaign of campaigns) {
        await this.processCampaign(campaign);
      }
    } catch (error) {
      console.error('❌ Error processing campaigns:', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Fetch queued campaigns from backend
   */
  private async fetchQueuedCampaigns(): Promise<Campaign[]> {
    try {
      const response = await fetch(`${this.backendUrl}/api/campaigns/internal/queued`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaigns');
      }

      return data.campaigns || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  /**
   * Process a single campaign
   */
  private async processCampaign(campaign: Campaign) {
    console.log(`\n[START] Processing campaign: ${campaign.name} (ID: ${campaign.id})`);

    try {
      // Update campaign status to processing
      await this.updateCampaignStatus(campaign.id, 'processing');

      // Fetch companies for this campaign
      const companies = await this.fetchCampaignCompanies(campaign.id);

      console.log(`   📊 Total companies: ${companies.length}`);

      let successCount = 0;
      let failedCount = 0;
      let captchaCount = 0;

      // Process each company
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        console.log(`   [${i + 1}/${companies.length}] Processing: ${company.company_name}`);

        // Skip if already processed
        if (company.status !== 'pending') {
          console.log(`   [SKIP] Skipping (status: ${company.status})`);
          continue;
        }

        // Update company status to processing
        await this.updateCompanyStatus(company.id, 'processing');

        // Process company using scraper
        const result = await this.scraper.processCompany(company, {
          message_template: campaign.message_template,
          user_name: 'Campaign Bot',
          user_email: 'noreply@trevnoctilla.com',
        });

        // Update company with result
        await this.updateCompanyResult(company.id, result);

        // Update counters
        if (result.status === 'success') {
          successCount++;
          console.log(`   [OK] Success`);
        } else if (result.status === 'captcha') {
          captchaCount++;
          console.log(`   [CAPTCHA] CAPTCHA detected`);
        } else {
          failedCount++;
          console.log(`   [FAIL] Failed: ${result.errorMessage}`);
        }

        // Add delay between requests (2-5 seconds)
        const delay = 2000 + Math.random() * 3000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Update campaign as completed
      await this.updateCampaignStatus(campaign.id, 'completed', {
        success_count: successCount,
        failed_count: failedCount,
        captcha_count: captchaCount,
        processed_count: companies.length,
      });

      console.log(`[SUCCESS] Campaign completed!`);
      console.log(`   Success: ${successCount}`);
      console.log(`   Failed: ${failedCount}`);
      console.log(`   CAPTCHA: ${captchaCount}`);

    } catch (error: any) {
      console.error(`❌ Error processing campaign:`, error);
      await this.updateCampaignStatus(campaign.id, 'failed');
    }
  }

  /**
   * Fetch companies for a campaign
   */
  private async fetchCampaignCompanies(campaignId: number): Promise<Company[]> {
    try {
      const response = await fetch(`${this.backendUrl}/api/campaigns/${campaignId}/companies`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch companies');
      }

      return data.companies || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  /**
   * Update campaign status
   */
  private async updateCampaignStatus(
    campaignId: number,
    status: string,
    stats?: {
      success_count?: number;
      failed_count?: number;
      captcha_count?: number;
      processed_count?: number;
    }
  ) {
    try {
      await fetch(`${this.backendUrl}/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...stats }),
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  }

  /**
   * Update company status
   */
  private async updateCompanyStatus(companyId: number, status: string) {
    try {
      await fetch(`${this.backendUrl}/api/campaigns/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Error updating company status:', error);
    }
  }

  /**
   * Update company with scraper result
   */
  private async updateCompanyResult(companyId: number, result: any) {
    try {
      await fetch(`${this.backendUrl}/api/campaigns/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: result.status,
          error_message: result.errorMessage,
          contact_page_url: result.contactPageUrl,
          contact_page_found: result.contactPageFound,
          form_found: result.formFound,
          screenshot_url: result.screenshotPath,
          processed_at: new Date().toISOString(),
          submitted_at: result.success ? new Date().toISOString() : null,
        }),
      });

      // Save logs
      if (result.logs && result.logs.length > 0) {
        await fetch(`${this.backendUrl}/api/campaigns/companies/${companyId}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: result.logs }),
        });
      }
    } catch (error) {
      console.error('Error updating company result:', error);
    }
  }

  /**
   * Stop the worker
   */
  async stop() {
    console.log('🛑 Stopping Campaign Worker...');
    await this.scraper.close();
    process.exit(0);
  }
}

// Main execution
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
const worker = new CampaignWorker(backendUrl);

// Handle graceful shutdown
process.on('SIGINT', () => worker.stop());
process.on('SIGTERM', () => worker.stop());

// Start worker
worker.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
