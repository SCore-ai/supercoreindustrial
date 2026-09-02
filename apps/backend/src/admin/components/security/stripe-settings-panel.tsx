import { Badge, Button, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { securityClient } from "../../lib/security-client"

export const StripeSettingsPanel = ({ compact = false }: { compact?: boolean }) => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stripe-status"],
    queryFn: () => securityClient.getStripeStatus(),
  })

  const enableMutation = useMutation({
    mutationFn: () => securityClient.enableStripeRegions(),
    onSuccess: (response) => {
      queryClient.setQueryData(["admin-stripe-status"], (current: typeof data) =>
        current
          ? { ...current, regions: response.regions, warnings: current.warnings }
          : current
      )
      queryClient.invalidateQueries({ queryKey: ["admin-system-security"] })
      toast.success(
        response.updated
          ? `Stripe enabled on ${response.updated} region(s)`
          : "Stripe is already enabled on all regions"
      )
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  if (isLoading) {
    return (
      <Text size="small" className="text-ui-fg-subtle">
        Checking Stripe configuration…
      </Text>
    )
  }

  if (error) {
    return (
      <Text size="small" className="text-ui-fg-error">
        {error instanceof Error ? error.message : "Could not load Stripe status."}
      </Text>
    )
  }

  if (!data) {
    return null
  }

  const pendingRegions = data.regions.filter((region) => !region.enabled)
  const ready =
    data.configured &&
    data.provider_registered &&
    pendingRegions.length === 0

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(data.webhook_url)
      toast.success("Webhook URL copied")
    } catch {
      toast.error("Could not copy webhook URL")
    }
  }

  return (
    <div className={compact ? "space-y-3" : "mt-4 space-y-4 rounded-md bg-ui-bg-subtle p-4"}>
      <div className="flex flex-wrap items-center gap-2">
        {!compact && <Heading level="h2">Stripe</Heading>}
        <Badge color={ready ? "green" : data.configured ? "orange" : "grey"} size="2xsmall">
          {ready ? "Ready" : data.configured ? "Needs regions" : "Not configured"}
        </Badge>
        {data.configured && (
          <Badge color={data.live_mode ? "red" : "grey"} size="2xsmall">
            {data.live_mode ? "Live" : "Test"}
          </Badge>
        )}
        {data.live_blocked && (
          <Badge color="red" size="2xsmall">
            Live key blocked
          </Badge>
        )}
      </div>

      {!compact && (
        <Text size="xsmall" className="text-ui-fg-subtle">
          Secret keys stay in environment variables and are never stored in
          Postgres or returned to the browser. Checkout uses Stripe Payment
          Element (PCI SAQ A). Payments are authorized first
          {data.capture
            ? " and captured immediately."
            : " and captured later from the order (recommended)."}
        </Text>
      )}

      {data.warnings.map((warning) => (
        <Text key={warning} size="xsmall" className="text-ui-fg-error">
          {warning}
        </Text>
      ))}

      <div className="space-y-1">
        <Text size="xsmall">
          Secret key: {data.secret_key_masked ?? "not set (STRIPE_API_KEY)"}
        </Text>
        <Text size="xsmall">
          Provider loaded: {data.provider_registered ? "yes" : "no — restart Medusa"}
        </Text>
        {!compact && (
          <>
            <Text size="xsmall">
              Publishable key:{" "}
              {data.publishable_key_configured
                ? "set"
                : "set NEXT_PUBLIC_STRIPE_KEY on the storefront"}
            </Text>
            <Text size="xsmall">
              Webhook:{" "}
              {data.webhook_configured
                ? "signed"
                : "not set (required in production)"}
            </Text>
            <Text size="xsmall" className="break-all">
              Webhook URL: {data.webhook_url}
            </Text>
            <Text size="xsmall">
              Events: {data.webhook_events.join(", ")}
            </Text>
            <Text size="xsmall">Provider: {data.provider_id}</Text>
          </>
        )}
      </div>

      <div>
        <Text size="xsmall" weight="plus">
          Regions
        </Text>
        {data.regions.length ? (
          data.regions.map((region) => (
            <Text key={region.id} size="xsmall" className="text-ui-fg-subtle">
              {region.name} ({region.currency_code}):{" "}
              {region.enabled ? "Stripe enabled" : "not enabled"}
            </Text>
          ))
        ) : (
          <Text size="xsmall" className="text-ui-fg-subtle">
            No regions found.
          </Text>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="small"
          disabled={!data.configured || !data.provider_registered || enableMutation.isPending}
          isLoading={enableMutation.isPending}
          onClick={() => enableMutation.mutate()}
        >
          {pendingRegions.length
            ? `Enable Stripe on ${pendingRegions.length} region(s)`
            : "Refresh region assignment"}
        </Button>
        {!compact && (
          <Button size="small" variant="secondary" onClick={copyWebhook}>
            Copy webhook URL
          </Button>
        )}
        <Link
          to="/settings/regions"
          className="text-ui-fg-interactive text-sm hover:underline"
        >
          Open region settings
        </Link>
        {compact && (
          <Link
            to="/system/payments"
            className="text-ui-fg-interactive text-sm hover:underline"
          >
            Payment settings
          </Link>
        )}
      </div>
    </div>
  )
}
