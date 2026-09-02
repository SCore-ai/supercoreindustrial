import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getAllPageSlugs, getPageBySlug } from "@lib/site-pages"
import ContentPageTemplate from "@modules/marketing/templates/content-page"

type PageProps = {
  params: Promise<{ countryCode: string; slug: string[] }>
}

const DEDICATED_PAGE_SLUGS = new Set([
  "brands",
  "brands/spectrum",
  "brands/axis",
  "brands/zenitel",
])

export async function generateStaticParams() {
  return getAllPageSlugs()
    .filter((slug) => !DEDICATED_PAGE_SLUGS.has(slug))
    .map((slug) => ({
      slug: slug.split("/"),
    }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const page = getPageBySlug(params.slug)

  if (!page) {
    return { title: "Page Not Found" }
  }

  return {
    title: page.title,
    description: page.description,
  }
}

export default async function MarketingCatchAllPage(props: PageProps) {
  const params = await props.params
  const page = getPageBySlug(params.slug)

  if (!page) {
    notFound()
  }

  return <ContentPageTemplate page={page} />
}
