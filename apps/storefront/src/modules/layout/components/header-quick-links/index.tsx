import LocalizedClientLink from "@modules/common/components/localized-client-link"

const linkClassName =
  "hidden min-[1024px]:inline-flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 min-w-[3.25rem] max-w-[4.25rem] text-sc-steel hover:text-sc-accent transition-colors text-center"

const iconClassName = "h-5 w-5 shrink-0"

const labelClassName =
  "text-[10px] font-semibold leading-[1.15] tracking-tight text-current"

const QuickOrderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
    <path
      d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

const QuotesBomIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden>
    <path
      d="M8 4h8l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M16 4v4h4M8 12h8M8 16h5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const HeaderQuickLinks = ({
  quickOrderEnabled,
  quotesEnabled,
}: {
  quickOrderEnabled: boolean
  quotesEnabled: boolean
}) => {
  if (!quickOrderEnabled && !quotesEnabled) {
    return null
  }

  return (
    <div className="hidden min-[1024px]:flex items-center gap-0.5">
      {quickOrderEnabled && (
        <LocalizedClientLink
          href="/quick-order"
          className={linkClassName}
          data-testid="nav-quick-order-link"
        >
          <QuickOrderIcon />
          <span className={labelClassName}>Quick Order</span>
        </LocalizedClientLink>
      )}
      {quotesEnabled && (
        <LocalizedClientLink
          href="/quote"
          className={linkClassName}
          data-testid="nav-quotes-bom-link"
        >
          <QuotesBomIcon />
          <span className={labelClassName}>Quotes / BOM</span>
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default HeaderQuickLinks
