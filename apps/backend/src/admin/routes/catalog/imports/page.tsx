import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { catalogClient } from "../../../lib/catalog-client"
import type {
  ManufacturerOption,
  ManufacturerPreviewResponse,
} from "../../../lib/catalog-types"

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)

const CatalogImportsPage = () => {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string>("zenitel")
  const [csv, setCsv] = useState("")
  const [filename, setFilename] = useState("zenitel-pricelist.csv")
  const [preview, setPreview] = useState<ManufacturerPreviewResponse | null>(
    null
  )

  const manufacturersQuery = useQuery({
    queryKey: ["admin-catalog-manufacturers"],
    queryFn: () => catalogClient.listManufacturers(),
  })

  const manufacturers = manufacturersQuery.data?.manufacturers ?? []
  const selected: ManufacturerOption | undefined =
    manufacturers.find((m) => m.id === selectedId) ?? manufacturers[0]

  useEffect(() => {
    if (!selectedId && manufacturers[0]) {
      setSelectedId(manufacturers[0].id)
      setFilename(manufacturers[0].default_filename)
    }
  }, [manufacturers, selectedId])

  const jobsQuery = useQuery({
    queryKey: ["admin-catalog-imports"],
    queryFn: () => catalogClient.listImports({ limit: 15 }),
  })

  const previewMutation = useMutation({
    mutationFn: () => {
      if (!selected) {
        throw new Error("Select a manufacturer")
      }
      return catalogClient.previewManufacturer(selected.id, {
        csv,
        filename,
        source_currency: selected.source_currency,
      })
    },
    onSuccess: (result) => {
      setPreview(result)
      toast.success(
        `Preview ready · ${result.total_rows} products · FX ${result.fx_rate}`
      )
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const importMutation = useMutation({
    mutationFn: () => {
      if (!selected) {
        throw new Error("Select a manufacturer")
      }
      return catalogClient.runManufacturer(selected.id, {
        csv,
        filename,
        source_currency: selected.source_currency,
        job_id: preview?.job_id,
      })
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-catalog-imports"] })
      toast.success(
        `Imported ${result.imported_count} ${result.manufacturer} products (${result.status})`
      )
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const onFile = async (file: File | null) => {
    if (!file) {
      return
    }
    setFilename(file.name)
    const text = await file.text()
    setCsv(text)
    setPreview(null)
  }

  const selectManufacturer = (m: ManufacturerOption) => {
    setSelectedId(m.id)
    setFilename(m.default_filename)
    setCsv("")
    setPreview(null)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div>
          <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
            Catalog
          </Text>
          <Heading level="h1" className="mt-1">
            Manufacturer imports
          </Heading>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Import brand price lists into GBP store base with EUR/USD variant
            prices.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button size="small" variant="secondary" asChild>
            <Link to="/catalog/currencies">FX rates</Link>
          </Button>
          <Button size="small" variant="secondary" asChild>
            <Link to="/catalog">Catalog home</Link>
          </Button>
        </div>
      </div>

      <section className="px-6 py-5">
        <Text weight="plus">Select manufacturer</Text>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {manufacturers.map((m) => {
            const active = m.id === selected?.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => selectManufacturer(m)}
                className={`rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-ui-border-interactive bg-ui-bg-base shadow-sm"
                    : "border-ui-border-base bg-ui-bg-subtle hover:border-ui-border-strong"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Text weight="plus">{m.name}</Text>
                  <Badge
                    size="2xsmall"
                    color={m.source_currency === "usd" ? "orange" : "blue"}
                  >
                    {m.fx_label}
                  </Badge>
                </div>
                <Text size="small" className="mt-2 text-ui-fg-subtle">
                  {m.description}
                </Text>
              </button>
            )
          })}
          {!manufacturers.length && (
            <Text size="small" className="text-ui-fg-subtle">
              Loading manufacturers…
            </Text>
          )}
        </div>
      </section>

      {selected && (
        <section className="px-6 py-5">
          <div className="rounded-lg border border-ui-border-base p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Text weight="plus">{selected.name} import</Text>
                <Text size="small" className="mt-1 text-ui-fg-subtle">
                  {selected.id === "spectrum"
                    ? "Variant CSV: sku, parent_sku, title, price, connectivity, router, region, antenna. Rows with the same parent_sku become one product with those options."
                    : `Upload CSV (or paste). Expected columns: SKU, Description, List Price (${selected.source_currency.toUpperCase()}). Semicolon delimiters are supported.`}
                </Text>
              </div>
              <Badge
                color={selected.source_currency === "usd" ? "orange" : "blue"}
                size="2xsmall"
              >
                {selected.fx_label}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => onFile(event.target.files?.[0] ?? null)}
              />
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setCsv(selected.sample_csv)
                  setFilename(selected.default_filename.replace(".csv", "-sample.csv"))
                  setPreview(null)
                }}
              >
                Load sample
              </Button>
            </div>

            <Textarea
              className="mt-3 min-h-[180px] font-mono text-xs"
              value={csv}
              onChange={(event) => {
                setCsv(event.target.value)
                setPreview(null)
              }}
              placeholder={`Paste ${selected.name} CSV here…`}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="small"
                variant="secondary"
                disabled={!csv.trim()}
                isLoading={previewMutation.isPending}
                onClick={() => previewMutation.mutate()}
              >
                Preview conversion
              </Button>
              <Button
                size="small"
                disabled={!csv.trim() || !preview}
                isLoading={importMutation.isPending}
                onClick={() => importMutation.mutate()}
              >
                Import products
              </Button>
            </div>
          </div>
        </section>
      )}

      {preview && (
        <section className="px-6 py-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Text weight="plus">
              Preview · {preview.manufacturer} · {preview.total_rows} rows ·
              rate <span className="font-mono">{preview.fx_rate}</span> (
              {preview.source_currency.toUpperCase()}→
              {preview.target_currency.toUpperCase()})
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              Showing {preview.preview_count} · skipped {preview.skipped_count}
            </Text>
          </div>

          <div className="overflow-x-auto rounded-md border border-ui-border-base">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>SKU</Table.HeaderCell>
                  <Table.HeaderCell>Title</Table.HeaderCell>
                  <Table.HeaderCell>EUR</Table.HeaderCell>
                  <Table.HeaderCell>GBP</Table.HeaderCell>
                  <Table.HeaderCell>USD</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {preview.items.map((item) => (
                  <Table.Row key={item.sku}>
                    <Table.Cell>
                      <Text size="small" className="font-mono">
                        {item.sku}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{item.title}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        {formatMoney(item.eur_price, "eur")}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small" weight="plus">
                        {formatMoney(item.gbp_price, "gbp")}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">
                        {formatMoney(item.usd_price, "usd")}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </section>
      )}

      <section className="px-6 py-5">
        <Text weight="plus">Recent import jobs</Text>
        <div className="mt-3 overflow-x-auto rounded-md border border-ui-border-base">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Manufacturer</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Source</Table.HeaderCell>
                <Table.HeaderCell>Rows</Table.HeaderCell>
                <Table.HeaderCell>FX</Table.HeaderCell>
                <Table.HeaderCell>File</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(jobsQuery.data?.jobs ?? []).map((job) => (
                <Table.Row key={job.id}>
                  <Table.Cell>{job.manufacturer}</Table.Cell>
                  <Table.Cell>
                    <Badge size="2xsmall" color="grey">
                      {job.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" className="uppercase">
                      {job.source_currency}→{job.target_currency}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">
                      {job.imported_count}/{job.total_rows}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" className="font-mono">
                      {job.fx_rate_used ?? "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" className="text-ui-fg-subtle">
                      {job.filename ?? "—"}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
              {!jobsQuery.data?.jobs?.length && (
                <Table.Row>
                  <Table.Cell>
                    <Text size="small" className="text-ui-fg-subtle">
                      No imports yet.
                    </Text>
                  </Table.Cell>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </section>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Imports",
  icon: Buildings,
  rank: 2,
})

export default CatalogImportsPage
