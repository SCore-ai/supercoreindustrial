import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { resendCompanyMemberInvite } from "../../lib/b2b/invite-company-member"

type ResendInviteInput = {
  member_id: string
}

const resendB2bMemberInviteStep = createStep(
  "resend-b2b-member-invite",
  async (input: ResendInviteInput, { container }) => {
    const result = await resendCompanyMemberInvite(container, input.member_id)
    return new StepResponse(result)
  }
)

export const resendB2bMemberInviteWorkflow = createWorkflow(
  "resend-b2b-member-invite",
  (input: ResendInviteInput) => {
    const result = resendB2bMemberInviteStep(input)
    return new WorkflowResponse(result)
  }
)

export default resendB2bMemberInviteWorkflow
