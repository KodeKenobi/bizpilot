/**
 * Extensible Campaign Scraper Configuration
 * Handles different patterns, languages, and edge cases
 */

export interface ScrapeStrategy {
  name: string;
  priority: number;
  detect: (page: any) => Promise<boolean>;
  execute: (page: any, context: any) => Promise<any>;
}

/**
 * Cookie Consent Handlers
 * Add new cookie modal patterns here
 */
export const COOKIE_HANDLERS: ScrapeStrategy[] = [
  {
    name: 'Generic Cookie Consent',
    priority: 1,
    detect: async (page) => {
      return await page.evaluate(() => {
        const keywords = ['cookie', 'consent', 'gdpr', 'privacy', 'accept'];
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        return buttons.some(btn => {
          const text = (btn.textContent || '').toLowerCase();
          return keywords.some(keyword => text.includes(keyword));
        });
      });
    },
    execute: async (page) => {
      // Try common accept button patterns
      const selectors = [
        'button:has-text("Accept")',
        'button:has-text("Accept all")',
        'button:has-text("I agree")',
        'button:has-text("OK")',
        'button:has-text("Got it")',
        '[id*="cookie"][id*="accept"]',
        '[class*="cookie"][class*="accept"]',
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', // Cookiebot
        '.cc-dismiss', // Cookie Consent
        '#onetrust-accept-btn-handler', // OneTrust
      ];

      for (const selector of selectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            await page.waitForTimeout(1000);
            return { success: true, method: selector };
          }
        } catch {}
      }
      return { success: false };
    }
  },
  {
    name: 'EU Cookie Law',
    priority: 2,
    detect: async (page) => {
      return await page.$('.eu-cookie-compliance-banner, #eu-cookie-law') !== null;
    },
    execute: async (page) => {
      try {
        await page.click('.eu-cookie-compliance-buttons button, #eu-cookie-law button');
        return { success: true };
      } catch {
        return { success: false };
      }
    }
  },
];

/**
 * Contact Page Patterns (Multi-language)
 */
export const CONTACT_PAGE_PATTERNS = {
  // English
  en: {
    urls: ['/contact', '/contact-us', '/get-in-touch', '/reach-us', '/contactus'],
    text: ['contact', 'contact us', 'get in touch', 'reach us', 'reach out'],
  },
  // Spanish
  es: {
    urls: ['/contacto', '/contactanos', '/contactenos'],
    text: ['contacto', 'contáctanos', 'contáctenos', 'ponte en contacto'],
  },
  // French
  fr: {
    urls: ['/contact', '/contactez-nous', '/nous-contacter'],
    text: ['contact', 'contactez-nous', 'nous contacter'],
  },
  // German
  de: {
    urls: ['/kontakt', '/kontaktieren'],
    text: ['kontakt', 'kontaktieren sie uns', 'kontaktiere uns'],
  },
  // Portuguese
  pt: {
    urls: ['/contato', '/contacto', '/fale-conosco'],
    text: ['contato', 'contacto', 'fale conosco', 'entre em contato'],
  },
  // Italian
  it: {
    urls: ['/contatti', '/contattaci'],
    text: ['contatti', 'contattaci', 'contatto'],
  },
  // Dutch
  nl: {
    urls: ['/contact', '/contacteer-ons'],
    text: ['contact', 'neem contact op', 'contacteer ons'],
  },
};

/**
 * Form Field Detection Patterns
 */
export const FORM_FIELD_PATTERNS = {
  name: {
    selectors: [
      'input[name*="name"]',
      'input[id*="name"]',
      'input[placeholder*="name"]',
      'input[aria-label*="name"]',
    ],
    keywords: ['name', 'naam', 'nombre', 'nom', 'nome', 'nome'],
  },
  email: {
    selectors: [
      'input[type="email"]',
      'input[name*="email"]',
      'input[id*="email"]',
      'input[placeholder*="email"]',
    ],
    keywords: ['email', 'e-mail', 'correo', 'courriel'],
  },
  phone: {
    selectors: [
      'input[type="tel"]',
      'input[name*="phone"]',
      'input[name*="tel"]',
      'input[id*="phone"]',
    ],
    keywords: ['phone', 'telephone', 'tel', 'telefon', 'teléfono'],
  },
  subject: {
    selectors: [
      'input[name*="subject"]',
      'input[id*="subject"]',
      'select[name*="subject"]',
    ],
    keywords: ['subject', 'asunto', 'sujet', 'betreff', 'assunto'],
  },
  message: {
    selectors: [
      'textarea[name*="message"]',
      'textarea[id*="message"]',
      'textarea[name*="comment"]',
      'textarea[placeholder*="message"]',
    ],
    keywords: ['message', 'mensaje', 'mensagem', 'nachricht', 'bericht'],
  },
  company: {
    selectors: [
      'input[name*="company"]',
      'input[name*="organization"]',
      'input[id*="company"]',
    ],
    keywords: ['company', 'organization', 'empresa', 'société', 'bedrijf'],
  },
};

