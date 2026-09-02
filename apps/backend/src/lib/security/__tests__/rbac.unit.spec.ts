import { roleHasPermission } from "../types"

describe("B2B RBAC permissions", () => {
  it("lets company admins view conversations they can manage", () => {
    expect(roleHasPermission("admin", "conversations.view")).toBe(true)
    expect(roleHasPermission("admin", "conversations.manage")).toBe(true)
    expect(roleHasPermission("admin", "members.manage")).toBe(true)
  })

  it("lets buyers view quotes and conversations but not manage members", () => {
    expect(roleHasPermission("buyer", "quotes.view")).toBe(true)
    expect(roleHasPermission("buyer", "conversations.view")).toBe(true)
    expect(roleHasPermission("buyer", "members.manage")).toBe(false)
    expect(roleHasPermission("buyer", "orders.approve")).toBe(false)
  })

  it("lets approvers approve orders without member admin rights", () => {
    expect(roleHasPermission("approver", "orders.approve")).toBe(true)
    expect(roleHasPermission("approver", "members.manage")).toBe(false)
  })
})
