// Minimal brand domain map for your 15 stocks
export const NAME_TO_DOMAIN = {
  "Reliance Industries Ltd": "ril.com",            // relianceindustries.com also works
  "Infosys Limited": "infosys.com",
  "Tata Consultancy Services": "tcs.com",
  "HDFC Bank Limited": "hdfcbank.com",
  "ICICI Bank Limited": "icicibank.com",
  "Bharti Airtel Limited": "airtel.in",
  "ITC Limited": "itcportal.com",
  "Bajaj Finance Ltd": "bajajfinserv.in",          // Brand is Finserv; Finance is subsidiary
  "Asian Paints Limited": "asianpaints.com",
  "Maruti Suzuki India Ltd": "marutisuzuki.com",
  "Wipro Limited": "wipro.com",
  "Tata Motors Ltd": "tatamotors.com",
  "Tech Mahindra": "techmahindra.com",
  "Axis Bank Limited": "axisbank.com",
  "Sun Pharmaceutical": "sunpharma.com",
};

export function companyDomainFrom(name) {
  // exact first
  if (NAME_TO_DOMAIN[name]) return NAME_TO_DOMAIN[name];

  // fuzzy pass (fallback)
  const n = name.toLowerCase();
  const hit = Object.entries(NAME_TO_DOMAIN).find(([k]) => n.includes(k.toLowerCase()));
  return hit?.[1];
}

export function logoCandidates({ symbol, name }) {
  const domain = companyDomainFrom(name);
  const candidates = [
    `/logos/${symbol}.png`,
    `/logos/${symbol}.svg`,
  ];

  if (domain) {
    candidates.push(`https://logo.clearbit.com/${domain}`);
  }

  // brand.dev fallback
  candidates.push(`https://stock-logo-api.brand.dev/${symbol}`);

  return candidates;
}
