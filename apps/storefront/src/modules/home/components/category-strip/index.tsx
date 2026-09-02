import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const FEATURED_HANDLES = [
  "cctv-systems",
  "paga-systems",
  "intercom-systems",
  "explosion-protected-devices",
  "hazardous-area",
  "cables",
]

export default async function CategoryStrip() {
  const categories = await listCategories()
  const featured = FEATURED_HANDLES.map((handle) =>
    categories?.find((c) => c.handle === handle && !c.parent_category)
  ).filter(Boolean)

  if (!featured.length) {
    return null
  }

  return (
    <section className="border-b border-sc-line bg-sc-paper">
      <div className="content-container py-20">
        <div className="flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
          <div>
            <p className="font-display text-xs tracking-[0.24em] uppercase text-sc-signal">
              Product families
            </p>
            <h2 className="mt-3 font-display text-3xl small:text-4xl tracking-tight text-sc-ink">
              Systems engineered for critical sites
            </h2>
          </div>
          <LocalizedClientLink
            href="/store"
            className="font-display text-sm tracking-[0.16em] uppercase text-sc-steel underline-offset-4 hover:underline"
          >
            View full catalog
          </LocalizedClientLink>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-px bg-sc-line small:grid-cols-2 large:grid-cols-3">
          {featured.map((category) => (
            <li key={category!.id} className="bg-sc-paper">
              <LocalizedClientLink
                href={`/categories/${category!.handle}`}
                className="group flex h-full flex-col justify-between gap-8 bg-sc-paper p-8 transition-colors duration-300 hover:bg-sc-mist"
              >
                <span className="font-display text-2xl tracking-tight text-sc-ink transition-transform duration-300 group-hover:translate-x-1">
                  {category!.name}
                </span>
                <span className="font-display text-xs tracking-[0.2em] uppercase text-sc-steel/70">
                  Shop category →
                </span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
