import { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { notifyB2bAccessInvite } from "./email/notifications"
import { assignCustomerToGroup } from "./medusa-integrations"
import {
  generatePasswordResetToken,
} from "./password-reset"
import {
  buildTradeAccountPasswordSetupUrl,
  ensureCustomerRecord,
} from "./trade-account-provisioning"

export type InviteCompanyMemberInput = {
  company_id: string
  email: string
  role?: "admin" | "buyer" | "approver"
  first_name?: string | null
  last_name?: string | null
}

const VALID_ROLES = new Set(["admin", "buyer", "approver"])

export function serializeStoreMember(member: {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  role: string
  status: string
  is_primary: boolean
  created_at?: Date | string
}) {
  return {
    id: member.id,
    email: member.email ?? null,
    first_name: member.first_name ?? null,
    last_name: member.last_name ?? null,
    role: member.role,
    status: member.status,
    is_primary: member.is_primary,
    created_at:
      member.created_at instanceof Date
        ? member.created_at.toISOString()
        : member.created_at ?? null,
  }
}

async function sendMemberInviteEmail(
  scope: MedusaContainer,
  input: {
    companyName: string
    email: string
    role: string
  }
) {
  const resetToken = await generatePasswordResetToken(
    scope,
    input.email,
    "customer"
  )
  const passwordSetupUrl = resetToken
    ? buildTradeAccountPasswordSetupUrl(resetToken, input.email)
    : null

  await notifyB2bAccessInvite(scope, {
    companyName: input.companyName,
    email: input.email,
    role: input.role,
    passwordSetupUrl,
  })

  return Boolean(passwordSetupUrl)
}

export async function inviteCompanyMember(
  scope: MedusaContainer,
  input: InviteCompanyMemberInput
) {
  const email = input.email.trim().toLowerCase()
  const role = input.role ?? "buyer"

  if (!email) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Email is required"
    )
  }

  if (!VALID_ROLES.has(role)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Role must be admin, buyer, or approver"
    )
  }

  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  const company = await b2bService.retrieveCompanyWithMembers(input.company_id)

  const alreadyInCompany = company.members.some(
    (member) => member.email?.trim().toLowerCase() === email
  )

  if (alreadyInCompany) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "This email is already a member of the company"
    )
  }

  const [existingElsewhere] = await b2bService.listB2bCompanyMembers(
    { email },
    { take: 5 }
  )

  if (
    existingElsewhere &&
    existingElsewhere.company_id !== input.company_id
  ) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This email already belongs to another trade account"
    )
  }

  const displayName =
    [input.first_name, input.last_name].filter(Boolean).join(" ").trim() ||
    email
  const customerId = await ensureCustomerRecord(scope, email, displayName)

  const member = await b2bService.addMember({
    company_id: input.company_id,
    customer_id: customerId,
    email,
    first_name: input.first_name?.trim() || null,
    last_name: input.last_name?.trim() || null,
    role,
    status: "invited",
  })

  if (customerId && company.customer_group_id) {
    await assignCustomerToGroup(scope, customerId, company.customer_group_id)
  }

  const passwordSetupSent = await sendMemberInviteEmail(scope, {
    companyName: company.name,
    email,
    role: member.role,
  })

  return {
    member,
    password_setup_sent: passwordSetupSent,
  }
}

export async function resendCompanyMemberInvite(
  scope: MedusaContainer,
  memberId: string
) {
  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  const member = await b2bService.retrieveB2bCompanyMember(memberId)
  const email = member.email?.trim().toLowerCase()

  if (!email) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Member has no email to invite"
    )
  }

  const company = await b2bService.retrieveB2bCompany(member.company_id)
  const passwordSetupSent = await sendMemberInviteEmail(scope, {
    companyName: company.name,
    email,
    role: member.role,
  })

  if (member.status === "disabled") {
    await b2bService.updateMember({
      id: member.id,
      status: "invited",
    })
  }

  return {
    member: await b2bService.retrieveB2bCompanyMember(memberId),
    password_setup_sent: passwordSetupSent,
  }
}
