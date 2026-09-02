import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../../modules/b2b"
import B2bModuleService from "../../../../../modules/b2b/service"
import {
  deleteMedusaCustomerGroup,
  updateMedusaCustomerGroup,
} from "../../../../../lib/b2b/medusa-integrations"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { name?: string }
  const name = body.name?.trim()

  if (!name) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Group name is required"
    )
  }

  await updateMedusaCustomerGroup(req.scope, id, name)
  res.json({ id, name })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const companies = await b2bService.listCompaniesForAdmin({
    include_archived: true,
    limit: 200,
    offset: 0,
  })
  const linked = companies.companies.filter(
    (company) => company.customer_group_id === id
  )

  if (linked.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Unassign ${linked.length} compan${linked.length === 1 ? "y" : "ies"} before deleting this group`
    )
  }

  await deleteMedusaCustomerGroup(req.scope, id)
  res.json({ id, deleted: true })
}
