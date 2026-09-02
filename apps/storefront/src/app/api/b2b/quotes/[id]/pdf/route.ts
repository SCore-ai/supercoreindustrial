import { NextResponse } from "next/server"
import { getAuthHeaders } from "@lib/data/cookies"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const backend =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "http://localhost:9000"
  const authHeaders = await getAuthHeaders()

  const response = await fetch(`${backend}/store/b2b/quotes/${id}/pdf`, {
    headers: {
      ...authHeaders,
      "x-publishable-api-key":
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    return new NextResponse(body || "Could not download offer PDF", {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "text/plain; charset=utf-8",
      },
    })
  }

  const buffer = await response.arrayBuffer()
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        response.headers.get("content-disposition") ||
        `attachment; filename="Supercore-Offer.pdf"`,
      "Cache-Control": "private, no-store",
    },
  })
}
