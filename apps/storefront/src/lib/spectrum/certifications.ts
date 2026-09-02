export type SpectrumCertScheme = {
  id: string
  mark: string
  region: string
  role: string
  body: string
}

export const SPECTRUM_CERT_SCHEMES: SpectrumCertScheme[] = [
  {
    id: "cfmus",
    mark: "cFMus / FM",
    region: "United States & Canada",
    role: "NEC / CEC Class & Division",
    body:
      "FM Approvals coverage for Class I Division 1 & 2 (and related Class II / III listings on selected assemblies). Used on sites that specify NFPA 70 / CEC hazardous locations.",
  },
  {
    id: "atex",
    mark: "ATEX",
    region: "European Union & UKCA-adjacent projects",
    role: "Directive 2014/34/EU",
    body:
      "Notified-Body certification for explosive atmospheres. Typical camera markings follow IEC 60079 (Ex db / Ex tb) for Zone 1 / 21 gas and dust.",
  },
  {
    id: "iecex",
    mark: "IECEx",
    region: "International / multi-country EPCs",
    role: "IEC System of Conformity",
    body:
      "Accepted across 50+ countries as the global Ex equipment benchmark — common on Middle East, Asia-Pacific, and African packages.",
  },
  {
    id: "inmetro",
    mark: "INMETRO",
    region: "Brazil",
    role: "National market access",
    body:
      "Required for electrical equipment entering Brazilian classified areas. Issued against the same IEC 60079 test basis as IECEx on many Spectrum assemblies.",
  },
  {
    id: "peso",
    mark: "PESO",
    region: "India",
    role: "Petroleum & Explosives Safety Organisation",
    body:
      "National registration for hazardous-area equipment on Indian oil, gas, and chemical sites. Confirm the PESO approval number on the model datasheet.",
  },
  {
    id: "ukca",
    mark: "UKCA",
    region: "United Kingdom",
    role: "UK market marking",
    body:
      "Selected assemblies carry UKCA alongside ATEX. Use the SKU datasheet when the specification calls for UK-only marking.",
  },
]

export const SPECTRUM_CLASS_MAP = [
  {
    nec: "Class I, Division 1",
    iec: "Zone 1 (gas) / Zone 21 (dust)",
    meaning: "Ignitable concentration expected in normal operation.",
  },
  {
    nec: "Class I, Division 2",
    iec: "Zone 2 (gas) / Zone 22 (dust)",
    meaning: "Ignitable concentration only under abnormal conditions.",
  },
  {
    nec: "Groups B, C, D (typical camera listings)",
    iec: "IIB+H2 / IIIC on many assemblies",
    meaning: "Hydrogen-inclusive gas groups and conductive dust where listed.",
  },
  {
    nec: "Type 4X enclosure",
    iec: "IP66 / IP67",
    meaning: "Hose-down, weather, and corrosion-resistant housings.",
  },
]

export const SPECTRUM_TYPICAL_MARKING = [
  {
    label: "Protection",
    value: "Ex db IIB+H2 T6 Gb / Ex tb IIIC T85 °C Db",
  },
  {
    label: "Ingress",
    value: "IP66 / IP67 · Type 4X",
  },
  {
    label: "Ambient (example)",
    value: "−20 °C to +50 °C (model-specific)",
  },
  {
    label: "Certificate families",
    value: "FM17US0156X · FM18ATEX0057X · FMG 18.0020X (examples)",
  },
]

export const SPECTRUM_SUBMITTAL_STEPS = [
  {
    step: "01",
    title: "Name the area",
    body: "Class/Division or Zone, gas/dust group, and T-class from the site hazardous-area drawing.",
  },
  {
    step: "02",
    title: "Lock the SKU",
    body: "Series plus Connectivity / Router / Region / Antenna variants change the certified assembly.",
  },
  {
    step: "03",
    title: "Request the pack",
    body: "We issue the matching datasheet and certificate set for that part number — not a generic brochure.",
  },
]
