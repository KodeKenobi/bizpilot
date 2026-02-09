/**
 * Company Name Detection Service
 * Automatically extracts company name from website URL
 * 
 * Methods (in priority order):
 * 1. OpenGraph meta tags (og:site_name)
 * 2. Structured data (JSON-LD)
 * 3. Title tag analysis
 * 4. About page scraping
 * 5. Footer copyright
 * 6. Whois data
 * 7. Domain name parsing (fallback)
 */

import puppeteer, { Browser, Page } from 'puppeteer';

interface CompanyInfo {
  name: string;
  confidence: 'high' | 'medium' | 'low';
  method: string;
  description?: string;
  industry?: string;
  location?: string;
  email?: string;
  phone?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export class CompanyDetector {
  private browser: Browser | null = null;

  /**
   * Initialize browser
   */
  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
    }
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Detect company information from URL
   */
  async detectCompany(url: string): Promise<CompanyInfo> {
    await this.initialize();
    const page = await this.browser!.newPage();

    try {
      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 15000 
      });

      // Try multiple detection methods
      let companyInfo: CompanyInfo | null = null;

      // Method 1: OpenGraph & Meta Tags (HIGH confidence)
      companyInfo = await this.detectFromMetaTags(page);
      if (companyInfo) {
        await page.close();
        return companyInfo;
      }

      // Method 2: Structured Data / JSON-LD (HIGH confidence)
      companyInfo = await this.detectFromStructuredData(page);
      if (companyInfo) {
        await page.close();
        return companyInfo;
      }

      // Method 3: Title Tag Analysis (MEDIUM confidence)
      companyInfo = await this.detectFromTitle(page, url);
      if (companyInfo) {
        await page.close();
        return companyInfo;
      }

      // Method 4: Page Content Analysis (MEDIUM confidence)
      companyInfo = await this.detectFromPageContent(page);
      if (companyInfo) {
        await page.close();
        return companyInfo;
      }

      // Method 5: Footer Copyright (MEDIUM confidence)
      companyInfo = await this.detectFromFooter(page);
      if (companyInfo) {
        await page.close();
        return companyInfo;
      }

