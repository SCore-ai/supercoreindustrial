export const DEFAULT_ADMIN_EMAIL = "service@supercoresystems.co.uk"

export function resolveAdminMfaEmail(input: {
  userEmail?: string | null
  adminEmail?: string | null
  envEmail?: string | null
}) {
  const envEmail = input.envEmail?.trim().toLowerCase()
  const adminEmail = input.adminEmail?.trim().toLowerCase()
  const userEmail = input.userEmail?.trim().toLowerCase()

  return envEmail || adminEmail || userEmail || DEFAULT_ADMIN_EMAIL
}
