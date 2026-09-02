import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  inviteCompanyMember,
  type InviteCompanyMemberInput,
} from "../../lib/b2b/invite-company-member"

const inviteB2bCompanyMemberStep = createStep(
  "invite-b2b-company-member",
  async (input: InviteCompanyMemberInput, { container }) => {
    const result = await inviteCompanyMember(container, input)
    return new StepResponse(result)
  }
)

export const inviteB2bCompanyMemberWorkflow = createWorkflow(
  "invite-b2b-company-member",
  (input: InviteCompanyMemberInput) => {
    const result = inviteB2bCompanyMemberStep(input)
    return new WorkflowResponse(result)
  }
)

export default inviteB2bCompanyMemberWorkflow
