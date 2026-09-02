import type { OrderAddressRecord } from "./orders-types"

export function formatOrderMoney(
  amount?: number | null,
  currencyCode?: string | null
) {
  if (amount == null || !currencyCode) {
    return "—"
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100)
}

export function formatOrderDate(value?: string | null) {
  if (!value) {
    return "—"
  }

  return new Date(value).toLocaleString()
}

export function formatOrderDateLong(value?: string | null) {
  if (!value) {
    return "—"
  }

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  })
}

export function orderStatusLabel(status: string) {
  return status.replace(/_/g, " ")
}

export function paymentStatusLabel(status?: string | null) {
  if (!status) {
    return "Unknown"
  }

  return status.replace(/_/g, " ")
}

export function fulfillmentStatusLabel(status?: string | null) {
  if (!status) {
    return "Unknown"
  }

  return status.replace(/_/g, " ")
}

export function formatOrderAddressLines(address?: OrderAddressRecord | null) {
  if (!address) {
    return []
  }

  return [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    address.company,
    address.address_1,
    address.address_2,
    [address.city, address.province, address.postal_code].filter(Boolean).join(", "),
    address.country_code?.toUpperCase(),
    address.phone,
  ].filter(Boolean) as string[]
}

export function buildOrderStatusPageUrl(orderId: string) {
  const base =
    typeof window !== "undefined"
      ? window.location.origin.replace(":9000", ":8000")
      : "http://localhost:8000"

  return `${base}/gb/account/orders/details/${orderId}`
}

export function printOrderDocument(
  title: string,
  html: string
) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700")

  if (!printWindow) {
    throw new Error("Pop-up blocked. Allow pop-ups to print.")
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; color: #111; padding: 24px; }
          h1 { font-size: 20px; margin: 0 0 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          .muted { color: #64748b; font-size: 13px; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
