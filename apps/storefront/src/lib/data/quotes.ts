"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getQuoteId,
  removeQuoteId,
  setQuoteId,
} from "./cookies"
import { getRegion } from "./regions"

export type StoreQuoteLineItem = {
  id: string
  quote_id: string
  variant_id: string
  product_id?: string | null
  quantity: number
  sku?: string | null
  mpn?: string | null
  title?: string | null
  metadata?: Record<string, unknown> | null
}

export type StoreQuote = {
  id: string
  status: "draft" | "submitted"
  email?: string | null
  company?: string | null
  project?: string | null
  notes?: string | null
  region_id?: string | null
  items: StoreQuoteLineItem[]
}

export async function retrieveQuote(quoteId?: string) {
  const id = quoteId || (await getQuoteId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("quotes")),
  }

  return sdk.client
    .fetch<{ quote: StoreQuote }>(`/store/quotes/${id}`, {
      method: "GET",
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ quote }) => quote)
    .catch(() => null)
}

export async function getOrSetQuote(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let quote = await retrieveQuote(undefined)

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!quote) {
    const { quote: created } = await sdk.client.fetch<{ quote: StoreQuote }>(
      "/store/quotes",
      {
        method: "POST",
        body: { region_id: region.id },
        headers,
      }
    )

    quote = created
    await setQuoteId(quote.id)

    const quoteCacheTag = await getCacheTag("quotes")
    revalidateTag(quoteCacheTag)
  } else if (quote.region_id !== region.id) {
    await sdk.client.fetch<{ quote: StoreQuote }>(`/store/quotes/${quote.id}`, {
      method: "PATCH",
      body: { region_id: region.id },
      headers,
    })

    const quoteCacheTag = await getCacheTag("quotes")
    revalidateTag(quoteCacheTag)
  }

  return quote
}

export async function addToQuote({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to quote")
  }

  const quote = await getOrSetQuote(countryCode)

  if (!quote) {
    throw new Error("Error retrieving or creating quote")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.client
    .fetch(`/store/quotes/${quote.id}/line-items`, {
      method: "POST",
      body: {
        variant_id: variantId,
        quantity,
      },
      headers,
    })
    .then(async () => {
      const quoteCacheTag = await getCacheTag("quotes")
      revalidateTag(quoteCacheTag)
    })
    .catch(medusaError)
}

export async function updateQuoteLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  const quoteId = await getQuoteId()

  if (!quoteId) {
    throw new Error("Missing quote ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch(`/store/quotes/${quoteId}/line-items/${lineId}`, {
      method: "PATCH",
      body: { quantity },
      headers,
    })
    .then(async () => {
      const quoteCacheTag = await getCacheTag("quotes")
      revalidateTag(quoteCacheTag)
    })
    .catch(medusaError)
}

export async function deleteQuoteLineItem(lineId: string) {
  const quoteId = await getQuoteId()

  if (!quoteId) {
    throw new Error("Missing quote ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch(`/store/quotes/${quoteId}/line-items/${lineId}`, {
      method: "DELETE",
      headers,
    })
    .then(async () => {
      const quoteCacheTag = await getCacheTag("quotes")
      revalidateTag(quoteCacheTag)
    })
    .catch(medusaError)
}

export type BulkAddToQuoteFailure = {
  line?: number
  sku?: string
  quantity?: number
  reason: string
  raw?: string
}

export type BulkAddToQuoteResult = {
  added_count: number
  parse_failures: BulkAddToQuoteFailure[]
  resolution_failures: BulkAddToQuoteFailure[]
}

export async function bulkAddToQuote({
  countryCode,
  rows,
  csv,
}: {
  countryCode: string
  rows?: Array<{ sku: string; quantity: number }>
  csv?: string
}) {
  if (!rows?.length && !csv?.trim()) {
    throw new Error("Enter at least one SKU or provide CSV content")
  }

  const quote = await getOrSetQuote(countryCode)

  if (!quote) {
    throw new Error("Error retrieving or creating quote")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await sdk.client
    .fetch<{
      added_count: number
      parse_failures: BulkAddToQuoteFailure[]
      resolution_failures: BulkAddToQuoteFailure[]
    }>(`/store/quotes/${quote.id}/bulk-line-items`, {
      method: "POST",
      body: {
        rows,
        csv,
      },
      headers,
    })
    .catch(medusaError)

  const quoteCacheTag = await getCacheTag("quotes")
  revalidateTag(quoteCacheTag)

  return {
    added_count: response.added_count,
    parse_failures: response.parse_failures ?? [],
    resolution_failures: response.resolution_failures ?? [],
  } satisfies BulkAddToQuoteResult
}

export async function submitQuote(input: {
  email: string
  company?: string
  project?: string
  notes?: string
}) {
  const quoteId = await getQuoteId()

  if (!quoteId) {
    throw new Error("No quote to submit")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const { quote } = await sdk.client
    .fetch<{ quote: StoreQuote }>(`/store/quotes/${quoteId}/submit`, {
      method: "POST",
      body: input,
      headers,
    })
    .catch(medusaError)

  await removeQuoteId()

  const quoteCacheTag = await getCacheTag("quotes")
  revalidateTag(quoteCacheTag)

  return quote
}
