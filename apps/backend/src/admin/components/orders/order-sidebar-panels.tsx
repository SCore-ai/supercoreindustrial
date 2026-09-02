import {
  Button,
  Input,
  Text,
  Textarea,
} from "@medusajs/ui"
import { useState } from "react"
import { Link } from "react-router-dom"
import type { AdminOrderDetail, OrderAddressRecord } from "../../lib/orders-types"
import { formatOrderAddressLines } from "../../lib/orders-utils"
import OrderRiskBar from "./order-risk-bar"

const SidebarCard = ({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) => (
  <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
    <div className="mb-3 flex items-center justify-between gap-2">
      <Text size="small" weight="plus">
        {title}
      </Text>
      {action}
    </div>
    {children}
  </div>
)

const AddressEditor = ({
  value,
  onChange,
  onSave,
  saving,
}: {
  value: OrderAddressRecord
  onChange: (next: OrderAddressRecord) => void
  onSave: () => void
  saving?: boolean
}) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <Input
        placeholder="First name"
        value={value.first_name ?? ""}
        onChange={(event) =>
          onChange({ ...value, first_name: event.target.value })
        }
      />
      <Input
        placeholder="Last name"
        value={value.last_name ?? ""}
        onChange={(event) =>
          onChange({ ...value, last_name: event.target.value })
        }
      />
    </div>
    <Input
      placeholder="Company"
      value={value.company ?? ""}
      onChange={(event) => onChange({ ...value, company: event.target.value })}
    />
    <Input
      placeholder="Address"
      value={value.address_1 ?? ""}
      onChange={(event) => onChange({ ...value, address_1: event.target.value })}
    />
    <Input
      placeholder="Address line 2"
      value={value.address_2 ?? ""}
      onChange={(event) => onChange({ ...value, address_2: event.target.value })}
    />
    <div className="grid grid-cols-2 gap-2">
      <Input
        placeholder="City"
        value={value.city ?? ""}
        onChange={(event) => onChange({ ...value, city: event.target.value })}
      />
      <Input
        placeholder="Postal code"
        value={value.postal_code ?? ""}
        onChange={(event) =>
          onChange({ ...value, postal_code: event.target.value })
        }
      />
    </div>
    <Input
      placeholder="Country code"
      value={value.country_code ?? ""}
      onChange={(event) =>
        onChange({ ...value, country_code: event.target.value })
      }
    />
    <Input
      placeholder="Phone"
      value={value.phone ?? ""}
      onChange={(event) => onChange({ ...value, phone: event.target.value })}
    />
    <Button size="small" isLoading={saving} onClick={onSave}>
      Save address
    </Button>
  </div>
)

export const OrderNotesPanel = ({
  order,
  onSaveNotes,
  saving,
}: {
  order: AdminOrderDetail
  onSaveNotes: (notes: string) => void
  saving?: boolean
}) => {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(order.customer_notes ?? "")

  return (
    <SidebarCard
      title="Notes"
      action={
        !editing ? (
          <button
            type="button"
            className="text-xs text-ui-fg-interactive hover:underline"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        ) : null
      }
    >
      {editing ? (
        <div className="space-y-2">
          <Textarea
            rows={4}
            placeholder="No notes from customer"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="small"
              isLoading={saving}
              onClick={() => {
                onSaveNotes(notes)
                setEditing(false)
              }}
            >
              Save
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                setNotes(order.customer_notes ?? "")
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Text size="small" className="text-ui-fg-subtle whitespace-pre-wrap">
          {order.customer_notes?.trim() || "No notes from customer"}
        </Text>
      )}
    </SidebarCard>
  )
}

