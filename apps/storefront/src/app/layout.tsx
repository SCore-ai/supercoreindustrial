import { getBaseURL } from "@lib/util/env"
import { BRAND } from "@lib/brand"
import { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import "styles/globals.css"

const display = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sc-display",
  display: "swap",
})

const sans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sc-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: BRAND.legalName,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.legalName,
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${display.variable} ${sans.variable}`}
    >
      <body className="font-sans bg-white text-base leading-6 text-sc-body antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
