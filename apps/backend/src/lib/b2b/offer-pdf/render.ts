import { OFFER_PDF_BRAND, OFFER_PDF_COLORS as C } from "./brand"
import type { OfferPdfDocument, OfferPdfLine } from "./document"
import { resolveOfferPdfFonts, resolveOfferPdfLogo } from "./fonts"

const PAGE = { width: 595.28, height: 841.89 }
const MARGIN = 40
const CONTENT_WIDTH = PAGE.width - MARGIN * 2
const HEADER_HEIGHT = 76
const FOOTER_TOP = 778

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)
}

function dateShort(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value)
}

function orDash(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : "—"
}

function registerFonts(doc: PDFKit.PDFDocument) {
  const fonts = resolveOfferPdfFonts()
  doc.registerFont("DisplayBold", fonts.displayBold)
  doc.registerFont("DisplaySemibold", fonts.displaySemibold)
  doc.registerFont("Body", fonts.body)
  doc.registerFont("BodySemibold", fonts.bodySemibold)
}

function drawPageChrome(
  doc: PDFKit.PDFDocument,
  pageIndex: number,
  pageCount: number
) {
  doc.rect(0, 0, PAGE.width, HEADER_HEIGHT).fill(C.white)
  doc.rect(0, HEADER_HEIGHT, PAGE.width, 3).fill(C.gold)
  const logo = resolveOfferPdfLogo()
  if (logo) {
    doc.image(logo, MARGIN, 10, { height: 56 })
  }
  doc
    .fillColor(C.gold)
    .font("DisplayBold")
    .fontSize(16)
    .text("QUOTATION", PAGE.width - MARGIN - 220, 28, {
      width: 220,
      align: "right",
      characterSpacing: 1.8,
    })

  doc.rect(0, FOOTER_TOP, PAGE.width, PAGE.height - FOOTER_TOP).fill(C.ink)
  doc.rect(0, FOOTER_TOP, PAGE.width, 3).fill(C.gold)
  doc
    .fillColor("#9BB0C2")
    .font("Body")
    .fontSize(6.5)
    .text(
      [
        `${OFFER_PDF_BRAND.legalName}  ·  ${OFFER_PDF_BRAND.country}`,
        OFFER_PDF_BRAND.companyNumber
          ? `Companies House ${OFFER_PDF_BRAND.companyNumber}`
          : null,
        OFFER_PDF_BRAND.terms,
      ]
        .filter(Boolean)
        .join("\n"),
      MARGIN,
      FOOTER_TOP + 10,
      { width: CONTENT_WIDTH - 50, lineGap: 1.5 }
    )
  doc
    .fillColor(C.gold)
    .font("DisplaySemibold")
    .fontSize(8)
    .text(
      `${pageIndex} / ${pageCount}`,
      PAGE.width - MARGIN - 40,
      FOOTER_TOP + 12,
      { width: 40, align: "right" }
    )
}

function labeledValue(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) {
  doc.fillColor(C.muted).font("Body").fontSize(7.5).text(label, x, y, { width })
  doc
    .fillColor(C.body)
    .font("BodySemibold")
    .fontSize(8.5)
    .text(value, x, y + 11, { width })
}

const COLS = [
  { key: "n", width: 22 },
  { key: "title", width: 228 },
  { key: "model", width: 88 },
  { key: "qty", width: 36 },
  { key: "price", width: 70 },
  { key: "total", width: 71 },
] as const

function drawTableHeader(doc: PDFKit.PDFDocument, y: number) {
  doc.rect(MARGIN, y, CONTENT_WIDTH, 20).fill(C.steel)
  const labels = ["#", "DESCRIPTION", "MODEL", "QTY", "PRICE", "TOTAL"]
  let x = MARGIN + 6
  labels.forEach((label, index) => {
    const col = COLS[index]
    doc
      .fillColor(C.white)
      .font("DisplaySemibold")
      .fontSize(7)
      .text(label, x, y + 6, {
        width: col.width - 8,
        align: index >= 3 ? "right" : "left",
        characterSpacing: 0.5,
      })
    x += col.width
  })
  return y + 20
}

function lineHeightFor(doc: PDFKit.PDFDocument, line: OfferPdfLine) {
  doc.font("BodySemibold").fontSize(8)
  const titleHeight = doc.heightOfString(line.title, {
    width: COLS[1].width - 8,
  })
  doc.font("Body").fontSize(6.5)
  const detailHeight = line.details.reduce(
    (sum, detail) =>
      sum +
      doc.heightOfString(detail, { width: CONTENT_WIDTH - COLS[0].width - 16 }) +
      2,
    0
  )
  return Math.max(26, titleHeight + detailHeight + 14)
}

