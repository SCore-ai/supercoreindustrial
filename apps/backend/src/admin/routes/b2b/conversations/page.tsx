import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
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
import B2bRecordActions from "../../../components/b2b/b2b-record-actions"
import { useConversationRecordActions } from "../../../hooks/use-b2b-record-actions"
import { b2bClient } from "../../../lib/client"

const PAGE_SIZE = 20

const B2bConversationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const statusFilter = searchParams.get("status") || "open"
  const [offset, setOffset] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [subject, setSubject] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [quoteId, setQuoteId] = useState("")
  const [initialMessage, setInitialMessage] = useState("")

  const queryParams = useMemo(
    () => ({
      limit: PAGE_SIZE,
      offset,
      status: statusFilter as "open" | "closed" | "archived" | "all",
    }),
    [offset, statusFilter]
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-conversations", queryParams],
    queryFn: () => b2bClient.listConversations(queryParams),
  })

  const { archive, restore, remove } = useConversationRecordActions()

  const createMutation = useMutation({
    mutationFn: () =>
      b2bClient.createConversation({
        subject,
        company_id: companyId || null,
        quote_id: quoteId || null,
        initial_message: initialMessage || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-conversations"] })
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-dashboard"] })
      toast.success("Conversation created")
      setShowCreate(false)
      setSubject("")
      setCompanyId("")
      setQuoteId("")
      setInitialMessage("")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const conversations = data?.conversations ?? []
  const count = data?.count ?? 0
  const page = Math.floor(offset / PAGE_SIZE) + 1
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Conversations</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            B2B messaging between trade accounts and your sales team
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-44">
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
                <Select.Item value="all">All active</Select.Item>
                <Select.Item value="open">Open</Select.Item>
                <Select.Item value="closed">Closed</Select.Item>
                <Select.Item value="archived">Archived</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <Button size="small" onClick={() => setShowCreate((prev) => !prev)}>
            New conversation
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="space-y-3 border-b border-ui-border-base px-6 py-4">
          <div>
            <Label htmlFor="conv_subject">Subject</Label>
            <Input
              id="conv_subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="conv_company">Company ID (optional)</Label>
              <Input
                id="conv_company"
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="conv_quote">Quote ID (optional)</Label>
              <Input
                id="conv_quote"
                value={quoteId}
                onChange={(event) => setQuoteId(event.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="conv_message">Initial message</Label>
            <Textarea
              id="conv_message"
              value={initialMessage}
              onChange={(event) => setInitialMessage(event.target.value)}
            />
          </div>
          <Button
            disabled={!subject.trim()}
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Create
          </Button>
        </div>
      )}

      <div className="px-6 py-4">
        {isLoading && <Text>Loading conversations...</Text>}
        {error && (
          <Text className="text-ui-fg-error">{(error as Error).message}</Text>
        )}

        {!isLoading && !error && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Subject</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Linked</Table.HeaderCell>
                <Table.HeaderCell>Updated</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {conversations.map((conversation) => (
                <Table.Row key={conversation.id}>
                  <Table.Cell>
                    <Link
                      to={`/b2b/conversations/${conversation.id}`}
                      className="text-ui-fg-interactive hover:underline"
                    >
                      {conversation.subject}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        conversation.status === "open"
                          ? "green"
                          : conversation.status === "archived"
                            ? "orange"
                            : "grey"
                      }
                    >
                      {conversation.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {conversation.company_id && (
                        <Link
                          to={`/customers/companies/${conversation.company_id}`}
                        >
                          Company
                        </Link>
                      )}
                      {conversation.quote_link?.status === "linked" &&
                        conversation.quote_link.id && (
                        <>
                          {" "}
                          <Link to={`/b2b/offers/${conversation.quote_link.id}`}>
                            Quote
                          </Link>
                        </>
                      )}
                      {conversation.quote_link?.status === "removed" && (
                        <>
                          {" "}
                          <span className="text-ui-fg-subtle">
                            {conversation.quote_link.label}
                          </span>
                        </>
                      )}
                      {conversation.order_id && (
                        <>
                          {" "}
                          <Link to={`/orders/${conversation.order_id}`}>
                            Order
                          </Link>
                        </>
                      )}
                      {!conversation.company_id &&
                        conversation.quote_link?.status !== "linked" &&
                        conversation.quote_link?.status !== "removed" &&
                        !conversation.order_id &&
                        "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">
                      {conversation.updated_at
                        ? new Date(conversation.updated_at).toLocaleString()
                        : "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <B2bRecordActions
                      recordId={conversation.id}
                      recordLabel={conversation.subject}
                      isArchived={conversation.status === "archived"}
                      archive={archive}
                      restore={restore}
                      remove={remove}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}

              {!conversations.length && (
                <Table.Row>
                  <Table.Cell colSpan={5}>
                    <Text className="text-ui-fg-subtle">
                      {statusFilter === "archived"
                        ? "No archived conversations."
                        : "No conversations yet."}
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
  label: "Conversations",
  rank: 7,
})

export default B2bConversationsPage
