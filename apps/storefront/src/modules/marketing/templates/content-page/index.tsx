import type { SitePage } from "@lib/site-pages"

import PageHero from "@modules/marketing/components/page-hero"
import PageSections from "@modules/marketing/components/page-sections"

type ContentPageTemplateProps = {
  page: SitePage
}

const ContentPageTemplate = ({ page }: ContentPageTemplateProps) => {
  return (
    <>
      {page.hero && <PageHero hero={page.hero} />}
      {page.sections && <PageSections sections={page.sections} />}
    </>
  )
}

export default ContentPageTemplate
