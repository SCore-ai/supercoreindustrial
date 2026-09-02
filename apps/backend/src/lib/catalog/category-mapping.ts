/**
 * Map manufacturer catalogue rows → Supercore category handles.
 *
 * Sources cross-checked against:
 * - zenitel.com (Turbine / ICX-AlphaCom / IC-EDGE / Exigo / Vipedia / VAIA / PAVA)
 * - axis.com product naming guide (M/P/Q/F/A/C/D/S/T/W/X lines + form-factor digit)
 * - explosionproofcamera.com (Spectrum D/F/TEZP/FEZB series, junction boxes, accessories)
 */

import type { ManufacturerId } from "./manufacturers"

export type ManufacturerCategoryId = ManufacturerId

export type CategoryMapInput = {
  manufacturerId: ManufacturerCategoryId | string
  title: string
  sku?: string | null
  categoryHint?: string | null
}

export type CategoryMapResult = {
  /** Supercore product_category.handle, or null when intentionally unmapped */
  handle: string | null
  reason: string
  skip: boolean
}

const SKIP_HINT =
  /travelling|hotel expenses|training\s*\/\s*courses|\btraining\b|software installation services|additional standard charges/i

function norm(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim()
}

function upper(value: string | null | undefined): string {
  return norm(value).toUpperCase()
}

function includesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toUpperCase()
  return needles.some((n) => h.includes(n.toUpperCase()))
}

/** Axis camera form-factor → leaf handle.
 *  Collections: axis.com/products/network-cameras (Box / Bullet / Dome / PTZ / Panoramic / Modular / Thermal / Explosion-protected).
 *  Series pages 2026: Q16+Q17 = box, P14+M20+Q18 = bullet, Q178/Q179 = legacy Q17 bullets.
 */
function axisCameraFormHandle(title: string): string {
  const t = upper(title)

  if (/\bTHERMAL\b|\b-TE\b|\b-XTE\b|\b Q19[0-9]|\b Q29[0-9]|\b Q87[0-9]/.test(t)) {
    return "cctv-thermal"
  }
  if (/\bPANORAMIC\b|\b-PLVE\b|\b-PLR\b|\bFISHEYE\b/.test(t)) {
    return "cctv-panoramic"
  }
  if (/\bPOSITIONING\b|\bAXIS\s+Q86\d/.test(t)) {
    return "cctv-positioning"
  }

  // axis.com Box cameras: M10/M11/P13/P15/Q16/Q17 (block)
  if (/\bAXIS\s+Q17[12]\d/.test(t) || /\bBLOCK CAMERA\b/.test(t)) {
    return "cctv-box"
  }
  // axis.com Bullet cameras: M20/P14/Q18 + legacy Q178/Q179
  if (
    /\bAXIS\s+Q18\d/.test(t) ||
    /\bAXIS\s+Q17[89]\d/.test(t) ||
    /\bAXIS\s+[MPQV]14\d/.test(t) ||
    /\bAXIS\s+[MQ]20\d/.test(t)
  ) {
    return "cctv-bullet"
  }
  if (/\bAXIS\s+[MPQV]1[136]\d/.test(t) || /\bAXIS\s+P15\d/.test(t)) {
    return "cctv-box"
  }

  const m = t.match(
    /\bAXIS\s+(?:EXCAM\s+)?([MPQV])(\d)/
  )
  if (m) {
    const digit = Number(m[2])
    if (digit === 1 || digit === 2) {
      if (/\bBULLET\b/.test(t)) return "cctv-bullet"
      return "cctv-box"
    }
    if (digit === 3 || digit === 4) return "cctv-dome"
    if (digit === 5 || digit === 6) return "cctv-ptz"
    if (digit === 8 || digit === 9) return "cctv-special"
  }

  if (/\bDOME\b/.test(t)) return "cctv-dome"
  if (/\bBULLET\b/.test(t)) return "cctv-bullet"
  if (/\bPTZ\b|\bPAN.?TILT\b/.test(t)) return "cctv-ptz"
  if (/\bBOX\b|\bBLOCK\b/.test(t)) return "cctv-box"
  if (/\bMODULAR\b|\bSENSOR UNIT\b|\bMAIN UNIT\b|\bBODY WORN\b/.test(t)) {
    return "cctv-special"
  }

  return "cctv-systems"
}

