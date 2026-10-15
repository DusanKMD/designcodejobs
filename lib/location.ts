import type { JobLocation, RegionSlug, Workplace } from "@/lib/types";

export const EU_APPLICANT_COUNTRIES = [
  "DE",
  "FR",
  "NL",
  "ES",
  "PT",
  "IE",
  "IT",
  "AT",
  "BE",
  "SE",
  "DK",
  "FI",
  "PL",
] as const;

export const COUNTRY_NAME: Record<string, string> = {
  US: "USA",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  ES: "Spain",
  PT: "Portugal",
  IE: "Ireland",
  IT: "Italy",
  AT: "Austria",
  BE: "Belgium",
  SE: "Sweden",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  AU: "Australia",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
  SG: "Singapore",
  JP: "Japan",
  NZ: "New Zealand",
};

type CityDef = {
  slug: string;
  locality: string;
  region?: string;
  country: string;
  facet: RegionSlug;
  names: string[];
};

export const CITIES: CityDef[] = [
  { slug: "london", locality: "London", region: "England", country: "GB", facet: "uk", names: ["london"] },
  { slug: "new-york", locality: "New York", region: "NY", country: "US", facet: "us", names: ["new york city", "new york", "nyc"] },
  { slug: "san-francisco", locality: "San Francisco", region: "CA", country: "US", facet: "us", names: ["san francisco bay area", "san francisco", "sf bay area"] },
  { slug: "seattle", locality: "Seattle", region: "WA", country: "US", facet: "us", names: ["seattle"] },
  { slug: "berlin", locality: "Berlin", region: "Berlin", country: "DE", facet: "europe", names: ["berlin"] },
  { slug: "amsterdam", locality: "Amsterdam", region: "North Holland", country: "NL", facet: "europe", names: ["amsterdam"] },
  { slug: "toronto", locality: "Toronto", region: "ON", country: "CA", facet: "canada", names: ["toronto"] },
];

const COUNTRY_PATTERNS: { re: RegExp; code: string }[] = [
  { re: /\b(united states of america|united states|u\.s\.a\.|u\.s\.|usa)\b/i, code: "US" },
  { re: /\bus\b/i, code: "US" },
  { re: /\b(united kingdom|u\.k\.|great britain|britain|england|scotland|wales)\b|\buk\b/i, code: "GB" },
  { re: /\bcanada\b/i, code: "CA" },
  { re: /\bportugal\b/i, code: "PT" },
  { re: /\bgermany\b|\bdeutschland\b/i, code: "DE" },
  { re: /\bfrance\b/i, code: "FR" },
  { re: /\b(netherlands|holland)\b/i, code: "NL" },
  { re: /\bspain\b/i, code: "ES" },
  { re: /\bireland\b/i, code: "IE" },
  { re: /\bitaly\b/i, code: "IT" },
  { re: /\baustralia\b/i, code: "AU" },
  { re: /\bindia\b/i, code: "IN" },
  { re: /\bbrazil\b/i, code: "BR" },
  { re: /\bmexico\b/i, code: "MX" },
  { re: /\bsingapore\b/i, code: "SG" },
  { re: /\bjapan\b/i, code: "JP" },
];

const US_STATE =
  /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|district of columbia)\b/i;

const CA_PROVINCE = /\b(ontario|british columbia|quebec|alberta|manitoba|saskatchewan|nova scotia)\b|\b(ON|BC|QC|AB)\b/;

