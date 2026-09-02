import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null

  // Parallel @dashboard still renders when logged out; layout shows @login.
  // notFound() here would 404 the whole account segment.
  if (!customer) {
    return null
  }

  return <Overview customer={customer} orders={orders} />
}
