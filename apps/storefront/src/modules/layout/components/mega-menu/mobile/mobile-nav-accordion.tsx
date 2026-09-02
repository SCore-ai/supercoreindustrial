"use client"

import { useState } from "react"

import type { NavLink } from "@lib/site-navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    aria-hidden
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
)

type MobileNavAccordionProps = {
  title: string
  href?: string
  items: NavLink[]
  onNavigate: () => void
  defaultOpen?: boolean
}

const MobileNavAccordion = ({
  title,
  href,
  items,
  onNavigate,
  defaultOpen = false,
}: MobileNavAccordionProps) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mb-4 border-b border-sc-line pb-4">
      <div className="flex items-center justify-between">
        {href ? (
          <LocalizedClientLink
            href={href}
            onClick={onNavigate}
            className="font-display text-sm uppercase tracking-[0.12em] text-sc-ink transition-colors hover:text-sc-cta"
          >
            {title}
          </LocalizedClientLink>
        ) : (
          <span className="font-display text-sm uppercase tracking-[0.12em] text-sc-ink">
            {title}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="p-2 text-sc-steel"
        >
          <Chevron open={open} />
        </button>
      </div>
      {open && (
        <ul className="mt-3 space-y-2 pl-1">
          {items.map((item) => (
            <li key={item.href}>
              <LocalizedClientLink
                href={item.href}
                onClick={onNavigate}
                className="text-sm text-sc-steel hover:text-sc-cta"
              >
                {item.label}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MobileNavAccordion
