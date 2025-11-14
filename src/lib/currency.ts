export type CountryCode = 'IN' | 'US' | 'EU' | 'UK' | 'AE';

const COUNTRY_KEY = 'app:country';
export const defaultCountry: CountryCode = 'IN';

export function getSavedCountry(): CountryCode {
  try {
    const saved = localStorage.getItem(COUNTRY_KEY);
    if (saved === 'IN' || saved === 'US' || saved === 'EU' || saved === 'UK' || saved === 'AE') return saved as CountryCode;
  } catch {}
  return defaultCountry;
}

export function saveCountry(country: CountryCode) {
  try {
    localStorage.setItem(COUNTRY_KEY, country);
  } catch {}
}

export function currencyForCountry(country: CountryCode): string {
  switch (country) {
    case 'IN':
      return 'INR';
    case 'US':
      return 'USD';
    case 'EU':
      return 'EUR';
    case 'UK':
      return 'GBP';
    case 'AE':
      return 'AED';
    default:
      return 'USD';
  }
}

export function localeForCountry(country: CountryCode): string {
  switch (country) {
    case 'IN':
      return 'en-IN';
    case 'US':
      return 'en-US';
    case 'EU':
      return 'de-DE';
    case 'UK':
      return 'en-GB';
    case 'AE':
      return 'en-AE';
    default:
      return 'en-US';
  }
}

export function formatCurrency(amount: number, country?: CountryCode): string {
  const c = country || getSavedCountry();
  const currency = currencyForCountry(c);
  const locale = localeForCountry(c);
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    // Fallback formatting
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

// --- Exchange rate helpers (base: USD) ---
// Live rates via exchangerate.host with localStorage caching; fallback to defaults if offline.
type Rates = Record<string, number>;

const USD_TO_DEFAULT: Rates = {
  USD: 1,
  INR: 88.61,   // 1 USD = 88.61 INR (requested)
  // Derived from user-provided INR mappings:
  // 1 EUR = 102.66 INR => EUR per 1 USD = 88.61 / 102.66 ≈ 0.8628
  EUR: 0.8628,
  // 1 GBP = 116.37 INR => GBP per 1 USD = 88.61 / 116.37 ≈ 0.7614
  GBP: 0.7614,
  // 1 AED = 24.12 INR => AED per 1 USD = 88.61 / 24.12 ≈ 3.671
  AED: 3.671,
};

const FX_CACHE_KEY = 'app:fx:usd_to';
const FX_CACHE_TS_KEY = 'app:fx:usd_to:ts';
const FX_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getCachedRates(): Rates | null {
  try {
    const raw = localStorage.getItem(FX_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Rates;
  } catch {}
  return null;
}

function saveRates(rates: Rates) {
  try {
    localStorage.setItem(FX_CACHE_KEY, JSON.stringify(rates));
    localStorage.setItem(FX_CACHE_TS_KEY, String(Date.now()));
  } catch {}
}

function isCacheFresh(): boolean {
  try {
    const ts = Number(localStorage.getItem(FX_CACHE_TS_KEY) || '0');
    if (!ts) return false;
    return Date.now() - ts < FX_TTL_MS;
  } catch { return false; }
}

export async function refreshFxRates(force = false): Promise<Rates> {
  if (!force && isCacheFresh()) {
    const cached = getCachedRates();
    if (cached) return cached;
  }
  try {
    const symbols = ['USD','INR','EUR','GBP','AED'].join(',');
    const res = await fetch(`https://api.exchangerate.host/latest?base=USD&symbols=${symbols}`);
    if (!res.ok) throw new Error('FX fetch failed');
    const data = await res.json();
    const rates: Rates = { ...USD_TO_DEFAULT };
    if (data && data.rates) {
      for (const k of Object.keys(rates)) {
        if (data.rates[k] && typeof data.rates[k] === 'number') {
          rates[k] = data.rates[k];
        }
      }
    }
    saveRates(rates);
    return rates;
  } catch {
    // fallback to defaults; keep any existing cache if present
    const cached = getCachedRates();
    return cached || USD_TO_DEFAULT;
  }
}

function getRates(): Rates {
  const cached = getCachedRates();
  return cached || USD_TO_DEFAULT;
}

export function convertUSDTo(amountUSD: number, country?: CountryCode): number {
  const c = country || getSavedCountry();
  const cur = currencyForCountry(c);
  const rate = getRates()[cur] ?? 1;
  return amountUSD * rate;
}

export function convertAndFormatUSD(amountUSD: number, country?: CountryCode): string {
  const c = country || getSavedCountry();
  const converted = convertUSDTo(amountUSD, c);
  return formatCurrency(converted, c);
}

// Convert a raw amount between two countries' currencies via USD base
export function convertBetweenCountries(amount: number, from: CountryCode, to: CountryCode): number {
  if (from === to) return amount;
  const fromCur = currencyForCountry(from);
  const toCur = currencyForCountry(to);
  const rates = getRates();
  const fromRate = rates[fromCur] ?? 1; // units of FROM per 1 USD
  const toRate = rates[toCur] ?? 1;     // units of TO per 1 USD
  // Convert FROM -> USD -> TO
  const amountUSD = amount / fromRate;
  return amountUSD * toRate;
}
