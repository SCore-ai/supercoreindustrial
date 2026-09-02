import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../lib/b2b/customer-context"
import { memberCanApproveCompanyOrders } from "../../../../lib/b2b/order-approval-access"
import { requireB2bFeature } from "../../../../lib/b2b/settings-guard"
import { requireB2bPermission } from "../../../../lib/security/rbac"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "order_approval_enabled")
    const customerId = requireAuthenticatedCustomer(req)
    const context = await resolveStoreB2bContext(req.scope, customerId)
    await requireB2bPermission(req.scope, context.member?.role, "orders.view")

    if (!context.companyId) {
      res.json({
        approvals: [],
        count: 0,
        limit: 20,
        offset: 0,
        permissions: { can_approve_orders: false },
      })
      return
    }

    const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const status = req.query.status as
      | "pending"
      | "approved"
      | "rejected"
      | undefined

    const { approvals, count } = await b2bService.listOrderApprovalsForCompany({
      company_id: context.companyId,
      status,
      limit,
      offset,
    })

    res.json({
      approvals: approvals.map((approval) => ({
        id: approval.id,
        order_id: approval.order_id,
        status: approval.status,
        notes: approval.notes ?? null,
        created_at: approval.created_at,
        updated_at: approval.updated_at,
      })),
      count,
      limit,
      offset,
      permissions: {
        can_approve_orders: memberCanApproveCompanyOrders(context.member),
      },
    })
  } catch (error) {
    if (error instanceof MedusaError) {
      if (error.type === MedusaError.Types.UNAUTHORIZED) {
        res.status(401).json({ message: error.message })
        return
      }

      if (error.type === MedusaError.Types.NOT_ALLOWED) {
        res.status(403).json({ message: error.message })
        return
      }
    }

    throw error
  }
}