export const OrderCustomerPanel = ({
  order,
  onSaveEmail,
  onSaveShipping,
  onRemoveCustomer,
  saving,
}: {
  order: AdminOrderDetail
  onSaveEmail: (email: string) => void
  onSaveShipping: (address: OrderAddressRecord) => void
  onRemoveCustomer: () => void
  saving?: boolean
}) => {
  const [editContact, setEditContact] = useState(false)
  const [editShipping, setEditShipping] = useState(false)
  const [email, setEmail] = useState(order.email ?? "")
  const [shipping, setShipping] = useState<OrderAddressRecord>(
    order.shipping_address ?? {}
  )

  const shippingLines = formatOrderAddressLines(order.shipping_address)
  const billingLines = order.billing_same_as_shipping
    ? null
    : formatOrderAddressLines(order.billing_address)

  const mapQuery = [
    order.shipping_address?.address_1,
    order.shipping_address?.city,
    order.shipping_address?.postal_code,
    order.shipping_address?.country_code,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <SidebarCard title="Customer">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <Text size="small" weight="plus">
              {order.customer_name || "Guest customer"}
            </Text>
            {order.customer_id && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                {order.conversion.customer_order_count} orders
              </Text>
            )}
          </div>
          {order.customer_id && (
            <Link
              to={`/customers/${order.customer_id}`}
              className="text-xs text-ui-fg-interactive hover:underline"
            >
              View customer profile
            </Link>
          )}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <Text size="xsmall" className="text-ui-fg-subtle uppercase">
              Contact information
            </Text>
            <button
              type="button"
              className="text-xs text-ui-fg-interactive hover:underline"
              onClick={() => setEditContact((current) => !current)}
            >
              Edit contact information
            </button>
          </div>
          {editContact ? (
            <div className="space-y-2">
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
              <Button
                size="small"
                isLoading={saving}
                onClick={() => {
                  onSaveEmail(email)
                  setEditContact(false)
                }}
              >
                Save email
              </Button>
            </div>
          ) : (
            <Text size="small">{order.email || "No email"}</Text>
          )}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <Text size="xsmall" className="text-ui-fg-subtle uppercase">
              Shipping address
            </Text>
            <button
              type="button"
              className="text-xs text-ui-fg-interactive hover:underline"
              onClick={() => setEditShipping((current) => !current)}
            >
              Edit shipping address
            </button>
          </div>
          {editShipping ? (
            <AddressEditor
              value={shipping}
              onChange={setShipping}
              saving={saving}
              onSave={() => {
                onSaveShipping(shipping)
                setEditShipping(false)
              }}
            />
          ) : shippingLines.length ? (
            <div className="space-y-0.5">
              {shippingLines.map((line) => (
                <Text key={line} size="small">
                  {line}
                </Text>
              ))}
              {mapQuery && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-ui-fg-interactive hover:underline"
                >
                  View map
                </a>
              )}
            </div>
          ) : (
            <Text size="small" className="text-ui-fg-subtle">
              No shipping address
            </Text>
          )}
        </div>

        <div>
          <Text size="xsmall" className="mb-1 text-ui-fg-subtle uppercase">
            Billing address
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            {order.billing_same_as_shipping
              ? "Same as shipping address"
              : billingLines?.length
                ? billingLines.join(", ")
                : "Different billing address not set"}
          </Text>
        </div>

        {order.customer_id && (
          <Button
            size="small"
            variant="danger"
            isLoading={saving}
            onClick={() => {
              if (window.confirm("Remove customer from this order?")) {
                onRemoveCustomer()
              }
            }}
          >
            Remove customer
          </Button>
        )}
      </div>
    </SidebarCard>
  )
}

export const OrderConversionPanel = ({ order }: { order: AdminOrderDetail }) => (
  <SidebarCard title="Conversion summary">
    <div className="space-y-2">
      {order.conversion.summary_lines.map((line) => (
        <Text key={line} size="small" className="text-ui-fg-subtle">
          {line}
        </Text>
      ))}
    </div>
  </SidebarCard>
)

export const OrderRiskPanel = ({ order }: { order: AdminOrderDetail }) => (
  <OrderRiskBar risk={order.risk} />
)

export const OrderTagsPanel = ({
  order,
  onSaveTags,
  saving,
}: {
  order: AdminOrderDetail
  onSaveTags: (tags: string[]) => void
  saving?: boolean
}) => {
  const [value, setValue] = useState(order.tags.join(", "))

  return (
    <SidebarCard title="Tags">
      <div className="space-y-2">
        <Input
          placeholder="Comma-separated tags"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button
          size="small"
          variant="secondary"
          isLoading={saving}
          onClick={() =>
            onSaveTags(
              value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            )
          }
        >
          Save tags
        </Button>
      </div>
    </SidebarCard>
  )
}
