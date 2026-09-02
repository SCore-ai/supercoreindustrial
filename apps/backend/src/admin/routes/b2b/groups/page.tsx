import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
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
import B2bPageShell from "../../../components/b2b/b2b-page-shell"
import { b2bClient } from "../../../lib/client"

const B2bGroupsPage = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [assignGroupId, setAssignGroupId] = useState<string | null>(null)
  const [assignCompanyId, setAssignCompanyId] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-groups"],
    queryFn: () => b2bClient.listCustomerGroups(),
  })

  const { data: companiesData } = useQuery({
    queryKey: ["admin-b2b-companies", "groups-assign"],
    queryFn: () =>
      b2bClient.listCompanies({ status: "approved", limit: 100, offset: 0 }),
  })

  const groups = data?.groups ?? []
  const companies = companiesData?.companies ?? []

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-groups"] })
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-companies"] })
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-pricing-tiers"] })
  }

  const createMutation = useMutation({
    mutationFn: () => b2bClient.createCustomerGroup({ name: name.trim() }),
    onSuccess: () => {
      invalidate()
      setName("")
      toast.success("Customer group created")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const renameMutation = useMutation({
    mutationFn: () =>
      b2bClient.renameCustomerGroup(renameId!, renameValue.trim()),
    onSuccess: () => {
      invalidate()
      setRenameId(null)
      setRenameValue("")
      toast.success("Group renamed")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => b2bClient.deleteCustomerGroup(id),
    onSuccess: () => {
      invalidate()
      toast.success("Group deleted")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const assignMutation = useMutation({
    mutationFn: () =>
      b2bClient.assignCompanyCustomerGroup(assignCompanyId, assignGroupId),
    onSuccess: () => {
      invalidate()
      setAssignCompanyId("")
      toast.success("Company assigned to group")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const assignableCompanies = useMemo(() => {
    if (!assignGroupId) {
      return companies
    }
    return companies.filter(
      (company) => company.customer_group_id !== assignGroupId
    )
  }, [assignGroupId, companies])

  return (
    <Container className="p-0">
      <B2bPageShell
        title="Groups"
        subtitle="Create Medusa customer groups and assign trade accounts. Pricing rules can target a group."
        actions={
          <Link
            to="/b2b/pricing-tiers"
            className="text-sm text-ui-fg-interactive hover:underline"
          >
            Group rules →
          </Link>
        }
      >
        <div className="mb-6 grid gap-3 rounded-lg border border-ui-border-base p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Label htmlFor="new-group-name">New group</Label>
            <Input
              id="new-group-name"
              placeholder="e.g. Trade Account, Integrator, OEM"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <Button
            disabled={!name.trim()}
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Create group
          </Button>
        </div>

        {typeof data?.unassigned_companies === "number" &&
          data.unassigned_companies > 0 && (
            <Text size="small" className="mb-4 text-ui-fg-subtle">
              {data.unassigned_companies === 1
                ? "1 company is not assigned to a group."
                : `${data.unassigned_companies} companies are not assigned to a group.`}
            </Text>
          )}

        {isLoading && <Text>Loading groups...</Text>}
        {error && (
          <Text className="text-ui-fg-error">{(error as Error).message}</Text>
        )}

        {!isLoading && !error && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Group</Table.HeaderCell>
                <Table.HeaderCell>Customers</Table.HeaderCell>
                <Table.HeaderCell>Companies</Table.HeaderCell>
                <Table.HeaderCell>Pricing rules</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {groups.map((group) => (
                <Table.Row key={group.id}>
                  <Table.Cell>
                    {renameId === group.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={renameValue}
                          onChange={(event) =>
                            setRenameValue(event.target.value)
                          }
                        />
                        <Button
                          size="small"
                          disabled={!renameValue.trim()}
                          isLoading={renameMutation.isPending}
                          onClick={() => renameMutation.mutate()}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => {
                            setRenameId(null)
                            setRenameValue("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Text size="small" weight="plus">
                          {group.name}
                        </Text>
                        <Text size="xsmall" className="font-mono text-ui-fg-subtle">
                          {group.id}
                        </Text>
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>{group.customer_count}</Table.Cell>
                  <Table.Cell>{group.companies}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      size="2xsmall"
                      color={group.pricing_rules ? "green" : "grey"}
                    >
                      {group.pricing_rules} rules
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => {
                          setRenameId(group.id)
                          setRenameValue(group.name)
                        }}
                      >
                        Rename
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => {
                          setAssignGroupId(group.id)
                          setAssignCompanyId("")
                        }}
                      >
                        Assign company
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        isLoading={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(group.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}

              {!groups.length && (
                <Table.Row>
                  <Table.Cell colSpan={5}>
                    <Text className="text-ui-fg-subtle">
                      No Medusa customer groups yet. Create Trade Account or
                      another group to start assigning companies.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}

        {assignGroupId && (
          <div className="mt-6 space-y-3 rounded-lg border border-ui-border-base p-4">
            <Text weight="plus">
              Assign company to{" "}
              {groups.find((group) => group.id === assignGroupId)?.name ??
                "group"}
            </Text>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
              <div>
                <Label>Approved company</Label>
                <Select
                  value={assignCompanyId}
                  onValueChange={setAssignCompanyId}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select a company" />
                  </Select.Trigger>
                  <Select.Content>
                    {assignableCompanies.map((company) => (
                      <Select.Item key={company.id} value={company.id}>
                        {company.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              <Button
                disabled={!assignCompanyId}
                isLoading={assignMutation.isPending}
                onClick={() => assignMutation.mutate()}
              >
                Assign
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setAssignGroupId(null)
                  setAssignCompanyId("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </B2bPageShell>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Groups",
  rank: 3,
})

export default B2bGroupsPage
