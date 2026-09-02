import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CurrencyDollar } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { catalogClient } from "../../../lib/catalog-client"

const CURRENCIES = ["gbp", "eur", "usd"] as const

const formatRate = (rate: number) =>
  new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(rate)

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)

const CatalogCurrenciesPage = () => {
  const queryClient = useQueryClient()
  const [fromCurrency, setFromCurrency] = useState("eur")
  const [toCurrency, setToCurrency] = useState("gbp")
  const [amount, setAmount] = useState("100")
  const [editFrom, setEditFrom] = useState("eur")
  const [editTo, setEditTo] = useState("gbp")
  const [editRate, setEditRate] = useState("0.86")
  const [editNotes, setEditNotes] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-catalog-fx"],
    queryFn: () => catalogClient.getFxRates(),
  })

  const convertMutation = useMutation({
    mutationFn: () =>
      catalogClient.convert({
        amount: Number(amount),
        from: fromCurrency,
        to: toCurrency,
      }),
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      catalogClient.upsertFxRate({
        from_currency: editFrom,
        to_currency: editTo,
        rate: Number(editRate),
        notes: editNotes || null,
        upsert_inverse: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-catalog-fx"] })
      toast.success("FX rate saved (pair + inverse)")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const matrix = useMemo(() => {
    const rates = data?.rates ?? []
    const map = new Map(
      rates.map((rate) => [
        `${rate.from_currency}:${rate.to_currency}`,
        rate.rate,
      ])
    )

    return CURRENCIES.map((from) =>
      CURRENCIES.map((to) => {
        if (from === to) {
          return { from, to, rate: 1 }
        }
        return {
          from,
          to,
          rate: map.get(`${from}:${to}`) ?? null,
        }
      })
    ).flat()
  }, [data?.rates])

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div>
          <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
            Catalog
          </Text>
          <Heading level="h1" className="mt-1">
            Currencies & FX
          </Heading>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Store base currency is GBP. Convert manufacturer lists (EUR/USD)
            before import.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="green" size="2xsmall">
            Base GBP
          </Badge>
          <Button size="small" variant="secondary" asChild>
            <Link to="/catalog">Catalog home</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-6 px-6 py-5 lg:grid-cols-2">
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text weight="plus">Converter</Text>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            EUR → GBP, USD → GBP, and reverse pairs.
          </Text>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <Label>Amount</Label>
              <Input
                className="mt-1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div>
              <Label>From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <Select.Trigger className="mt-1">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {CURRENCIES.map((code) => (
                    <Select.Item key={code} value={code}>
                      {code.toUpperCase()}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div>
              <Label>To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <Select.Trigger className="mt-1">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {CURRENCIES.map((code) => (
                    <Select.Item key={code} value={code}>
                      {code.toUpperCase()}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              size="small"
              variant="secondary"
              isLoading={convertMutation.isPending}
              onClick={() => convertMutation.mutate()}
            >
              Convert
            </Button>
            {convertMutation.data && (
              <Text weight="plus">
                {formatMoney(convertMutation.data.amount, convertMutation.data.from)}{" "}
                ={" "}
                {formatMoney(
                  convertMutation.data.converted,
                  convertMutation.data.to
                )}{" "}
                <span className="text-ui-fg-muted font-normal">
                  @ {formatRate(convertMutation.data.rate)}
                </span>
              </Text>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-ui-border-base p-4">
          <Text weight="plus">Update rate pair</Text>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Saves forward + inverse automatically.
          </Text>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label>From</Label>
              <Select value={editFrom} onValueChange={setEditFrom}>
                <Select.Trigger className="mt-1">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {CURRENCIES.map((code) => (
                    <Select.Item key={code} value={code}>
                      {code.toUpperCase()}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div>
              <Label>To</Label>
              <Select value={editTo} onValueChange={setEditTo}>
                <Select.Trigger className="mt-1">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {CURRENCIES.map((code) => (
                    <Select.Item key={code} value={code}>
                      {code.toUpperCase()}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div>
              <Label>Rate (1 From = ? To)</Label>
              <Input
                className="mt-1"
                value={editRate}
                onChange={(event) => setEditRate(event.target.value)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                className="mt-1"
                value={editNotes}
                onChange={(event) => setEditNotes(event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <Button
            className="mt-4"
            size="small"
            isLoading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Save pair
          </Button>
        </div>
      </section>

      <section className="px-6 py-5">
        <Text weight="plus">Rate matrix</Text>
        {isLoading && <Text className="mt-3">Loading rates…</Text>}
        {error && (
          <Text className="mt-3 text-ui-fg-error">
            {(error as Error).message}
          </Text>
        )}

        {!isLoading && !error && (
          <div className="mt-3 overflow-x-auto rounded-md border border-ui-border-base">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Pair</Table.HeaderCell>
                  <Table.HeaderCell>Rate</Table.HeaderCell>
                  <Table.HeaderCell>Meaning</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {matrix.map((cell) => (
                  <Table.Row key={`${cell.from}-${cell.to}`}>
                    <Table.Cell>
                      <Text size="small" className="font-mono uppercase">
                        {cell.from}/{cell.to}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small" className="font-mono">
                        {cell.rate == null ? "—" : formatRate(cell.rate)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small" className="text-ui-fg-subtle">
                        {cell.rate == null
                          ? "Not configured"
                          : `1 ${cell.from.toUpperCase()} = ${formatRate(cell.rate)} ${cell.to.toUpperCase()}`}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </section>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Currencies",
  icon: CurrencyDollar,
  rank: 1,
})

export default CatalogCurrenciesPage
