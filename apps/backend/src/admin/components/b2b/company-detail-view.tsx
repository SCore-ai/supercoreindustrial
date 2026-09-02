import {
  Button,
  Drawer,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import type { B2bCompany, B2bCompanyMember } from "../../lib/types"
import { b2bClient } from "../../lib/client"
import MoreActionsMenu, {
  type MoreActionItem,
} from "../shared/more-actions-menu"
import CompanyStatusBadge from "./company-status-badge"

const CompanyMoreActions = ({
  company,
  members,
  onEditDetails,
  onManagePermissions,
  onAddCustomer,
  onChangeMainContact,
  onEditAssignedStaff,
}: {
  company: B2bCompany
  members: B2bCompanyMember[]
  onEditDetails: () => void
  onManagePermissions: () => void
  onAddCustomer: () => void
  onChangeMainContact: () => void
  onEditAssignedStaff: () => void
}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const resendMutation = useMutation({
    mutationFn: () => b2bClient.resendTradeAccountWelcome(company.id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-company", company.id] })
      toast.success(
        result.password_setup_sent
          ? "B2B access email sent with password setup link"
          : "B2B access email sent"
      )
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const accessEmailMutation = useMutation({
    mutationFn: (email?: string) =>
      b2bClient.sendB2bAccessEmail(company.id, email ? { email } : {}),
    onSuccess: () => toast.success("B2B access email sent"),
    onError: (error: Error) => toast.error(error.message),
  })

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      b2bClient.removeCompanyMember(company.id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-b2b-company", company.id] })
      toast.success("Customer removed from company")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: () => b2bClient.deleteCompany(company.id),
    onSuccess: () => {
      toast.success("Company deleted")
      navigate("/customers/companies")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const nonPrimaryMembers = members.filter((member) => !member.is_primary)

  const actions = useMemo<MoreActionItem[]>(() => {
    const items: MoreActionItem[] = [
      {
        id: "edit-details",
        label: "Edit company details",
        onSelect: onEditDetails,
      },
      {
        id: "manage-permissions",
        label: "Manage permissions",
        onSelect: onManagePermissions,
      },
      {
        id: "add-customer",
        label: "Invite customer",
        onSelect: onAddCustomer,
      },
      {
        id: "change-main-contact",
        label: "Change main contact",
        onSelect: onChangeMainContact,
      },
      {
        id: "send-password-reset",
        label: "Send password reset",
        onSelect: async () => {
          if (!company.primary_customer_id) {
            toast.error("Link a customer to this company first")
            return
          }

          try {
            const result = await b2bClient.sendCustomerPasswordReset(
              company.primary_customer_id
            )
            toast.success(`Password reset email sent to ${result.email}`)
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Could not send password reset email"
            )
          }
        },
      },
      {
        id: "send-b2b-access",
        label: "Send B2B access email",
        onSelect: async () => {
          if (company.status === "approved") {
            await resendMutation.mutateAsync()
            return
          }

          await accessEmailMutation.mutateAsync(company.email)
        },
      },
      {
        id: "edit-assigned-staff",
        label: "Edit assigned staff",
        onSelect: onEditAssignedStaff,
      },
    ]

    for (const member of nonPrimaryMembers) {
      items.push({
        id: `remove-${member.id}`,
        label: `Remove customer — ${member.email || member.customer_id}`,
        section: "Remove customer",
        tone: "danger",
        onSelect: async () => {
          if (
            !window.confirm(
              `Remove ${member.email || "this customer"} from ${company.name}?`
            )
          ) {
            return
          }

          await removeMemberMutation.mutateAsync(member.id)
        },
      })
    }

    items.push({
      id: "delete-company",
      label: "Delete company",
      section: "Danger zone",
      tone: "danger",
      onSelect: async () => {
        if (
          !window.confirm(
            `Delete ${company.name}? This cannot be undone.`
          )
        ) {
          return
        }

        await deleteMutation.mutateAsync()
      },
    })

    return items
  }, [
    accessEmailMutation,
    company.email,
    company.id,
    company.name,
    company.primary_customer_id,
    company.status,
    deleteMutation,
    nonPrimaryMembers,
    onAddCustomer,
    onChangeMainContact,
    onEditAssignedStaff,
    onEditDetails,
    onManagePermissions,
    removeMemberMutation,
    resendMutation,
  ])

  return (
    <MoreActionsMenu
      actions={actions}
      isLoading={
        resendMutation.isPending ||
        accessEmailMutation.isPending ||
        removeMemberMutation.isPending ||
        deleteMutation.isPending
      }
    />
  )
}

export const CompanyDetailView = ({
  company,
  basePath = "/customers/companies",
}: {
  company: B2bCompany & { members?: B2bCompanyMember[] }
  basePath?: string
}) => {
  const queryClient = useQueryClient()
  const members = company.members ?? []

  const [editOpen, setEditOpen] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)
  const [mainContactOpen, setMainContactOpen] = useState(false)
  const [staffOpen, setStaffOpen] = useState(false)
  const [rejectNotes, setRejectNotes] = useState("")

  const [editForm, setEditForm] = useState({
    name: company.name,
    legal_name: company.legal_name ?? "",
    email: company.email,
    phone: company.phone ?? "",
    vat_number: company.vat_number ?? "",
    registration_number: company.registration_number ?? "",
    website: company.website ?? "",
    country_code: company.country_code ?? "",
    admin_notes: company.admin_notes ?? "",
  })

  const [memberEmail, setMemberEmail] = useState("")
  const [memberRole, setMemberRole] = useState<"admin" | "buyer" | "approver">(
    "buyer"
  )
  const [selectedMemberId, setSelectedMemberId] = useState(
    members.find((member) => member.is_primary)?.id ?? members[0]?.id ?? ""
  )
  const [assignedStaff, setAssignedStaff] = useState(
    (company.metadata as { assigned_staff?: string } | null)?.assigned_staff ?? ""
  )
  const [requireOrderApproval, setRequireOrderApproval] = useState(
    company.require_order_approval ?? true
  )
  const [customerGroupId, setCustomerGroupId] = useState(
    company.customer_group_id ?? ""
  )

  const { data: groupsData } = useQuery({
    queryKey: ["admin-b2b-groups"],
    queryFn: () => b2bClient.listCustomerGroups(),
  })
  const groups = groupsData?.groups ?? []

  useEffect(() => {
    setCustomerGroupId(company.customer_group_id ?? "")
  }, [company.customer_group_id])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-company", company.id] })
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-companies"] })
    queryClient.invalidateQueries({ queryKey: ["admin-b2b-groups"] })
  }

  const approveMutation = useMutation({
    mutationFn: () =>
      b2bClient.approveCompany(company.id, {
        customer_group_id: customerGroupId || null,
      }),
    onSuccess: () => {
      invalidate()
      toast.success("Company approved")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const rejectMutation = useMutation({
    mutationFn: () =>
      b2bClient.rejectCompany(company.id, { admin_notes: rejectNotes || null }),
    onSuccess: () => {
      invalidate()
      toast.success("Company rejected")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      b2bClient.updateCompany(company.id, {
        name: editForm.name.trim(),
        legal_name: editForm.legal_name.trim() || null,
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        vat_number: editForm.vat_number.trim() || null,
        registration_number: editForm.registration_number.trim() || null,
        website: editForm.website.trim() || null,
        country_code: editForm.country_code.trim() || null,
        admin_notes: editForm.admin_notes.trim() || null,
        require_order_approval: requireOrderApproval,
      }),
    onSuccess: () => {
      invalidate()
      setEditOpen(false)
      setPermissionsOpen(false)
      toast.success("Company updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const groupMutation = useMutation({
    mutationFn: () =>
      b2bClient.assignCompanyCustomerGroup(
        company.id,
        customerGroupId || null
      ),
    onSuccess: () => {
      invalidate()
      toast.success("Customer group updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const addMemberMutation = useMutation({
    mutationFn: () =>
      b2bClient.addCompanyMember(company.id, {
        email: memberEmail.trim() || null,
        role: memberRole,
      }),
    onSuccess: () => {
      invalidate()
      setAddCustomerOpen(false)
      setMemberEmail("")
      toast.success("Invite sent")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const setPrimaryMutation = useMutation({
    mutationFn: () =>
      b2bClient.setCompanyPrimaryContact(company.id, selectedMemberId),
    onSuccess: () => {
      invalidate()
      setMainContactOpen(false)
      toast.success("Main contact updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const saveStaffMutation = useMutation({
    mutationFn: () =>
      b2bClient.updateCompany(company.id, {
        metadata: {
          ...(company.metadata as Record<string, unknown> | null),
          assigned_staff: assignedStaff.trim() || null,
        },
      }),
    onSuccess: () => {
      invalidate()
      setStaffOpen(false)
      toast.success("Assigned staff updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const primaryMember =
    members.find((member) => member.is_primary) ?? members[0] ?? null

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Text size="small" className="text-ui-fg-subtle">
              Companies
            </Text>
          </div>
          <Text size="xlarge" weight="plus" className="mt-1">
            {company.name}
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            B2B customer account
          </Text>
          <div className="mt-2">
            <CompanyStatusBadge status={company.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={basePath}
            className="text-sm text-ui-fg-interactive hover:underline"
          >
            Back to companies
          </Link>
          <CompanyMoreActions
            company={company}
            members={members}
            onEditDetails={() => setEditOpen(true)}
            onManagePermissions={() => setPermissionsOpen(true)}
            onAddCustomer={() => setAddCustomerOpen(true)}
            onChangeMainContact={() => setMainContactOpen(true)}
            onEditAssignedStaff={() => setStaffOpen(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-y-6">
          <section className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
            <div className="flex items-center justify-between gap-3">
              <Text weight="plus">Orders</Text>
              <Link
                to="/orders/management"
                className="text-sm text-ui-fg-interactive hover:underline"
              >
                View all orders
              </Link>
            </div>
            <Text size="small" className="mt-4 text-ui-fg-subtle">
              No orders yet for this company.
            </Text>
            <Button className="mt-4" size="small" variant="secondary" disabled>
              Create order
            </Button>
          </section>

          <section className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
            <div className="flex items-center justify-between gap-3">
              <Text weight="plus">Customers</Text>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setAddCustomerOpen(true)}
              >
                Invite customer
              </Button>
            </div>
            <div className="mt-4 divide-y divide-ui-border-base">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <Text size="small" weight="plus">
                      {member.email || member.customer_id}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {member.role}
                      {member.is_primary ? " · Main contact" : ""}
                    </Text>
                  </div>
                  {member.customer_id && (
                    <Link
                      to={`/customers/${member.customer_id}`}
                      className="text-sm text-ui-fg-interactive hover:underline"
                    >
                      View customer
                    </Link>
                  )}
                </div>
              ))}
              {!members.length && (
                <Text size="small" className="py-3 text-ui-fg-subtle">
                  No customers linked yet.
                </Text>
              )}
            </div>
          </section>

          {company.status === "pending" && (
            <section className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
              <Text weight="plus">Approval</Text>
              <Text size="small" className="mt-2 text-ui-fg-subtle">
                Review this registration before granting trade account access.
                Unassigned companies default to the Trade Account group.
              </Text>
              <div className="mt-4">
                <Label>Customer group</Label>
                <Select
                  value={customerGroupId || "none"}
                  onValueChange={(value) =>
                    setCustomerGroupId(value === "none" ? "" : value)
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select a group" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="none">
                      Default (Trade Account)
                    </Select.Item>
                    {groups.map((group) => (
                      <Select.Item key={group.id} value={group.id}>
                        {group.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => approveMutation.mutate()}
                  isLoading={approveMutation.isPending}
                >
                  Approve company
                </Button>
              </div>
              <div className="mt-4">
                <Label htmlFor="reject_notes">Rejection notes</Label>
                <Textarea
                  id="reject_notes"
                  value={rejectNotes}
                  onChange={(event) => setRejectNotes(event.target.value)}
                />
                <Button
                  className="mt-2"
                  variant="danger"
                  onClick={() => rejectMutation.mutate()}
                  isLoading={rejectMutation.isPending}
                >
                  Reject
                </Button>
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-y-4">
          <section className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
            <Text weight="plus">{company.name}</Text>
            <div className="mt-2">
              <CompanyStatusBadge status={company.status} />
            </div>
            <div className="mt-4 space-y-2">
              <Text size="small">
                <span className="text-ui-fg-subtle">Main contact:</span>{" "}
                {primaryMember?.email || company.email}
              </Text>
              <Text size="small">
                <span className="text-ui-fg-subtle">Email:</span> {company.email}
              </Text>
              {company.primary_customer_id && (
                <Link
                  to={`/customers/${company.primary_customer_id}`}
                  className="text-sm text-ui-fg-interactive hover:underline"
                >
                  Open primary customer
                </Link>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
            <Text weight="plus">Customizations</Text>
            <div className="mt-4 space-y-3">
              <div>
                <Label>Customer group</Label>
                <Select
                  value={customerGroupId || "none"}
                  onValueChange={(value) =>
                    setCustomerGroupId(value === "none" ? "" : value)
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select a group" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="none">Not assigned</Select.Item>
                    {groups.map((group) => (
                      <Select.Item key={group.id} value={group.id}>
                        {group.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Button
                  className="mt-2"
                  size="small"
                  disabled={
                    (customerGroupId || null) ===
                    (company.customer_group_id || null)
                  }
                  isLoading={groupMutation.isPending}
                  onClick={() => groupMutation.mutate()}
                >
                  Save group
                </Button>
              </div>
              <Text size="small">
                <span className="text-ui-fg-subtle">Order approval:</span>{" "}
                {company.require_order_approval ? "Required for buyers" : "Off"}
              </Text>
              <Text size="small">
                <span className="text-ui-fg-subtle">Country:</span>{" "}
                {company.country_code || "—"}
              </Text>
            </div>
          </section>

          <section className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
            <Text weight="plus">Assigned staff</Text>
            <Text size="small" className="mt-2 text-ui-fg-subtle">
              {(company.metadata as { assigned_staff?: string } | null)
                ?.assigned_staff || "None"}
            </Text>
          </section>

          <section className="rounded-xl border border-ui-border-base bg-ui-bg-base p-5">
            <Text weight="plus">Notes</Text>
            <Text size="small" className="mt-2 text-ui-fg-subtle">
              {company.admin_notes || "No notes"}
            </Text>
          </section>
        </div>
      </div>

      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit company details</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="space-y-4">
            {[
              ["name", "Company name"],
              ["legal_name", "Legal name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["vat_number", "VAT number"],
              ["registration_number", "Registration number"],
              ["website", "Website"],
              ["country_code", "Country code"],
            ].map(([key, label]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  value={editForm[key as keyof typeof editForm]}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editForm.admin_notes}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    admin_notes: event.target.value,
                  }))
                }
              />
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              onClick={() => updateMutation.mutate()}
              isLoading={updateMutation.isPending}
            >
              Save changes
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      <Drawer open={permissionsOpen} onOpenChange={setPermissionsOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Manage permissions</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="space-y-4">
            <Text size="small" className="text-ui-fg-subtle">
              Control whether subaccount buyers need approval before orders are
              placed.
            </Text>
            <Select
              value={requireOrderApproval ? "required" : "off"}
              onValueChange={(value) =>
                setRequireOrderApproval(value === "required")
              }
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="required">
                  Require approval for buyers
                </Select.Item>
                <Select.Item value="off">No approval required</Select.Item>
              </Select.Content>
            </Select>
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              onClick={() => updateMutation.mutate()}
              isLoading={updateMutation.isPending}
            >
              Save permissions
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      <Drawer open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Invite customer</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={memberRole}
                onValueChange={(value) =>
                  setMemberRole(value as "admin" | "buyer" | "approver")
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="buyer">Buyer</Select.Item>
                  <Select.Item value="approver">Approver</Select.Item>
                  <Select.Item value="admin">Admin</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              disabled={!memberEmail.trim()}
              onClick={() => addMemberMutation.mutate()}
              isLoading={addMemberMutation.isPending}
            >
              Invite customer
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      <Drawer open={mainContactOpen} onOpenChange={setMainContactOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Change main contact</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <Select
              value={selectedMemberId}
              onValueChange={setSelectedMemberId}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select member" />
              </Select.Trigger>
              <Select.Content>
                {members.map((member) => (
                  <Select.Item key={member.id} value={member.id}>
                    {member.email || member.customer_id}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              disabled={!selectedMemberId}
              onClick={() => setPrimaryMutation.mutate()}
              isLoading={setPrimaryMutation.isPending}
            >
              Set main contact
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      <Drawer open={staffOpen} onOpenChange={setStaffOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit assigned staff</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <Label>Assigned staff</Label>
            <Input
              value={assignedStaff}
              onChange={(event) => setAssignedStaff(event.target.value)}
              placeholder="Sales rep name or email"
            />
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              onClick={() => saveStaffMutation.mutate()}
              isLoading={saveStaffMutation.isPending}
            >
              Save assigned staff
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

export default CompanyMoreActions
