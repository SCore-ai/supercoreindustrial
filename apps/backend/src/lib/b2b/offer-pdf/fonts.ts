import fs from "fs"
import path from "path"

const FONT_FILES = {
  displayBold: "Montserrat-Bold.ttf",
  displaySemibold: "Montserrat-SemiBold.ttf",
  body: "OpenSans-Regular.ttf",
  bodySemibold: "OpenSans-SemiBold.ttf",
} as const

export type OfferPdfFontPaths = {
  displayBold: string
  displaySemibold: string
  body: string
  bodySemibold: string
}

function candidateDirs() {
  return [
    path.join(process.cwd(), "assets", "offer-pdf", "fonts"),
    path.join(process.cwd(), "src", "lib", "b2b", "offer-pdf", "fonts"),
  ]
}

export function resolveOfferPdfFonts(): OfferPdfFontPaths {
  const dir = candidateDirs().find((candidate) => fs.existsSync(candidate))

  if (!dir) {
    throw new Error(
      "Offer PDF fonts are missing. Expected assets/offer-pdf/fonts (Montserrat + Open Sans)."
    )
  }

  const paths = {
    displayBold: path.join(dir, FONT_FILES.displayBold),
    displaySemibold: path.join(dir, FONT_FILES.displaySemibold),
    body: path.join(dir, FONT_FILES.body),
    bodySemibold: path.join(dir, FONT_FILES.bodySemibold),
  }

  for (const filePath of Object.values(paths)) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Offer PDF font file is missing: ${filePath}`)
    }
  }

  return paths
}

export function resolveOfferPdfLogo(): string | null {
  const candidates = [
    path.join(process.cwd(), "assets", "offer-pdf", "logo-stacked-light.png"),
    path.join(
      process.cwd(),
      "..",
      "storefront",
      "public",
      "brand",
      "logo-stacked-light.png"
    ),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}
