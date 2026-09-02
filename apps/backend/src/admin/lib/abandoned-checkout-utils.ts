import type { AbandonedCheckoutSummary } from "./abandoned-checkout-types"

export function formatCheckoutMoney(
  amount: number,
  currencyCode: string
) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}

export function formatCheckoutDate(value: string) {
  const date = new Date(value)
  const now = new Date()
  const sameWeek =
    Math.abs(now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000

  if (sameWeek) {
    return date.toLocaleString("en-GB", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return date.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatCheckoutDateLong(value: string, regionLabel?: string) {
  const date = new Date(value)

  return `${regionLabel ? `${regionLabel}, ` : ""}${date.toLocaleString("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`
}

export function exportCheckoutsCsv(checkouts: AbandonedCheckoutSummary[]) {
  const headers = [
    "Checkout",
    "Created",
    "Customer",
    "Email",
    "Region",
    "Recovery status",
    "Total",
    "Currency",
    "Items",
  ]

  const rows = checkouts.map((checkout) => [
    checkout.display_id,
    checkout.created_at,
    checkout.customer_name,
    checkout.customer_email ?? "",
    checkout.region_label,
    checkout.recovery_status,
    String(checkout.total),
    checkout.currency_code.toUpperCase(),
    String(checkout.item_count),
  ])

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `abandoned-checkouts-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function formatAddress(
  address?: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    address_2?: string | null
    city?: string | null
    postal_code?: string | null
    province?: string | null
    country_code?: string | null
    phone?: string | null
  } | null
) {
  if (!address) {
    return null
  }

  const lines = [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    address.address_1,
    address.address_2,
    [address.city, address.province, address.postal_code].filter(Boolean).join(" "),
    address.country_code?.toUpperCase(),
    address.phone,
  ].filter(Boolean)

  return lines.length ? lines : null
}
