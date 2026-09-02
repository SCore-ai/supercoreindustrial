import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingCart } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { abandonedCheckoutClient } from "../../../lib/abandoned-checkout-client"
import {
  exportCheckoutsCsv,
  formatCheckoutDate,
  formatCheckoutMoney,
} from "../../../lib/abandoned-checkout-utils"
import type {
  AbandonedCheckoutRecoveryEmailStatus,
  AbandonedCheckoutRecoveryStatus,
} from "../../../lib/abandoned-checkout-types"

const PAGE_SIZE = 20

const RecoveryBadge = ({
  status,
}: {
  status: AbandonedCheckoutRecoveryStatus
}) => (
  <Badge color={status === "recovered" ? "green" : "orange"} size="2xsmall">
    {status === "recovered" ? "Recovered" : "Not recovered"}
  </Badge>
)

const RecoveryEmailBadge = ({
  status,
}: {
  status: AbandonedCheckoutRecoveryEmailStatus
}) => {
  if (status === "sent") {
    return (
      <Badge color="green" size="2xsmall">
        Sent
      </Badge>
    )
  }

  if (status === "failed") {
    return (
      <Badge color="red" size="2xsmall">
        Failed
      </Badge>
    )
  }

  return (
    <Badge color="orange" size="2xsmall">
      Not sent
    </Badge>
  )
}

const AbandonedCheckoutsPage = () => {
  const [recoveryFilter, setRecoveryFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [offset, setOffset] = useState(0)

  const queryParams = useMemo(() => {
    return {
      limit: PAGE_SIZE,
      offset,
      recovery_status: recoveryFilter,
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
    }
  }, [debouncedSearch, offset, recoveryFilter])

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-abandoned-checkouts", queryParams],
    queryFn: () => abandonedCheckoutClient.list(queryParams),
  })

  const checkouts = data?.checkouts ?? []
  const count = data?.count ?? 0
  const page = Math.floor(offset / PAGE_SIZE) + 1
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setOffset(0)
    setDebouncedSearch(search.trim())
  }

  const handleExport = async () => {
    try {
      const response = await abandonedCheckoutClient.list({
        recovery_status: recoveryFilter,
        q: debouncedSearch || undefined,
        limit: 500,
        offset: 0,
      })
      exportCheckoutsCsv(response.checkouts)
      toast.success("Export downloaded")
    } catch (exportError) {
      toast.error((exportError as Error).message)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Abandoned checkouts</Heading>
        <Button size="small" variant="secondary" onClick={handleExport}>
          Export
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        <div className="w-44">
          <Select
            value={recoveryFilter}
            onValueChange={(value) => {
              setRecoveryFilter(value)
              setOffset(0)
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="All" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All</Select.Item>
              <Select.Item value="not_recovered">Not recovered</Select.Item>
              <Select.Item value="recovered">Recovered</Select.Item>
            </Select.Content>
          </Select>
        </div>

        <form className="min-w-[240px] flex-1" onSubmit={handleSearchSubmit}>
          <Input
            placeholder="Search by customer, email, or checkout ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>
      </div>

      <div className="px-6 pb-6">
        {isLoading && <Text>Loading abandoned checkouts...</Text>}
        {error && (
          <Text className="text-ui-fg-error">
            Failed to load checkouts: {(error as Error).message}
          </Text>
        )}

        {!isLoading && !error && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Checkout</Table.HeaderCell>
                <Table.HeaderCell>Created</Table.HeaderCell>
                <Table.HeaderCell>Customer name</Table.HeaderCell>
                <Table.HeaderCell>Region</Table.HeaderCell>
                <Table.HeaderCell>Recovery status</Table.HeaderCell>
                <Table.HeaderCell>Recovery email</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  Total price
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {checkouts.map((checkout) => (
                <Table.Row key={checkout.id}>
                  <Table.Cell>
                    <Link
                      to={`/orders/abandoned-checkouts/${checkout.id}`}
                      className="text-ui-fg-interactive hover:underline"
                    >
                      #{checkout.display_id}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    {formatCheckoutDate(checkout.created_at)}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <Text size="small" weight="plus">
                        {checkout.customer_name}
                      </Text>
                      {checkout.customer_email && (
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          {checkout.customer_email}
                        </Text>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{checkout.region_label}</Table.Cell>
                  <Table.Cell>
                    <RecoveryBadge status={checkout.recovery_status} />
                  </Table.Cell>
                  <Table.Cell>
                    <RecoveryEmailBadge status={checkout.recovery_email_status} />
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {formatCheckoutMoney(
                      checkout.total,
                      checkout.currency_code
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}

              {!checkouts.length && (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <Text className="text-ui-fg-subtle">
                      No abandoned checkouts yet. Incomplete carts with customer
                      details will appear here.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Text size="small" className="text-ui-fg-subtle">
            {count} total
          </Text>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-ui-fg-interactive disabled:text-ui-fg-disabled"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </button>
            <Text size="small">
              Page {page} of {pageCount}
            </Text>
            <button
              type="button"
              className="text-ui-fg-interactive disabled:text-ui-fg-disabled"
              disabled={offset + PAGE_SIZE >= count}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Abandoned checkouts",
  icon: ShoppingCart,
  nested: "/orders",
  rank: 2,
})

export default AbandonedCheckoutsPage
