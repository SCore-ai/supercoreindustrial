import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import {
  findCustomerEmailById,
  generatePasswordResetToken,
} from "../../../../../lib/b2b/password-reset"
import { notifyPasswordReset } from "../../../../../lib/b2b/email/notifications"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const email = await findCustomerEmailById(req.scope, id)

    if (!email) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Customer email was not found"
      )
    }

    const token = await generatePasswordResetToken(req.scope, email, "customer")

    if (!token) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Could not generate a password reset token. Check JWT_SECRET."
      )
    }

    const result = await notifyPasswordReset(req.scope, {
      email,
      token,
      actorType: "customer",
    })

    if (!result.sent) {
      res.status(400).json({
        message: result.error ?? "Password reset email was not sent",
        email,
      })
      return
    }

    res.json({
      sent: true,
      email,
    })
  } catch (error) {
    if (error instanceof MedusaError) {
      const status =
        error.type === MedusaError.Types.NOT_FOUND
          ? 404
          : error.type === MedusaError.Types.INVALID_DATA
            ? 400
            : 400
      res.status(status).json({ message: error.message })
      return
    }

    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to send password reset email",
    })
  }
}
