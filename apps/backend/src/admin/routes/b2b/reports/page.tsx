import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront, DocumentText } from "@medusajs/icons"
import { Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import B2bPageShell from "../../../components/b2b/b2b-page-shell"
import B2bMetricBar from "../../../components/b2b/b2b-metric-bar"
import B2bPipelineChart, {
  buildQuotePipelineStages,
} from "../../../components/b2b/b2b-pipeline-chart"
import KpiIcon from "../../../components/b2b/b2b-kpi-icon"
import { b2bClient } from "../../../lib/client"
import type { B2bDashboardStats } from "../../../lib/types"

const B2bReportsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-dashboard"],
    queryFn: () => b2bClient.getDashboard(),
  })

  const stats = data?.stats

  return (
    <Container className="p-0">
      <B2bPageShell
        title="Reports"
        subtitle="Pipeline analytics, conversion metrics, and operational health"
      >
        {isLoading && <Text>Loading reports...</Text>}
        {error && (
          <Text className="text-ui-fg-error">{(error as Error).message}</Text>
        )}

        {stats && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <HighlightCard
                title="Quote pipeline"
                value={stats.total_submitted_quotes}
                caption="Submitted requests"
                tone="blue"
              />
              <HighlightCard
                title="Win rate"
                value={formatWinRate(stats)}
                caption={`${stats.won_quotes} won / ${stats.won_quotes + stats.lost_quotes || 0} closed`}
                tone="green"
              />
              <HighlightCard
                title="Active offers"
                value={stats.quoted_offers}
                caption="Awaiting customer decision"
                tone="cyan"
              />
              <HighlightCard
                title="Pending actions"
                value={
                  stats.pending_companies + stats.pending_order_approvals
                }
                caption="Registrations + order approvals"
                tone="orange"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-base">
              <div className="border-b border-ui-border-base p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Heading level="h2">Quote funnel</Heading>
                    <Text size="small" className="mt-1 text-ui-fg-subtle">
                      Volume across each admin workflow stage
                    </Text>
                  </div>
                  <Link
                    to="/b2b/offers"
                    className="text-sm text-ui-fg-interactive hover:underline"
                  >
                    Open offers →
                  </Link>
                </div>
                <div className="mt-8">
                  <B2bPipelineChart stages={buildQuotePipelineStages(stats)} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
                <ReportPanel title="Customer accounts" href="/b2b/companies">
                  <div className="space-y-4">
                    <B2bMetricBar
                      label="Approved trade accounts"
                      value={stats.approved_companies}
                      total={
                        stats.approved_companies + stats.pending_companies
                      }
                      tone="green"
                    />
                    <B2bMetricBar
                      label="Pending registration"
                      value={stats.pending_companies}
                      total={
                        stats.approved_companies + stats.pending_companies
                      }
                      tone="orange"
                    />
                  </div>
                </ReportPanel>

                <ReportPanel
                  title="Operations"
                  href="/b2b/conversations"
                  bordered={false}
                >
                  <div className="space-y-4">
                    <B2bMetricBar
                      label="Open conversations"
                      value={stats.open_conversations}
                      total={Math.max(stats.open_conversations, 1)}
                      tone="violet"
                    />
                    <B2bMetricBar
                      label="Pending order approvals"
                      value={stats.pending_order_approvals}
                      total={Math.max(stats.pending_order_approvals, 1)}
                      tone="cyan"
                    />
                  </div>
                </ReportPanel>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <QuickLinkCard
                title="Quote requests"
                value={stats.new_quotes + stats.in_review_quotes}
                description="New and in-review pipeline"
                href="/b2b/offers"
                icon={<DocumentText />}
                tone="blue"
              />
              <QuickLinkCard
                title="Customers"
                value={stats.approved_companies}
                description="Approved B2B accounts"
                href="/b2b/companies"
                icon={<span>★</span>}
                tone="green"
              />
              <QuickLinkCard
                title="Messages"
                value={stats.open_conversations}
                description="Open conversations"
                href="/b2b/conversations"
                icon={<span>MSG</span>}
                tone="violet"
              />
              <QuickLinkCard
                title="Approvals"
                value={stats.pending_order_approvals}
                description="Orders awaiting approval"
                href="/b2b/order-approvals"
                icon={<span>✓</span>}
                tone="orange"
              />
            </div>

            <div className="rounded-2xl border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                Key metrics
              </Heading>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KpiIcon
                  label="Total submitted quotes"
                  value={stats.total_submitted_quotes}
                  icon={<BuildingStorefront />}
                  tone="blue"
                />
                <KpiIcon
                  label="Quoted offers"
                  value={stats.quoted_offers}
                  icon={<DocumentText />}
                  tone="cyan"
                />
                <KpiIcon
                  label="Won deals"
                  value={stats.won_quotes}
                  icon={<span>✓</span>}
                  tone="green"
                />
                <KpiIcon
                  label="Lost deals"
                  value={stats.lost_quotes}
                  icon={<span>×</span>}
                  tone="orange"
                />
              </div>
            </div>
          </div>
        )}
      </B2bPageShell>
    </Container>
  )
}

