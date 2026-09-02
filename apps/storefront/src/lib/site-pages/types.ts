export type PageSection =
  | {
      type: "intro"
      heading?: string
      body: string
    }
  | {
      type: "cards"
      heading?: string
      items: {
        title: string
        description: string
        href: string
        ctaLabel?: string
      }[]
    }
  | {
      type: "category-grid"
      heading?: string
      items: {
        title: string
        href: string
        image?: string
      }[]
    }
  | {
      type: "values"
      heading?: string
      items: { title: string; description: string }[]
    }
  | {
      type: "cta"
      heading: string
      body?: string
      primaryLabel: string
      primaryHref: string
      secondaryLabel?: string
      secondaryHref?: string
    }
  | {
      type: "contact-info"
    }
  | {
      type: "partner-programs"
    }

export type SitePage = {
  slug: string
  title: string
  description: string
  template?: "standard" | "contact" | "quote" | "catalog" | "partners" | "about"
  hero?: {
    eyebrow?: string
    heading: string
    subheading?: string
    image?: string
    imageAlt?: string
  }
  sections?: PageSection[]
}
