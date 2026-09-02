import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../../../modules/b2b"
import B2bModuleService from "../../../../../../modules/b2b/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../../../lib/b2b/customer-context"
import { assertCanApproveCompanyOrders } from "../../../../../../lib/b2b/order-approval-access"
import { requireB2bFeature } from "../../../../../../lib/b2b/settings-guard"
import { auditFromRequest } from "../../../../../../lib/security/audit"
import { requireB2bPermission, requireCompanyScope } from "../../../../../../lib/security/rbac"
import approveOrderApprovalWorkflow from "../../../../../../workflows/b2b/approve-order-approval"

function handleStoreApprovalError(error: unknown, res: MedusaResponse) {
  if (error instanceof MedusaError) {
    if (error.type === MedusaError.Types.UNAUTHORIZED) {
      res.status(401).json({ message: error.message })
      return true
    }

    if (error.type === MedusaError.Types.NOT_ALLOWED) {
      res.status(403).json({ message: error.message })
      return true
    }

    if (error.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({ message: error.message })
      return true
    }

    if (error.type === MedusaError.Types.INVALID_DATA) {
      res.status(400).json({ message: error.message })
      return true
    }
  }

  return false
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "order_approval_enabled")
    const customerId = requireAuthenticatedCustomer(req)
    const context = await resolveStoreB2bContext(req.scope, customerId)
    await requireB2bPermission(req.scope, context.member?.role, "orders.approve")
    assertCanApproveCompanyOrders(context.member)

    if (!context.companyId) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "No trade company is linked to this account."
      )
    }

    const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
    const { id } = req.params
    const body = (req.body || {}) as { notes?: string | null }

    let approval
    try {
      approval = await b2bService.retrieveB2bOrderApproval(id)
    } catch {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Order approval not found"
      )
    }

    await requireCompanyScope(req.scope, context.companyId, approval.company_id)

    if (approval.company_id !== context.companyId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Order approval not found"
      )
    }

    const { result } = await approveOrderApprovalWorkflow(req.scope).run({
      input: {
        approval_id: id,
        approved_by_member_id: context.member!.id,
        notes: body.notes,
      },
    })

    await auditFromRequest(req, {
      actor_type: "customer",
      actor_id: customerId,
      actor_email: context.email,
      action: "b2b.order.approved",
      resource_type: "b2b_order_approval",
      resource_id: result.id,
      company_id: context.companyId,
      summary: `Approved order ${result.order_id}`,
    })

    res.json({
      approval: {
        id: result.id,
        order_id: result.order_id,
        status: result.status,
        notes: result.notes ?? null,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    })
  } catch (error) {
    if (handleStoreApprovalError(error, res)) {
      return
    }
    throw error
  }
}
