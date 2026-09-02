export type CategorySeed = {
  name: string
  handle: string
  children?: CategorySeed[]
}

/** Supercore product taxonomy — matches master category document */
export const SUPERCORE_CATEGORY_TREE: CategorySeed[] = [
  {
    name: "CCTV Systems",
    handle: "cctv-systems",
    children: [
      { name: "Box", handle: "cctv-box" },
      { name: "Bullet", handle: "cctv-bullet" },
      { name: "Dome", handle: "cctv-dome" },
      { name: "PTZ", handle: "cctv-ptz" },
      { name: "Panoramic", handle: "cctv-panoramic" },
      { name: "Positioning", handle: "cctv-positioning" },
      { name: "Special Cameras", handle: "cctv-special" },
      { name: "Thermal Imaging", handle: "cctv-thermal" },
      { name: "Explosion-Protected", handle: "cctv-explosion-protected" },
      { name: "Accessories", handle: "cctv-accessories" },
      { name: "Storage and Recorders", handle: "cctv-storage" },
      { name: "Software", handle: "cctv-software" },
    ],
  },
  {
    name: "PAGA Systems",
    handle: "paga-systems",
    children: [
      { name: "EXIGO Networked IP PA/GA", handle: "paga-exigo" },
      { name: "SPA-V2 PA/GA", handle: "paga-spa-v2" },
    ],
  },
  {
    name: "Intercom Systems",
    handle: "intercom-systems",
    children: [
      { name: "IC-EDGE System", handle: "intercom-ic-edge" },
      { name: "ICX-AlphaCom Platform", handle: "intercom-icx-alphacom" },
      { name: "ICS 6200 System", handle: "intercom-ics-6200" },
      { name: "Batteryless Telephone", handle: "intercom-batteryless" },
      { name: "IP and SIP Intercom", handle: "intercom-ip-sip" },
    ],
  },
  {
    name: "Public Address Systems",
    handle: "public-address-systems",
    children: [
      { name: "ZENITEL PAVA Systems", handle: "pa-pava" },
      { name: "INTEGRA Range (Wall Mount)", handle: "pa-integra" },
      { name: "VIPEDIA Range (Rack Mount)", handle: "pa-vipedia" },
      { name: "Zenitel VAIA Range", handle: "pa-vaia" },
      { name: "SIP Amplifiers", handle: "pa-sip-amplifiers" },
      { name: "IP Speakers", handle: "pa-ip-speakers" },
      { name: "Loudspeakers", handle: "pa-loudspeakers" },
    ],
  },
  {
    name: "Solution Platforms",
    handle: "solution-platforms",
    children: [
      { name: "Zenitel Connect Pro", handle: "platform-connect-pro" },
      { name: "IC-EDGE System", handle: "platform-ic-edge" },
      { name: "ICX-AlphaCom", handle: "platform-icx-alphacom" },
    ],
  },
  {
    name: "Explosion-Protected Devices",
    handle: "explosion-protected-devices",
    children: [
      {
        name: "Accessories for Hazardous Areas",
        handle: "ex-accessories",
        children: [
          {
            name: "Housings and Cabinets for Hazardous Areas",
            handle: "ex-housings-cabinets",
          },
          { name: "Mounts for Hazardous Areas", handle: "ex-mounts" },
          {
            name: "Power and Connectivity for Hazardous Areas",
            handle: "ex-power-connectivity",
          },
          { name: "Tools and Extras for Hazardous Areas", handle: "ex-tools" },
        ],
      },
      {
        name: "Explosion-Protected Cameras",
        handle: "ex-cameras",
        children: [
          {
            name: "Explosion Protected Cameras Certified Zone 1 and-or Division 1",
            handle: "ex-zone1-cameras",
          },
          {
            name: "Explosion Protected Fixed Camera Certified Zone 2 and Division 2",
            handle: "ex-zone2-cameras",
          },
          { name: "Explosion Protected Dome Cameras", handle: "ex-dome-cameras" },
          { name: "Explosion Protected Fixed Cameras", handle: "ex-fixed-cameras" },
          { name: "Thermal imaging", handle: "ex-thermal" },
        ],
      },
    ],
  },
  { name: "Network audio", handle: "network-audio" },
  { name: "Access control", handle: "access-control" },
  {
    name: "Radar",
    handle: "radar",
    children: [
      { name: "Security Radars", handle: "radar-security" },
      { name: "HDR 300 Series", handle: "radar-hdr-300" },
      { name: "HDR 351 Radar", handle: "radar-hdr-351" },
      { name: "AdvanceGuard for Airports", handle: "radar-advanceguard-airports" },
      { name: "AdvanceGuard for FOD", handle: "radar-advanceguard-fod" },
      {
        name: "AdvanceGuard for Ground Surveillance",
        handle: "radar-advanceguard-ground",
      },
      { name: "AdvanceGuard for Security", handle: "radar-advanceguard-security" },
      { name: "ClearWay", handle: "radar-clearway" },
      { name: "SafeGuard", handle: "radar-safeguard" },
      { name: "Sensors", handle: "radar-sensors" },
    ],
  },
  { name: "Video analytics", handle: "video-analytics" },
  {
    name: "Hazardous Area",
    handle: "hazardous-area",
    children: [
      { name: "Hazardous Area Fixed Camera Housing", handle: "haz-fixed-housing" },
      { name: "Hazardous Area Fixed Camera Stations", handle: "haz-fixed-stations" },
      { name: "Hazardous Area Illuminators", handle: "haz-illuminators" },
      { name: "Hazardous Area Pan & Tilt", handle: "haz-pan-tilt" },
      { name: "Hazardous Area PTZ Camera Housing", handle: "haz-ptz-housing" },
      { name: "Hazardous Area PTZ Camera Stations", handle: "haz-ptz-stations" },
      {
        name: "Hazardous Area Washer Systems and Accessories",
        handle: "haz-washer-systems",
      },
    ],
  },
  {
    name: "Safe Area",
    handle: "safe-area",
    children: [
      { name: "Safe Area Fixed Camera Housing", handle: "safe-fixed-housing" },
      { name: "Safe Area Fixed Camera Stations", handle: "safe-fixed-stations" },
      { name: "Safe Area Illuminators", handle: "safe-illuminators" },
      { name: "Safe Area Pan & Tilt", handle: "safe-pan-tilt" },
      { name: "Safe Area PTZ Camera Housing", handle: "safe-ptz-housing" },
      { name: "Safe Area PTZ Camera Stations", handle: "safe-ptz-stations" },
      {
        name: "Safe Area Washer Systems and Accessories",
        handle: "safe-washer-systems",
      },
    ],
  },
  {
    name: "Cables",
    handle: "cables",
    children: [
      { name: "NEK Sealine Marine Cables", handle: "cables-nek-sealine" },
      {
        name: "DNV-GL and Lloyd's Register Approved Cables",
        handle: "cables-dnv-lloyds",
      },
      { name: "NEK 606 Cables", handle: "cables-nek-606" },
      { name: "BS6883 / BS7917 UKOOA Cables", handle: "cables-bs6883" },
      { name: "Amercable Gexol Type P Cables", handle: "cables-amercable-gexol" },
      { name: "Bespoke Design / Hybrid Cables", handle: "cables-bespoke-hybrid" },
      { name: "Marine Cables", handle: "cables-marine" },
      { name: "Fibre Optic Cables", handle: "cables-fibre" },
      { name: "Data / Admiral Cables", handle: "cables-data-admiral" },
      { name: "Pre-Term Fibre Optic Assemblies", handle: "cables-preterm-fibre" },
    ],
  },
  {
    name: "Legacy Devices",
    handle: "legacy-devices",
  },
]
