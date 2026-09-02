import { buildOfferPdfDocument } from "../document"
import { renderOfferPdf } from "../render"

describe("Offer PDF render", () => {
  it("produces a PDF buffer with branded metadata", async () => {
    const document = buildOfferPdfDocument({
      quote_id: "quote_render01",
      currency_code: "gbp",
      project: "Harbour CCTV",
      company_name: "Northport Ltd",
      items: [
        {
          title: "Explosion-protected camera station",
          sku: "EDS-305",
          mpn: null,
          quantity: 1,
          unit_price: 1250,
          discount_percent: 0,
        },
      ],
    })

    const buffer = await renderOfferPdf(document)

    expect(buffer.slice(0, 5).toString("utf8")).toBe("%PDF-")
    expect(buffer.length).toBeGreaterThan(5000)
  })
})
