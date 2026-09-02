import Typesense from "typesense"

export const PRODUCTS_COLLECTION = "products"

export const productsCollectionSchema = {
  name: PRODUCTS_COLLECTION,
  fields: [
    { name: "title", type: "string" as const },
    {
      name: "title_sort",
      type: "string" as const,
      optional: true,
      sort: true,
      index: false,
    },
    { name: "handle", type: "string" as const },
    { name: "description", type: "string" as const, optional: true },
    { name: "thumbnail", type: "string" as const, optional: true },
    { name: "sku", type: "string[]" as const, optional: true },
    { name: "mpn", type: "string[]" as const, optional: true },
    {
      name: "manufacturer",
      type: "string" as const,
      facet: true,
      optional: true,
    },
    { name: "category", type: "string[]" as const, facet: true, optional: true },
    {
      name: "certification",
      type: "string[]" as const,
      facet: true,
      optional: true,
    },
    { name: "has_price", type: "bool" as const, facet: true },
    { name: "in_stock", type: "bool" as const, facet: true, optional: true },
    { name: "price_from", type: "float" as const, optional: true },
    {
      name: "price_from_gbp",
      type: "float" as const,
      optional: true,
      sort: true,
    },
    {
      name: "price_from_eur",
      type: "float" as const,
      optional: true,
      sort: true,
    },
    {
      name: "price_from_usd",
      type: "float" as const,
      optional: true,
      sort: true,
    },
    { name: "status", type: "string" as const, facet: true },
  ],
}

const schemaFieldNames = new Set(
  productsCollectionSchema.fields.map((field) => field.name)
)

let client: Typesense.Client | null = null
let ensured = false

export function getTypesenseClient(): Typesense.Client {
  if (client) {
    return client
  }

  client = new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST || "localhost",
        port: Number(process.env.TYPESENSE_PORT || 8108),
        protocol: process.env.TYPESENSE_PROTOCOL || "http",
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY || "",
    connectionTimeoutSeconds: 5,
  })

  return client
}

async function syncCollectionSchema(typesense: Typesense.Client) {
  let existingFields: string[] = []

  try {
    const collection = await typesense.collections(PRODUCTS_COLLECTION).retrieve()
    existingFields = (collection.fields || []).map((field) => field.name)
  } catch (err: any) {
    if (err?.httpStatus === 404) {
      await typesense.collections().create(productsCollectionSchema as any)
      return
    }
    throw err
  }

  const missingFields = productsCollectionSchema.fields.filter(
    (field) => !existingFields.includes(field.name)
  )

  if (missingFields.length > 0) {
    await typesense.collections(PRODUCTS_COLLECTION).update({
      fields: missingFields as any,
    })
  }
}

export async function ensureProductsCollection(): Promise<void> {
  if (ensured) {
    return
  }

  const typesense = getTypesenseClient()
  await syncCollectionSchema(typesense)
  ensured = true
}

export function isKnownSearchField(name: string) {
  return schemaFieldNames.has(name)
}
