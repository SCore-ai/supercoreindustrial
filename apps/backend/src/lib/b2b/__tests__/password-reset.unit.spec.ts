import { buildPasswordResetUrl } from "../password-reset"

describe("buildPasswordResetUrl", () => {
  const originalStore = process.env.STOREFRONT_URL
  const originalAdmin = process.env.ADMIN_URL

  afterEach(() => {
    process.env.STOREFRONT_URL = originalStore
    process.env.ADMIN_URL = originalAdmin
  })

  it("builds a storefront reset URL for customers", () => {
    process.env.STOREFRONT_URL = "http://localhost:8000"
    expect(buildPasswordResetUrl("customer", "tok123", "buyer@example.com")).toBe(
      "http://localhost:8000/account/reset-password?token=tok123&email=buyer%40example.com"
    )
  })

  it("builds an admin reset URL for users", () => {
    process.env.ADMIN_URL = "http://localhost:9000/app"
    expect(buildPasswordResetUrl("user", "tok123", "admin@example.com")).toBe(
      "http://localhost:9000/app/reset-password?token=tok123&email=admin%40example.com"
    )
  })
})