function mapAxis(input: CategoryMapInput): CategoryMapResult {
  const title = norm(input.title)
  const t = upper(title)
  const hint = upper(input.categoryHint)

  if (!title) {
    return { handle: null, reason: "empty-title", skip: true }
  }

  if (/discontinued/i.test(hint) || /discontinued/i.test(title)) {
    // Still map sellable leftover SKUs by title heuristics below
  }

  // Explosion-protected (Axis X-line / ExCam) — axis.com/oil-and-gas → Explosion-protected devices
  if (
    /\bAXIS\s+X[A-Z0-9]/.test(t) ||
    /\bEXCAM\b/.test(t) ||
    /\bEXPLOSION[- ]PROTECTED\b/.test(t) ||
    /\bASKDP0/.test(t) ||
    /\bSKDP0/.test(t)
  ) {
    if (/\bSPEAKER\b|\bHORN\b|\bXC[0-9]/.test(t)) {
      return { handle: "network-audio", reason: "axis-ex-audio", skip: false }
    }
    if (
      /\bMOUNT\b|\bBRACKET\b|\bWEATHERSHIELD\b|\bSUNSHIELD\b|\bWRENCH\b|\bCABLE GLAND\b/.test(
        t
      )
    ) {
      return { handle: "ex-mounts", reason: "axis-ex-mount", skip: false }
    }
    if (/\bCABLE\b/.test(t)) {
      return { handle: "ex-power-connectivity", reason: "axis-ex-cable", skip: false }
    }
    if (/\bADAPTER\b|\bWASHER\b|\bILLUMINATOR\b/.test(t)) {
      return { handle: "ex-tools", reason: "axis-ex-accessory", skip: false }
    }
    if (/\bTHERMAL\b|\b-TE\b|\bXPQ.*THERMAL|\bXT/.test(t)) {
      return { handle: "ex-thermal", reason: "axis-ex-thermal", skip: false }
    }
    if (/\bXPQ\b|\bXPT\b|\bX1100\b|\bPTZ\b/.test(t)) {
      return { handle: "ex-zone1-cameras", reason: "axis-ex-ptz-oil-gas", skip: false }
    }
    if (/\bDOME\b|\bXDQ\b/.test(t)) {
      return { handle: "ex-zone1-cameras", reason: "axis-ex-dome-oil-gas", skip: false }
    }
    if (/\bXFQ\b|\bFIXED\b|\bBULLET\b/.test(t)) {
      return { handle: "ex-zone1-cameras", reason: "axis-ex-fixed", skip: false }
    }
    return { handle: "ex-zone1-cameras", reason: "axis-ex-camera", skip: false }
  }

  // Zone 2 / Division 2 (Axis -XLE), e.g. P1468-XLE
  if (/\b-XLE\b/.test(t) || (/\bZONE\s*2\b|\bDIV(?:ISION)?\s*2\b/.test(t) && /\bAXIS\s+[MPQV]/.test(t))) {
    return { handle: "ex-zone2-cameras", reason: "axis-ex-zone2", skip: false }
  }

  // Accessories first (T / TM / TQ / TU / TP / TX / TA / ACI / LENS / MIDSPAN…)
  if (
    /\bAXIS\s+T[0-9A-Z]/.test(t) ||
    /\bAXIS\s+T[MQUXPA][0-9A-Z]/.test(t) ||
    /\bAXIS\s+ACI\b/.test(t) ||
    /^(ACC\s+|LENS\s+)/.test(t) ||
    /\bCONN(?:ECTOR)?\b|\bCONN KIT\b|\bCLEAR DOME\b|\bVERIFIER KIT\b/.test(t) ||
    /\bMIDSPAN\b|\bMOUNT\b|\bBRACKET\b|\bHOUSING\b|\bPENDANT\b|\bCONDUIT\b|\bGASKET\b|\bADAPTER\b|\bBACK BOX\b|\bTOP COVER\b|\bSUNSHIELD\b|\bWASHER\b|\bILLUMINATOR\b|\bPOE\+?\b|\bMEDIA CONVERTER\b|\bSURGE\b|\bLENS CLOTH\b|\bSCREWDRIVER\b|\bCOUPLER\b|\bLOCKNUT\b|\bCABLE KIT\b|\bRJ45 CABLE\b|\bEXTENSION CABLE\b/.test(
      t
    )
  ) {
    // Door-station clear-dome kits still accessories
    return { handle: "cctv-accessories", reason: "axis-accessory", skip: false }
  }

  // Network audio (C-line + Audio Manager)
  if (
    /\bAXIS\s+C[0-9]/.test(t) ||
    /\bNETWORK (HORN )?SPEAKER\b|\bSOUND PROJECTOR\b|\bAUDIO AMP\b|\bAUDIO BRIDGE\b|\bAUDIO MANAGER\b|\bPAGING CONSOLE\b/.test(
      t
    )
  ) {
    return { handle: "network-audio", reason: "axis-network-audio", skip: false }
  }

  // Radar / system devices D-line
  if (/\bAXIS\s+D[0-9]/.test(t) || /\bRADAR\b|\bSTROBE SPEAKER\b/.test(t)) {
    if (/\bRADAR\b|\bD21[0-9]|\bD22[0-9]/.test(t)) {
      return { handle: "radar-security", reason: "axis-radar", skip: false }
    }
    return { handle: "cctv-accessories", reason: "axis-system-device", skip: false }
  }

  // Intercoms (I-line, A8xxx door stations, 2N)
  if (
    /\bAXIS\s+I[0-9]/.test(t) ||
    /\bAXIS\s+A8[0-9]{3}/.test(t) ||
    /^2N\b/.test(t) ||
    /\bDOOR STATION\b|\bVIDEO INTERCOM\b|\bNETWORK VIDEO INTERCOM\b/.test(t)
  ) {
    if (/\bCLEAR DOME\b|\bMOUNT\b|\bBACK BOX\b/.test(t)) {
      return { handle: "cctv-accessories", reason: "axis-intercom-accessory", skip: false }
    }
    return { handle: "intercom-ip-sip", reason: "axis-intercom", skip: false }
  }

  // Access control (A1 / A4 / A9 I/O, readers, controllers)
  if (
    /\bAXIS\s+A1[0-9]{3}/.test(t) ||
    /\bAXIS\s+A4[0-9]{3}/.test(t) ||
    /\bAXIS\s+A9[0-9]{3}/.test(t) ||
    /\bDOOR CONTROLLER\b|\bCARD READER\b|\bNETWORK READER\b|\bSECURITY RELAY\b|\bI\/O RELAY\b|\bACCESS CONTROL\b|\bBARCODE READER\b/.test(
      t
    )
  ) {
    return { handle: "access-control", reason: "axis-access-control", skip: false }
  }

  // Storage / VMS
  if (
    /\bAXIS\s+S[0-9]/.test(t) ||
    /\bCAMERA STATION\b|\bACS\b|\bRECORDER\b|\bRECORDING SERVER\b|\bWORKSTATION\b/.test(
      t
    )
  ) {
    if (/\bLICENSE\b|\bELIC\b|\bE-LICENSE\b|\bSOFTWARE\b/.test(t)) {
      return { handle: "cctv-software", reason: "axis-software", skip: false }
    }
    return { handle: "cctv-storage", reason: "axis-storage", skip: false }
  }

  if (/\bLICENSE\b|\bELIC\b|\bE-LICENSE\b|\bPROFESSIONAL SERVICES\b/.test(t)) {
    return { handle: "cctv-software", reason: "axis-license", skip: false }
  }

  // Body worn
  if (/\bAXIS\s+W[0-9]/.test(t) || /\bBODY WORN\b/.test(t)) {
    return { handle: "cctv-special", reason: "axis-body-worn", skip: false }
  }

  // Modular F / FA
  if (/\bAXIS\s+F[A0-9]/.test(t) || /\bMODULAR\b|\bSENSOR UNIT\b|\bMAIN UNIT\b/.test(t)) {
    return { handle: "cctv-special", reason: "axis-modular", skip: false }
  }

  // Video encoders / decoders (M71, P73) — not a camera form-factor
  if (/\bAXIS\s+(M71|P73)\d/.test(t) || /\bENCODER\b|\bDECODER\b/.test(t)) {
    return { handle: "cctv-special", reason: "axis-encoder", skip: false }
  }

  // Network cameras M / P / Q / V
  if (/\bAXIS\s+[MPQV][0-9]/.test(t)) {
    const handle = axisCameraFormHandle(title)
    return { handle, reason: `axis-camera:${handle}`, skip: false }
  }

  // Fallback keyword camera
  if (/\bCAMERA\b|\bDOME\b|\bBULLET\b|\bPTZ\b/.test(t)) {
    const handle = axisCameraFormHandle(title)
    return {
      handle: handle === "cctv-systems" ? "cctv-special" : handle,
      reason: `axis-camera-fallback:${handle}`,
      skip: false,
    }
  }

  return { handle: "cctv-accessories", reason: "axis-fallback-accessory", skip: false }
}

