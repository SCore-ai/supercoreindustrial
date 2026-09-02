const MFA_BLOCK_CODE = "admin_mfa_required"
const MFA_MESSAGE = "Admin MFA verification is required."
const GUARD_KEY = "__supercoreAdminMfaFetchGuard"

type GuardState = {
  installed: boolean
  originalFetch: typeof window.fetch
  blocking: boolean
  waiters: Array<() => void>
  onBlocked: Array<() => void>
}

function getState(): GuardState | null {
  if (typeof window === "undefined") {
    return null
  }

  const existing = (window as Window & { [GUARD_KEY]?: GuardState })[GUARD_KEY]

  if (existing) {
    return existing
  }

  const state: GuardState = {
    installed: false,
    originalFetch: window.fetch.bind(window),
    blocking: false,
    waiters: [],
    onBlocked: [],
  }

  ;(window as Window & { [GUARD_KEY]?: GuardState })[GUARD_KEY] = state
  return state
}

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") {
    return input
  }

  if (input instanceof URL) {
    return input.toString()
  }

  return input.url
}

function isMfaApi(url: string) {
  return url.includes("/admin/system/mfa")
}

function isAdminApi(url: string) {
  return url.includes("/admin/")
}

function cloneInput(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.clone()
  }

  return input
}

function waitForUnblock(state: GuardState) {
  return new Promise<void>((resolve) => {
    state.waiters.push(resolve)
  })
}

function dismissDevErrorOverlays() {
  document.querySelectorAll("vite-error-overlay").forEach((node) => {
    node.remove()
  })
}

function isMfaBlockPayload(payload: { code?: string; message?: string }) {
  return (
    payload.code === MFA_BLOCK_CODE ||
    payload.message === MFA_MESSAGE
  )
}

async function readMfaBlock(response: Response) {
  if (response.status !== 403) {
    return false
  }

  try {
    const payload = (await response.clone().json()) as {
      code?: string
      message?: string
    }
    return isMfaBlockPayload(payload)
  } catch {
    return false
  }
}

function notifyBlocked(state: GuardState) {
  state.blocking = true
  dismissDevErrorOverlays()
  state.onBlocked.forEach((listener) => listener())
}

export function installAdminMfaFetchGuard(onBlocked?: () => void) {
  const state = getState()

  if (!state) {
    return () => undefined
  }

  if (onBlocked && !state.onBlocked.includes(onBlocked)) {
    state.onBlocked.push(onBlocked)
    if (state.blocking) {
      onBlocked()
    }
  }

  if (state.installed) {
    return () => {
      state.onBlocked = state.onBlocked.filter((listener) => listener !== onBlocked)
    }
  }

  state.installed = true

  window.addEventListener("unhandledrejection", (event) => {
    const message = String(
      (event.reason as { message?: string } | undefined)?.message ??
        event.reason ??
        ""
    )

    if (message.includes(MFA_MESSAGE)) {
      event.preventDefault()
      notifyBlocked(state)
    }
  })

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = requestUrl(input)

    if (isMfaApi(url)) {
      return state.originalFetch(cloneInput(input), init)
    }

    if (state.blocking && isAdminApi(url)) {
      await waitForUnblock(state)
      return state.originalFetch(cloneInput(input), init)
    }

    const response = await state.originalFetch(cloneInput(input), init)

    if (!(await readMfaBlock(response))) {
      return response
    }

    notifyBlocked(state)
    await waitForUnblock(state)
    return state.originalFetch(cloneInput(input), init)
  }

  return () => {
    state.onBlocked = state.onBlocked.filter((listener) => listener !== onBlocked)
  }
}

export function releaseAdminMfaFetchGuard() {
  const state = getState()

  if (!state) {
    return
  }

  state.blocking = false
  const waiters = state.waiters
  state.waiters = []
  waiters.forEach((resolve) => resolve())
}

installAdminMfaFetchGuard()