const formatWinRate = (stats: B2bDashboardStats) => {
  const closed = stats.won_quotes + stats.lost_quotes
  if (!closed) {
    return "—"
  }
  return `${Math.round((stats.won_quotes / closed) * 100)}%`
}

const HighlightCard = ({
  title,
  value,
  caption,
  tone,
}: {
  title: string
  value: string | number
  caption: string
  tone: "blue" | "green" | "cyan" | "orange"
}) => {
  const gradient =
    tone === "green"
      ? "from-emerald-600 to-emerald-500"
      : tone === "cyan"
        ? "from-cyan-600 to-cyan-500"
        : tone === "orange"
          ? "from-orange-600 to-orange-500"
          : "from-blue-600 to-blue-500"

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-sm`}
    >
      <Text size="small" className="text-white/80">
        {title}
      </Text>
      <Heading level="h1" className="mt-2 text-white">
        {value}
      </Heading>
      <Text size="xsmall" className="mt-3 text-white/75">
        {caption}
      </Text>
    </div>
  )
}

const ReportPanel = ({
  title,
  href,
  children,
  bordered = true,
}: {
  title: string
  href: string
  children: React.ReactNode
  bordered?: boolean
}) => (
  <div
    className={`p-6 ${bordered ? "border-b border-ui-border-base lg:border-b-0 lg:border-r" : ""}`}
  >
    <div className="mb-4 flex items-center justify-between gap-3">
      <Heading level="h2">{title}</Heading>
      <Link
        to={href}
        className="text-sm text-ui-fg-interactive hover:underline"
      >
        View →
      </Link>
    </div>
    {children}
  </div>
)

const QuickLinkCard = ({
  title,
  value,
  description,
  href,
  icon,
  tone,
}: {
  title: string
  value: number
  description: string
  href: string
  icon: React.ReactNode
  tone: "blue" | "green" | "violet" | "orange"
}) => {
  const iconTone =
    tone === "green"
      ? "text-emerald-500"
      : tone === "violet"
        ? "text-violet-500"
        : tone === "orange"
          ? "text-orange-500"
          : "text-blue-500"

  return (
    <Link
      to={href}
      className="group rounded-2xl border border-ui-border-base bg-ui-bg-base p-5 transition-colors hover:border-ui-border-interactive"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Text size="small" className="text-ui-fg-subtle">
            {title}
          </Text>
          <Heading level="h2" className="mt-1">
            {value}
          </Heading>
          <Text size="xsmall" className="mt-2 text-ui-fg-subtle">
            {description}
          </Text>
        </div>
        <span className={`text-2xl ${iconTone}`}>{icon}</span>
      </div>
      <Text
        size="xsmall"
        className="mt-4 text-ui-fg-interactive group-hover:underline"
      >
        Open detail →
      </Text>
    </Link>
  )
}

export const config = defineRouteConfig({
  label: "Reports",
  rank: 6,
})

export default B2bReportsPage
