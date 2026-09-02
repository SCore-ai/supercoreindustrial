import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import {
  assignCustomerToGroup,
  linkCustomersToGroup,
} from "../../lib/b2b/medusa-integrations"

type AssignCompanyCustomerGroupInput = {
  company_id: string
  customer_group_id: string | null
}

const assignCompanyCustomerGroupStep = createStep(
  "assign-company-customer-group",
  async (input: AssignCompanyCustomerGroupInput, { container }) => {
    const b2bService: B2bModuleService = container.resolve(B2B_MODULE)
    const company = await b2bService.retrieveCompanyWithMembers(input.company_id)
    const previousGroupId = company.customer_group_id ?? null
    const nextGroupId = input.customer_group_id
    const customerIds = [
      ...new Set(
        [
          company.primary_customer_id,
          ...company.members.map((member) => member.customer_id),
        ].filter((id): id is string => Boolean(id))
      ),
    ]

    const updated = await b2bService.updateCompany({
      id: input.company_id,
      customer_group_id: nextGroupId,
    })

    if (previousGroupId && previousGroupId !== nextGroupId && customerIds.length) {
      await linkCustomersToGroup(container, previousGroupId, {
        remove: customerIds,
      })
    }

    if (nextGroupId) {
      for (const customerId of customerIds) {
        await assignCustomerToGroup(container, customerId, nextGroupId)
      }
    }

    return new StepResponse(updated)
  }
)

export const assignCompanyCustomerGroupWorkflow = createWorkflow(
  "assign-company-customer-group",
  (input: AssignCompanyCustomerGroupInput) => {
    const company = assignCompanyCustomerGroupStep(input)
    return new WorkflowResponse(company)
  }
)

export default assignCompanyCustomerGroupWorkflow