const US_ABBR =
  /,\s*(AL|AK|AZ|AR|CA|CO|CT|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/;

export type LocationInput = {
  text?: string | null;
  workplace?: Workplace | null;
  address?: { locality?: string | null; region?: string | null; country?: string | null } | null;
  secondaryTexts?: string[];
};

export type ParsedLocation = {
  workplace: Workplace;
  locations: JobLocation[];
  applicantCountries: string[];
  regions: RegionSlug[];
  citySlugs: string[];
  locationRaw: string;
};

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function findCities(text: string): CityDef[] {
  const lower = text.toLowerCase();
  const found: CityDef[] = [];
  for (const city of CITIES) {
    const names = [...city.names].sort((a, b) => b.length - a.length);
    if (names.some((name) => new RegExp(`\\b${name}\\b`, "i").test(lower))) found.push(city);
  }
  if (/\bsf\b/i.test(text) && !found.some((c) => c.slug === "san-francisco")) {
    const sf = CITIES.find((c) => c.slug === "san-francisco");
    if (sf) found.push(sf);
  }
  return found;
}

function findCountries(text: string) {
  const codes: string[] = [];
  for (const pattern of COUNTRY_PATTERNS) {
    if (pattern.re.test(text) && !codes.includes(pattern.code)) codes.push(pattern.code);
  }
  if ((US_STATE.test(text) || US_ABBR.test(text)) && !codes.includes("US")) codes.push("US");
  if (CA_PROVINCE.test(text) && !codes.includes("CA")) codes.push("CA");
  return codes;
}

function regionForCountry(code: string): RegionSlug | null {
  if (code === "US") return "us";
  if (code === "GB") return "uk";
  if (code === "CA") return "canada";
  if ((EU_APPLICANT_COUNTRIES as readonly string[]).includes(code)) return "europe";
  return null;
}

function isoCountry(name: string | null | undefined) {
  if (!name) return null;
  const value = name.trim();
  if (/^[A-Z]{2}$/.test(value)) return value === "UK" ? "GB" : value;
  const hit = COUNTRY_PATTERNS.find((p) => p.re.test(value));
  if (hit) return hit.code;
  if (/european union|europe/i.test(value)) return null;
  return null;
}

export function parseLocation(input: LocationInput): ParsedLocation {
  const parts = [input.text || "", ...(input.secondaryTexts || [])].map((p) => p.trim()).filter(Boolean);
  const text = parts.join(" · ");
  const locationRaw = (input.text || parts[0] || "").trim();

  let workplace: Workplace = input.workplace || "onsite";
  if (!input.workplace) {
    if (/hybrid/i.test(text)) workplace = "hybrid";
    else if (/\bremote\b/i.test(text)) workplace = "remote";
  }

  const europe = /\beurope\b|\beuropean\b|\beu\b|\bemaa\b/i.test(text);
  const northAmerica = /\bnorth america\b|\bamericas\b/i.test(text);
  const worldwide = /\bworldwide\b|\banywhere\b|\bglobal\b/i.test(text);

  const cities = findCities(text);
  let countries = findCountries(text);
  const addressCountry = isoCountry(input.address?.country);
  if (addressCountry && !countries.includes(addressCountry)) countries.push(addressCountry);
  if (europe && countries.length === 0) countries = [...EU_APPLICANT_COUNTRIES];
  if (northAmerica) {
    if (!countries.includes("US")) countries.push("US");
    if (!countries.includes("CA")) countries.push("CA");
  }
  for (const city of cities) {
    if (!countries.includes(city.country)) countries.push(city.country);
  }

  const regions: RegionSlug[] = [];
  for (const code of countries) {
    const region = regionForCountry(code);
    if (region && !regions.includes(region)) regions.push(region);
  }
  if (europe && !regions.includes("europe")) regions.push("europe");
  if (worldwide && regions.length === 0) regions.push("worldwide");

  const citySlugs = unique(cities.map((c) => c.slug));
  const locations: JobLocation[] = [];

  if (workplace !== "remote") {
    if (cities.length) {
      for (const city of cities) {
        locations.push({
          locality: city.locality,
          region: city.region,
          country: city.country,
          citySlug: city.slug,
        });
      }
    } else if (input.address?.locality || addressCountry || countries[0]) {
      locations.push({
        locality: input.address?.locality || undefined,
        region: input.address?.region || undefined,
        country: addressCountry || countries[0],
      });
    } else {
      const free = text.split(/[;|]/)[0]?.trim();
      const cityState = free?.match(/^([A-Za-z .'-]+?),\s*([A-Z]{2})$/);
      if (cityState && countries[0]) {
        locations.push({ locality: cityState[1], region: cityState[2], country: countries[0] });
      }
    }
  }

  const applicantCountries = workplace === "remote" ? unique(countries) : [];

  return {
    workplace,
    locations: locations.filter((loc) => loc.country),
    applicantCountries,
    regions,
    citySlugs,
    locationRaw,
  };
}

export function countryLabel(code: string) {
  return COUNTRY_NAME[code] || code;
}
