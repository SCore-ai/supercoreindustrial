import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Select, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import CompanyStatusBadge from "../../../components/b2b/company-status-badge"
import { b2bClient } from "../../../lib/client"

const PAGE_SIZE = 20

const CustomerCompaniesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const statusFilter = searchParams.get("status") || "all"
  const [offset, setOffset] = useState(0)

  const queryParams = useMemo(() => {
    return {
      limit: PAGE_SIZE,
      offset,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    }
  }, [offset, statusFilter])

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-companies", queryParams],
    queryFn: () => b2bClient.listCompanies(queryParams),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => b2bClient.approveCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-companies"] })
      toast.success("Company approved")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const companies = data?.companies ?? []
  const count = data?.count ?? 0
  const page = Math.floor(offset / PAGE_SIZE) + 1
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <Container className="flex flex-col gap-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Text size="xlarge" weight="plus">
            Companies
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            B2B trade accounts linked to customer records
          </Text>
        </div>
        <div className="w-52">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setSearchParams(value === "all" ? {} : { status: value })
              setOffset(0)
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Filter status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All statuses</Select.Item>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="approved">Approved</Select.Item>
              <Select.Item value="rejected">Rejected</Select.Item>
              <Select.Item value="suspended">Suspended</Select.Item>
              <Select.Item value="archived">Archived</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>

      {isLoading && <Text>Loading companies...</Text>}
      {error && (
        <Text className="text-ui-fg-error">{(error as Error).message}</Text>
      )}

      {!isLoading && !error && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Company</Table.HeaderCell>
              <Table.HeaderCell>Ordering</Table.HeaderCell>
              <Table.HeaderCell>Main contact</Table.HeaderCell>
              <Table.HeaderCell>Members</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {companies.map((company) => (
              <Table.Row key={company.id}>
                <Table.Cell>
                  <Link
                    to={`/customers/companies/${company.id}`}
                    className="text-ui-fg-interactive hover:underline"
                  >
                    {company.name}
                  </Link>
                  {company.vat_number && (
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      VAT {company.vat_number}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <CompanyStatusBadge status={company.status} />
                </Table.Cell>
                <Table.Cell>
                  <Text size="small">{company.email}</Text>
                </Table.Cell>
                <Table.Cell>{company.member_count ?? 0}</Table.Cell>
                <Table.Cell>
                  {company.status === "pending" && (
                    <button
                      type="button"
                      className="text-sm text-ui-fg-interactive hover:underline"
                      onClick={() => approveMutation.mutate(company.id)}
                    >
                      Approve
                    </button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}

            {!companies.length && (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text className="text-ui-fg-subtle">
                    No companies yet. They appear when customers register for a
                    trade account or submit B2B quotes.
                  </Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      )}

      <div className="flex items-center justify-between">
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
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Companies",
  nested: "/customers",
  rank: 1,
})

export default CustomerCompaniesPage
