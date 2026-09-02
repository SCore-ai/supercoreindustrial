import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../modules/b2b"
import B2bModuleService from "../modules/b2b/service"
import { notifyOrderApprovalPending } from "../lib/b2b/email/notifications"

type OrderPlacedEvent = {
  id: string
}

export default async function orderPlacedB2bHandler({
  event,
  container,
}: SubscriberArgs<OrderPlacedEvent>) {
  const logger = container.resolve("logger")
  const b2bService: B2bModuleService = container.resolve(B2B_MODULE)

  const orderModule = container.resolve(Modules.ORDER) as {
    retrieveOrder: (id: string) => Promise<{
      id: string
      customer_id?: string | null
      metadata?: Record<string, unknown> | null
    }>
    updateOrders: (data: {
      id: string
      metadata: Record<string, unknown>
    }) => Promise<unknown>
  }

  const order = await orderModule.retrieveOrder(event.data.id)

  if (!order.customer_id) {
    return
  }

  const approvalContext = await b2bService.shouldRequireOrderApproval(
    order.customer_id
  )

  if (!approvalContext) {
    return
  }

  const approval = await b2bService.createOrderApproval({
    order_id: order.id,
    company_id: approvalContext.company.id,
    requested_by_member_id: approvalContext.member.id,
  })

  await orderModule.updateOrders({
    id: order.id,
    metadata: {
      ...(order.metadata ?? {}),
      b2b_approval_status: "pending",
      b2b_approval_id: approval.id,
      b2b_company_id: approvalContext.company.id,
    },
  })

  logger.info(
    `[b2b] Order ${order.id} pending approval for company ${approvalContext.company.id}`
  )

  await notifyOrderApprovalPending(container, {
    orderId: order.id,
    companyId: approvalContext.company.id,
    approvalId: approval.id,
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
