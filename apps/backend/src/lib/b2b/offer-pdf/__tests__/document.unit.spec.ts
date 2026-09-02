import {
  assertPricedOfferLines,
  buildOfferPdfDocument,
  formatProductDetails,
  offerNumberFromQuoteId,
  offerPdfFilename,
} from "../document"

describe("Offer PDF document", () => {
  const issuedAt = new Date(2026, 6, 16, 11, 33, 0)
  const items = [
    {
      title: "Spectrum F202 camera station",
      sku: "F202-A",
      mpn: "SRXE4P",
      quantity: 2,
      unit_price: 100,
      discount_percent: 10,
      details: ["HS Code: 852589, Country of origin: PL"],
    },
    {
      title: "Junction box",
      sku: "JB-1",
      mpn: null,
      quantity: 1,
      unit_price: 50,
      discount_percent: 0,
    },
  ]

  it("builds a quotation with NetcamCenter-style fields and filename", () => {
    const document = buildOfferPdfDocument({
      quote_id: "quote_abc12345xyz",
      customer_id: "comp_4213375",
      currency_code: "gbp",
      project: "North Sea FPSO",
      email: "buyer@example.com",
      company_name: "Acme Energy",
      contact_name: "Tolga Agyol",
      issued_at: issuedAt,
      invoice_address: [
        "Acme Energy",
        "Tolga Agyol",
        "140 Goswell Road",
        "London",
        "EC1V 7DY",
        "United Kingdom",
      ],
      items,
    })

    expect(document.offer_number).toBe("SCI-12345XYZ")
    expect(document.filename).toBe(
      "Supercore_Quote_SCI-12345XYZ_16-07-2026_11-33-00.pdf"
    )
    expect(document.subtotal).toBe(230)
    expect(document.shipping_cost).toBe(0)
    expect(document.vat_amount).toBe(0)
    expect(document.total).toBe(230)
    expect(document.discount_total).toBe(20)
    expect(document.payment_term).toBe("Prepayment")
    expect(document.lines[0].net_unit_price).toBe(90)
    expect(document.lines[1].details[2]).toBe("In stock")
    expect(document.customer.name).toBe("Acme Energy")
    expect(document.customer.contact_name).toBe("Tolga Agyol")
    expect(document.invoice_address.lines[0]).toBe("Acme Energy")
    expect(document.shipping_address.lines).toEqual(document.invoice_address.lines)
    expect(document.seller.vatNumber).toBe("GB454 3803 92")
    expect(document.seller.companyNumber).toBe("14447351")
    expect(document.seller.addressLines[0]).toContain("Goswell")
  })

  it("rejects unpriced lines", () => {
    expect(() =>
      assertPricedOfferLines([
        {
          title: "Unpriced",
          sku: null,
          mpn: null,
          quantity: 1,
          unit_price: null,
          discount_percent: 0,
        },
      ])
    ).toThrow(/not priced/)
  })

  it("formats quote id and download filename from the issue timestamp", () => {
    expect(offerNumberFromQuoteId("quote_00112233")).toBe("SCI-00112233")
    expect(offerPdfFilename("quote_00112233", issuedAt)).toBe(
      "Supercore_Quote_SCI-00112233_16-07-2026_11-33-00.pdf"
    )
  })

  it("formats product trade details when present", () => {
    expect(
      formatProductDetails({
        hs_code: "852589",
        origin_country: "pl",
        length: 255,
        width: 360,
        height: 145,
        weight: 2400,
        stock_status: "in_stock",
      })
    ).toEqual([
      "HS Code: 852589, Country of origin: Poland",
      "Dimensions (LWH): 255x360x145mm (10.04x14.17x5.71in.), Weight: 2400gr. (5.3lbs)",
      "In stock",
    ])
  })
})
