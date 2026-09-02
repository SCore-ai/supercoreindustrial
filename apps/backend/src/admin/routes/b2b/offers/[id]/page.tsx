import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import IntegrationPanel from "../../../../components/b2b/integration-panel"
import QuoteOfferEditor from "../../../../components/b2b/quote-offer-editor"
import B2bRecordActions from "../../../../components/b2b/b2b-record-actions"
import CompanyStatusBadge from "../../../../components/b2b/company-status-badge"
import QuoteStatusBadge from "../../../../components/b2b/quote-status-badge"
import { useOfferRecordActions } from "../../../../hooks/use-b2b-record-actions"
import { b2bClient } from "../../../../lib/client"
import { QuoteAdminStatus, QuoteErpMetadata } from "../../../../lib/types"

const ADMIN_STATUS_OPTIONS: { value: QuoteAdminStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In review" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "cancelled", label: "Cancelled" },
]

const B2bOfferDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-quote", id],
    queryFn: () => b2bClient.getQuote(id!),
    enabled: Boolean(id),
  })

  const quote = data?.quote

  const [adminStatus, setAdminStatus] = useState<QuoteAdminStatus | "">("")
  const [orderId, setOrderId] = useState("")
  const [adminNotes, setAdminNotes] = useState("")

  const updateMutation = useMutation({
    mutationFn: (body: {
      admin_status?: QuoteAdminStatus
      order_id?: string | null
      admin_notes?: string | null
    }) => b2bClient.updateQuote(id!, body),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-quote", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-quotes"] })
      if (response.order_id) {
        toast.success(`Order created: ${response.order_id}`)
      } else {
        toast.success("Offer updated")
      }
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const convertMutation = useMutation({
    mutationFn: () => b2bClient.convertQuoteToOrder(id!),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-quote", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-quotes"] })
      toast.success(`Order created: ${response.order_id}`)
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const integrationMutation = useMutation({
    mutationFn: (erp: QuoteErpMetadata) =>
      b2bClient.updateIntegration(id!, erp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-quote", id] })
      toast.success("Integration metadata saved")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const offerMutation = useMutation({
    mutationFn: (body: Parameters<typeof b2bClient.sendQuoteOffer>[1]) =>
      b2bClient.sendQuoteOffer(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-quote", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-quotes"] })
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-dashboard"] })
      toast.success("Offer sent to customer")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const conversationMutation = useMutation({
    mutationFn: () =>
      b2bClient.createConversation({
        subject: `Quote ${id}`,
        quote_id: id!,
        company_id:
          typeof quote?.company === "object" && quote.company
            ? quote.company.id
            : quote?.company_id ?? null,
        customer_id: quote?.customer_id ?? null,
        initial_message: `Discussion about quote request ${id}.`,
      }),
    onSuccess: (response) => {
      if (response.emailed) {
        toast.success("Conversation started — customer emailed")
      } else {
        toast.success("Conversation started")
      }
      navigate(`/b2b/conversations/${response.conversation.id}`)
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const pdfMutation = useMutation({
    mutationFn: () => b2bClient.downloadQuotePdf(id!),
    onSuccess: () => toast.success("Offer PDF downloaded"),
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const { archive, restore, remove } = useOfferRecordActions({
    offerId: id,
    onDeleted: () => navigate("/b2b/offers"),
  })

  if (isLoading) {
    return (
      <Container>
        <Text>Loading offer...</Text>
      </Container>
    )
  }

  if (error || !quote) {
    return (
      <Container>
        <Text className="text-ui-fg-error">
          {(error as Error)?.message ?? "Offer not found"}
        </Text>
      </Container>
    )
  }

  const currentAdminStatus = adminStatus || quote.b2b?.admin_status || "new"
  const currentOrderId = orderId || quote.b2b?.order_id || ""
  const currentNotes = adminNotes || quote.b2b?.admin_notes || ""

  return (
    <Container className="flex flex-col gap-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Heading level="h1">Offer / quote request</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {quote.id}
          </Text>
          <div className="mt-2 flex items-center gap-2">
            <QuoteStatusBadge
              status={quote.status}
              adminStatus={quote.b2b?.admin_status}
            />
            {quote.region_id && (
              <Badge size="2xsmall" color="grey">
                Region {quote.region_id.slice(-6)}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/b2b/offers"
            className="text-sm text-ui-fg-interactive hover:underline"
          >
            Back to offers
          </Link>
          <B2bRecordActions
            recordId={quote.id}
            recordLabel={`offer ${quote.id.slice(-8).toUpperCase()}`}
            isArchived={quote.b2b?.admin_status === "cancelled"}
            archive={archive}
            restore={restore}
            remove={remove}
          />
          <Button
            size="small"
            variant="secondary"
            isLoading={pdfMutation.isPending}
            onClick={() => pdfMutation.mutate()}
          >
            Download offer PDF
          </Button>
          <Button
            size="small"
            variant="secondary"
            isLoading={conversationMutation.isPending}
            onClick={() => conversationMutation.mutate()}
          >
            Start conversation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-ui-border-base p-4">
          <Heading level="h2" className="mb-3">
            Customer
          </Heading>
          <div className="space-y-2">
            <Text>
              <span className="text-ui-fg-subtle">Email:</span>{" "}
              {quote.email || "—"}
            </Text>
            <Text>
              <span className="text-ui-fg-subtle">Company:</span>{" "}
              {typeof quote.company === "string"
                ? quote.company
                : quote.company?.name || "—"}
            </Text>
            <Text>
              <span className="text-ui-fg-subtle">Project:</span>{" "}
              {quote.project || "—"}
            </Text>
            <Text>
              <span className="text-ui-fg-subtle">Notes:</span>{" "}
              {quote.notes || "—"}
            </Text>
            {typeof quote.company === "object" && quote.company && (
              <div className="mt-3 rounded-md border border-ui-border-base p-3">
                <Text weight="plus" size="small">
                  Linked B2B customer
                </Text>
                <div className="mt-1 flex items-center gap-2">
                  <Link
                    to={`/b2b/companies/${quote.company.id}`}
                    className="text-sm text-ui-fg-interactive hover:underline"
                  >
                    {quote.company.name}
                  </Link>
                  <CompanyStatusBadge status={quote.company.status} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-ui-border-base p-4">
          <Heading level="h2" className="mb-3">
            Offer workflow
          </Heading>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_status">Admin status</Label>
              <Select
                value={currentAdminStatus}
                onValueChange={(value) =>
                  setAdminStatus(value as QuoteAdminStatus)
                }
              >
                <Select.Trigger id="admin_status">
                  <Select.Value placeholder="Admin status" />
                </Select.Trigger>
                <Select.Content>
                  {ADMIN_STATUS_OPTIONS.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div>
              <Label htmlFor="order_id">Linked order ID</Label>
              <Input
                id="order_id"
                value={currentOrderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="Auto-filled when converted to order"
                disabled={Boolean(quote.b2b?.order_id)}
              />
              {quote.b2b?.order_id && (
                <Link
                  to={`/orders/${quote.b2b.order_id}`}
                  className="mt-1 inline-block text-sm text-ui-fg-interactive hover:underline"
                >
                  Open linked order
                </Link>
              )}
            </div>

            {!quote.b2b?.order_id && (
              <Button
                variant="secondary"
                isLoading={convertMutation.isPending}
                onClick={() => convertMutation.mutate()}
              >
                Convert to order
              </Button>
            )}

            <div>
              <Label htmlFor="admin_notes">Internal notes</Label>
              <Textarea
                id="admin_notes"
                value={currentNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
              />
            </div>

            <Button
              onClick={() =>
                updateMutation.mutate({
                  admin_status: currentAdminStatus,
                  order_id: currentOrderId || null,
                  admin_notes: currentNotes || null,
                })
              }
              isLoading={updateMutation.isPending}
            >
              Save workflow
            </Button>
          </div>
        </div>
      </div>

      <QuoteOfferEditor
        quoteId={quote.id}
        items={quote.items}
        currencyCode={quote.currency_code}
        validUntil={quote.valid_until}
        offerTotal={quote.offer_total}
        onSend={async (payload) => {
          await offerMutation.mutateAsync(payload)
        }}
      />

      <IntegrationPanel
        quoteId={quote.id}
        erp={quote.b2b?.erp}
        onSave={async (erp) => {
          await integrationMutation.mutateAsync(erp)
        }}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Offer detail",
  link: false,
})

export default B2bOfferDetailPage
