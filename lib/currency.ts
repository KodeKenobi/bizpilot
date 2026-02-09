// Currency conversion utility
// Fetches USD to ZAR exchange rate and converts amounts
// Uses multiple APIs as fallbacks - NEVER hardcodes exchange rates

const EXCHANGE_RATE_CACHE_KEY = "usd_to_zar_rate";
const EXCHANGE_RATE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

interface ExchangeRateCache {
  rate: number;
  timestamp: number;
}

/**
 * Exchange rate API providers (in order of preference)
 * All are free tier APIs that don't require API keys
 */
const EXCHANGE_RATE_APIS = [
  // API 1: exchangerate-api.com (free tier, no API key)
  {
    name: "exchangerate-api.com",
    url: "https://api.exchangerate-api.com/v4/latest/USD",
    extractRate: (data: any): number | null => {
      return data?.rates?.ZAR || null;
    },
  },
  // API 2: exchangerate.host (free tier, no API key)
  {
    name: "exchangerate.host",
    url: "https://api.exchangerate.host/latest?base=USD&symbols=ZAR",
    extractRate: (data: any): number | null => {
      return data?.rates?.ZAR || null;
    },
  },
  // API 3: fixer.io free tier (no API key for basic rates)
  {
    name: "fixer.io",
    url: "https://api.fixer.io/latest?base=USD&symbols=ZAR",
    extractRate: (data: any): number | null => {
      return data?.rates?.ZAR || null;
    },
  },
  // API 4: currencyapi.net (free tier, no API key)
  {
    name: "currencyapi.net",
    url: "https://api.currencyapi.com/v3/latest?apikey=free&base_currency=USD&currencies=ZAR",
    extractRate: (data: any): number | null => {
      return data?.data?.ZAR?.value || null;
    },
  },
  // API 5: open.er-api.com (free tier)
  {
    name: "open.er-api.com",
    url: "https://open.er-api.com/v6/latest/USD",
    extractRate: (data: any): number | null => {
      return data?.rates?.ZAR || null;
    },
  },
];

/**
 * Fetch exchange rate from a single API
 */
async function fetchRateFromAPI(
  api: (typeof EXCHANGE_RATE_APIS)[0]
): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(api.url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const rate = api.extractRate(data);

    if (rate && typeof rate === "number" && rate > 0 && rate < 1000) {
      // Sanity check: rate should be reasonable (between 0 and 1000)
      return rate;
    }

    return null;
  } catch (error) {
    
    return null;
  }
}

/**
 * Get USD to ZAR exchange rate
 * Tries multiple APIs in sequence until one succeeds
 * NEVER returns a hardcoded value - throws error if all APIs fail
 */
export async function getUSDToZARRate(): Promise<number> {
  // Check cache first
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
    if (cached) {
      try {
        const cache: ExchangeRateCache = JSON.parse(cached);
        const now = Date.now();
        // Use cached rate if less than 1 hour old
        if (now - cache.timestamp < EXCHANGE_RATE_CACHE_DURATION) {
          
          return cache.rate;
        }
      } catch (e) {
        // Invalid cache, fetch new rate
      }
    }
  }

  // Try each API in sequence
  let lastError: Error | null = null;
  for (const api of EXCHANGE_RATE_APIS) {
    
    const rate = await fetchRateFromAPI(api);

    if (rate !== null) {
      

      // Cache the rate
      if (typeof window !== "undefined") {
        const cache: ExchangeRateCache = {
          rate,
          timestamp: Date.now(),
        };
        localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify(cache));
      }

      return rate;
    }
  }

  // If all APIs failed, try to use cached rate (even if expired)
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
    if (cached) {
      try {
        const cache: ExchangeRateCache = JSON.parse(cached);
        
        return cache.rate;
      } catch (e) {
        // Invalid cache
      }
    }
  }

  // CRITICAL: Never hardcode - throw error if all APIs fail
  const error = new Error(
    "Failed to fetch exchange rate from all available APIs. Please check your internet connection and try again."
  );
  
  throw error;
}

/**
 * Convert USD amount to ZAR
 */
export async function convertUSDToZAR(usdAmount: number): Promise<number> {
  const rate = await getUSDToZARRate();
  return parseFloat((usdAmount * rate).toFixed(2));
}