/**
 * Submit Button Patterns
 */
export const SUBMIT_BUTTON_PATTERNS = {
  selectors: [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Send")',
    'button:has-text("Submit")',
  ],
  keywords: {
    en: ['send', 'submit', 'send message', 'contact us'],
    es: ['enviar', 'enviar mensaje', 'contactar'],
    fr: ['envoyer', 'soumettre', 'envoyer le message'],
    de: ['senden', 'absenden', 'nachricht senden'],
    pt: ['enviar', 'enviar mensagem', 'submeter'],
    it: ['invia', 'inviare', 'invia messaggio'],
    nl: ['verzenden', 'versturen', 'bericht verzenden'],
  },
};

/**
 * CAPTCHA Detection Patterns
 */
export const CAPTCHA_PATTERNS = [
  'iframe[src*="recaptcha"]',
  'iframe[src*="hcaptcha"]',
  '.g-recaptcha',
  '.h-captcha',
  '#recaptcha',
  '[data-sitekey]',
];

/**
 * Language Detection
 */
export async function detectPageLanguage(page: any): Promise<string> {
  return await page.evaluate(() => {
    // Check html lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang) return htmlLang.split('-')[0];

    // Check meta tags
    const metaLang = document.querySelector('meta[http-equiv="content-language"]');
    if (metaLang) return (metaLang as HTMLMetaElement).content.split('-')[0];

    // Analyze text content
    const text = document.body.textContent || '';
    const languages = {
      en: ['the', 'and', 'is', 'are', 'contact', 'about'],
      es: ['el', 'la', 'los', 'las', 'contacto', 'sobre'],
      fr: ['le', 'la', 'les', 'de', 'contact', 'à propos'],
      de: ['der', 'die', 'das', 'und', 'kontakt', 'über'],
      pt: ['o', 'a', 'os', 'as', 'contato', 'sobre'],
    };

    let maxScore = 0;
    let detectedLang = 'en';

    for (const [lang, words] of Object.entries(languages)) {
      const score = words.reduce((count, word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        return count + (text.match(regex)?.length || 0);
      }, 0);
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang;
      }
    }

    return detectedLang;
  });
}

/**
 * Website-Specific Overrides
 * For known problematic websites
 */
export const WEBSITE_OVERRIDES: Record<string, {
  cookieHandler?: string;
  contactPageUrl?: string;
  formSelectors?: Record<string, string>;
  skipSteps?: string[];
}> = {
  // Example: WordPress sites often have specific patterns
  'wordpress': {
    contactPageUrl: '/contact',
    formSelectors: {
      name: 'input[name="your-name"]',
      email: 'input[name="your-email"]',
      message: 'textarea[name="your-message"]',
    }
  },
  // Example: Wix sites
  'wix.com': {
    cookieHandler: 'wix-cookie-handler',
  },
  // Add more as you discover patterns
};

/**
 * User-Defined Custom Rules
 * Stored in database per campaign or globally
 */
export interface CustomRule {
  domain?: string; // If set, only applies to this domain
  type: 'cookie' | 'contact_page' | 'form_field' | 'submit_button';
  selector?: string;
  xpath?: string;
  action?: 'click' | 'fill' | 'wait';
  value?: string;
  priority?: number;
}

/**
 * AI-Powered Fallback (Future)
 * Use computer vision or GPT-4 Vision to detect elements when patterns fail
 */
export interface AIFallbackConfig {
  enabled: boolean;
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  apiKey: string;
}
