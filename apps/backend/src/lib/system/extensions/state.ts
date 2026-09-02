import fs from "fs"
import path from "path"
import type { ExtensionsState } from "./types"

const STATE_FILENAME = "extensions-state.json"

function getStatePath() {
  return path.join(process.cwd(), STATE_FILENAME)
}

export function readExtensionsState(): ExtensionsState {
  const statePath = getStatePath()

  if (!fs.existsSync(statePath)) {
    return {
      disabled: ["draft-order"],
      updated_at: new Date(0).toISOString(),
      pending_restart: false,
    }
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(statePath, "utf-8")) as ExtensionsState

    return {
      disabled: Array.isArray(parsed.disabled) ? parsed.disabled : [],
      updated_at: parsed.updated_at ?? new Date(0).toISOString(),
      pending_restart: parsed.pending_restart ?? false,
    }
  } catch {
    return {
      disabled: [],
      updated_at: new Date(0).toISOString(),
      pending_restart: false,
    }
  }
}

export function writeExtensionsState(state: ExtensionsState) {
  const statePath = getStatePath()
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8")
}

export function getDisabledExtensionIds() {
  return new Set(readExtensionsState().disabled)
}

export function setExtensionEnabled(id: string, enabled: boolean) {
  const state = readExtensionsState()
  const disabled = new Set(state.disabled)

  if (enabled) {
    disabled.delete(id)
  } else {
    disabled.add(id)
  }

  const nextState: ExtensionsState = {
    disabled: [...disabled],
    updated_at: new Date().toISOString(),
    pending_restart: true,
  }

  writeExtensionsState(nextState)
  return nextState
}
