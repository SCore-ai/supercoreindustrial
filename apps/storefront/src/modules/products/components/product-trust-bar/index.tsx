import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ProductTrustBar = () => {
  const items = [
    {
      title: "Expert support",
      detail: "Engineering team available for specification help",
    },
    {
      title: "Trade accounts",
      detail: "Volume pricing and quote workflows for B2B buyers",
    },
    {
      title: "Global shipping",
      detail: "Worldwide delivery with customs documentation",
    },
  ]

  return (
    <div className="mt-6 space-y-3 border-t border-sc-line pt-6">
      {items.map((item) => (
        <div key={item.title} className="flex gap-3">
          <span
            aria-hidden
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sc-cta"
          />
          <div>
            <p className="text-sm font-semibold text-sc-body">{item.title}</p>
            <p className="text-xs text-sc-steel">{item.detail}</p>
          </div>
        </div>
      ))}
      <LocalizedClientLink
        href="/register-trade"
        className="inline-flex text-sm font-semibold text-sc-body underline-offset-4 hover:text-sc-cta hover:underline"
      >
        Open a trade account
      </LocalizedClientLink>
    </div>
  )
}

export default ProductTrustBar
