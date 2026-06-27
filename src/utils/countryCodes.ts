/**
 * ISO 3166-1 alpha-2 country code → { name, flag } mapping.
 *
 * Cloudflare's CF-IPCountry header returns 2-letter codes (e.g. "US", "CN").
 * This map converts them to full country names and emoji flags for display.
 * Covers all 249 ISO codes plus "XX" for unknown.
 */

export interface CountryInfo {
  /** Full country name in English. */
  name: string;
  /** Emoji flag (regional indicator symbols). */
  flag: string;
}

/** Convert a 2-letter country code to emoji flag. */
function codeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  const A = 0x1f1e6;
  const chars = code.toUpperCase().split('').map((c) => A + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}

/** Full ISO 3166-1 alpha-2 country name map. */
const COUNTRY_NAMES: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AD: 'Andorra', AO: 'Angola',
  AG: 'Antigua & Barbuda', AR: 'Argentina', AM: 'Armenia', AU: 'Australia', AT: 'Austria',
  AZ: 'Azerbaijan', BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados',
  BY: 'Belarus', BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BT: 'Bhutan',
  BO: 'Bolivia', BA: 'Bosnia & Herzegovina', BW: 'Botswana', BR: 'Brazil', BN: 'Brunei',
  BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', CM: 'Cameroon',
  CA: 'Canada', CV: 'Cape Verde', CF: 'Central African Rep.', TD: 'Chad', CL: 'Chile',
  CN: 'China', CO: 'Colombia', KM: 'Comoros', CG: 'Congo', CD: 'Congo (DRC)',
  CR: 'Costa Rica', CI: "Côte d'Ivoire", HR: 'Croatia', CU: 'Cuba', CY: 'Cyprus',
  CZ: 'Czech Republic', DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Rep.',
  EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea',
  EE: 'Estonia', SZ: 'Eswatini', ET: 'Ethiopia', FJ: 'Fiji', FI: 'Finland',
  FR: 'France', GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany',
  GH: 'Ghana', GR: 'Greece', GD: 'Grenada', GT: 'Guatemala', GN: 'Guinea',
  GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', HN: 'Honduras', HK: 'Hong Kong',
  HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran',
  IQ: 'Iraq', IE: 'Ireland', IL: 'Israel', IT: 'Italy', JM: 'Jamaica',
  JP: 'Japan', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati',
  KP: 'North Korea', KR: 'South Korea', KW: 'Kuwait', KG: 'Kyrgyzstan', LA: 'Laos',
  LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia', LY: 'Libya',
  LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg', MO: 'Macao', MG: 'Madagascar',
  MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta',
  MH: 'Marshall Islands', MR: 'Mauritania', MU: 'Mauritius', MX: 'Mexico', FM: 'Micronesia',
  MD: 'Moldova', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MA: 'Morocco',
  MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru', NP: 'Nepal',
  NL: 'Netherlands', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger', NG: 'Nigeria',
  MK: 'North Macedonia', NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau',
  PA: 'Panama', PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines',
  PL: 'Poland', PT: 'Portugal', QA: 'Qatar', RO: 'Romania', RU: 'Russia',
  RW: 'Rwanda', KN: 'Saint Kitts & Nevis', LC: 'Saint Lucia', VC: 'St. Vincent & Grenadines',
  WS: 'Samoa', SM: 'San Marino', ST: 'São Tomé & Príncipe', SA: 'Saudi Arabia', SN: 'Senegal',
  RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore', SK: 'Slovakia',
  SI: 'Slovenia', SB: 'Solomon Islands', SO: 'Somalia', ZA: 'South Africa', SS: 'South Sudan',
  ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SE: 'Sweden',
  CH: 'Switzerland', SY: 'Syria', TW: 'Taiwan', TJ: 'Tajikistan', TZ: 'Tanzania',
  TH: 'Thailand', TL: 'Timor-Leste', TG: 'Togo', TO: 'Tonga', TT: 'Trinidad & Tobago',
  TN: 'Tunisia', TR: 'Turkey', TM: 'Turkmenistan', TV: 'Tuvalu', UG: 'Uganda',
  UA: 'Ukraine', AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States',
  UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VA: 'Vatican City', VE: 'Venezuela',
  VN: 'Vietnam', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe',
  // Special regions (non-duplicate with above)
  AX: 'Åland Islands', AS: 'American Samoa', AQ: 'Antarctica', AW: 'Aruba',
  BM: 'Bermuda', BV: 'Bouvet Island', IO: 'British Indian Ocean Territory',
  BQ: 'Caribbean Netherlands', KY: 'Cayman Islands', CX: 'Christmas Island',
  CC: 'Cocos Islands', CK: 'Cook Islands', CW: 'Curaçao', FO: 'Faroe Islands',
  GF: 'French Guiana', PF: 'French Polynesia', TF: 'French Southern Territories',
  GL: 'Greenland', GP: 'Guadeloupe', GU: 'Guam', GG: 'Guernsey', HM: 'Heard & McDonald Islands',
  IM: 'Isle of Man', JE: 'Jersey', XK: 'Kosovo',
  MF: 'Saint Martin',
  MQ: 'Martinique', YT: 'Mayotte', MS: 'Montserrat',
  NC: 'New Caledonia', NU: 'Niue', NF: 'Norfolk Island', MP: 'Northern Mariana Islands',
  PS: 'Palestine', PN: 'Pitcairn', PR: 'Puerto Rico', RE: 'Réunion',
  BL: 'Saint Barthélemy', SH: 'Saint Helena', PM: 'Saint Pierre & Miquelon',
  SX: 'Sint Maarten', GS: 'South Georgia', SJ: 'Svalbard & Jan Mayen',
  TK: 'Tokelau', TC: 'Turks & Caicos', UM: 'U.S. Outlying Islands',
  VG: 'British Virgin Islands', VI: 'U.S. Virgin Islands', WF: 'Wallis & Futuna',
  EH: 'Western Sahara',
};

/** Lookup cache for performance. */
const cache = new Map<string, CountryInfo>();

/**
 * Get country info from a 2-letter ISO code.
 * Returns { name, flag } for known codes, or a fallback for unknown.
 */
export function getCountryInfo(code: string): CountryInfo {
  const upper = (code || '').toUpperCase();

  if (cache.has(upper)) {
    return cache.get(upper)!;
  }

  const info: CountryInfo = {
    name: COUNTRY_NAMES[upper] || (upper === 'XX' ? 'Unknown' : upper),
    flag: codeToFlag(upper),
  };

  cache.set(upper, info);
  return info;
}

/**
 * Format country info for display: "🇨🇳 China"
 * Falls back to "Unknown" for missing codes.
 */
export function formatCountry(code: string): string {
  const info = getCountryInfo(code);
  return `${info.flag} ${info.name}`;
}
