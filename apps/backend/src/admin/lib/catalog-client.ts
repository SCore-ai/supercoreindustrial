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
    throw new Error(body || `Request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export const catalogClient = {
  getFxRates() {
    return adminFetch<import("./catalog-types").FxRatesResponse>(
      "/admin/catalog/fx"
    )
  },

  upsertFxRate(body: {
    from_currency: string
    to_currency: string
    rate: number
    notes?: string | null
    upsert_inverse?: boolean
  }) {
    return adminFetch("/admin/catalog/fx", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  convert(body: { amount: number; from: string; to: string }) {
    return adminFetch<import("./catalog-types").ConvertResponse>(
      "/admin/catalog/fx/convert",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    )
  },

  listImports(params?: { limit?: number; offset?: number }) {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.offset) q.set("offset", String(params.offset))
    const query = q.toString()
    return adminFetch<{
      jobs: import("./catalog-types").CatalogImportJob[]
      count: number
    }>(query ? `/admin/catalog/imports?${query}` : "/admin/catalog/imports")
  },

  listManufacturers() {
    return adminFetch<{
      manufacturers: import("./catalog-types").ManufacturerOption[]
    }>("/admin/catalog/imports/manufacturers")
  },

  previewManufacturer(
    manufacturerId: string,
    body: {
      csv: string
      filename?: string
      source_currency?: string
    }
  ) {
    return adminFetch<import("./catalog-types").ManufacturerPreviewResponse>(
      `/admin/catalog/imports/${manufacturerId}/preview`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    )
  },

  runManufacturer(
    manufacturerId: string,
    body: {
      csv: string
      filename?: string
      source_currency?: string
      job_id?: string
    }
  ) {
    return adminFetch<import("./catalog-types").ManufacturerImportResult>(
      `/admin/catalog/imports/${manufacturerId}/run`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    )
  },

  previewZenitel(body: {
    csv: string
    filename?: string
    source_currency?: string
  }) {
    return this.previewManufacturer("zenitel", body)
  },

  runZenitel(body: {
    csv: string
    filename?: string
    source_currency?: string
    job_id?: string
  }) {
    return this.runManufacturer("zenitel", body)
  },
}