function drawLineRow(
  doc: PDFKit.PDFDocument,
  line: OfferPdfLine,
  index: number,
  y: number,
  currency: string
) {
  const height = lineHeightFor(doc, line)
  doc.font("BodySemibold").fontSize(8)
  const titleHeight = doc.heightOfString(line.title, {
    width: COLS[1].width - 8,
  })
  if (index % 2 === 0) {
    doc.rect(MARGIN, y, CONTENT_WIDTH, height).fill(C.paper)
  }

  const model = line.sku || line.mpn || "—"
  const values = [
    String(index + 1),
    line.title,
    model,
    String(line.quantity),
    money(line.net_unit_price, currency),
    money(line.line_total, currency),
  ]

  let x = MARGIN + 6
  values.forEach((value, colIndex) => {
    const col = COLS[colIndex]
    doc
      .fillColor(C.body)
      .font(colIndex === 1 || colIndex === 5 ? "BodySemibold" : "Body")
      .fontSize(8)
      .text(value, x, y + 6, {
        width: col.width - 8,
        align: colIndex >= 3 ? "right" : "left",
      })
    x += col.width
  })

  let detailY = y + 6 + titleHeight + 2
  line.details.forEach((detail) => {
    doc
      .fillColor(C.muted)
      .font("Body")
      .fontSize(6.5)
      .text(detail, MARGIN + COLS[0].width + 6, detailY, {
        width: CONTENT_WIDTH - COLS[0].width - 16,
      })
    detailY +=
      doc.heightOfString(detail, {
        width: CONTENT_WIDTH - COLS[0].width - 16,
      }) + 2
  })

  return y + height
}

function ensureSpace(
  doc: PDFKit.PDFDocument,
  y: number,
  needed: number
) {
  if (y + needed <= FOOTER_TOP - 10) {
    return y
  }
  doc.addPage()
  return HEADER_HEIGHT + 16
}

