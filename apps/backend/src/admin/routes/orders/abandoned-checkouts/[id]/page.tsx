import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { abandonedCheckoutClient } from "../../../../lib/abandoned-checkout-client"
import {
  formatAddress,
  formatCheckoutDateLong,
  formatCheckoutMoney,
} from "../../../../lib/abandoned-checkout-utils"

import type { AbandonedCheckoutRecoveryEmailStatus } from "../../../../lib/abandoned-checkout-types"

const CopyButton = ({ value, label }: { value: string; label: string }) => (
  <Button
    size="small"
    variant="secondary"
    onClick={async () => {
      try {
        await navigator.clipboard.writeText(value)
        toast.success(`${label} copied`)
      } catch {
        toast.error(`Could not copy ${label.toLowerCase()}`)
      }
    }}
  >
    Copy
  </Button>
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

const AbandonedCheckoutDetailPage = () => {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-abandoned-checkout", id],
    queryFn: () => abandonedCheckoutClient.get(id!),
    enabled: Boolean(id),
  })

  const checkout = data?.checkout

  const saveNotesMutation = useMutation({
    mutationFn: () =>
      abandonedCheckoutClient.updateNotes(id!, notes.trim() || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-abandoned-checkout", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-abandoned-checkouts"] })
      toast.success("Notes saved")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const sendEmailMutation = useMutation({
    mutationFn: () => abandonedCheckoutClient.sendRecoveryEmail(id!),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin-abandoned-checkout", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-abandoned-checkouts"] })

      if (response.sent) {
        toast.success(`Recovery email sent to ${response.sent_to}`)
      } else {
        toast.error(response.error ?? "Failed to send recovery email")
      }
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>Loading checkout...</Text>
      </Container>
    )
  }

  if (error || !checkout) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">
          {(error as Error)?.message ?? "Checkout not found"}
        </Text>
      </Container>
    )
  }

  const currentNotes = notes || checkout.admin_notes || ""
  const shippingLines = formatAddress(checkout.shipping_address)
  const billingLines = checkout.billing_same_as_shipping
    ? null
    : formatAddress(checkout.billing_address)

  return (
    <Container className="flex flex-col gap-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Heading level="h1">#{checkout.display_id}</Heading>
            <Badge
              color={checkout.recovery_status === "recovered" ? "green" : "orange"}
              size="2xsmall"
            >
              {checkout.recovery_status === "recovered"
                ? "Recovered"
                : "Not recovered"}
            </Badge>
          </div>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            {formatCheckoutDateLong(checkout.created_at, checkout.region_label)}
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/orders/abandoned-checkouts"
            className="text-sm text-ui-fg-interactive hover:underline"
          >
            Back to list
          </Link>
          <CopyButton value={checkout.checkout_url} label="Checkout URL" />
          <Button size="small" variant="secondary" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-y-6">
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-base">
            <div className="flex items-center justify-between border-b border-ui-border-base px-5 py-4">
              <div>
                <Heading level="h2">Checkout details</Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  From online store
                </Text>
              </div>
              <CopyButton value={checkout.checkout_url} label="Checkout URL" />
            </div>

            <div className="divide-y divide-ui-border-base">
              {checkout.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 px-5 py-4"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title ?? "Product"}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        No image
                      </Text>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text weight="plus">{item.title}</Text>
                    {item.subtitle && (
                      <Text size="small" className="text-ui-fg-subtle">
                        {item.subtitle}
                      </Text>
                    )}
                    {item.sku && (
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        SKU {item.sku}
                      </Text>
                    )}
                    <Text size="small" className="mt-2 text-ui-fg-subtle">
                      {formatCheckoutMoney(item.unit_price, checkout.currency_code)}{" "}
                      × {item.quantity}
                    </Text>
                  </div>
                  <Text weight="plus">
                    {formatCheckoutMoney(item.line_total, checkout.currency_code)}
                  </Text>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-ui-border-base px-5 py-4">
              <div className="flex justify-between">
                <Text size="small" className="text-ui-fg-subtle">
                  Subtotal · {checkout.item_count}{" "}
                  {checkout.item_count === 1 ? "item" : "items"}
                </Text>
                <Text size="small">
                  {formatCheckoutMoney(
                    checkout.item_subtotal,
                    checkout.currency_code
                  )}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text size="small" className="text-ui-fg-subtle">
                  Shipping
                  {checkout.shipping_method ? ` · ${checkout.shipping_method}` : ""}
                </Text>
                <Text size="small">
                  {formatCheckoutMoney(
                    checkout.shipping_subtotal,
                    checkout.currency_code
                  )}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text size="small" className="text-ui-fg-subtle">
                  Estimated tax
                </Text>
                <Text size="small">
                  {formatCheckoutMoney(checkout.tax_total, checkout.currency_code)}
                </Text>
              </div>
              {checkout.discount_subtotal > 0 && (
                <div className="flex justify-between">
                  <Text size="small" className="text-ui-fg-subtle">
                    Discount
                  </Text>
                  <Text size="small">
                    -
                    {formatCheckoutMoney(
                      checkout.discount_subtotal,
                      checkout.currency_code
                    )}
                  </Text>
                </div>
              )}
              <div className="flex justify-between border-t border-ui-border-base pt-3">
                <Text weight="plus">Total</Text>
                <Text weight="plus">
                  {formatCheckoutMoney(checkout.total, checkout.currency_code)}
                </Text>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-ui-border-base bg-ui-bg-subtle px-5 py-4">
              <Text weight="plus">To be paid by customer</Text>
              <Text weight="plus">
                {formatCheckoutMoney(checkout.total, checkout.currency_code)}
              </Text>
            </div>
          </div>

          <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
            <Heading level="h2" className="mb-3">
              Notes
            </Heading>
            <Label htmlFor="admin_notes" className="sr-only">
              Notes
            </Label>
            <Textarea
              id="admin_notes"
              placeholder="Add a note to this checkout"
              value={currentNotes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="small"
                isLoading={saveNotesMutation.isPending}
                onClick={() => saveNotesMutation.mutate()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
            <Heading level="h2" className="mb-4">
              Customer
            </Heading>
            <div className="space-y-4">
              <div>
                <Text size="xsmall" className="text-ui-fg-subtle uppercase">
                  Customer
                </Text>
                {checkout.customer_id ? (
                  <Link
                    to={`/customers/${checkout.customer_id}`}
                    className="mt-1 block text-ui-fg-interactive hover:underline"
                  >
                    {checkout.customer_name}
                  </Link>
                ) : (
                  <Text className="mt-1">{checkout.customer_name}</Text>
                )}
                <Text size="small" className="text-ui-fg-subtle">
                  {checkout.has_account ? "Registered account" : "No account"}
                </Text>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <Text size="xsmall" className="text-ui-fg-subtle uppercase">
                    Contact information
                  </Text>
                  {checkout.email && (
                    <CopyButton value={checkout.email} label="Email" />
                  )}
                </div>
                <Text className="mt-1">{checkout.email || "—"}</Text>
              </div>

              <div>
                <Text size="xsmall" className="text-ui-fg-subtle uppercase">
                  Shipping address
                </Text>
                {shippingLines ? (
                  <div className="mt-1 space-y-0.5">
                    {shippingLines.map((line) => (
                      <Text key={line} size="small">
                        {line}
                      </Text>
                    ))}
                  </div>
                ) : (
                  <Text className="mt-1 text-ui-fg-subtle">No shipping address</Text>
                )}
              </div>

              <div>
                <Text size="xsmall" className="text-ui-fg-subtle uppercase">
                  Billing address
                </Text>
                {checkout.billing_same_as_shipping ? (
                  <Text className="mt-1 text-ui-fg-subtle">
                    Same as shipping address
                  </Text>
                ) : billingLines ? (
                  <div className="mt-1 space-y-0.5">
                    {billingLines.map((line) => (
                      <Text key={line} size="small">
                        {line}
                      </Text>
                    ))}
                  </div>
                ) : (
                  <Text className="mt-1 text-ui-fg-subtle">No billing address</Text>
                )}
              </div>

              {checkout.recovered_order_id && (
                <div>
                  <Text size="xsmall" className="text-ui-fg-subtle uppercase">
                    Recovered order
                  </Text>
                  <Link
                    to={`/orders/${checkout.recovered_order_id}`}
                    className="mt-1 block text-ui-fg-interactive hover:underline"
                  >
                    {checkout.recovered_order_id}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
            <Heading level="h2" className="mb-1">
              Automations
            </Heading>
            <Text size="small" className="mb-4 text-ui-fg-subtle">
              Manual recovery actions for this checkout. Emails are never sent
              automatically — you choose when to send.
            </Text>

            <div className="rounded-lg border border-ui-border-base">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border-base px-4 py-3">
                <div>
                  <Text weight="plus">Recover abandoned checkout</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    Send a reminder email via B2B SMTP
                  </Text>
                </div>
                <Button
                  size="small"
                  isLoading={sendEmailMutation.isPending}
                  disabled={
                    !checkout.email ||
                    !checkout.email_configured ||
                    checkout.recovery_status === "recovered"
                  }
                  onClick={() => {
                    const confirmMessage =
                      checkout.recovery_email_status === "sent"
                        ? `Send another recovery email to ${checkout.email}?`
                        : `Send recovery email to ${checkout.email}?`

                    if (window.confirm(confirmMessage)) {
                      sendEmailMutation.mutate()
                    }
                  }}
                >
                  Send recovery email
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Text size="small">You left items in your checkout</Text>
                </div>
                <RecoveryEmailBadge status={checkout.recovery_email_status} />
              </div>
            </div>

            {!checkout.email_configured && (
              <Text size="small" className="mt-3 text-ui-fg-subtle">
                SMTP is not configured. Set up email in{" "}
                <Link
                  to="/b2b/settings"
                  className="text-ui-fg-interactive hover:underline"
                >
                  B2B → Settings → Email
                </Link>{" "}
                before sending.
              </Text>
            )}

            {!checkout.email && (
              <Text size="small" className="mt-3 text-ui-fg-subtle">
                This checkout has no customer email address.
              </Text>
            )}

            {checkout.recovery_email_sent_at && (
              <Text size="small" className="mt-3 text-ui-fg-subtle">
                Last sent{" "}
                {new Date(checkout.recovery_email_sent_at).toLocaleString()}
                {checkout.recovery_email_sent_to
                  ? ` to ${checkout.recovery_email_sent_to}`
                  : ""}
              </Text>
            )}

            {checkout.recovery_email_error &&
              checkout.recovery_email_status === "failed" && (
                <Text size="small" className="mt-2 text-ui-fg-error">
                  {checkout.recovery_email_error}
                </Text>
              )}

            <div className="mt-4 border-t border-ui-border-base pt-4">
              <Text size="small" className="text-ui-fg-subtle">
                Or share the checkout link directly:
              </Text>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Text size="small" className="break-all font-mono">
                  {checkout.checkout_url}
                </Text>
                <CopyButton value={checkout.checkout_url} label="Checkout URL" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Abandoned checkout detail",
  link: false,
})

export default AbandonedCheckoutDetailPage