/** Resolve Zenitel maritime intercom rows to a leaf (never parent intercom-systems). */
function mapZenitelMaritimeIntercomLeaf(title: string, hintRaw = ""): CategoryMapResult {
  const t = upper(title)
  const hint = upper(hintRaw)

  if (
    includesAny(t, ["VSP", "MAIN STATION", "SUBSTATION", "SUB-STATION"]) ||
    includesAny(hint, ["VSP", "12 WAY", "20 WAY", "BATTERYLESS"]) ||
    /^90\d{2}\b/.test(t) ||
    includesAny(t, ["ACCOMMODATION UNIT", "CALL UNIT", "WEATHERPROOF SUBSTATION"])
  ) {
    return { handle: "intercom-batteryless", reason: "zenitel-maritime-station", skip: false }
  }
  if (
    includesAny(t, [
      "HEADSET",
      "WALLBOX",
      "ADAPTER",
      "JUNCTION BOX",
      "PLUGBOX",
      "RELAY BOX",
      "CABINET",
      "MICROPHONE",
      "MANUAL",
    ])
  ) {
    return { handle: "cctv-accessories", reason: "zenitel-maritime-acc", skip: false }
  }
  return { handle: "intercom-batteryless", reason: "zenitel-maritime-intercom", skip: false }
}

function mapZenitelLicenseLeaf(title: string): CategoryMapResult {
  const t = upper(title)
  if (includesAny(t, ["CONNECT PRO", "ZENITEL CONNECT"])) {
    return { handle: "platform-connect-pro", reason: "zenitel-license-connect-pro", skip: false }
  }
  if (includesAny(t, ["ICX", "ALPHACOM", "ILS", "RECORDER", "VS RECORDER"])) {
    return { handle: "platform-icx-alphacom", reason: "zenitel-license-icx", skip: false }
  }
  if (includesAny(t, ["ICS 6200", "ICS6200"])) {
    return { handle: "intercom-ics-6200", reason: "zenitel-license-ics", skip: false }
  }
  if (includesAny(t, ["SIP", "VOIP", "IP STATION"])) {
    return { handle: "intercom-ip-sip", reason: "zenitel-license-sip", skip: false }
  }
  return { handle: "platform-icx-alphacom", reason: "zenitel-license-general", skip: false }
}

