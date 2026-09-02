import {
  parseBulkOrderInput,
  parseBulkOrderRows,
} from "../bulk-order-parser"

describe("bulk order parser", () => {
  it("parses headered CSV with sku and quantity columns", () => {
    const csv = "sku,quantity\nABC-123,2\nDEF-456,1"
    const result = parseBulkOrderInput({ csv })

    expect(result.failures).toEqual([])
    expect(result.rows).toEqual([
      { sku: "ABC-123", quantity: 2, line: 2 },
      { sku: "DEF-456", quantity: 1, line: 3 },
    ])
  })

  it("parses headerless two-column CSV", () => {
    const csv = "01919-021;10\n01932-021;5"
    const result = parseBulkOrderInput({ csv })

    expect(result.failures).toEqual([])
    expect(result.rows).toEqual([
      { sku: "01919-021", quantity: 10, line: 1 },
      { sku: "01932-021", quantity: 5, line: 2 },
    ])
  })

  it("merges duplicate SKUs by summing quantity", () => {
    const result = parseBulkOrderRows([
      { sku: "ABC-1", quantity: 2 },
      { sku: "abc-1", quantity: 3 },
    ])

    expect(result.rows).toEqual([{ sku: "ABC-1", quantity: 5, line: 1 }])
  })

  it("reports invalid rows", () => {
    const result = parseBulkOrderRows([
      { sku: "", quantity: 1 },
      { sku: "ABC", quantity: 0 },
    ])

    expect(result.rows).toEqual([])
    expect(result.failures).toHaveLength(2)
  })
})
