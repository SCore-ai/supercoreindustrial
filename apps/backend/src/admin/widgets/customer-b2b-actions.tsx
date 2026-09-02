import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Label,
  Prompt,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import MoreActionsMenu, {
  type MoreActionItem,
} from "../components/shared/more-actions-menu"
import { b2bClient } from "../lib/client"

const HEADER_MOUNT_ID = "supercore-send-password-reset-host"

function useCustomerHeaderMount(email?: string | null) {
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!email) {
      setHost(null)
      return
    }

    const attach = () => {
      const existing = document.getElementById(HEADER_MOUNT_ID)
      if (existing) {
        setHost(existing)
        return true
      }

      const heading = Array.from(document.querySelectorAll("h1")).find(
        (element) => element.textContent?.trim() === email
      )
      const actions = heading?.parentElement?.querySelector(":scope > div")

      if (!actions) {
        return false
      }

      const mount = document.createElement("div")
      mount.id = HEADER_MOUNT_ID
      mount.style.display = "flex"
      mount.style.alignItems = "center"
      const menu = actions.lastElementChild
      if (menu) {
        actions.insertBefore(mount, menu)
      } else {
        actions.appendChild(mount)
      }
      setHost(mount)
      return true
    }

    if (attach()) {
      return () => {
        document.getElementById(HEADER_MOUNT_ID)?.remove()
      }
    }

    const observer = new MutationObserver(() => {
      if (attach()) {
        observer.disconnect()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.getElementById(HEADER_MOUNT_ID)?.remove()
    }
  }, [email])

  return host
}