function mapZenitelAccessoryLeaf(title: string): CategoryMapResult {
  const t = upper(title)
  if (includesAny(t, ["EXIGO", "ECPIR"])) {
    return { handle: "paga-exigo", reason: "zenitel-exigo-acc", skip: false }
  }
  if (includesAny(t, ["TURBINE", "TCIS", "TCIV", "ITS-", "ITSV"])) {
    return { handle: "intercom-ip-sip", reason: "zenitel-turbine-acc", skip: false }
  }
  if (includesAny(t, ["VSP", "BATTERYLESS"])) {
    return { handle: "intercom-batteryless", reason: "zenitel-vsp-acc", skip: false }
  }
  if (includesAny(t, ["VIPEDIA", "VAIA", "INTEGRA", "AMPLIFIER", "MICROPHONE"])) {
    return { handle: "pa-vipedia", reason: "zenitel-pa-acc", skip: false }
  }
  return { handle: "cctv-accessories", reason: "zenitel-accessory", skip: false }
}

function mapZenitelHint(hintRaw: string, title: string): CategoryMapResult | null {
  const hint = upper(hintRaw)
  const leaf = hint.includes(" > ") ? hint.split(" > ").slice(1).join(" > ") : hint
  const t = upper(title)

  if (SKIP_HINT.test(hintRaw) || SKIP_HINT.test(leaf)) {
    return { handle: null, reason: "zenitel-skip-service", skip: true }
  }

  // --- Safety & Security / IP intercom (zenitel.com) ---
  if (includesAny(hint, ["TURBINE", "IP INTERCOM", "IP TELEPHONE", "OPERATOR STATION", "INCA", "HEAVY DUTY"])) {
    // Only the "Turbine Speakers" leaf — parent path "IP intercom & speakers" must not match
    if (/\bTURBINE SPEAKERS\b/.test(hint) || /\bIP SPEAKERS\b/.test(leaf)) {
      return { handle: "pa-ip-speakers", reason: "zenitel-turbine-speakers", skip: false }
    }
    return { handle: "intercom-ip-sip", reason: "zenitel-ip-sip", skip: false }
  }

  if (includesAny(hint, ["IC-EDGE", "IC EDGE"])) {
    return { handle: "intercom-ic-edge", reason: "zenitel-ic-edge", skip: false }
  }

  if (includesAny(hint, ["ICX", "ALPHACOM"])) {
    // Licenses + central gear → platform/intercom ICX
    if (includesAny(hint, ["LICENSE"])) {
      return { handle: "platform-icx-alphacom", reason: "zenitel-icx-license", skip: false }
    }
    return { handle: "intercom-icx-alphacom", reason: "zenitel-icx", skip: false }
  }

  if (includesAny(hint, ["ICS 6200", "COMPACT ICS", "ICS6200"])) {
    return { handle: "intercom-ics-6200", reason: "zenitel-ics-6200", skip: false }
  }

  if (includesAny(hint, ["BATTERYLESS", "VSP", "COMMAND TALKBACK"])) {
    return { handle: "intercom-batteryless", reason: "zenitel-batteryless", skip: false }
  }

  if (includesAny(hint, ["CONNECT PRO", "ZENITEL CONNECT"])) {
    return { handle: "platform-connect-pro", reason: "zenitel-connect-pro", skip: false }
  }

  if (includesAny(hint, ["ANALOGUE", "ANALOG", "ACM STATION"])) {
    return { handle: "intercom-batteryless", reason: "zenitel-analogue", skip: false }
  }

  // --- PAGA / PAVA (zenitel.com PA) ---
  if (includesAny(hint, ["EXIGO"])) {
    return { handle: "paga-exigo", reason: "zenitel-exigo", skip: false }
  }
  if (includesAny(hint, ["SPA-V2", "SPA V2", "SPA MAIN"])) {
    return { handle: "paga-spa-v2", reason: "zenitel-spa-v2", skip: false }
  }
  // Title wins: Integra / VAIA must not inherit a parent "Vipedia/VAIA" hint
  if (includesAny(t, ["INTEGRA"])) {
    return { handle: "pa-integra", reason: "zenitel-integra", skip: false }
  }
  if (includesAny(t, ["VAIA"])) {
    return { handle: "pa-vaia", reason: "zenitel-vaia", skip: false }
  }
  if (includesAny(hint, ["VIPEDIA"])) {
    return { handle: "pa-vipedia", reason: "zenitel-vipedia", skip: false }
  }
  if (includesAny(hint, ["VAIA"])) {
    return { handle: "pa-vaia", reason: "zenitel-vaia", skip: false }
  }
  if (includesAny(hint, ["INTEGRA"])) {
    return { handle: "pa-integra", reason: "zenitel-integra", skip: false }
  }
  if (includesAny(hint, ["SIP AMPLIFIER"])) {
    return { handle: "pa-sip-amplifiers", reason: "zenitel-sip-amp", skip: false }
  }
  if (includesAny(hint, ["PAVA", "V2000", "VIPA"])) {
    return { handle: "pa-pava", reason: "zenitel-pava", skip: false }
  }
  if (
    includesAny(hint, ["IP SPEAKER", "ELSII", "TURBINE SPEAKER"]) ||
    includesAny(t, ["ELSII", "IP SPEAKER", "IP HORN"])
  ) {
    return { handle: "pa-ip-speakers", reason: "zenitel-ip-speakers", skip: false }
  }
  if (includesAny(hint, ["LOUDSPEAKER"])) {
    return { handle: "pa-loudspeakers", reason: "zenitel-loudspeakers", skip: false }
  }
  if (includesAny(hint, ["PAGA", "PA, ALARM", "VOLUME CONTROL"])) {
    if (includesAny(t, ["AMPLIFIER", "LOUDSPEAKER", "SPEAKER"])) {
      return { handle: "pa-loudspeakers", reason: "zenitel-pa-speaker", skip: false }
    }
    return { handle: "pa-loudspeakers", reason: "zenitel-pa-general", skip: false }
  }

  // --- Maritime cameras ---
  if (includesAny(hint, ["EX PROOF IP CAMERA", "EX AREA"] ) && includesAny(hint, ["CAMERA"])) {
    const hay = `${hint} ${t}`
    if (includesAny(hay, ["BACK BOX", "BRACKET", "MOUNT", "CONNECTOR", "WRENCH", "CABLE GLAND"])) {
      return { handle: "ex-tools", reason: "zenitel-ex-acc", skip: false }
    }
    if (includesAny(hint, ["PTZ", "PZT", "DOME"])) {
      return { handle: "ex-zone1-cameras", reason: "zenitel-ex-ptz", skip: false }
    }
    if (includesAny(hint, ["THERMAL"])) {
      return { handle: "ex-thermal", reason: "zenitel-ex-thermal", skip: false }
    }
    return { handle: "ex-zone1-cameras", reason: "zenitel-ex-camera", skip: false }
  }
  if (includesAny(hint, ["IP CAMERA", "CAMERA"])) {
    const hay = `${hint} ${t}`
    if (includesAny(hay, ["BACK BOX", "BRACKET", "MOUNT", "CONNECTOR", "WRENCH", "CABLE GLAND"])) {
      if (includesAny(hay, ["EX PROOF", "EX-PROOF", "DS-2XE", "ATEX", "EXPLOSION", "EX AREA"])) {
        return { handle: "ex-tools", reason: "zenitel-ex-acc", skip: false }
      }
      return { handle: "cctv-accessories", reason: "zenitel-camera-accessory", skip: false }
    }
    if (includesAny(hay, ["FISHEYE", "PANORAMIC"])) {
      return { handle: "cctv-panoramic", reason: "zenitel-panoramic", skip: false }
    }
    if (includesAny(hay, ["UNDERWATER", "SEAHAWK"])) {
      return { handle: "cctv-special", reason: "zenitel-underwater", skip: false }
    }
    if (includesAny(hay, ["PTZ", "PZT"])) {
      return { handle: "cctv-ptz", reason: "zenitel-ptz", skip: false }
    }
    if (includesAny(hay, ["DOME"])) {
      return { handle: "cctv-dome", reason: "zenitel-dome", skip: false }
    }
    if (includesAny(hay, ["BULLET"])) {
      return { handle: "cctv-bullet", reason: "zenitel-bullet", skip: false }
    }
    return { handle: "cctv-special", reason: "zenitel-camera", skip: false }
  }

  // --- Maritime EX / haz signalling ---
  if (includesAny(hint, ["EXPLOSION PROOF", "EX PROOF", "ATEX", "HAZARDOUS"])) {
    if (includesAny(t, ["VSP", "BATTERYLESS"])) {
      return { handle: "intercom-batteryless", reason: "zenitel-ex-vsp", skip: false }
    }
    if (includesAny(hint, ["BEACON", "LIGHT", "FLASH"]) || includesAny(t, ["BEACON", "FLASH"])) {
      return { handle: "ex-tools", reason: "zenitel-ex-beacon", skip: false }
    }
    if (includesAny(hint, ["LOUDSPEAKER"]) || includesAny(t, ["LOUDSPEAKER"])) {
      return { handle: "pa-loudspeakers", reason: "zenitel-ex-speaker", skip: false }
    }
    return { handle: "ex-tools", reason: "zenitel-ex-extra", skip: false }
  }

  // --- Cables ---
  if (includesAny(hint, ["CABLE", "PATCH"])) {
    return { handle: "cables-marine", reason: "zenitel-cable", skip: false }
  }

  // --- Intercom maritime stations ---
  if (
    includesAny(hint, [
      "SUB-STATION",
      "MASTER STATION",
      "HANDSET",
      "DIGITAL INTERCOM",
      "OUTDOOR PANEL",
      "INTERCOM",
    ])
  ) {
    return mapZenitelMaritimeIntercomLeaf(title, hintRaw)
  }

  if (includesAny(hint, ["RADIO", "DECT", "REPEATER", "WIRELESS ACCESS"])) {
    return { handle: "cctv-accessories", reason: "zenitel-radio-dect", skip: false }
  }

  if (includesAny(hint, ["SWITCH", "ETHERNET", "DATA NETWORK", "FLOWIRE", "RACK", "UPS", "POWER MODULE", "SERVER"])) {
    return { handle: "cctv-accessories", reason: "zenitel-infra", skip: false }
  }

  if (includesAny(hint, ["IPTV", "ENTERTAINMENT", "SATELLITE", "PC SCREEN", "IP CLOCK"])) {
    if (includesAny(t, ["TOUCH PANEL", "POWER SUPPLY", "CLOCK"])) {
      return { handle: "cctv-accessories", reason: "zenitel-entertainment-acc", skip: false }
    }
    return { handle: "pa-pava", reason: "zenitel-entertainment", skip: false }
  }

  if (includesAny(hint, ["BEACON", "ROTARY LIGHT", "FLASHING", "ALARM", "RELAY"])) {
    if (includesAny(t, ["RELAY"])) {
      return { handle: "cctv-accessories", reason: "zenitel-relay", skip: false }
    }
    if (includesAny(t, ["BEACON", "FLASH", "LIGHT", "ROTARY"])) {
      return { handle: "ex-tools", reason: "zenitel-alarm-visual", skip: false }
    }
    return { handle: "cctv-accessories", reason: "zenitel-alarm-acc", skip: false }
  }

  if (includesAny(hint, ["LICENSE"])) {
    return mapZenitelLicenseLeaf(title)
  }

  if (includesAny(hint, ["ACCESSOR"])) {
    return mapZenitelAccessoryLeaf(title)
  }

  return null
}

