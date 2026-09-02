import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import {
  buildPasswordResetUrl,
  generatePasswordResetToken,
} from "./password-reset"

type ProvisionInput = {
  companyId: string
  email: string
  name: string
  primaryCustomerId?: string | null
}

export async function findCustomerByEmail(
  scope: MedusaContainer,
  email: string
): Promise<{ id: string; has_account?: boolean } | null> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: Array<{ id: string; has_account?: boolean }> }>
  }

  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "has_account"],
    filters: { email },
  })

  return data[0] ?? null
}

export async function ensureCustomerRecord(
  scope: MedusaContainer,
  email: string,
  name: string
) {
  const existing = await findCustomerByEmail(scope, email)

  if (existing) {
    return existing.id
  }

  const { result } = await createCustomersWorkflow(scope).run({
    input: {
      customersData: [
        {
          email,
          first_name: name,
          has_account: true,
        },
      ],
    },
  })

  return result[0]?.id ?? null
}

async function linkCompanyToCustomer(
  scope: MedusaContainer,
  companyId: string,
  customerId: string,
  email: string
) {
  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService

  await b2bService.updateB2bCompanies({
    id: companyId,
    primary_customer_id: customerId,
  })

  const members = await b2bService.listB2bCompanyMembers({
    company_id: companyId,
    is_primary: true,
  })

  const [primaryMember] = members

  if (primaryMember) {
    await b2bService.updateB2bCompanyMembers({
      id: primaryMember.id,
      customer_id: customerId,
      email,
      status: "active",
    })
    return
  }

  await b2bService.createB2bCompanyMembers([
    {
      company_id: companyId,
      customer_id: customerId,
      email,
      role: "admin",
      is_primary: true,
      status: "active",
    },
  ])
}

export async function provisionApprovedTradeAccount(
  scope: MedusaContainer,
  input: ProvisionInput
): Promise<{ customerId: string; resetToken: string | null }> {
  const email = input.email.trim().toLowerCase()
  const customerId =
    input.primaryCustomerId ??
    (await ensureCustomerRecord(scope, email, input.name))

  if (!customerId) {
    throw new Error("Failed to create or resolve customer for trade account")
  }

  await linkCompanyToCustomer(scope, input.companyId, customerId, email)

  const resetToken = await generatePasswordResetToken(scope, email, "customer")
  return { customerId, resetToken }
}

export function buildTradeAccountPasswordSetupUrl(
  resetToken: string,
  email: string
) {
  return buildPasswordResetUrl("customer", resetToken, email)
}
