import { defineRouteConfig } from "@medusajs/admin-sdk"
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
import { useState } from "react"
import { b2bClient } from "../../../lib/client"
import type { PricingTierInput } from "../../../lib/types"

const emptyForm: PricingTierInput = {
  name: "",
  variant_id: "",
  customer_group_id: "",
  min_quantity: 1,
  max_quantity: null,
  unit_price: null,
  currency_code: "gbp",
  discount_percent: 0,
  priority: 0,
  status: "active",
}

const B2bPricingTiersPage = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PricingTierInput>(emptyForm)
  const [statusFilter, setStatusFilter] = useState("all")

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-pricing-tiers", statusFilter],
    queryFn: () =>
      b2bClient.listPricingTiers(
        statusFilter === "all" ? {} : { status: statusFilter }
      ),
  })

  const { data: groupsData } = useQuery({
    queryKey: ["admin-b2b-groups"],
    queryFn: () => b2bClient.listCustomerGroups(),
  })
  const groups = groupsData?.groups ?? []

  const createMutation = useMutation({
    mutationFn: () =>
      b2bClient.createPricingTier({
        ...form,
        variant_id: form.variant_id || null,
        customer_group_id: form.customer_group_id || null,
        unit_price:
          form.unit_price != null && form.unit_price !== ("" as unknown)
            ? Number(form.unit_price)
            : null,
        min_quantity: Number(form.min_quantity ?? 1),
        max_quantity: form.max_quantity ? Number(form.max_quantity) : null,
        discount_percent: Number(form.discount_percent ?? 0),
        priority: Number(form.priority ?? 0),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-pricing-tiers"] })
      toast.success("Pricing tier created")
      setForm(emptyForm)
      setShowForm(false)
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => b2bClient.deletePricingTier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-pricing-tiers"] })
      toast.success("Tier deleted")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const toggleMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: "active" | "disabled"
    }) => b2bClient.updatePricingTier(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-pricing-tiers"] })
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const tiers = data?.tiers ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Group rules</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Tiered pricing and quantity breaks by customer group (B2B Module group rules)
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger>
                <Select.Value placeholder="Status" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All</Select.Item>
                <Select.Item value="active">Active</Select.Item>
                <Select.Item value="disabled">Disabled</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <Button size="small" onClick={() => setShowForm((prev) => !prev)}>
            Add tier
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 gap-3 border-b border-ui-border-base px-6 py-4 md:grid-cols-2">
          <div>
            <Label htmlFor="tier_name">Name</Label>
            <Input
              id="tier_name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="tier_variant">Variant ID</Label>
            <Input
              id="tier_variant"
              value={form.variant_id ?? ""}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, variant_id: event.target.value }))
              }
            />
          </div>
          <div>
            <Label>Customer group</Label>
            <Select
              value={form.customer_group_id || "any"}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  customer_group_id: value === "any" ? "" : value,
                }))
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Any group" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="any">Any group</Select.Item>
                {groups.map((group) => (
                  <Select.Item key={group.id} value={group.id}>
                    {group.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div>
            <Label htmlFor="tier_currency">Currency</Label>
            <Input
              id="tier_currency"
              value={form.currency_code ?? "gbp"}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  currency_code: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="tier_min">Min quantity</Label>
            <Input
              id="tier_min"
              type="number"
              value={form.min_quantity ?? 1}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  min_quantity: Number(event.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="tier_max">Max quantity (optional)</Label>
            <Input
              id="tier_max"
              type="number"
              value={form.max_quantity ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  max_quantity: event.target.value
                    ? Number(event.target.value)
                    : null,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="tier_price">Unit price</Label>
            <Input
              id="tier_price"
              type="number"
              step="0.01"
              value={form.unit_price ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  unit_price: event.target.value
                    ? Number(event.target.value)
                    : null,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="tier_discount">Discount %</Label>
            <Input
              id="tier_discount"
              type="number"
              value={form.discount_percent ?? 0}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  discount_percent: Number(event.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="tier_priority">Priority</Label>
            <Input
              id="tier_priority"
              type="number"
              value={form.priority ?? 0}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  priority: Number(event.target.value),
                }))
              }
            />
          </div>
          <div className="flex items-end">
            <Button
              disabled={!form.name.trim()}
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Save tier
            </Button>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        {isLoading && <Text>Loading tiers...</Text>}
        {error && (
          <Text className="text-ui-fg-error">{(error as Error).message}</Text>
        )}

        {!isLoading && !error && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Group</Table.HeaderCell>
                <Table.HeaderCell>Variant</Table.HeaderCell>
                <Table.HeaderCell>Qty range</Table.HeaderCell>
                <Table.HeaderCell>Price</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tiers.map((tier) => (
                <Table.Row key={tier.id}>
                  <Table.Cell>{tier.name}</Table.Cell>
                  <Table.Cell>
                    {groups.find((group) => group.id === tier.customer_group_id)
                      ?.name ||
                      (tier.customer_group_id ? tier.customer_group_id : "Any")}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="xsmall" className="font-mono">
                      {tier.variant_id || "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    {tier.min_quantity}
                    {tier.max_quantity != null ? `–${tier.max_quantity}` : "+"}
                  </Table.Cell>
                  <Table.Cell>
                    {tier.unit_price != null
                      ? `${tier.currency_code.toUpperCase()} ${tier.unit_price}`
                      : tier.discount_percent
                        ? `${tier.discount_percent}% off`
                        : "—"}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={tier.status === "active" ? "green" : "grey"}>
                      {tier.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        isLoading={toggleMutation.isPending}
                        onClick={() =>
                          toggleMutation.mutate({
                            id: tier.id,
                            status:
                              tier.status === "active" ? "disabled" : "active",
                          })
                        }
                      >
                        {tier.status === "active" ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        isLoading={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(tier.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}

              {!tiers.length && (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <Text className="text-ui-fg-subtle">
                      No pricing tiers configured yet.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Group Rules",
  rank: 4,
})

export default B2bPricingTiersPage
