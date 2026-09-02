import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"

type RejectOrderApprovalInput = {
  approval_id: string
  approved_by_member_id?: string | null
  notes?: string | null
}

const rejectOrderApprovalStep = createStep(
  "reject-b2b-order-approval",
  async (input: RejectOrderApprovalInput, { container }) => {
    const b2bService: B2bModuleService = container.resolve(B2B_MODULE)
    const approval = await b2bService.rejectOrderApproval(
      input.approval_id,
      input.approved_by_member_id,
      input.notes
    )

    const orderModule = container.resolve(Modules.ORDER) as {
      updateOrders: (data: {
        id: string
        metadata: Record<string, unknown>
      }) => Promise<unknown>
      retrieveOrder: (id: string) => Promise<{ metadata?: Record<string, unknown> | null }>
    }

    const order = await orderModule.retrieveOrder(approval.order_id)
    await orderModule.updateOrders({
      id: approval.order_id,
      metadata: {
        ...(order.metadata ?? {}),
        b2b_approval_status: "rejected",
        b2b_approval_id: approval.id,
      },
    })

    const eventBus = container.resolve(Modules.EVENT_BUS)
    await eventBus.emit({
      name: "b2b.order.rejected",
      data: { order_id: approval.order_id, approval_id: approval.id },
    })

    return new StepResponse(approval)
  }
)

export const rejectOrderApprovalWorkflow = createWorkflow(
  "reject-b2b-order-approval",
  (input: RejectOrderApprovalInput) => {
    const approval = rejectOrderApprovalStep(input)
    return new WorkflowResponse(approval)
  }
)

export default rejectOrderApprovalWorkflow
