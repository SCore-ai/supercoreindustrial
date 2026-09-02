import { MedusaContainer } from "@medusajs/framework/types"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { notifyRegistrationApproved } from "./email/notifications"
import {
  buildTradeAccountPasswordSetupUrl,
  provisionApprovedTradeAccount,
} from "./trade-account-provisioning"

export async function resendTradeAccountWelcomeEmail(
  scope: MedusaContainer,
  companyId: string
) {
  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  const company = await b2bService.retrieveCompanyWithMembers(companyId)

  if (company.status !== "approved") {
    throw new Error("Only approved trade accounts can receive welcome emails")
  }

  const provisioned = await provisionApprovedTradeAccount(scope, {
    companyId: company.id,
    email: company.email,
    name: company.name,
    primaryCustomerId: company.primary_customer_id,
  })

  await notifyRegistrationApproved(scope, {
    companyId: company.id,
    name: company.name,
    email: company.email,
    passwordSetupUrl: provisioned.resetToken
      ? buildTradeAccountPasswordSetupUrl(
          provisioned.resetToken,
          company.email
        )
      : null,
  })

  return {
    company,
    primary_customer_id: provisioned.customerId,
    password_setup_sent: Boolean(provisioned.resetToken),
  }
}
