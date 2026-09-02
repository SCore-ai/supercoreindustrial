import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { generateResetPasswordTokenWorkflow } from "@medusajs/medusa/core-flows"
import crypto from "crypto"

type AuthModuleLike = {
  register: (
    provider: string,
    authData: {
      body: Record<string, unknown>
      authScope: string
    }
  ) => Promise<unknown>
}

export function buildPasswordResetUrl(
  actorType: string,
  token: string,
  email: string
) {
  const params = new URLSearchParams({ token, email })

  if (actorType === "user") {
    const adminUrl = (
      process.env.ADMIN_URL?.trim() || "http://localhost:9000/app"
    ).replace(/\/$/, "")
    return `${adminUrl}/reset-password?${params.toString()}`
  }

  const storefrontUrl = (
    process.env.STOREFRONT_URL?.trim() || "http://localhost:8000"
  ).replace(/\/$/, "")
  return `${storefrontUrl}/account/reset-password?${params.toString()}`
}

export function extractResetPasswordToken(result: unknown): string | null {
  if (typeof result === "string" && result.trim()) {
    return result
  }

  if (result && typeof result === "object") {
    const record = result as Record<string, unknown>
    for (const key of ["token", "reset_token", "resetToken"]) {
      const value = record[key]
      if (typeof value === "string" && value.trim()) {
        return value
      }
    }
  }

  return null
}

export async function ensureEmailpassIdentity(
  scope: MedusaContainer,
  email: string,
  actorType: "customer" | "user" = "customer"
) {
  const authModule = scope.resolve(Modules.AUTH) as AuthModuleLike
  const tempPassword = crypto.randomBytes(24).toString("hex")

  try {
    await authModule.register("emailpass", {
      body: { email, password: tempPassword },
      authScope: actorType,
    })
  } catch {
    // Identity already exists — reset still applies.
  }
}

export async function generatePasswordResetToken(
  scope: MedusaContainer,
  email: string,
  actorType: "customer" | "user" = "customer"
): Promise<string | null> {
  const jwtSecret = process.env.JWT_SECRET?.trim()

  if (!jwtSecret) {
    return null
  }

  await ensureEmailpassIdentity(scope, email, actorType)

  try {
    const { result } = await generateResetPasswordTokenWorkflow(scope).run({
      input: {
        entityId: email,
        actorType,
        provider: "emailpass",
        secret: jwtSecret,
      },
    })

    return extractResetPasswordToken(result)
  } catch {
    return null
  }
}

export async function findCustomerEmailById(
  scope: MedusaContainer,
  customerId: string
): Promise<string | null> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: Array<{ email?: string | null }> }>
  }

  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "email"],
    filters: { id: customerId },
  })

  return data[0]?.email?.trim().toLowerCase() ?? null
}
