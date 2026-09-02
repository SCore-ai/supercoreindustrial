import {
  assertCanApproveCompanyOrders,
  memberCanApproveCompanyOrders,
} from "../order-approval-access"

describe("order-approval-access", () => {
  it("allows admin and approver roles", () => {
    expect(
      memberCanApproveCompanyOrders({ id: "m1", role: "admin", status: "active" })
    ).toBe(true)
    expect(
      memberCanApproveCompanyOrders({
        id: "m2",
        role: "approver",
        status: "active",
      })
    ).toBe(true)
  })

  it("allows primary contacts even if buyer", () => {
    expect(
      memberCanApproveCompanyOrders({
        id: "m3",
        role: "buyer",
        is_primary: true,
        status: "active",
      })
    ).toBe(true)
  })

  it("blocks buyers without primary flag", () => {
    expect(
      memberCanApproveCompanyOrders({
        id: "m4",
        role: "buyer",
        is_primary: false,
        status: "active",
      })
    ).toBe(false)

    expect(() =>
      assertCanApproveCompanyOrders({
        id: "m4",
        role: "buyer",
        is_primary: false,
        status: "active",
      })
    ).toThrow(/approvers/)
  })
})
