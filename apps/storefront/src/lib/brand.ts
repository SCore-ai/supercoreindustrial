export const BRAND = {
  name: "Supercore",
  legalName: "Supercore Industrial Systems Ltd",
  tagline: "Industrial systems for hazardous and marine environments",
  description:
    "Supercore Industrial Systems Ltd delivers secure, scalable OT/IT networking, private cellular, CCTV, PAGA, intercom, and hazardous-area solutions for critical infrastructure.",
  email: "sales@supercore.local",
  phone: "+44 (0)1224 000000",
  phoneTel: "+441224000000",
  supportPhone: "+44 (0)1224 000000",
  website: "https://supercoreai.co.uk",
  logos: {
    nav: "/brand/logo-stacked-light.png",
    footer: "/brand/logo-stacked-dark.png",
    horizontal: "/brand/logo-horizontal-dark.png",
  },
} as const

export const BRAND_OFFICES = [
  {
    name: "United Kingdom",
    lines: ["Supercore Industrial Systems Ltd", "United Kingdom"],
    mapUrl: "https://supercoreai.co.uk",
  },
] as const

export const BRAND_MARKETS = [
  "Oil & Gas",
  "Subsea",
  "Renewables",
  "Marine",
  "Transportation",
  "Industrial",
  "Defence",
  "Airports",
] as const
