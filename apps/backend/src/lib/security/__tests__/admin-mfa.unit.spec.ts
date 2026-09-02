import {
  signAdminMfaToken,
  verifyAdminMfaToken,
  maskEmail,
  isAdminMfaExemptPath,
} from "../admin-mfa"
import { resolveAdminMfaEmail } from "../../b2b/admin-email"
import { evaluateSecurityPosture } from "../posture"
import { DEFAULT_SECURITY_SETTINGS } from "../types"

describe("admin MFA helpers", () => {
  const originalCookie = process.env.COOKIE_SECRET

  beforeEach(() => {
    process.env.COOKIE_SECRET = "unit-test-cookie-secret-value"
  })

  afterEach(() => {
    process.env.COOKIE_SECRET = originalCookie
  })

  it("round-trips a signed MFA cookie for the same user", () => {
    const token = signAdminMfaToken("user_1")
    expect(verifyAdminMfaToken(token, "user_1")).toBe(true)
    expect(verifyAdminMfaToken(token, "user_2")).toBe(false)
    expect(verifyAdminMfaToken("tampered", "user_1")).toBe(false)
  })

  it("rejects an expired MFA cookie", () => {
    const previousNow = Date.now
    Date.now = () => 1_000

    try {
      const token = signAdminMfaToken("user_1")
      Date.now = () => 1_000 + 13 * 60 * 60 * 1000
      expect(verifyAdminMfaToken(token, "user_1")).toBe(false)
    } finally {
      Date.now = previousNow
    }
  })

  it("masks admin emails", () => {
    expect(maskEmail("admin@supercore.test")).toBe("a***@supercore.test")
  })

  it("prefers the configured admin mailbox for MFA", () => {
    expect(
      resolveAdminMfaEmail({
        userEmail: "user@supercore.local",
        adminEmail: "service@supercoresystems.co.uk",
      })
    ).toBe("service@supercoresystems.co.uk")
    expect(resolveAdminMfaEmail({})).toBe("service@supercoresystems.co.uk")
  })

  it("exempts MFA and current-user routes", () => {
    expect(isAdminMfaExemptPath("/admin/system/mfa/status")).toBe(true)
    expect(isAdminMfaExemptPath("/admin/system/mfa/challenge")).toBe(true)
    expect(isAdminMfaExemptPath("/admin/users/me?fields=email")).toBe(true)
    expect(isAdminMfaExemptPath("/admin/products")).toBe(false)
  })
})

describe("admin MFA posture", () => {
  const settings = {
    id: "security_settings_default",
    ...DEFAULT_SECURITY_SETTINGS,
    admin_mfa_required: true,
  }

  it("passes when MFA is required", () => {
    const report = evaluateSecurityPosture(settings)
    const check = report.checks.find((item) => item.id === "admin-mfa")
    expect(check?.status).toBe("pass")
  })

  it("asks for review when the requirement is off", () => {
    const report = evaluateSecurityPosture({
      ...settings,
      admin_mfa_required: false,
    })
    const check = report.checks.find((item) => item.id === "admin-mfa")
    expect(check?.status).toBe("warn")
  })
})
