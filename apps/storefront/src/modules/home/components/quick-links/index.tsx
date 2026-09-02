import type { ReactNode } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { QUICK_LINKS, type QuickLink } from "@lib/home-content"

const iconPaths: Record<QuickLink["icon"], ReactNode> = {
  catalog: (
    <path
      d="M8 6h8M8 10h8M8 14h5M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  ),
  contact: (
    <>
      <path
        d="M8 14a6 6 0 106-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 8v4l2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  industries: (
    <path
      d="M6 18V10l4-2v10M14 18V8l4-2v12M4 20h16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  quote: (
    <path
      d="M8 6h8v12H8zM10 10h4M10 14h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.5 9.5a2.5 2.5 0 014.5 1.5c0 2-2.5 2-2.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" />
    </>
  ),
  support: (
    <path
      d="M6 10a6 6 0 1112 0v2a2 2 0 01-2 2h-1v3H9v-3H8a2 2 0 01-2-2v-2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

const QuickLinks = () => {
  return (
    <section className="border-b border-sc-line bg-white">
      <div className="content-container py-10 small:py-12">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-3 medium:grid-cols-6">
          {QUICK_LINKS.map((item) => (
            <li key={item.label} className="flex justify-center">
              <LocalizedClientLink
                href={item.href}
                className="group flex w-full max-w-[140px] flex-col items-center gap-4 text-center"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-sc-line bg-sc-paper text-sc-steel transition-colors group-hover:border-sc-cta group-hover:text-sc-cta">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8"
                    aria-hidden
                  >
                    {iconPaths[item.icon]}
                  </svg>
                </span>
                <span className="text-base font-normal text-sc-body transition-colors group-hover:text-sc-ink">
                  {item.label}
                </span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default QuickLinks