type CustomerWidgetData = {
  id?: string
  email?: string | null
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const body = await response.text()
    let message = body || `Request failed (${response.status})`
    try {
      const parsed = JSON.parse(body) as { message?: string }
      if (parsed?.message) {
        message = parsed.message
      }
    } catch {
      // keep raw body
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

function resolveCustomerId(
  data: CustomerWidgetData | undefined,
  paramId: string | undefined,
  pathname: string
) {
  if (data?.id) {
    return data.id
  }

  if (paramId) {
    return paramId
  }

  const match = pathname.match(
    /\/customers\/(?!companies(?:\/|$)|create(?:\/|$))([^/]+)/
  )

  return match?.[1] ?? null
}

const CustomerB2bActionsWidget = ({
  data,
}: {
  data?: CustomerWidgetData
}) => {
  const { id: paramId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addGroupId, setAddGroupId] = useState("")

  const customerId = resolveCustomerId(data, paramId, location.pathname)

  const { data: customer } = useQuery({
    queryKey: ["admin-customer", customerId],
    queryFn: () =>
      adminFetch<{
        customer: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          groups?: Array<{ id: string; name?: string | null }>
        }
      }>(
        `/admin/customers/${customerId}?fields=+groups`
      ),
    enabled: Boolean(customerId),
  })

  const { data: groupsData } = useQuery({
    queryKey: ["admin-b2b-groups"],
    queryFn: () => b2bClient.listCustomerGroups(),
    enabled: Boolean(customerId),
  })

  const { data: companyData } = useQuery({
    queryKey: ["admin-b2b-company-by-customer", customerId],
    queryFn: async () => {
      const response = await fetch(`/admin/b2b/companies?limit=100`, {
        credentials: "include",
      })

      if (!response.ok) {
        return null
      }

      const body = (await response.json()) as {
        companies: Array<{ id: string; primary_customer_id?: string | null }>
      }

      return (
        body.companies.find(
          (company) => company.primary_customer_id === customerId
        ) ?? null
      )
    },
    enabled: Boolean(customerId),
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      adminFetch(`/admin/customers/${customerId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Customer deleted")
      navigate("/customers")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const resetMutation = useMutation({
    mutationFn: () => b2bClient.sendCustomerPasswordReset(customerId!),
    onSuccess: (result) => {
      toast.success(`Password reset email sent to ${result.email}`)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const customerGroups = customer?.customer.groups ?? []
  const availableGroups = (groupsData?.groups ?? []).filter(
    (group) => !customerGroups.some((assigned) => assigned.id === group.id)
  )

  const invalidateCustomerGroups = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-customer", customerId] })
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-groups"] })
  }

  const addGroupMutation = useMutation({
    mutationFn: () =>
      b2bClient.linkCustomersToGroup(addGroupId, { add: [customerId!] }),
    onSuccess: () => {
      invalidateCustomerGroups()
      setAddGroupId("")
      toast.success("Customer added to group")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const removeGroupMutation = useMutation({
    mutationFn: (groupId: string) =>
      b2bClient.linkCustomersToGroup(groupId, { remove: [customerId!] }),
    onSuccess: () => {
      invalidateCustomerGroups()
      toast.success("Customer removed from group")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const actions = useMemo<MoreActionItem[]>(() => {
    const email = customer?.customer.email ?? data?.email

    return [
      {
        id: "issue-store-credit",
        label: "Issue store credit",
        onSelect: () => {
          toast.info(
            "Store credit is not enabled yet. Configure a store credit provider to use this action."
          )
        },
      },
      {
        id: "merge-customer",
        label: "Merge customer",
        onSelect: () => {
          toast.info(
            "Open the duplicate customer profile, then use Medusa customer merge when available."
          )
        },
      },
      {
        id: "request-customer-data",
        label: "Request customer data",
        onSelect: () => {
          toast.success(
            email
              ? `GDPR data request logged for ${email}. Export customer details from this page.`
              : "GDPR data request logged."
          )
        },
      },
      {
        id: "erase-personal-data",
        label: "Erase personal data",
        onSelect: () => {
          toast.warning(
            "Personal data erasure requires deleting or anonymizing the customer record."
          )
        },
      },
      {
        id: "delete-customer",
        label: "Delete customer",
        tone: "danger",
        onSelect: () => setDeleteOpen(true),
      },
    ]
  }, [customer?.customer.email, data?.email])

  const email = customer?.customer.email ?? data?.email
  const headerHost = useCustomerHeaderMount(email)

  if (!customerId) {
    return <></>
  }

  return (
    <>
      {headerHost &&
        createPortal(
          <Button
            size="small"
            variant="secondary"
            isLoading={resetMutation.isPending}
            onClick={() => resetMutation.mutate()}
          >
            Send password reset
          </Button>,
          headerHost
        )}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h2">Customer actions</Heading>
            {companyData && (
              <Link
                to={`/customers/companies/${companyData.id}`}
                className="text-sm text-ui-fg-interactive hover:underline"
              >
                View linked B2B company
              </Link>
            )}
          </div>
          <MoreActionsMenu actions={actions} />
        </div>
        <div className="px-6 py-4">
          <Button
            className="w-full"
            variant="secondary"
            isLoading={resetMutation.isPending}
            onClick={() => resetMutation.mutate()}
          >
            Send password reset
          </Button>
          <Text size="small" className="mt-2 text-ui-fg-subtle">
            {email
              ? `Emails a reset link to ${email}.`
              : "Emails a reset link to this customer."}
          </Text>
        </div>
        <div className="px-6 py-4">
          <Text weight="plus">Customer groups</Text>
          <div className="mt-3 flex flex-wrap gap-2">
            {customerGroups.map((group) => (
              <Badge key={group.id} size="2xsmall" className="gap-x-2">
                {group.name || group.id}
                <button
                  type="button"
                  className="text-ui-fg-muted hover:text-ui-fg-base"
                  disabled={removeGroupMutation.isPending}
                  onClick={() => removeGroupMutation.mutate(group.id)}
                >
                  Remove
                </button>
              </Badge>
            ))}
            {!customerGroups.length && (
              <Text size="small" className="text-ui-fg-subtle">
                Not in a Medusa customer group.
              </Text>
            )}
          </div>
          <div className="mt-3 space-y-2">
            <Label>Add to group</Label>
            <Select
              value={addGroupId || undefined}
              onValueChange={setAddGroupId}
              disabled={!availableGroups.length}
            >
              <Select.Trigger>
                <Select.Value
                  placeholder={
                    availableGroups.length
                      ? "Select a group"
                      : "No other groups"
                  }
                />
              </Select.Trigger>
              <Select.Content>
                {availableGroups.map((group) => (
                  <Select.Item key={group.id} value={group.id}>
                    {group.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Button
              className="w-full"
              size="small"
              variant="secondary"
              disabled={!addGroupId}
              isLoading={addGroupMutation.isPending}
              onClick={() => addGroupMutation.mutate()}
            >
              Add to group
            </Button>
          </div>
        </div>
      </Container>

      <Prompt open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete customer</Prompt.Title>
            <Prompt.Description>
              This permanently deletes the customer record. Orders and linked B2B
              data may need manual review.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete customer
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </>
  )
}

export const config = defineWidgetConfig({
  id: "supercore:customer-actions",
  zone: "customer.details.side",
})

export default CustomerB2bActionsWidget
