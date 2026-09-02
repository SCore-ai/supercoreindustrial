import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Heading, Input, Text } from "@medusajs/ui"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  installAdminMfaFetchGuard,
  releaseAdminMfaFetchGuard,
} from "../lib/admin-mfa-fetch-guard"
import { securityClient } from "../lib/security-client"

type MfaStatus = {
  required: boolean
  enforced: boolean
  verified: boolean
  email: string | null
}

const AdminMfaGate = () => {
  const [status, setStatus] = useState<MfaStatus | null>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const requestedRef = useRef(false)

  const markBlocked = useCallback(() => {
    setStatus((current) =>
      current
        ? { ...current, enforced: true, verified: false }
        : {
            required: true,
            enforced: true,
            verified: false,
            email: null,
          }
    )
  }, [])

  const loadStatus = useCallback(async () => {
    try {
      const next = await securityClient.getAdminMfaStatus()
      setStatus(next)
      return next
    } catch {
      return null
    }
  }, [])

  const sendCode = useCallback(async () => {
    setSending(true)
    setError(null)

    try {
      const result = await securityClient.challengeAdminMfa()
      setStatus((current) =>
        current
          ? { ...current, enforced: true, email: result.email ?? current.email }
          : {
              required: true,
              enforced: true,
              verified: false,
              email: result.email ?? null,
            }
      )
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send a verification code."
      )
    } finally {
      setSending(false)
    }
  }, [])

  useEffect(() => {
    return installAdminMfaFetchGuard(markBlocked)
  }, [markBlocked])

  useEffect(() => {
    void loadStatus().then((next) => {
      if (next?.enforced && !next.verified && !requestedRef.current) {
        requestedRef.current = true
        markBlocked()
        void sendCode()
      }
    })
  }, [loadStatus, markBlocked, sendCode])

  const verify = async () => {
    setVerifying(true)
    setError(null)

    try {
      await securityClient.verifyAdminMfa(code.trim())
      releaseAdminMfaFetchGuard()
      window.location.reload()
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Invalid or expired verification code."
      )
    } finally {
      setVerifying(false)
    }
  }

  if (!status?.enforced || status.verified) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-ui-bg-overlay p-6"
      style={{ zIndex: 2147483000 }}
    >
      <div className="w-full max-w-md rounded-lg border border-ui-border-base bg-ui-bg-base p-6 shadow-elevation-flyout">
        <Heading level="h1">Verify admin sign-in</Heading>
        <Text size="small" className="mt-2 text-ui-fg-subtle">
          Enter the 6-digit code sent to{" "}
          <strong>{status.email ?? "service@supercoresystems.co.uk"}</strong>.
        </Text>
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (code.trim().length >= 6) {
              void verify()
            }
          }}
        >
          <Input
            placeholder="123456"
            value={code}
            autoFocus
            onChange={(event) => setCode(event.target.value)}
            autoComplete="one-time-code"
          />
          {error && (
            <Text size="small" className="mt-2 text-ui-fg-error">
              {error}
            </Text>
          )}
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              isLoading={sending}
              onClick={() => void sendCode()}
            >
              Resend code
            </Button>
            <Button
              type="submit"
              isLoading={verifying}
              disabled={code.trim().length < 6}
            >
              Verify
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export const config = defineWidgetConfig({
  zone: "topbar",
  id: "supercore.admin-mfa-gate",
})

export default AdminMfaGate
