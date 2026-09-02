export type ManufacturerId =
  | "zenitel"
  | "axis"
  | "spectrum"
  | "tecnovideo"
  | "cisco"

export type ManufacturerDefinition = {
  id: ManufacturerId
  name: string
  /** Price list currency before FX conversion to GBP store base. */
  source_currency: "eur" | "usd" | "gbp"
  target_currency: "gbp"
  description: string
  sample_csv: string
  default_filename: string
}

export const MANUFACTURERS: Record<ManufacturerId, ManufacturerDefinition> = {
  zenitel: {
    id: "zenitel",
    name: "Zenitel",
    source_currency: "eur",
    target_currency: "gbp",
    description:
      "Safety & Security and Maritime & Energy EUR price lists → GBP base + EUR/USD variants.",
    default_filename: "zenitel-pricelist.csv",
    sample_csv: `SKU,Description,List Price,Category
TCIS-1,Turbine Compact IP Station,245.00,Intercom
TCIS-2,Turbine Compact IP Station Dual,312.50,Intercom
ECPIR-3P,Ex Call Panel,890.00,Ex devices`,
  },
  axis: {
    id: "axis",
    name: "Axis",
    source_currency: "eur",
    target_currency: "gbp",
    description:
      "Axis Communications — supports EUR MSRP and GBP partner lists (merged import uses both).",
    default_filename: "axis-pricelist-merged.csv",
    sample_csv: `sku,title,description,price,eur_price,gbp_price,category,mpn,source_currency
01386-001,2N SECURITY RELAY,2N Security Relay,116.52,165,116.52,Axis,01386-001,gbp
01942-001,AXIS D4100-E NETWORK STROBE SIREN,"AXIS D4100-E Network Strobe Siren helps deter intruders...",399.00,569,399.00,Axis,01942-001,gbp`,
  },
  spectrum: {
    id: "spectrum",
    name: "Spectrum",
    source_currency: "usd",
    target_currency: "gbp",
    description:
      "Spectrum Camera USD list with Connectivity/Router/Region/Antenna variations → GBP base with EUR/USD prices.",
    default_filename: "spectrum-pricelist-usd.csv",
    sample_csv: `sku,parent_sku,title,price,usd_price,category,connectivity,router,region,antenna
F201-Q1715-01-01,F201-A-Q1715,F201 Explosion-Proof Camera - Q1715,7714.23,7714.23,Fixed Cameras,Wired (PoE),N/A,N/A,N/A
F201-Q1715-02-03-02-RUT241-01-L,F201-A-Q1715,F201 Explosion-Proof Camera - Q1715,9008.50,9008.50,Fixed Cameras,Wireless,Teltonika RUT241 (4G),Global,LTE`,
  },
  tecnovideo: {
    id: "tecnovideo",
    name: "Tecnovideo",
    source_currency: "eur",
    target_currency: "gbp",
    description:
      "Tecnovideo Hazardous + Safe Area EUR partner list → GBP base with EUR/USD variant prices. Fill blank prices in data/imports/Tecnovideo/tecnovideo-pricelist-eur.csv before import.",
    default_filename: "tecnovideo-pricelist-eur.csv",
    sample_csv: `sku,title,price,eur_price,category,mpn,source_currency,area,series
TXPTV4,TXPTV4 / TXPUSTV4 Explosionproof PTZ 4K camera,,,Hazardous Area > PTZ camera stations,TXPTV4,eur,hazardous,TXPTV4
TSPTV2,TSPTV2 Stainless steel PTZ 5MP camera,,,Safe Area > PTZ camera stations,TSPTV2,eur,safe,TSPTV2`,
  },
  cisco: {
    id: "cisco",
    name: "Cisco",
    source_currency: "usd",
    target_currency: "gbp",
    description:
      "Cisco USD price lists → GBP base with EUR/USD variant prices.",
    default_filename: "cisco-pricelist.csv",
    sample_csv: `SKU,Description,List Price,Category
C9200-24P,Catalyst 9200 24-port PoE+,2499.00,Switching
C9300-48P,Catalyst 9300 48-port PoE+,5499.00,Switching`,
  },
}

export const MANUFACTURER_LIST = Object.values(MANUFACTURERS)

export function getManufacturer(id: string): ManufacturerDefinition | null {
  const key = id.trim().toLowerCase() as ManufacturerId
  return MANUFACTURERS[key] ?? null
}

export function requireManufacturer(id: string): ManufacturerDefinition {
  const manufacturer = getManufacturer(id)
  if (!manufacturer) {
    throw new Error(
      `Unknown manufacturer "${id}". Supported: ${MANUFACTURER_LIST.map((m) => m.id).join(", ")}`
    )
  }
  return manufacturer
}