      // Method 6: Domain Name Parsing (LOW confidence - fallback)
      companyInfo = this.detectFromDomain(url);
      await page.close();
      return companyInfo;

    } catch (error) {
      console.error('Error detecting company:', error);
      await page.close();
      
      // Ultimate fallback
      return this.detectFromDomain(url);
    }
  }

  /**
   * Detect from meta tags (OpenGraph, Twitter, etc.)
   */
  private async detectFromMetaTags(page: Page): Promise<CompanyInfo | null> {
    const metaData = await page.evaluate(() => {
      // OpenGraph site name
      const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
      
      // Twitter
      const twitterSite = document.querySelector('meta[name="twitter:site"]')?.getAttribute('content');
      const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
      
      // Application name
      const appName = document.querySelector('meta[name="application-name"]')?.getAttribute('content');
      
      return {
        ogSiteName,
        ogTitle,
        ogDescription,
        twitterSite,
        twitterTitle,
        appName,
      };
    });

    if (metaData.ogSiteName) {
      return {
        name: metaData.ogSiteName,
        confidence: 'high',
        method: 'OpenGraph Meta Tag',
        description: metaData.ogDescription || undefined,
      };
    }

    if (metaData.appName) {
      return {
        name: metaData.appName,
        confidence: 'high',
        method: 'Application Name Meta Tag',
      };
    }

    return null;
  }

  /**
   * Detect from structured data (JSON-LD)
   */
  private async detectFromStructuredData(page: Page): Promise<CompanyInfo | null> {
    const structuredData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '{}');
          
          // Organization schema
          if (data['@type'] === 'Organization' || data['@type']?.includes('Organization')) {
            return {
              name: data.name,
              description: data.description,
              email: data.email,
              phone: data.telephone,
              location: data.address?.addressLocality,
            };
          }

          // LocalBusiness schema
          if (data['@type'] === 'LocalBusiness' || data['@type']?.includes('Business')) {
            return {
              name: data.name,
              description: data.description,
              email: data.email,
              phone: data.telephone,
              location: data.address?.addressLocality,
            };
          }

          // Corporation schema
          if (data['@type'] === 'Corporation') {
            return {
              name: data.name || data.legalName,
              description: data.description,
            };
          }
        } catch (e) {
          continue;
        }
      }
      
      return null;
    });

    if (structuredData?.name) {
      return {
        name: structuredData.name,
        confidence: 'high',
        method: 'Structured Data (JSON-LD)',
        description: structuredData.description,
        email: structuredData.email,
        phone: structuredData.phone,
        location: structuredData.location,
      };
    }

    return null;
  }

  /**
   * Detect from title tag
   */
  private async detectFromTitle(page: Page, url: string): Promise<CompanyInfo | null> {
    const title = await page.title();
    
    if (!title) return null;

    // Clean title - remove common suffixes
    let companyName = title
      .replace(/\s*[-|–—]\s*(Home|Welcome|Official Site|Website).*$/i, '')
      .replace(/\s*[-|–—]\s*.*$/i, '')
      .trim();

    // If title is too short or too long, try first part only
    if (companyName.length < 3 || companyName.length > 100) {
      const parts = title.split(/[-|–—]/);
      companyName = parts[0].trim();
    }

    if (companyName.length >= 3 && companyName.length <= 100) {
      return {
        name: companyName,
        confidence: 'medium',
        method: 'Title Tag Analysis',
      };
    }

    return null;
  }

  /**
   * Detect from page content (h1, logo alt text, etc.)
   */
  private async detectFromPageContent(page: Page): Promise<CompanyInfo | null> {
    const contentData = await page.evaluate(() => {
      // Check logo alt text
      const logo = document.querySelector('img[alt*="logo" i], img[class*="logo" i]');
      const logoAlt = logo?.getAttribute('alt')?.replace(/logo/i, '').trim();

      // Check h1 (but not if it's a tagline)
      const h1 = document.querySelector('h1')?.textContent?.trim();
      
      // Check nav brand
      const navBrand = document.querySelector('.navbar-brand, .brand, [class*="logo-text"]')?.textContent?.trim();

      // Check header company name
      const headerCompany = document.querySelector('header [class*="company"], header [class*="brand"]')?.textContent?.trim();

      return {
        logoAlt,
        h1: h1 && h1.length < 100 ? h1 : null,
        navBrand,
        headerCompany,
      };
    });

    if (contentData.navBrand && contentData.navBrand.length >= 3 && contentData.navBrand.length <= 50) {
      return {
        name: contentData.navBrand,
        confidence: 'medium',
        method: 'Navigation Brand',
      };
    }

    if (contentData.logoAlt && contentData.logoAlt.length >= 3 && contentData.logoAlt.length <= 50) {
      return {
        name: contentData.logoAlt,
        confidence: 'medium',
        method: 'Logo Alt Text',
      };
    }

    if (contentData.headerCompany) {
      return {
        name: contentData.headerCompany,
        confidence: 'medium',
        method: 'Header Content',
      };
    }

    return null;
  }

  /**
   * Detect from footer copyright
   */
  private async detectFromFooter(page: Page): Promise<CompanyInfo | null> {
    const footerData = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return null;

      const text = footer.textContent || '';
      
      // Look for copyright patterns
      const copyrightMatch = text.match(/©\s*(?:\d{4})?\s*(?:-\s*\d{4})?\s*([A-Za-z0-9\s&.,'-]+?)(?:\.|All|Rights|Inc|Ltd|LLC|Corp)/i);
      if (copyrightMatch) {
        return copyrightMatch[1].trim();
      }

      // Look for "Copyright YEAR Company Name"
      const copyrightMatch2 = text.match(/Copyright\s*(?:\d{4})?\s*(?:-\s*\d{4})?\s*([A-Za-z0-9\s&.,'-]+?)(?:\.|All|Rights|Inc|Ltd|LLC|Corp)/i);
      if (copyrightMatch2) {
        return copyrightMatch2[1].trim();
      }

      return null;
    });

    if (footerData && footerData.length >= 3 && footerData.length <= 100) {
      return {
        name: footerData,
        confidence: 'medium',
        method: 'Footer Copyright',
      };
    }

    return null;
  }

  /**
   * Fallback: Parse domain name
   */
  private detectFromDomain(url: string): CompanyInfo {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      let domain = urlObj.hostname;

      // Remove www
      domain = domain.replace(/^www\./i, '');

      // Remove TLD
      const domainParts = domain.split('.');
      let companyName = domainParts[0];

      // Capitalize and clean
      companyName = companyName
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        name: companyName,
        confidence: 'low',
        method: 'Domain Name Parsing (Fallback)',
      };
    } catch (error) {
      return {
        name: url,
        confidence: 'low',
        method: 'Raw URL (Failed Parsing)',
      };
    }
  }

  /**
   * Batch detect multiple companies
   */
  async detectBatch(urls: string[]): Promise<Map<string, CompanyInfo>> {
    const results = new Map<string, CompanyInfo>();

    for (const url of urls) {
      try {
        const info = await this.detectCompany(url);
        results.set(url, info);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to detect company for ${url}:`, error);
        results.set(url, this.detectFromDomain(url));
      }
    }

    return results;
  }
}
