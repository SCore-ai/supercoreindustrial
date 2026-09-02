import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import {
  assignCustomerToGroup,
  resolveTradeAccountGroupId,
} from "../../lib/b2b/medusa-integrations"
import {
  buildTradeAccountPasswordSetupUrl,
  provisionApprovedTradeAccount,
} from "../../lib/b2b/trade-account-provisioning"

type ApproveB2bCompanyInput = {
  company_id: string
  customer_group_id?: string | null
}

const approveB2bCompanyStep = createStep(
  "approve-b2b-company",
  async (input: ApproveB2bCompanyInput, { container }) => {
    const b2bService: B2bModuleService = container.resolve(B2B_MODULE)
    const groupId =
      input.customer_group_id ?? (await resolveTradeAccountGroupId(container))

    const company = await b2bService.approveCompany(
      input.company_id,
      groupId
    )

    if (company.primary_customer_id && groupId) {
      await assignCustomerToGroup(
        container,
        company.primary_customer_id,
        groupId
      )
    }

    const provisioned = await provisionApprovedTradeAccount(container, {
      companyId: company.id,
      email: company.email,
      name: company.name,
      primaryCustomerId: company.primary_customer_id,
    })

    if (provisioned.customerId && groupId) {
      await assignCustomerToGroup(container, provisioned.customerId, groupId)
    }

    const companyWithCustomer = await b2bService.retrieveCompanyWithMembers(
      input.company_id
    )

    const eventBus = container.resolve(Modules.EVENT_BUS)
    await eventBus.emit({
      name: "b2b.company.approved",
      data: {
        id: companyWithCustomer.id,
        email: companyWithCustomer.email,
        name: companyWithCustomer.name,
        customer_group_id: groupId,
        primary_customer_id: provisioned.customerId,
        reset_token: provisioned.resetToken,
        password_setup_url: provisioned.resetToken
          ? buildTradeAccountPasswordSetupUrl(
              provisioned.resetToken,
              companyWithCustomer.email
            )
          : null,
      },
    })

    return new StepResponse(companyWithCustomer)
  }
)

export const approveB2bCompanyWorkflow = createWorkflow(
  "approve-b2b-company",
  (input: ApproveB2bCompanyInput) => {
    const company = approveB2bCompanyStep(input)
    return new WorkflowResponse(company)
  }
)

export default approveB2bCompanyWorkflow
