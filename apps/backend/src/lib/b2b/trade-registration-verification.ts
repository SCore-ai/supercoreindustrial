import { randomInt, randomUUID } from "crypto"

type PendingVerification = {
  email: string
  code: string
  expiresAt: number
}

type VerifiedSession = {
  email: string
  expiresAt: number
}

const pending = new Map<string, PendingVerification>()
const verifiedTokens = new Map<string, VerifiedSession>()

const CODE_TTL_MS = 15 * 60 * 1000
const TOKEN_TTL_MS = 30 * 60 * 1000

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function pendingKey(email: string, purpose: string) {
  return `${purpose}:${normalizeEmail(email)}`
}

function purgeExpired() {
  const now = Date.now()

  for (const [key, entry] of pending) {
    if (entry.expiresAt <= now) {
      pending.delete(key)
    }
  }

  for (const [key, entry] of verifiedTokens) {
    if (entry.expiresAt <= now) {
      verifiedTokens.delete(key)
    }
  }
}

export function issueVerificationCode(
  email: string,
  purpose = "register"
) {
  purgeExpired()
  const normalized = normalizeEmail(email)
  const code = String(randomInt(100000, 999999))

  pending.set(pendingKey(normalized, purpose), {
    email: normalized,
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
  })

  return code
}

export function consumeOneTimeCode(
  email: string,
  code: string,
  purpose = "register"
) {
  purgeExpired()
  const normalized = normalizeEmail(email)
  const key = pendingKey(normalized, purpose)
  const entry = pending.get(key)

  if (!entry || entry.code !== code.trim()) {
    return false
  }

  if (entry.expiresAt <= Date.now()) {
    pending.delete(key)
    return false
  }

  pending.delete(key)
  return true
}

export function verifyEmailCode(email: string, code: string) {
  if (!consumeOneTimeCode(email, code, "register")) {
    return null
  }

  const normalized = normalizeEmail(email)
  const token = randomUUID()

  verifiedTokens.set(token, {
    email: normalized,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  })

  return token
}

export function consumeVerificationToken(token: string, email: string) {
  purgeExpired()
  const session = verifiedTokens.get(token)

  if (!session) {
    return false
  }

  if (session.email !== normalizeEmail(email)) {
    return false
  }

  if (session.expiresAt <= Date.now()) {
    verifiedTokens.delete(token)
    return false
  }

  verifiedTokens.delete(token)
  return true
}
