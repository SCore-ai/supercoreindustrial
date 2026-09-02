import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import B2bRecordActions from "../../../../components/b2b/b2b-record-actions"
import { useConversationRecordActions } from "../../../../hooks/use-b2b-record-actions"
import { b2bClient } from "../../../../lib/client"
import type { B2bMessage } from "../../../../lib/types"

const MessageBubble = ({ message }: { message: B2bMessage }) => {
  const isAdmin = message.sender_type === "admin"

  return (
    <div
      className={`rounded-lg border p-3 ${
        isAdmin
          ? "ml-8 border-ui-border-base bg-ui-bg-subtle"
          : "mr-8 border-ui-border-base"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <Text size="xsmall" weight="plus">
          {message.sender_name || message.sender_type}
        </Text>
        <Text size="xsmall" className="text-ui-fg-subtle">
          {message.created_at
            ? new Date(message.created_at).toLocaleString()
            : ""}
        </Text>
      </div>
      <Text size="small" className="whitespace-pre-wrap">
        {message.body}
      </Text>
    </div>
  )
}

const B2bConversationDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [reply, setReply] = useState("")

  const { archive, restore, remove } = useConversationRecordActions({
    conversationId: id,
    onDeleted: () => navigate("/b2b/conversations"),
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-conversation", id],
    queryFn: () => b2bClient.getConversation(id!),
    enabled: Boolean(id),
  })

  const replyMutation = useMutation({
    mutationFn: () => b2bClient.replyConversation(id!, { body: reply }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-conversation", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-conversations"] })
      setReply("")
      toast.success(
        response.emailed
          ? "Reply sent — customer emailed"
          : "Reply saved — customer email not sent (check SMTP / recipient)"
      )
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  if (isLoading) {
    return (
      <Container>
        <Text>Loading conversation...</Text>
      </Container>
    )
  }

  if (error || !data?.conversation) {
    return (
      <Container>
        <Text className="text-ui-fg-error">
          {(error as Error)?.message ?? "Conversation not found"}
        </Text>
      </Container>
    )
  }

  const conversation = data.conversation
  const messages = conversation.messages ?? []
  const isArchived = conversation.status === "archived"

  return (
    <Container className="flex flex-col gap-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Heading level="h1">{conversation.subject}</Heading>
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
            {conversation.company_id && (
              <Link
                to={`/customers/companies/${conversation.company_id}`}
                className="text-sm text-ui-fg-interactive hover:underline"
              >
                View company
              </Link>
            )}
            {conversation.quote_link?.status === "linked" && conversation.quote_link.id && (
              <Link
                to={`/b2b/offers/${conversation.quote_link.id}`}
                className="text-sm text-ui-fg-interactive hover:underline"
              >
                View quote
              </Link>
            )}
            {conversation.quote_link?.status === "removed" && (
              <Text size="small" className="text-ui-fg-subtle">
                {conversation.quote_link.label}
              </Text>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Link
            to="/b2b/conversations"
            className="text-sm text-ui-fg-interactive hover:underline"
          >
            Back to conversations
          </Link>
          <B2bRecordActions
            recordId={conversation.id}
            recordLabel={conversation.subject}
            isArchived={isArchived}
            archive={archive}
            restore={restore}
            remove={remove}
            size="base"
          />
        </div>
      </div>

      {isArchived && (
        <Text size="small" className="text-ui-fg-subtle">
          This conversation is archived. Restore it to send new replies.
        </Text>
      )}

      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {!messages.length && (
          <Text className="text-ui-fg-subtle">No messages yet.</Text>
        )}
      </div>

      {conversation.status === "open" && !isArchived && (
        <div className="rounded-lg border border-ui-border-base p-4">
          <Textarea
            rows={4}
            placeholder="Write a reply..."
            value={reply}
            onChange={(event) => setReply(event.target.value)}
          />
          <Button
            className="mt-3"
            disabled={!reply.trim()}
            isLoading={replyMutation.isPending}
            onClick={() => replyMutation.mutate()}
          >
            Send reply
          </Button>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Conversation detail",
  link: false,
})

export default B2bConversationDetailPage