function mapZenitelTitleFallback(title: string): CategoryMapResult {
  const t = upper(title)

  if (SKIP_HINT.test(title)) {
    return { handle: null, reason: "zenitel-skip-title", skip: true }
  }

  if (includesAny(t, ["TCIS", "TCIV", "TURBINE", "ITS-", "ITSV", "CRM-V"])) {
    return { handle: "intercom-ip-sip", reason: "zenitel-title-turbine", skip: false }
  }
  if (includesAny(t, ["EXIGO", "ECPIR"])) {
    return { handle: "paga-exigo", reason: "zenitel-title-exigo", skip: false }
  }
  if (includesAny(t, ["INTEGRA"])) {
    return { handle: "pa-integra", reason: "zenitel-title-integra", skip: false }
  }
  if (includesAny(t, ["VIPEDIA"])) {
    return { handle: "pa-vipedia", reason: "zenitel-title-vipedia", skip: false }
  }
  if (includesAny(t, ["VAIA"])) {
    return { handle: "pa-vaia", reason: "zenitel-title-vaia", skip: false }
  }
  if (includesAny(t, ["SIP AMPLIFIER"])) {
    return { handle: "pa-sip-amplifiers", reason: "zenitel-title-sip-amp", skip: false }
  }
  if (includesAny(t, ["CONNECT PRO", "ZENITEL CONNECT"])) {
    return { handle: "platform-connect-pro", reason: "zenitel-title-connect-pro", skip: false }
  }
  if (includesAny(t, ["ALPHACOM", "ICX"])) {
    return { handle: "intercom-icx-alphacom", reason: "zenitel-title-icx", skip: false }
  }
  if (includesAny(t, ["ICS 6200", "ICS6200"])) {
    return { handle: "intercom-ics-6200", reason: "zenitel-title-ics", skip: false }
  }
  if (includesAny(t, ["VSP", "BATTERYLESS"])) {
    return { handle: "intercom-batteryless", reason: "zenitel-title-vsp", skip: false }
  }
  if (includesAny(t, ["ELSII", "ELSI-", "IP SPEAKER", "IP HORN"])) {
    return { handle: "pa-ip-speakers", reason: "zenitel-title-ip-speaker", skip: false }
  }
  if (includesAny(t, ["LOUDSPEAKER", "SPEAKER"])) {
    return { handle: "pa-loudspeakers", reason: "zenitel-title-speaker", skip: false }
  }
  if (includesAny(t, ["CAMERA"])) {
    if (includesAny(t, ["EX ", "ATEX", "ZONE 1", "EXPLOSION"])) {
      return { handle: "ex-zone1-cameras", reason: "zenitel-title-ex-cam", skip: false }
    }
    if (includesAny(t, ["PTZ"])) {
      return { handle: "cctv-ptz", reason: "zenitel-title-ptz", skip: false }
    }
    if (includesAny(t, ["DOME", "FISHEYE"])) {
      return { handle: "cctv-dome", reason: "zenitel-title-dome", skip: false }
    }
    if (includesAny(t, ["BULLET"])) {
      return { handle: "cctv-bullet", reason: "zenitel-title-bullet", skip: false }
    }
    return { handle: "cctv-special", reason: "zenitel-title-cam", skip: false }
  }
  if (includesAny(t, ["ILS", "LICENSE", "LICENCE"])) {
    return mapZenitelLicenseLeaf(title)
  }
  if (includesAny(t, ["AMPLIFIER"])) {
    return { handle: "pa-vipedia", reason: "zenitel-title-amplifier", skip: false }
  }
  if (includesAny(t, ["MICROPHONE"])) {
    return { handle: "pa-vipedia", reason: "zenitel-title-microphone", skip: false }
  }
  if (
    includesAny(t, [
      "MAIN STATION",
      "SUBSTATION",
      "SUB-STATION",
      "CALL UNIT",
      "ACCOMMODATION",
    ]) ||
    /^90\d{2}\b/.test(t)
  ) {
    return { handle: "intercom-batteryless", reason: "zenitel-title-station", skip: false }
  }
  if (includesAny(t, ["SERVER", "TRANSCODER", "ENCODER", "IPTV", "TVOD"])) {
    return { handle: "pa-pava", reason: "zenitel-title-iptv", skip: false }
  }
  if (includesAny(t, ["RELAY", "JUNCTION BOX", "CABINET", "RACK", "ANTENNA", "CABLE", "COAXIAL", "CLOCK"])) {
    return { handle: "cctv-accessories", reason: "zenitel-title-infra", skip: false }
  }

  return { handle: "cctv-accessories", reason: "zenitel-fallback", skip: false }
}

