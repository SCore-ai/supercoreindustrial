import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { listManufacturerProducts } from "../lib/catalog/manufacturer-collections"

export default async function verifyTecnovideoFix({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const products = await listManufacturerProducts(container, "tecnovideo", [
    "handle",
    "description",
    "thumbnail",
    "images.url",
  ])

  const sample = (products as any[]).find(
    (p) => p.handle === "txptv4-ptz-camera-station" || p.handle === "tecnovideo-txptv4"
  )
  const multi = (products as any[]).filter((p) => (p.images || []).length > 1)
  const emptyDesc = (products as any[]).filter(
    (p) => !(p.description || "").trim()
  )
  const external = (products as any[]).filter((p) =>
    /tecnovideocctv\.com/i.test(p.thumbnail || "")
  )

  logger.info(
    `[verify-fix] txptv4 images=${sample?.images?.length} thumb=${sample?.thumbnail} descLen=${(sample?.description || "").length}`
  )
  logger.info(
    `[verify-fix] total=${products.length} multiImage=${multi.length} emptyDesc=${emptyDesc.length} externalThumb=${external.length}`
  )
  if (multi.length) {
    logger.warn(
      `[verify-fix] multi eg ${multi
        .slice(0, 5)
        .map((p) => `${p.handle}:${p.images.length}`)
        .join(", ")}`
    )
  }
}
