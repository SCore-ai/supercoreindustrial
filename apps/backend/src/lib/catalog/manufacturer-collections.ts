import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  MANUFACTURER_LIST,
  type ManufacturerDefinition,
  type ManufacturerId,
} from "./manufacturers"

export async function ensureManufacturerCollection(
  scope: MedusaContainer,
  manufacturer: ManufacturerDefinition
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
  })
  const existing = (
    data as Array<{ id: string; handle?: string | null }>
  ).find((collection) => collection.handle === manufacturer.id)

  if (existing?.id) {
    return existing.id
  }

  const productModule = scope.resolve(Modules.PRODUCT) as {
    createProductCollections: (
      data: Array<{ title: string; handle: string }>
    ) => Promise<Array<{ id: string }>>
  }
  const created = await productModule.createProductCollections([
    {
      title: manufacturer.name,
      handle: manufacturer.id,
    },
  ])
  return created[0]?.id
}

export async function ensureAllManufacturerCollections(
  scope: MedusaContainer
): Promise<Map<ManufacturerId, string>> {
  const ids = new Map<ManufacturerId, string>()
  for (const manufacturer of MANUFACTURER_LIST) {
    const id = await ensureManufacturerCollection(scope, manufacturer)
    if (id) {
      ids.set(manufacturer.id, id)
    }
  }
  return ids
}

export async function listManufacturerProducts(
  scope: MedusaContainer,
  manufacturerId: string,
  fields: string[],
  take = 3000
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
    filters: { handle: manufacturerId },
  })
  const collectionId = (collections?.[0] as { id?: string } | undefined)?.id
  if (!collectionId) {
    return []
  }

  const { data } = await query.graph({
    entity: "product",
    fields,
    filters: { collection_id: collectionId },
    pagination: { take },
  })

  return data ?? []
}
