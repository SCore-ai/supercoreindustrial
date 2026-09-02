export type OrderAddressRecord = {
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

export function formatOrderAddress(address?: OrderAddressRecord | null) {
  if (!address) {
    return null
  }

  const lines = [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    address.company,
    address.address_1,
    address.address_2,
    [address.city, address.province, address.postal_code].filter(Boolean).join(", "),
    address.country_code?.toUpperCase(),
    address.phone,
  ].filter(Boolean)

  return lines.length ? lines : null
}

export function addressesMatch(
  shipping?: OrderAddressRecord | null,
  billing?: OrderAddressRecord | null
) {
  if (!shipping || !billing) {
    return false
  }

  const keys: Array<keyof OrderAddressRecord> = [
    "first_name",
    "last_name",
    "company",
    "address_1",
    "address_2",
    "city",
    "province",
    "postal_code",
    "country_code",
    "phone",
  ]

  return keys.every((key) => (shipping[key] ?? "") === (billing[key] ?? ""))
}

export function buildMapUrl(address?: OrderAddressRecord | null) {
  if (!address?.address_1) {
    return null
  }

  const query = [
    address.address_1,
    address.city,
    address.postal_code,
    address.country_code,
  ]
    .filter(Boolean)
    .join(", ")

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
