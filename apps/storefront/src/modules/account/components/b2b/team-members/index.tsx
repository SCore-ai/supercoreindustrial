"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  inviteB2bMember,
  removeB2bMember,
  resendB2bMemberInvite,
  updateB2bMember,
  type StoreB2bMember,
} from "@lib/data/b2b-account"

const ROLE_OPTIONS = [
  { value: "buyer", label: "Buyer" },
  { value: "approver", label: "Approver" },
  { value: "admin", label: "Admin" },
] as const

function memberName(member: StoreB2bMember) {
  const name = [member.first_name, member.last_name].filter(Boolean).join(" ")
  return name || member.email || "Team member"
}

function statusLabel(status: string) {
  if (status === "invited") {
    return "Invited"
  }
  if (status === "disabled") {
    return "Disabled"
  }
  return "Active"
}

const TeamMembers = ({
  members,
  canManage,
}: {
  members: StoreB2bMember[]
  canManage: boolean
}) => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState<"admin" | "buyer" | "approver">("buyer")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const refresh = () => router.refresh()

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setNotice(null)

    if (!email.trim()) {
      setError("Email is required.")
      return
    }

    startTransition(async () => {
      try {
        const result = await inviteB2bMember({
          email: email.trim(),
          role,
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
        })
        setEmail("")
        setFirstName("")
        setLastName("")
        setRole("buyer")
        setNotice(
          result.password_setup_sent
            ? `Invite sent to ${result.member.email}.`
            : `${result.member.email} was added to the team.`
        )
        refresh()
      } catch (inviteError) {
        setError(
          inviteError instanceof Error
            ? inviteError.message
            : "Could not send invite"
        )
      }
    })
  }

  const runMemberAction = (
    memberId: string,
    action: () => Promise<unknown>,
    successMessage?: string
  ) => {
    setError(null)
    setNotice(null)
    setActiveId(memberId)

    startTransition(async () => {
      try {
        await action()
        if (successMessage) {
          setNotice(successMessage)
        }
        refresh()
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not update team member"
        )
      } finally {
        setActiveId(null)
      }
    })
  }

  return (
    <div className="space-y-8">
      {canManage && (
        <form
          onSubmit={handleInvite}
          className="rounded-xl border border-[var(--sc-line)] bg-white p-6"
        >
          <h2 className="text-large-semi mb-1">Invite a teammate</h2>
          <p className="mb-4 text-sm text-ui-fg-subtle">
            They receive an email to set a password and join this trade account.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="team-email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="team-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-[var(--sc-line)] px-3 py-2 text-sm focus:border-[var(--sc-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--sc-cta)]/20"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label htmlFor="team-first" className="mb-1.5 block text-sm font-medium">
                First name
              </label>
              <input
                id="team-first"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="w-full rounded-lg border border-[var(--sc-line)] px-3 py-2 text-sm focus:border-[var(--sc-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--sc-cta)]/20"
              />
            </div>
            <div>
              <label htmlFor="team-last" className="mb-1.5 block text-sm font-medium">
                Last name
              </label>
              <input
                id="team-last"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="w-full rounded-lg border border-[var(--sc-line)] px-3 py-2 text-sm focus:border-[var(--sc-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--sc-cta)]/20"
              />
            </div>
            <div>
              <label htmlFor="team-role" className="mb-1.5 block text-sm font-medium">
                Role
              </label>
              <select
                id="team-role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as "admin" | "buyer" | "approver")
                }
                className="w-full rounded-lg border border-[var(--sc-line)] px-3 py-2 text-sm focus:border-[var(--sc-cta)] focus:outline-none focus:ring-2 focus:ring-[var(--sc-cta)]/20"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="mt-4 rounded-lg bg-sc-cta px-4 py-2.5 text-sm font-semibold text-sc-ink transition-colors hover:bg-sc-cta-hover disabled:opacity-50"
          >
            {isPending && !activeId ? "Sending..." : "Send invite"}
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg border border-[var(--sc-line)] bg-[var(--sc-paper)] px-4 py-3 text-sm">
          {notice}
        </p>
      )}

      {!members.length ? (
        <div className="rounded-xl border border-dashed border-[var(--sc-line)] p-8 text-center text-ui-fg-subtle">
          <p className="text-base-regular">No team members yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--sc-line)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--sc-paper)] text-ui-fg-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canManage && (
                  <th className="px-4 py-3 font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-[var(--sc-line)]">
                  <td className="px-4 py-3">
                    <p className="font-medium">{memberName(member)}</p>
                    {member.email && (
                      <p className="text-xs text-ui-fg-subtle">{member.email}</p>
                    )}
                    {member.is_primary && (
                      <p className="text-xs text-ui-fg-subtle">Main contact</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {canManage && !member.is_primary ? (
                      <select
                        value={member.role}
                        disabled={isPending && activeId === member.id}
                        onChange={(event) =>
                          runMemberAction(member.id, () =>
                            updateB2bMember({
                              memberId: member.id,
                              role: event.target.value as
                                | "admin"
                                | "buyer"
                                | "approver",
                            })
                          )
                        }
                        className="rounded-lg border border-[var(--sc-line)] px-2 py-1 text-sm capitalize"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize">{member.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{statusLabel(member.status)}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {member.status === "invited" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runMemberAction(
                                member.id,
                                () => resendB2bMemberInvite(member.id),
                                "Invite resent."
                              )
                            }
                            className="text-sm text-[var(--sc-body)] hover:underline"
                          >
                            Resend
                          </button>
                        )}
                        {!member.is_primary && member.status !== "disabled" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runMemberAction(member.id, () =>
                                updateB2bMember({
                                  memberId: member.id,
                                  status: "disabled",
                                })
                              )
                            }
                            className="text-sm text-[var(--sc-body)] hover:underline"
                          >
                            Disable
                          </button>
                        )}
                        {!member.is_primary && member.status === "disabled" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runMemberAction(member.id, () =>
                                updateB2bMember({
                                  memberId: member.id,
                                  status: "active",
                                })
                              )
                            }
                            className="text-sm text-[var(--sc-body)] hover:underline"
                          >
                            Enable
                          </button>
                        )}
                        {!member.is_primary && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              runMemberAction(member.id, () =>
                                removeB2bMember(member.id)
                              )
                            }
                            className="text-sm text-red-700 hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TeamMembers
