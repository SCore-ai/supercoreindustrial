import { resolveOfferSeller } from "../offer-seller"

describe("Offer seller settings", () => {
  it("falls back to branded defaults when settings are empty", () => {
    const resolved = resolveOfferSeller({})

    expect(resolved.seller.legalName).toContain("SUPERCORE")
    expect(resolved.seller.iban).toBe("")
    expect(resolved.payment_term).toBe("Prepayment")
  })

  it("uses saved company, IBAN, and bank details on the quotation", () => {
    const resolved = resolveOfferSeller({
      company_legal_name: "Acme Trading Ltd",
      company_address: "1 High Street\nLondon\nUnited Kingdom",
      company_iban: "GB00 TEST 1234 5678 90",
      company_bank: "Barclays 20-00-00",
      company_bic: "BARCGB22",
      company_payment_term: "Net 30",
    })

    expect(resolved.seller.legalName).toBe("Acme Trading Ltd")
    expect(resolved.seller.addressLines).toEqual([
      "1 High Street",
      "London",
      "United Kingdom",
    ])
    expect(resolved.seller.iban).toBe("GB00 TEST 1234 5678 90")
    expect(resolved.seller.bank).toBe("Barclays 20-00-00")
    expect(resolved.seller.bic).toBe("BARCGB22")
    expect(resolved.payment_term).toBe("Net 30")
  })
})
