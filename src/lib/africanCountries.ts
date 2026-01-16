export interface AfricanCountry {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  paystackCurrency: string; // Paystack uses specific currency codes
}

export const africanCountries: AfricanCountry[] = [
  { code: "KE", name: "Kenya", currency: "KES", currencySymbol: "KSh", paystackCurrency: "KES" },
  { code: "NG", name: "Nigeria", currency: "NGN", currencySymbol: "₦", paystackCurrency: "NGN" },
  { code: "GH", name: "Ghana", currency: "GHS", currencySymbol: "₵", paystackCurrency: "GHS" },
  { code: "ZA", name: "South Africa", currency: "ZAR", currencySymbol: "R", paystackCurrency: "ZAR" },
  { code: "UG", name: "Uganda", currency: "UGX", currencySymbol: "USh", paystackCurrency: "UGX" },
  { code: "TZ", name: "Tanzania", currency: "TZS", currencySymbol: "TSh", paystackCurrency: "TZS" },
  { code: "RW", name: "Rwanda", currency: "RWF", currencySymbol: "FRw", paystackCurrency: "RWF" },
  { code: "EG", name: "Egypt", currency: "EGP", currencySymbol: "E£", paystackCurrency: "EGP" },
  { code: "ET", name: "Ethiopia", currency: "ETB", currencySymbol: "Br", paystackCurrency: "ETB" },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF", currencySymbol: "CFA", paystackCurrency: "XOF" },
  { code: "SN", name: "Senegal", currency: "XOF", currencySymbol: "CFA", paystackCurrency: "XOF" },
  { code: "CM", name: "Cameroon", currency: "XAF", currencySymbol: "FCFA", paystackCurrency: "XAF" },
  { code: "ZM", name: "Zambia", currency: "ZMW", currencySymbol: "ZK", paystackCurrency: "ZMW" },
  { code: "ZW", name: "Zimbabwe", currency: "USD", currencySymbol: "$", paystackCurrency: "USD" },
  { code: "BW", name: "Botswana", currency: "BWP", currencySymbol: "P", paystackCurrency: "BWP" },
  { code: "MW", name: "Malawi", currency: "MWK", currencySymbol: "MK", paystackCurrency: "MWK" },
  { code: "MZ", name: "Mozambique", currency: "MZN", currencySymbol: "MT", paystackCurrency: "MZN" },
  { code: "AO", name: "Angola", currency: "AOA", currencySymbol: "Kz", paystackCurrency: "AOA" },
  { code: "MA", name: "Morocco", currency: "MAD", currencySymbol: "د.م.", paystackCurrency: "MAD" },
  { code: "DZ", name: "Algeria", currency: "DZD", currencySymbol: "د.ج", paystackCurrency: "DZD" },
  { code: "TN", name: "Tunisia", currency: "TND", currencySymbol: "د.ت", paystackCurrency: "TND" },
  { code: "SS", name: "South Sudan", currency: "SSP", currencySymbol: "£", paystackCurrency: "SSP" },
  { code: "SD", name: "Sudan", currency: "SDG", currencySymbol: "ج.س.", paystackCurrency: "SDG" },
  { code: "LY", name: "Libya", currency: "LYD", currencySymbol: "ل.د", paystackCurrency: "LYD" },
  { code: "CD", name: "DR Congo", currency: "CDF", currencySymbol: "FC", paystackCurrency: "CDF" },
  { code: "MU", name: "Mauritius", currency: "MUR", currencySymbol: "₨", paystackCurrency: "MUR" },
  { code: "SC", name: "Seychelles", currency: "SCR", currencySymbol: "₨", paystackCurrency: "SCR" },
  { code: "NA", name: "Namibia", currency: "NAD", currencySymbol: "$", paystackCurrency: "NAD" },
  { code: "SZ", name: "Eswatini", currency: "SZL", currencySymbol: "E", paystackCurrency: "SZL" },
  { code: "LS", name: "Lesotho", currency: "LSL", currencySymbol: "L", paystackCurrency: "LSL" },
].sort((a, b) => a.name.localeCompare(b.name));

export const getCountryByName = (name: string): AfricanCountry | undefined => {
  return africanCountries.find(c => c.name === name);
};

export const getCountryByCode = (code: string): AfricanCountry | undefined => {
  return africanCountries.find(c => c.code === code);
};

// Base price per vote in KES
export const VOTE_PRICE_KES_KENYA = 10;
export const VOTE_PRICE_KES_INTERNATIONAL = 20;

// Currency conversion rates (approximate, for display purposes)
// In production, you would fetch real-time rates
export const exchangeRatesFromKES: Record<string, number> = {
  KES: 1,
  NGN: 10.5, // 1 KES ≈ 10.5 NGN
  GHS: 0.11, // 1 KES ≈ 0.11 GHS
  ZAR: 0.14, // 1 KES ≈ 0.14 ZAR
  UGX: 28.5, // 1 KES ≈ 28.5 UGX
  TZS: 19.5, // 1 KES ≈ 19.5 TZS
  RWF: 9.5,  // 1 KES ≈ 9.5 RWF
  USD: 0.0077, // 1 KES ≈ 0.0077 USD
  EGP: 0.37, // 1 KES ≈ 0.37 EGP
  ETB: 0.87, // 1 KES ≈ 0.87 ETB
};

export const convertFromKES = (amountKES: number, targetCurrency: string): number => {
  const rate = exchangeRatesFromKES[targetCurrency] || 1;
  return Math.ceil(amountKES * rate);
};

export const formatCurrency = (amount: number, currency: string): string => {
  const country = africanCountries.find(c => c.currency === currency);
  const symbol = country?.currencySymbol || currency;
  return `${symbol} ${amount.toLocaleString()}`;
};

// Convert country code to emoji flag
export const getEmojiFlag = (countryCode: string): string => {
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

// Get emoji flag by country name
export const getEmojiFlagByName = (countryName: string): string => {
  const country = getCountryByName(countryName);
  return country ? getEmojiFlag(country.code) : "🌍";
};
