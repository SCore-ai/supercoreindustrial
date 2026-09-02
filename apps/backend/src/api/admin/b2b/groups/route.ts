import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import {
  createMedusaCustomerGroup,
  listMedusaCustomerGroups,
} from "../../../../lib/b2b/medusa-integrations"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const [groups, companies, tiers] = await Promise.all([
    listMedusaCustomerGroups(req.scope),
    b2bService.listCompaniesForAdmin({
      include_archived: true,
      limit: 200,
      offset: 0,
    }),
    b2bService.listPricingTiersForAdmin({ limit: 200, offset: 0 }),
  ])

  const companiesByGroup = new Map<string, number>()
  for (const company of companies.companies) {
    if (!company.customer_group_id) {
      continue
    }
    companiesByGroup.set(
      company.customer_group_id,
      (companiesByGroup.get(company.customer_group_id) ?? 0) + 1
    )
  }

  const rulesByGroup = new Map<string, number>()
  for (const tier of tiers.tiers) {
    const groupId = tier.customer_group_id || "global"
    rulesByGroup.set(groupId, (rulesByGroup.get(groupId) ?? 0) + 1)
  }

  res.json({
    groups: groups.map((group) => ({
      ...group,
      companies: companiesByGroup.get(group.id) ?? 0,
      pricing_rules: rulesByGroup.get(group.id) ?? 0,
    })),
    unassigned_companies: companies.companies.filter(
      (company) => !company.customer_group_id && company.status !== "archived"
    ).length,
    global_pricing_rules: rulesByGroup.get("global") ?? 0,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as { name?: string }
  const name = body.name?.trim()

  if (!name) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Group name is required"
    )
  }

  const group = await createMedusaCustomerGroup(req.scope, name)
  res.status(201).json({ group })
}
