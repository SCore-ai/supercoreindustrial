import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import KpiIcon from "../../../components/b2b/b2b-kpi-icon"
import { b2bClient } from "../../../lib/client"
import type { B2bDashboardStats } from "../../../lib/types"

const AlertCard = ({
  title,
  value,
  href,
  tone,
}: {
  title: string
  value: string | number
  href: string
  tone: "info" | "warning"
}) => (
  <Link
    to={href}
    className={`block rounded-xl p-5 text-white transition-opacity hover:opacity-90 ${
      tone === "info" ? "bg-blue-500" : "bg-orange-500"
    }`}
  >
    <Text size="small" className="text-white/80">
      {title}
    </Text>
    <Heading level="h2" className="mt-2 text-white">
      {value}
    </Heading>
    <Text size="xsmall" className="mt-4 text-white/70">
      Open →
    </Text>
  </Link>
)

const SummaryChart = ({ stats }: { stats: B2bDashboardStats }) => {
  const bars = [
    { label: "Quotes", value: stats.total_submitted_quotes },
    { label: "Offers", value: stats.quoted_offers },
    { label: "Customers", value: stats.approved_companies },
    { label: "Approvals", value: stats.pending_order_approvals },
  ]
  const max = Math.max(...bars.map((b) => b.value), 1)

  return (
    <div className="flex h-48 items-end gap-3 px-2">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md bg-ui-tag-blue-bg"
            style={{ height: `${Math.max(12, (bar.value / max) * 160)}px` }}
          />
          <Text size="xsmall" className="text-ui-fg-subtle">
            {bar.label}
          </Text>
          <Text size="small" weight="plus">
            {bar.value}
          </Text>
        </div>
      ))}
    </div>
  )
}

const B2bDashboardPage = () => {
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-b2b-dashboard"],
    queryFn: () => b2bClient.getDashboard(),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => b2bClient.approveCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-companies"] })
      toast.success("Trade account approved")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const stats = data?.stats
  const pendingRegistrations = data?.pending_registrations ?? []

  return (
    <Container className="flex flex-col gap-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Dashboard</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            B2B sales summary, registrations, messages, and orders
          </Text>
        </div>
        <button
          type="button"
          className="text-sm text-ui-fg-interactive hover:underline disabled:opacity-50"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          {isFetching ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      {isLoading && <Text>Loading dashboard...</Text>}
      {error && (
        <Text className="text-ui-fg-error">{(error as Error).message}</Text>
      )}

      {stats && (
        <>
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-base">
            <div className="border-b border-ui-border-base p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Heading level="h2">B2B activity summary</Heading>
                  <Text size="small" className="text-ui-fg-subtle">
                    Quote pipeline, customers, and approval queue
                  </Text>
                </div>
                <div className="flex gap-4">
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-400" />
                    B2B activity
                  </Text>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Open quote requests
                  </Text>
                  <Heading level="h1" className="mt-2">
                    {stats.new_quotes + stats.in_review_quotes}
                  </Heading>
                  <Text size="xsmall" className="mt-6 text-ui-fg-subtle">
                    Priced offers sent
                  </Text>
                  <Heading level="h2" className="mt-1">
                    {stats.quoted_offers}
                  </Heading>
                  <Text size="xsmall" className="mt-6 text-ui-fg-subtle">
                    Pending registrations
                  </Text>
                  <Heading level="h2" className="mt-1">
                    {stats.pending_companies}
                  </Heading>
                </div>
                <div className="lg:col-span-9">
                  <SummaryChart stats={stats} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 border-t border-ui-border-base p-5 md:grid-cols-2 lg:grid-cols-4">
              <KpiIcon
                label="Quote requests"
                value={stats.total_submitted_quotes}
                icon={<BuildingStorefront />}
                tone="orange"
              />
              <KpiIcon
                label="Active offers"
                value={stats.quoted_offers}
                icon={<span>📦</span>}
                tone="cyan"
              />
              <KpiIcon
                label="Approved customers"
                value={stats.approved_companies}
                icon={<span>★</span>}
                tone="blue"
              />
              <KpiIcon
                label="Pending approvals"
                value={stats.pending_order_approvals}
                icon={<span>$</span>}
                tone="green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-xl border border-ui-border-base p-5">
                {pendingRegistrations.length === 0 ? (
                  <div className="py-8 text-center">
                    <Heading level="h2">Nothing here...</Heading>
                    <Text className="mt-2 text-ui-fg-subtle">
                      No registrations need approval!
                    </Text>
                  </div>
                ) : (
                  <>
                    <Heading level="h2" className="mb-4">
                      {stats.pending_companies} New Registrations — Approval
                      Needed
                    </Heading>
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Name and email</Table.HeaderCell>
                          <Table.HeaderCell>Company</Table.HeaderCell>
                          <Table.HeaderCell>Reg. date</Table.HeaderCell>
                          <Table.HeaderCell>Approval</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {pendingRegistrations.map((company) => (
                          <Table.Row key={company.id}>
                            <Table.Cell>
                              <Text weight="plus" size="small">
                                {company.name}
                              </Text>
                              <Text size="xsmall" className="text-ui-fg-subtle">
                                {company.email}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              {company.legal_name || company.vat_number || "—"}
                            </Table.Cell>
                            <Table.Cell>
                              {company.created_at
                                ? new Date(company.created_at).toLocaleDateString()
                                : "—"}
                            </Table.Cell>
                            <Table.Cell>
                              <div className="flex gap-2">
                                <Link to={`/b2b/companies/${company.id}`}>
                                  <Button size="small" variant="secondary">
                                    Review
                                  </Button>
                                </Link>
                                <Button
                                  size="small"
                                  isLoading={approveMutation.isPending}
                                  onClick={() =>
                                    approveMutation.mutate(company.id)
                                  }
                                >
                                  Approve
                                </Button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                    {stats.pending_companies > pendingRegistrations.length && (
                      <Link
                        to="/b2b/companies?status=pending"
                        className="mt-4 inline-block text-sm text-ui-fg-interactive hover:underline"
                      >
                        View all pending registrations →
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-4">
              <AlertCard
                title="You have"
                value={`${stats.open_conversations} New Messages`}
                href="/b2b/conversations?status=open"
                tone="info"
              />
              <AlertCard
                title="You have"
                value={`${stats.pending_order_approvals} Orders Pending Approval`}
                href="/b2b/order-approvals?status=pending"
                tone="warning"
              />
              <AlertCard
                title="You have"
                value={`${stats.new_quotes} New Quote Requests`}
                href="/b2b/offers"
                tone="warning"
              />
            </div>
          </div>
        </>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Dashboard",
  rank: 1,
})

export default B2bDashboardPage
