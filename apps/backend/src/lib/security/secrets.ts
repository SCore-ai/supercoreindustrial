const MIN_SECRET_LENGTH = 32
const WEAK_SECRETS = new Set(["supersecret", "jwt_secret", "cookie_secret"])

type SecretName = "JWT_SECRET" | "COOKIE_SECRET"

function isStrongSecret(value: string | undefined) {
  if (!value || value.length < MIN_SECRET_LENGTH) {
    return false
  }

  return !WEAK_SECRETS.has(value.toLowerCase())
}

export function getRequiredSecret(name: SecretName) {
  const secret = process.env[name]?.trim()

  if (!isStrongSecret(secret)) {
    throw new Error(
      `${name} must be set to a unique value with at least ${MIN_SECRET_LENGTH} characters.`
    )
  }

  return secret
}

export function getCookieSigningSecret() {
  return getRequiredSecret("COOKIE_SECRET")
}
