export type OutboundFetchOptions = {
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
}

const DEFAULT_TIMEOUT_MS = 8000
const DEFAULT_RETRIES = 1
const DEFAULT_RETRY_DELAY_MS = 250

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 429 || status >= 500
}

export async function outboundFetch(
  url: string | URL,
  init?: RequestInit,
  options: OutboundFetchOptions = {}
): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const retries = options.retries ?? DEFAULT_RETRIES
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS
  let attempt = 0

  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      })

      if (attempt < retries && isRetryableStatus(response.status)) {
        attempt += 1
        await sleep(retryDelayMs * attempt)
        continue
      }

      return response
    } catch (error) {
      if (attempt >= retries) {
        throw error
      }

      attempt += 1
      await sleep(retryDelayMs * attempt)
    }
  }

  throw new Error("outboundFetch exhausted retries")
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (!items.length) {
    return []
  }

  const limit = Math.max(1, Math.min(concurrency, items.length))
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function runWorker() {
    while (true) {
      const index = nextIndex
      nextIndex += 1

      if (index >= items.length) {
        return
      }

      results[index] = await worker(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: limit }, () => runWorker()))

  return results
}
