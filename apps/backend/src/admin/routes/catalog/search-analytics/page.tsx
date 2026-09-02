"use client"

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { MagnifyingGlass } from "@medusajs/icons"
import { Badge, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"

type SearchAnalyticsResponse = {
  popular: Array<{
    query: string
    count: number
    last_searched_at: string
  }>
  recent: Array<{
    id: string
    query: string
    result_count: number
    mpn_only: boolean
    created_at?: string
  }>
}

async function fetchSearchAnalytics() {
  const response = await fetch("/admin/search-analytics", {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to load search analytics")
  }

  return response.json() as Promise<SearchAnalyticsResponse>
}

const SearchAnalyticsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-search-analytics"],
    queryFn: fetchSearchAnalytics,
  })

  return (
    <div className="p-6">
      <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
        Catalog
      </Text>
      <div className="mt-2">
        <Text weight="plus" className="text-xl">
          Search analytics
        </Text>
        <Text size="small" className="mt-1 text-ui-fg-subtle">
          Popular storefront queries collected from live search usage.
        </Text>
      </div>

      {isLoading && <p className="mt-6 text-ui-fg-subtle">Loading analytics…</p>}
      {error instanceof Error && (
        <p className="mt-6 text-ui-fg-error">{error.message}</p>
      )}

      {data && (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base">
            <div className="border-b border-ui-border-base px-4 py-3">
              <Text weight="plus">Popular searches</Text>
            </div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Query</Table.HeaderCell>
                  <Table.HeaderCell>Count</Table.HeaderCell>
                  <Table.HeaderCell>Last searched</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.popular.map((entry) => (
                  <Table.Row key={entry.query}>
                    <Table.Cell>{entry.query}</Table.Cell>
                    <Table.Cell>{entry.count}</Table.Cell>
                    <Table.Cell>
                      {new Date(entry.last_searched_at).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
                {!data.popular.length && (
                  <Table.Row>
                    <Table.Cell colSpan={3} className="text-ui-fg-subtle">
                      No searches recorded yet.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>

          <div className="rounded-lg border border-ui-border-base bg-ui-bg-base">
            <div className="border-b border-ui-border-base px-4 py-3">
              <Text weight="plus">Recent searches</Text>
            </div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Query</Table.HeaderCell>
                  <Table.HeaderCell>Results</Table.HeaderCell>
                  <Table.HeaderCell>Mode</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.recent.map((entry) => (
                  <Table.Row key={entry.id}>
                    <Table.Cell>{entry.query}</Table.Cell>
                    <Table.Cell>{entry.result_count}</Table.Cell>
                    <Table.Cell>
                      {entry.mpn_only ? (
                        <Badge size="2xsmall">MPN only</Badge>
                      ) : (
                        <Badge color="grey" size="2xsmall">
                          Standard
                        </Badge>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
                {!data.recent.length && (
                  <Table.Row>
                    <Table.Cell colSpan={3} className="text-ui-fg-subtle">
                      No recent searches yet.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Search analytics",
  icon: MagnifyingGlass,
  rank: 3,
})

export default SearchAnalyticsPage
