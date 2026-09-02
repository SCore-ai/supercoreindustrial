import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"

type RejectB2bCompanyInput = {
  company_id: string
  admin_notes?: string | null
}

const rejectB2bCompanyStep = createStep(
  "reject-b2b-company",
  async (input: RejectB2bCompanyInput, { container }) => {
    const b2bService: B2bModuleService = container.resolve(B2B_MODULE)
    const company = await b2bService.rejectCompany(
      input.company_id,
      input.admin_notes
    )

    const eventBus = container.resolve(Modules.EVENT_BUS)
    await eventBus.emit({
      name: "b2b.company.rejected",
      data: {
        id: company.id,
        email: company.email,
      },
    })

    return new StepResponse(company)
  }
)

export const rejectB2bCompanyWorkflow = createWorkflow(
  "reject-b2b-company",
  (input: RejectB2bCompanyInput) => {
    const company = rejectB2bCompanyStep(input)
    return new WorkflowResponse(company)
  }
)

export default rejectB2bCompanyWorkflow
