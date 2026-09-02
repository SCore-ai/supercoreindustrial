import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowUpRightOnBox, SquareTwoStack } from "@medusajs/icons"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useParams } from "react-router-dom"
import {
  buildStorefrontProductUrl,
  DEFAULT_STOREFRONT_COUNTRY,
} from "../../lib/catalog/catalog-permalink"
import { onlineStoreClient } from "../lib/online-store-client"

const HEADER_MOUNT_ID = "supercore-product-storefront-url-host"

type ProductWidgetData = {
  id?: string
  title?: string | null
  handle?: string | null
}

async function adminFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

function useProductHeaderMount(title?: string | null) {
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!title) {
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
        (element) => element.textContent?.trim() === title.trim()
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
  }, [title])

  return host
}

const ProductStorefrontUrlWidget = ({
  data,
}: {
  data?: ProductWidgetData
}) => {
  const { id: paramId } = useParams()
  const productId = data?.id || paramId

  const { data: productResponse } = useQuery({
    queryKey: ["admin-product-storefront-url", productId],
    queryFn: () =>
      adminFetch<{ product: { id: string; title?: string | null; handle?: string | null } }>(
        `/admin/products/${productId}?fields=id,title,handle`
      ),
    enabled: Boolean(productId),
  })

  const { data: store } = useQuery({
    queryKey: ["admin-online-store-overview"],
    queryFn: () => onlineStoreClient.getOverview(),
  })

  const product = productResponse?.product
  const handle = product?.handle || data?.handle || ""
  const title = product?.title || data?.title || ""
  const storefrontUrl =
    store?.theme?.storefront_url || "http://localhost:8000"
  const publicUrl = handle
    ? buildStorefrontProductUrl({
        handle,
        storefrontUrl,
        countryCode: DEFAULT_STOREFRONT_COUNTRY,
      })
    : ""
  const headerHost = useProductHeaderMount(title)

  const copyUrl = async () => {
    if (!publicUrl) {
      return
    }
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success("Storefront URL copied")
    } catch {
      toast.error("Could not copy the storefront URL")
    }
  }

  if (!productId || !publicUrl) {
    return <></>
  }

  return (
    <>
      {headerHost &&
        createPortal(
          <Button size="small" variant="secondary" asChild>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              View in store
            </a>
          </Button>,
          headerHost
        )}
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Storefront URL</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Public product link. The admin address bar still uses the Medusa
            record ID.
          </Text>
        </div>
        <div className="px-6 py-4">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="txt-compact-small text-ui-fg-interactive break-all hover:underline"
          >
            {publicUrl}
          </a>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={copyUrl}>
              <SquareTwoStack />
              Copy URL
            </Button>
            <Button size="small" variant="secondary" asChild>
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ArrowUpRightOnBox />
                Open
              </a>
            </Button>
          </div>
        </div>
      </Container>
    </>
  )
}

export const config = defineWidgetConfig({
  id: "supercore:product-storefront-url",
  zone: "product.details.side",
})

export default ProductStorefrontUrlWidget
