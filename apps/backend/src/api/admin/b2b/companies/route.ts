import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const status = req.query.status as
    | "pending"
    | "approved"
    | "rejected"
    | "suspended"
    | "archived"
    | undefined
  const includeArchived = req.query.include_archived === "true"
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const { companies, count } = await b2bService.listCompaniesForAdmin({
    status,
    include_archived: includeArchived,
    limit,
    offset,
  })

  res.json({ companies, count, limit, offset })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const body = (req.body || {}) as {
    name: string
    email: string
    legal_name?: string | null
    phone?: string | null
    vat_number?: string | null
    registration_number?: string | null
    website?: string | null
    country_code?: string | null
    customer_group_id?: string | null
    primary_customer_id?: string | null
    admin_notes?: string | null
  }

  const company = await b2bService.createCompany(body)
  res.status(201).json({ company })
}
