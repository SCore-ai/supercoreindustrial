type Eds305SeedInput = {
  categoryId: string
  salesChannelId: string
}

const CERTIFICATIONS = ["Safe Area", "Zone 2", "Zone 1"] as const
const LENSES = ["4mm", "8mm", "25mm"] as const
const HOUSINGS = ["SS316L", "Aluminium"] as const

function certCode(cert: string) {
  if (cert === "Safe Area") return "SA"
  if (cert === "Zone 2") return "Z2"
  return "Z1"
}

function housingCode(housing: string) {
  return housing === "SS316L" ? "316" : "AL"
}

export function buildEds305Product(input: Eds305SeedInput) {
  const variants: Array<{
    title: string
    sku: string
    options: Record<string, string>
    metadata: Record<string, string>
    prices: Array<{ amount: number; currency_code: string }>
  }> = []

  for (const certification of CERTIFICATIONS) {
    for (const lens of LENSES) {
      for (const housing of HOUSINGS) {
        const code = certCode(certification)
        const hCode = housingCode(housing)
        const lensNum = lens.replace("mm", "")
        const sku = `SC-EDS305-${code}-${lensNum}-${hCode}`
        const baseGbp = 48000 + LENSES.indexOf(lens) * 6000 + (hCode === "316" ? 4000 : 0)
        const priced = certification === "Safe Area"

        variants.push({
          title: `${certification} / ${lens} / ${housing}`,
          sku,
          options: {
            Certification: certification,
            Lens: lens,
            Housing: housing,
          },
          metadata: {
            mpn: `EDS-305-${code}-${lensNum}-${hCode}`,
          },
          prices: priced
            ? [
                { amount: baseGbp, currency_code: "gbp" },
                { amount: Math.round(baseGbp * 1.15), currency_code: "eur" },
                { amount: Math.round(baseGbp * 1.25), currency_code: "usd" },
              ]
            : [],
        })
      }
    }
  }

  return {
    title: "EDS-305 Explosion-Protected Camera Station",
    handle: "eds-305-explosion-protected-camera",
    description:
      "Industrial-grade explosion-protected camera station for hazardous area surveillance. HDTV imaging with configurable lens and housing options. Safe Area SKUs include list pricing; Zone 1/2 configurations are quote-gated for compliance review.",
    category_ids: [input.categoryId],
    status: "published" as const,
    metadata: {
      display: "matrix",
      family: "EDS-305",
      brand: "Supercore Systems",
      manufacturer: "Supercore Systems",
      model: "EDS-305",
      short_description:
        "Explosion-protected camera station with configurable lens, housing, and hazardous-area certification. Ideal for oil & gas, chemical, and industrial sites requiring ATEX/IECEx compliance.",
      courier_delivery:
        "Courier delivery: UK express 2–3 business days. EU 3–5 business days. Hazardous-area units ship with compliance documentation. Tracking number sent on dispatch.",
      vat_rate: 20,
      category_label: "Explosion-Protected Cameras",
      certifications: JSON.stringify([
        "ATEX Zone 1",
        "ATEX Zone 2",
        "IECEx",
        "UKCA",
      ]),
      highlights: JSON.stringify([
        { label: "Resolution", value: "1080p HDTV" },
        { label: "Zoom", value: "40× optical" },
        { label: "Temperature", value: "-20°C to +50°C" },
        { label: "Housing", value: "SS316L / Aluminium" },
      ]),
      features: JSON.stringify([
        "HDTV 1080p imaging with 40× optical zoom for overview and detail",
        "Patented explosion-proof housing in stainless steel or aluminium",
        "Axis Lightfinder 2.0 for low-light colour imaging",
        "Auto-tracking with click-and-track orientation aid",
        "Signed firmware and secure boot for enhanced cybersecurity",
        "NDAA compliant — manufactured for regulated deployments",
      ]),
      specifications: JSON.stringify({
        Imaging: {
          Resolution: "1920 × 1080 (1080p HDTV)",
          "Optical zoom": "40×",
          "Low-light": "Axis Lightfinder 2.0",
        },
        Environmental: {
          "Operating temperature": "-20°C to +50°C",
          "Housing options": "SS316L, Aluminium",
          "Lens options": "4 mm, 8 mm, 25 mm",
        },
        Certifications: {
          "Hazardous area": "Zone 1, Zone 2, Safe Area",
          Standards: "ATEX, IECEx, UKCA, cFMus",
        },
      }),
      documents: JSON.stringify([
        {
          name: "EDS-305 Datasheet",
          url: "https://supercoreai.co.uk",
          type: "pdf",
        },
        {
          name: "Installation Guide",
          url: "https://supercoreai.co.uk",
          type: "pdf",
        },
        {
          name: "ATEX Certificate Summary",
          url: "https://supercoreai.co.uk",
          type: "pdf",
        },
      ]),
      shipping_notes:
        "Handling time: ships on the next business day after order confirmation.\n\nUK & EU: express delivery typically 2–3 business days.\n\nInternational: standard freight 2–10 business days. Hazardous-area equipment may require additional export documentation.",
    },
    options: [
      { title: "Certification", values: [...CERTIFICATIONS] },
      { title: "Lens", values: [...LENSES] },
      { title: "Housing", values: [...HOUSINGS] },
    ],
    variants,
    sales_channels: [{ id: input.salesChannelId }],
  }
}

export const EDS305_HANDLE = "eds-305-explosion-protected-camera"
