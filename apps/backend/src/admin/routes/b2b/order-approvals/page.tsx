import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Label,
  Select,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { b2bClient } from "../../../lib/client"
import type { B2bOrderApproval } from "../../../lib/types"

const PAGE_SIZE = 20

const statusColor = (status: B2bOrderApproval["status"]) => {
  if (status === "pending") return "orange"
  if (status === "approved") return "green"
  return "red"
}

const B2bOrderApprovalsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const statusFilter = searchParams.get("status") || "pending"
  const [offset, setOffset] = useState(0)
  const [notesById, setNotesById] = useState<Record<string, string>>({})

  const queryParams = useMemo(
    () => ({
      limit: PAGE_SIZE,
      offset,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    }),
    [offset, statusFilter]
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-order-approvals", queryParams],
    queryFn: () => b2bClient.listOrderApprovals(queryParams),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string | null }) =>
      b2bClient.approveOrder(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-order-approvals"] })
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-dashboard"] })
      toast.success("Order approved")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string | null }) =>
      b2bClient.rejectOrder(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-order-approvals"] })
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-dashboard"] })
      toast.success("Order rejected")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const approvals = data?.approvals ?? []
  const count = data?.count ?? 0
  const page = Math.floor(offset / PAGE_SIZE) + 1
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Order approvals</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Subaccount orders awaiting parent company approval (B2B Module)
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
            </Select.Content>
          </Select>
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading && <Text>Loading approvals...</Text>}
        {error && (
          <Text className="text-ui-fg-error">{(error as Error).message}</Text>
        )}

        {!isLoading && !error && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Order</Table.HeaderCell>
                <Table.HeaderCell>Company</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Notes</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {approvals.map((approval) => (
                <Table.Row key={approval.id}>
                  <Table.Cell>
                    <Link
                      to={`/orders/${approval.order_id}`}
                      className="text-ui-fg-interactive hover:underline"
                    >
                      {approval.order_id}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      to={`/b2b/companies/${approval.company_id}`}
                      className="text-ui-fg-interactive hover:underline"
                    >
                      {approval.company_id}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColor(approval.status)}>
                      {approval.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {approval.status === "pending" ? (
                      <Textarea
                        rows={2}
                        placeholder="Optional notes"
                        value={notesById[approval.id] ?? ""}
                        onChange={(event) =>
                          setNotesById((prev) => ({
                            ...prev,
                            [approval.id]: event.target.value,
                          }))
                        }
                      />
                    ) : (
                      <Text size="small">{approval.notes || "—"}</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {approval.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          isLoading={approveMutation.isPending}
                          onClick={() =>
                            approveMutation.mutate({
                              id: approval.id,
                              notes: notesById[approval.id] || null,
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          isLoading={rejectMutation.isPending}
                          onClick={() =>
                            rejectMutation.mutate({
                              id: approval.id,
                              notes: notesById[approval.id] || null,
                            })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}

              {!approvals.length && (
                <Table.Row>
                  <Table.Cell colSpan={5}>
                    <Text className="text-ui-fg-subtle">
                      No order approvals in this queue.
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
  label: "Order approvals",
  link: false,
})

export default B2bOrderApprovalsPage