function mapSpectrumAccessoryLeaf(
  sku: string | null | undefined,
  title: string,
  hay: string
): CategoryMapResult {
  const s = upper(sku)
  const t = upper(title)
  const blob = `${s} ${t} ${hay}`

  if (
    /^T-(WM|PM|CM|PB)$/.test(s) ||
    /^F\dXX-(WM|PM|FM|TO|GM)$/.test(s) ||
    /^SCS-(CM|MM|PM|UM|VM)/.test(s) ||
    /^SD-(WM|DA|DDM|RSK|UM)/.test(s) ||
    /^SF-(CM|RSK)/.test(s) ||
    /\bMOUNT\b|\bBRACKET\b|\bPENDANT\b|\bPOLE\b|\bWALL\b|\bCORNER\b|\bPEDESTAL\b/.test(
      blob
    )
  ) {
    return { handle: "ex-mounts", reason: "spectrum-mount-sku", skip: false }
  }

  if (
    /^SCS-(CBL|PWR)/.test(s) ||
    /\bCABLE\b|\bPOE\b|\bSFP\b|\bPWR\b/.test(blob)
  ) {
    return {
      handle: "ex-power-connectivity",
      reason: "spectrum-connectivity-sku",
      skip: false,
    }
  }

  if (/\bJUNCTION\b|\bHOUSING\b|\bCABINET\b/.test(blob)) {
    return {
      handle: "ex-housings-cabinets",
      reason: "spectrum-housing-sku",
      skip: false,
    }
  }

  return { handle: "ex-tools", reason: "spectrum-accessory-leaf", skip: false }
}

