import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { StoreB2bAccountSummary } from "@lib/data/b2b-account"
import type { B2bAccountNavItem } from "@lib/b2b/account-nav"

const TradeOverview = ({
  summary,
  navItems,
}: {
  summary: StoreB2bAccountSummary
  navItems: B2bAccountNavItem[]
}) => (
  <div className="space-y-8">
    <section className="rounded-xl border border-[var(--sc-line)] bg-white p-6">
      <h2 className="text-large-semi mb-2">Trade account</h2>
      {summary.company ? (
        <div className="space-y-2 text-base-regular text-ui-fg-subtle">
          <p>
            <span className="font-medium text-ui-fg-base">
              {summary.company.name}
            </span>
          </p>
          <p>
            Status:{" "}
            <span className="capitalize text-ui-fg-base">
              {summary.company.status}
            </span>
          </p>
          {summary.member && (
            <p>
              Your role:{" "}
              <span className="capitalize text-ui-fg-base">
                {summary.member.role}
              </span>
            </p>
          )}
          {summary.company.require_order_approval && (
            <p className="text-sm">
              Subaccount orders may require company approval before fulfillment.
            </p>
          )}
        </div>
      ) : (
        <p className="text-base-regular text-ui-fg-subtle">
          No linked trade company yet. Submit a quote or register for a trade
          account to get started.
        </p>
      )}
    </section>

    <section className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Quotes"
        value={summary.counts.quotes}
        href="/account/trade/quotes"
        visible={navItems.some((item) => item.href === "/account/trade/quotes")}
      />
      <StatCard
        label="Messages"
        value={summary.counts.conversations}
        href="/account/trade/messages"
        visible={navItems.some(
          (item) => item.href === "/account/trade/messages"
        )}
      />
      <StatCard
        label="Pending approvals"
        value={summary.counts.pending_approvals}
        href="/account/trade/approvals"
        visible={navItems.some(
          (item) => item.href === "/account/trade/approvals"
        )}
      />
    </section>

    <section className="grid gap-3 sm:grid-cols-2">
      {navItems
        .filter((item) => item.href !== "/account/trade")
        .map((item) => (
          <LocalizedClientLink
            key={item.href}
            href={item.href}
            className="rounded-xl border border-[var(--sc-line)] px-5 py-4 transition-colors hover:border-[var(--sc-cta)] hover:bg-[var(--sc-paper)]"
          >
            <span className="text-base-semi">{item.label}</span>
          </LocalizedClientLink>
        ))}
    </section>
  </div>
)

const StatCard = ({
  label,
  value,
  href,
  visible,
}: {
  label: string
  value: number
  href: string
  visible: boolean
}) => {
  if (!visible) {
    return null
  }

  return (
    <LocalizedClientLink
      href={href}
      className="rounded-xl border border-[var(--sc-line)] bg-[var(--sc-paper)] p-5 transition-colors hover:border-[var(--sc-cta)]"
    >
      <p className="text-sm text-ui-fg-subtle">{label}</p>
      <p className="text-3xl-semi mt-2">{value}</p>
    </LocalizedClientLink>
  )
}

export default TradeOverview