export async function renderOfferPdf(data: OfferPdfDocument): Promise<Buffer> {
  const { default: PDFDocument } = await import("pdfkit")
  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    bufferPages: true,
    info: {
      Title: `Quotation ${data.offer_number}`,
      Author: OFFER_PDF_BRAND.legalName,
      Subject: data.project
        ? `Quotation for ${data.project}`
        : "Quotation",
      Creator: OFFER_PDF_BRAND.legalName,
      Keywords: "quote,quotation,supercore",
    },
  })

  registerFonts(doc)

  const chunks: Buffer[] = []
  doc.on("data", (chunk: Buffer) => chunks.push(chunk))

  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
  })

  let y = HEADER_HEIGHT + 16
  const colWidth = (CONTENT_WIDTH - 16) / 2

  doc
    .fillColor(C.gold)
    .font("DisplaySemibold")
    .fontSize(8)
    .text("CONTACT", MARGIN, y, { characterSpacing: 1.3 })
  y += 14

  const sellerLines = [
    data.seller.legalName,
    ...data.seller.addressLines,
    data.seller.phone,
    data.seller.email,
  ]
  sellerLines.forEach((line, index) => {
    doc
      .fillColor(index === 0 ? C.body : C.muted)
      .font(index === 0 ? "BodySemibold" : "Body")
      .fontSize(8)
      .text(line, MARGIN, y, { width: colWidth })
    y += index === 0 ? 12 : 11
  })
  doc
    .fillColor(C.muted)
    .font("Body")
    .fontSize(7.5)
    .text("VAT No.", MARGIN, y, { width: 90 })
  doc
    .fillColor(C.body)
    .font("Body")
    .fontSize(7.5)
    .text(orDash(data.seller.vatNumber), MARGIN + 92, y, { width: colWidth - 92 })
  y += 11
  doc
    .fillColor(C.muted)
    .font("Body")
    .fontSize(7.5)
    .text("Chamber Of\nCommerce No.", MARGIN, y, { width: 90 })
  doc
    .fillColor(C.body)
    .font("Body")
    .fontSize(7.5)
    .text(orDash(data.seller.companyNumber), MARGIN + 92, y + 4, {
      width: colWidth - 92,
    })

  let customerY = HEADER_HEIGHT + 16
  const customerLines = [
    data.customer.name,
    data.customer.contact_name,
    ...data.invoice_address.lines.filter(
      (line) => line !== data.customer.name && line !== data.customer.contact_name
    ),
  ].filter((line): line is string => Boolean(line))

  customerLines.forEach((line, index) => {
    doc
      .fillColor(index === 0 ? C.body : C.muted)
      .font(index === 0 ? "BodySemibold" : "Body")
      .fontSize(index === 0 ? 10 : 8)
      .text(line, MARGIN + colWidth + 16, customerY, { width: colWidth })
    customerY += index === 0 ? 14 : 11
  })

  y = Math.max(y + 28, customerY) + 10
  const senderBits = [
    data.seller.tradingName,
    ...data.seller.addressLines.slice(0, 2),
  ].filter(Boolean)
  doc.rect(MARGIN, y, CONTENT_WIDTH, 16).fill(C.paper)
  doc
    .fillColor(C.muted)
    .font("Body")
    .fontSize(7)
    .text(`Sender: ${senderBits.join(" - ")}`, MARGIN + 8, y + 4, {
      width: CONTENT_WIDTH - 16,
    })
  y += 24

  doc.rect(MARGIN, y, CONTENT_WIDTH, 52).fill(C.paper)
  labeledValue(
    doc,
    "Customer Id",
    orDash(data.customer_id),
    MARGIN + 8,
    y + 8,
    150
  )
  labeledValue(
    doc,
    "Quote Id",
    data.offer_number,
    MARGIN + 170,
    y + 8,
    130
  )
  labeledValue(
    doc,
    "Quote Date",
    dateShort(data.issued_at),
    MARGIN + 320,
    y + 8,
    140
  )
  y += 58

  doc.rect(MARGIN, y, CONTENT_WIDTH, 28).fill(C.ink)
  doc
    .fillColor(C.gold)
    .font("Body")
    .fontSize(8)
    .text(`Payment term: ${data.payment_term}`, MARGIN + 10, y + 9)
  doc
    .fillColor(C.white)
    .font("DisplayBold")
    .fontSize(10)
    .text(
      `Total Quotation: ${money(data.total, data.currency_code)}`,
      MARGIN + 220,
      y + 8,
      { width: CONTENT_WIDTH - 230, align: "right" }
    )
  y += 36

  doc.rect(MARGIN, y, CONTENT_WIDTH, 22).strokeColor(C.line).lineWidth(0.6).stroke()
  const bankCols = [
    ["IBAN", orDash(data.seller.iban)],
    ["Bank", orDash(data.seller.bank)],
    ["BIC", orDash(data.seller.bic)],
  ]
  bankCols.forEach((entry, index) => {
    const x = MARGIN + 8 + index * 170
    doc
      .fillColor(C.muted)
      .font("Body")
      .fontSize(6.5)
      .text(`${entry[0]}:`, x, y + 7)
    doc
      .fillColor(C.body)
      .font("BodySemibold")
      .fontSize(7.5)
      .text(entry[1], x + 28, y + 6, { width: 130 })
  })
  y += 32

  y = drawTableHeader(doc, y)
  data.lines.forEach((line, index) => {
    const needed = lineHeightFor(doc, line)
    y = ensureSpace(doc, y, needed)
    if (y === HEADER_HEIGHT + 16) {
      y = drawTableHeader(doc, y)
    }
    y = drawLineRow(doc, line, index, y, data.currency_code)
  })

  y = ensureSpace(doc, y + 10, 90)
  doc
    .fillColor(C.muted)
    .font("Body")
    .fontSize(7.5)
    .text("Prices above do not include VAT", MARGIN, y)
  y += 16

  const boxWidth = (CONTENT_WIDTH - 16) / 3
  const boxes = [
    ["Subtotal", money(data.subtotal, data.currency_code)],
    ["Shipping cost", money(data.shipping_cost, data.currency_code)],
    [data.vat_label, money(data.vat_amount, data.currency_code)],
  ]
  boxes.forEach((box, index) => {
    const x = MARGIN + index * (boxWidth + 8)
    doc.rect(x, y, boxWidth, 36).fill(C.paper)
    doc
      .fillColor(C.muted)
      .font("DisplaySemibold")
      .fontSize(7)
      .text(box[0], x + 8, y + 6, { characterSpacing: 0.4 })
    doc
      .fillColor(C.ink)
      .font("DisplayBold")
      .fontSize(11)
      .text(box[1], x + 8, y + 18, { width: boxWidth - 16 })
  })
  y += 44

  doc.rect(MARGIN, y, CONTENT_WIDTH, 32).fill(C.ink)
  doc
    .fillColor(C.gold)
    .font("DisplaySemibold")
    .fontSize(8)
    .text("Total", MARGIN + 10, y + 11, { characterSpacing: 1.1 })
  doc
    .fillColor(C.white)
    .font("DisplayBold")
    .fontSize(14)
    .text(money(data.total, data.currency_code), MARGIN + 120, y + 8, {
      width: CONTENT_WIDTH - 130,
      align: "right",
    })
  y += 44

  y = ensureSpace(doc, y, 90)
  const noteWidth = (CONTENT_WIDTH - 16) / 3
  const bottomBlocks: Array<[string, string[]]> = [
    ["Notes", data.customer_notes ? [data.customer_notes] : data.project ? [`Project: ${data.project}`] : ["—"]],
    ["Invoice address", data.invoice_address.lines],
    ["Shipping address", data.shipping_address.lines],
  ]
  let bottomHeight = 0
  bottomBlocks.forEach((block, index) => {
    const x = MARGIN + index * (noteWidth + 8)
    doc
      .fillColor(C.gold)
      .font("DisplaySemibold")
      .fontSize(7.5)
      .text(block[0].toUpperCase(), x, y, { characterSpacing: 0.8 })
    doc
      .fillColor(C.muted)
      .font("Body")
      .fontSize(7.5)
      .text(block[1].join("\n"), x, y + 12, { width: noteWidth, lineGap: 1.5 })
    const height = 12 + doc.heightOfString(block[1].join("\n"), { width: noteWidth })
    bottomHeight = Math.max(bottomHeight, height)
  })
  y += bottomHeight

  const range = doc.bufferedPageRange()
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i)
    drawPageChrome(doc, i + 1, range.count)
  }

  doc.end()
  return finished
}