function mapSpectrum(input: CategoryMapInput): CategoryMapResult {
  const title = norm(input.title)
  const t = upper(title)
  const hint = upper(input.categoryHint)
  const hay = `${t} ${hint}`

  if (!title) {
    return { handle: null, reason: "empty-title", skip: true }
  }

  if (/\bHORN\b|\bSPEAKER\b/.test(hay)) {
    return { handle: "network-audio", reason: "spectrum-horn", skip: false }
  }

  if (
    hint.includes("NETWORK ACCESSORIES") ||
    (/\bSFP\b|\bMEDIA CONVERTER\b|\bSPLITTER\b|\bPOE\b/.test(t) &&
      hint.includes("ACCESSOR"))
  ) {
    return {
      handle: "ex-power-connectivity",
      reason: "spectrum-network",
      skip: false,
    }
  }

  if (
    hint.includes("JUNCTION") ||
    /\bJUNCTION\b/.test(hay) ||
    /\bEXJB\b/.test(t) ||
    /^ZONE-/.test(t) ||
    /\bTRIPOD\b/.test(t) ||
    /\bSTARLINK\b/.test(t)
  ) {
    if (
      /\bMESH\b|\bWIRELESS\b|\bSTARLINK\b|\bMERAKI\b|\bRUTM\b|\bXR60\b/.test(
        hay
      )
    ) {
      return {
        handle: "ex-power-connectivity",
        reason: "spectrum-ex-wireless-jb",
        skip: false,
      }
    }
    return {
      handle: "ex-housings-cabinets",
      reason: "spectrum-junction-box",
      skip: false,
    }
  }

  if (hint.includes("TEZP") || /^TEZP/.test(t)) {
    return { handle: "cctv-explosion-protected", reason: "spectrum-tezp", skip: false }
  }

  if (hint.includes("FEZB") || /^FEZB/.test(t)) {
    return { handle: "cctv-explosion-protected", reason: "spectrum-fezb", skip: false }
  }

  if (hint.includes("DOME") || /^D\d{3}/.test(t)) {
    if (/\bPANORAMIC\b|\bFISHEYE\b|\bFISH EYE\b/.test(hay)) {
      return {
        handle: "cctv-explosion-protected",
        reason: "spectrum-d-panoramic",
        skip: false,
      }
    }
    if (/\bPTZ\b|\bP5655\b|\bNDP\b|\bXNP\b|\bQ38/.test(hay)) {
      return { handle: "cctv-explosion-protected", reason: "spectrum-d-ptz", skip: false }
    }
    return { handle: "cctv-explosion-protected", reason: "spectrum-d-dome", skip: false }
  }

  if (hint.includes("FIXED") || /^F\d{3}/.test(t)) {
    return { handle: "cctv-explosion-protected", reason: "spectrum-f-series", skip: false }
  }

  if (
    hint.includes("ACCESSOR") ||
    /\bACCESSOR/.test(hay) ||
    /\bMOUNT\b|\bBRACKET\b|\bGLAND\b|\bWASHER\b|\bSUNSHIELD\b|\bWIPER\b/.test(
      hay
    )
  ) {
    if (
      /\bMOUNT\b|\bBRACKET\b|\bPENDANT\b|\bPOLE\b|\bWALL\b|\bCORNER\b|\bPEDESTAL\b/.test(
        hay
      )
    ) {
      return { handle: "ex-mounts", reason: "spectrum-mount", skip: false }
    }
    return mapSpectrumAccessoryLeaf(input.sku, title, hay)
  }

  return { handle: "ex-zone1-cameras", reason: "spectrum-fallback", skip: false }
}

