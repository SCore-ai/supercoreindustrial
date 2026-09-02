import { MedusaRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService from "../../modules/quote/service"

export function getAuthenticatedCustomerId(req: MedusaRequest): string | null {
  const authContext = req.auth_context as
    | { actor_type?: string; actor_id?: string }
    | undefined

  if (!authContext || authContext.actor_type !== "customer") {
    return null
  }

  return authContext.actor_id ?? null
}

export function requireAuthenticatedCustomer(req: MedusaRequest): string {
  const customerId = getAuthenticatedCustomerId(req)

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Customer authentication is required"
    )
  }

  return customerId
}

export async function resolveCustomerGroupId(
  scope: { resolve: (key: string) => unknown },
  customerId: string | null | undefined
): Promise<string | null> {
  if (!customerId) {
    return null
  }

  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  const company = await b2bService.findCompanyByCustomerId(customerId)

  if (company?.customer_group_id) {
    return company.customer_group_id
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{
      data: Array<{ groups?: Array<{ id: string }> }>
    }>
  }

  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "groups.id"],
    filters: { id: customerId },
  })

  const groups = data[0]?.groups ?? []
  return groups[0]?.id ?? null
}

async function resolveCustomerEmail(
  scope: { resolve: (key: string) => unknown },
  customerId: string
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{
      data: Array<{ email?: string | null }>
    }>
  }

  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "email"],
    filters: { id: customerId },
  })

  return data[0]?.email?.trim().toLowerCase() ?? null
}

export async function resolveStoreB2bContext(
  scope: { resolve: (key: string) => unknown },
  customerId: string
) {
  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  const email = await resolveCustomerEmail(scope, customerId)

  let companyWithMembers = await b2bService.findCompanyByCustomerId(customerId)

  // Guest quote / pending trade accounts often create company members without
  // customer_id. Link on first authenticated visit when emails match.
  if (!companyWithMembers && email) {
    const companyByEmail = await b2bService.findCompanyByCustomerEmail(email)

    if (companyByEmail) {
      companyWithMembers = await b2bService.linkCustomerToCompanyByEmail({
        companyId: companyByEmail.id,
        email,
        customerId,
      })
    }
  }

  let member = companyWithMembers
    ? await b2bService.findMemberByCustomerId(customerId)
    : null

  if (member?.status === "invited") {
    member = await b2bService.updateMember({
      id: member.id,
      status: "active",
      customer_id: customerId,
    })
  }

  let quoteIds: string[] = []

  try {
    const quoteService = scope.resolve(QUOTE_MODULE) as QuoteModuleService
    const quotes = await quoteService.listQuotesForCustomer({
      customer_id: customerId,
      email,
      company_id: companyWithMembers?.id ?? null,
      limit: 200,
      offset: 0,
    })
    quoteIds = quotes.quotes.map((quote) => quote.id)
  } catch {
    quoteIds = []
  }

  return {
    customerId,
    email,
    company: companyWithMembers,
    member,
    companyId: companyWithMembers?.id ?? null,
    quoteIds,
  }
}
