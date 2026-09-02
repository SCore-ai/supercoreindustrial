import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { linkCustomersToGroup } from "../../../../../../lib/b2b/medusa-integrations"
import { auditFromRequest } from "../../../../../../lib/security/audit"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as {
    add?: string[]
    remove?: string[]
  }

  const add = body.add ?? []
  const remove = body.remove ?? []

  if (!add.length && !remove.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Provide customer ids to add or remove"
    )
  }

  await linkCustomersToGroup(req.scope, id, { add, remove })

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "b2b.group.customers_updated",
    resource_type: "customer_group",
    resource_id: id,
    summary: `Updated group customers (+${add.length} / -${remove.length})`,
    metadata: { added: add.length, removed: remove.length },
  })

  res.json({ id, added: add.length, removed: remove.length })
}
