import { BRAND } from "@lib/brand"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import Image from "next/image"

type LogoProps = {
  className?: string
  href?: string
  compact?: boolean
  tone?: "dark" | "light"
}

export default function Logo({
  className,
  href = "/",
  compact = false,
  tone = "dark",
}: LogoProps) {
  const src =
    tone === "light" ? BRAND.logos.footer : BRAND.logos.nav

  return (
    <LocalizedClientLink
      href={href}
      className={clx("group inline-flex items-center no-underline", className)}
      data-testid="nav-store-link"
      aria-label={BRAND.legalName}
    >
      <Image
        src={src}
        alt={BRAND.legalName}
        width={compact ? 140 : 180}
        height={compact ? 48 : 56}
        className={clx(
          "w-auto shrink-0 object-contain object-left",
          compact ? "h-10" : "h-12 small:h-14"
        )}
        priority
      />
    </LocalizedClientLink>
  )
}