function mapTecnovideo(input: CategoryMapInput): CategoryMapResult {
  if (SKIP_HINT.test(norm(input.title))) {
    return { handle: null, reason: "tecnovideo-skip-title", skip: true }
  }

  const hint = norm(input.categoryHint).toLowerCase()
  const title = upper(input.title)
  const sku = upper(input.sku)
  const blob = `${hint} ${title} ${sku}`

  const isSafe =
    hint.includes("safe area") ||
    hint.startsWith("safe ") ||
    /\bTSP|\bSAP|\bVSPT|\bSAFE\b/.test(blob)
  const isHaz =
    hint.includes("hazardous") ||
    hint.startsWith("haz ") ||
    /\bTXP|\bTXF|\bTX|\bEX\d|\bCHEP|\bWP10EX|\bHAZARDOUS\b/.test(blob)

  if (
    /washer|junction box|cable tail|bracket|mount|accessory|accessories/.test(
      blob
    )
  ) {
    return {
      handle: isSafe ? "safe-washer-systems" : "haz-washer-systems",
      reason: "tecnovideo-washer-accessory",
      skip: false,
    }
  }

  if (/illuminator|ir led|infrared/.test(blob) && /illuminator/.test(hint + title)) {
    return {
      handle: isSafe ? "safe-illuminators" : "haz-illuminators",
      reason: "tecnovideo-illuminator",
      skip: false,
    }
  }

  if (/pan\s*&\s*tilt|pan and tilt|\bp&t\b|\bpt\b.*unit/.test(blob)) {
    return {
      handle: isSafe ? "safe-pan-tilt" : "haz-pan-tilt",
      reason: "tecnovideo-pan-tilt",
      skip: false,
    }
  }

  if (/ptz camera housing|ptz housing/.test(blob) || (/housing/.test(blob) && /ptz/.test(blob) && !/station/.test(blob))) {
    return {
      handle: isSafe ? "safe-ptz-housing" : "haz-ptz-housing",
      reason: "tecnovideo-ptz-housing",
      skip: false,
    }
  }

  if (
    /fixed camera housing|fixed housing/.test(blob) ||
    (/\bhousing\b/.test(blob) && !/ptz|station/.test(blob))
  ) {
    return {
      handle: isSafe ? "safe-fixed-housing" : "haz-fixed-housing",
      reason: "tecnovideo-fixed-housing",
      skip: false,
    }
  }

  if (/fixed camera station|fixed station|\btxf|\btsf/.test(blob)) {
    return {
      handle: isSafe ? "safe-fixed-stations" : "haz-fixed-stations",
      reason: "tecnovideo-fixed-station",
      skip: false,
    }
  }

  if (/ptz|thermal ptz|dual.*ptz|\btxpt|\btspt|\bsap250/.test(blob)) {
    return {
      handle: isSafe ? "safe-ptz-stations" : "haz-ptz-stations",
      reason: "tecnovideo-ptz-station",
      skip: false,
    }
  }

  if (isSafe) {
    return { handle: "safe-ptz-stations", reason: "tecnovideo-safe-fallback", skip: false }
  }
  if (isHaz) {
    return { handle: "haz-ptz-stations", reason: "tecnovideo-haz-fallback", skip: false }
  }

  return { handle: "haz-ptz-stations", reason: "tecnovideo-default", skip: false }
}

function mapZenitel(input: CategoryMapInput): CategoryMapResult {
  if (SKIP_HINT.test(norm(input.title))) {
    return { handle: null, reason: "zenitel-skip-title", skip: true }
  }
  const hint = norm(input.categoryHint)
  if (hint) {
    const fromHint = mapZenitelHint(hint, input.title)
    if (fromHint) return fromHint
  }
  return mapZenitelTitleFallback(input.title)
}

export function mapManufacturerCategory(
  input: CategoryMapInput
): CategoryMapResult {
  const id = String(input.manufacturerId || "").toLowerCase()
  if (id === "axis") return mapAxis(input)
  if (id === "zenitel") return mapZenitel(input)
  if (id === "spectrum") return mapSpectrum(input)
  if (id === "tecnovideo") return mapTecnovideo(input)
  return { handle: null, reason: "unknown-manufacturer", skip: true }
}

/** Infer manufacturer from product handle / metadata when metadata.manufacturer_id is missing. */
export function inferManufacturerId(input: {
  handle?: string | null
  manufacturerId?: string | null
  manufacturer?: string | null
}): ManufacturerCategoryId | null {
  const mid = String(input.manufacturerId || "").toLowerCase()
  if (
    mid === "axis" ||
    mid === "zenitel" ||
    mid === "spectrum" ||
    mid === "tecnovideo" ||
    mid === "cisco"
  ) {
    return mid
  }
  const brand = String(input.manufacturer || "").toLowerCase()
  if (brand.includes("axis")) return "axis"
  if (brand.includes("zenitel")) return "zenitel"
  if (brand.includes("spectrum")) return "spectrum"
  if (brand.includes("tecnovideo")) return "tecnovideo"
  if (brand.includes("cisco")) return "cisco"
  const handle = String(input.handle || "").toLowerCase()
  if (handle.startsWith("axis-")) return "axis"
  if (handle.startsWith("zenitel-")) return "zenitel"
  if (handle.startsWith("spectrum-")) return "spectrum"
  if (handle.startsWith("tecnovideo-")) return "tecnovideo"
  if (handle.startsWith("cisco-")) return "cisco"
  return null
}
