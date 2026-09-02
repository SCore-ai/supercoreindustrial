import type { PartnerBrandConfig } from "./types"

export const ZENITEL_BRAND: PartnerBrandConfig = {
  id: "zenitel",
  collectionHandle: "zenitel",
  label: "Zenitel",
  legalName: "Zenitel",
  badge: "distributor",
  badgeLabel: "Regional & Worldwide Distributor",
  hubHref: "/brands/zenitel",
  catalogHref: "/collections/zenitel",
  aboutNavLabel: "Distributor",
  certsNavLabel: "Certifications",
  metadataTitle: "Zenitel | Regional & Worldwide Distributor",
  metadataDescription:
    "Supercore is the Zenitel Safety & Security distributor for Azerbaijan, Turkmenistan and Uzbekistan, and a Worldwide Distributor for Zenitel Maritime & Energy.",
  hero: {
    eyebrow: "Supercore · Zenitel distributor",
    title: "Zenitel specified and supplied from our desk",
    body:
      "Two mandates, one commercial path. We are the regional Safety & Security distributor for Azerbaijan, Turkmenistan and Uzbekistan — and a Worldwide Distributor for Zenitel Maritime & Energy. Live catalogue, project quotes, and documentation through Supercore.",
    bullets: [
      "Safety & Security: intercom, IC-EDGE, and related IP stations for Azerbaijan, Turkmenistan and Uzbekistan.",
      "Maritime & Energy: PAGA, batteryless talkback, marine CCTV and Ex signalling — worldwide supply.",
    ],
    images: [
      {
        seriesSlug: "safety-security",
        caption: "Safety & Security · IP intercom",
        alt: "Zenitel Turbine IP intercom station",
      },
      {
        seriesSlug: "maritime-energy",
        caption: "Maritime & Energy · worldwide",
        alt: "Zenitel maritime communication equipment",
      },
    ],
  },
  intro: [
    {
      title: "Safety & Security territory",
      body: "Authorized regional distributor for Azerbaijan, Turkmenistan and Uzbekistan — building, transport, and industrial intercom programmes in those markets.",
    },
    {
      title: "Maritime & Energy worldwide",
      body: "Worldwide Distributor for the marine and energy portfolio: PAGA, batteryless systems, ICS 6200, and classified-area signalling for vessels and offshore sites.",
    },
    {
      title: "One desk for both lines",
      body: "Quote, trade account, and SKU matching through Supercore. You do not bounce between a US cart and a separate marine channel.",
    },
  ],
  visualRail: {
    eyebrow: "Hardware we specify",
    title: "Built for critical voice — sold through us",
    shots: [
      {
        seriesSlug: "paga",
        href: "/brands/zenitel/paga",
        label: "PAGA",
        title: "Exigo, SPA-V2 and voice alarm",
        alt: "Zenitel public address and alarm equipment",
      },
      {
        seriesSlug: "platforms",
        href: "/brands/zenitel/platforms",
        label: "Platforms",
        title: "ICX-AlphaCom and Connect",
        alt: "Zenitel ICX-AlphaCom platform hardware",
      },
      {
        seriesSlug: "speakers",
        href: "/brands/zenitel/speakers",
        label: "Speakers",
        title: "IP horns and loudspeakers",
        alt: "Zenitel IP loudspeaker",
      },
    ],
  },
  techFacts: {
    eyebrow: "Technical snapshot",
    title: "What engineers ask before they specify",
    items: [
      {
        label: "Safety & Security cover",
        value: "Azerbaijan · Turkmenistan · Uzbekistan",
      },
      {
        label: "Maritime & Energy cover",
        value: "Worldwide Distributor",
      },
      {
        label: "Intercom platforms",
        value: "ICX-AlphaCom · IC-EDGE · ICS 6200 · Connect",
      },
      {
        label: "Public address",
        value: "Exigo · SPA-V2 · Vipedia / VAIA · Integra",
      },
      {
        label: "Marine & Ex",
        value: "Batteryless VSP · Ex stations · marine CCTV",
      },
      {
        label: "Integration",
        value: "SIP, analogue, and platform licences by SKU",
      },
    ],
  },
  seriesHeading: "Zenitel systems and hardware",
  series: [
    {
      slug: "safety-security",
      navLabel: "Safety & Security",
      title: "Safety & Security intercom",
      eyebrow: "AZ · TM · UZ distributor",
      href: "/brands/zenitel/safety-security",
      description:
        "Turbine IP stations, IC-EDGE, operator desks, and related intercom for buildings, transport, and industry in Azerbaijan, Turkmenistan and Uzbekistan.",
      match: {
        any: [
          "intercom-ip-sip",
          "intercom-ic-edge",
          "turbine",
          "tcis",
          "tciv",
          "ip intercom",
          "ip telephone",
          "operator station",
        ],
        none: ["turbine speaker", "maritime"],
      },
    },
    {
      slug: "maritime-energy",
      navLabel: "Maritime & Energy",
      title: "Maritime & Energy",
      eyebrow: "Worldwide Distributor",
      href: "/brands/zenitel/maritime-energy",
      description:
        "Batteryless talkback, ICS 6200, marine CCTV, Ex stations, and related hardware for vessels, yards, and energy sites — supplied worldwide.",
      match: {
        any: [
          "maritime",
          "batteryless",
          "intercom-batteryless",
          "intercom-ics-6200",
          "ics-6200",
          "ics 6200",
          "ics6200",
          " vsp",
          "cables-marine",
          "seahawk",
          "ex-zone",
          "explosion",
          "marine",
        ],
      },
    },
    {
      slug: "paga",
      navLabel: "PAGA",
      title: "PAGA and voice alarm",
      eyebrow: "Exigo · SPA-V2 · Vipedia",
      href: "/brands/zenitel/paga",
      description:
        "Public address and general alarm: Exigo, SPA-V2, Vipedia, VAIA, Integra, and PAVA packages for industrial and marine sites.",
      match: {
        any: [
          "paga-exigo",
          "paga-spa",
          "pa-vipedia",
          "pa-integra",
          "pa-pava",
          "pa-vaia",
          "pa-sip",
          "exigo",
          "vipedia",
          "integra",
          "public-address",
        ],
      },
    },
    {
      slug: "platforms",
      navLabel: "Platforms",
      title: "Solution platforms",
      eyebrow: "ICX · Connect",
      href: "/brands/zenitel/platforms",
      description:
        "ICX-AlphaCom cores, licences, and Zenitel Connect Pro — the servers and software the stations hang on.",
      match: {
        any: [
          "platform-",
          "alphacom",
          "icx",
          "connect pro",
          "zenitel connect",
          "solution-platforms",
        ],
      },
    },
    {
      slug: "speakers",
      navLabel: "Speakers",
      title: "Speakers and horns",
      eyebrow: "IP & analogue",
      href: "/brands/zenitel/speakers",
      description:
        "IP speakers, ELSII horns, and conventional loudspeakers for PAGA and intercom coverage.",
      match: {
        any: [
          "pa-loudspeakers",
          "pa-ip-speakers",
          "elsii",
          "turbine speaker",
          "loudspeaker",
          "ip speaker",
        ],
      },
    },
    {
      slug: "accessories",
      navLabel: "Accessories",
      title: "Accessories",
      eyebrow: "Cables & kits",
      href: "/brands/zenitel/accessories",
      description:
        "Cables, mounting kits, and spares that complete a Zenitel station or PAGA install.",
      match: {
        any: ["accessor", "cable", "patch", "mount", "bracket"],
      },
    },
  ],
  landingTileOrder: [
    "safety-security",
    "maritime-energy",
    "paga",
    "platforms",
    "speakers",
    "accessories",
  ],
  certsStrip: {
    eyebrow: "Coverage we hold",
    title: "Two Zenitel mandates — we quote against both",
    body: "Safety & Security for Azerbaijan, Turkmenistan and Uzbekistan. Maritime & Energy worldwide. Open the coverage map for how we work a package.",
    marks: [
      { mark: "AZ", note: "Azerbaijan" },
      { mark: "TM", note: "Turkmenistan" },
      { mark: "UZ", note: "Uzbekistan" },
      { mark: "M&E", note: "Worldwide" },
      { mark: "PAGA", note: "Exigo / SPA" },
      { mark: "ICX", note: "Platforms" },
    ],
  },
  featuredHeading: "One product from each series",
  cta: {
    title: "Specify Zenitel through Supercore",
    body: "Regional Safety & Security cover in Azerbaijan, Turkmenistan and Uzbekistan, plus worldwide Maritime & Energy — priced, quoted, and supported from our desk.",
  },
  certifications: {
    metadataTitle: "Zenitel coverage",
    metadataDescription:
      "Supercore Zenitel mandates: Safety & Security distributor for Azerbaijan, Turkmenistan and Uzbekistan; Worldwide Distributor for Maritime & Energy.",
    eyebrow: "Coverage · distributor",
    title: "Where we are authorized to supply Zenitel",
    body: "Mandates are by product family, not by website. Safety & Security is territorial. Maritime & Energy is worldwide. We lock the SKU against the right mandate before we quote.",
    nav: [
      { href: "#mandates", label: "Mandates" },
      { href: "#families", label: "Families" },
      { href: "#sites", label: "Typical sites" },
      { href: "#submittal", label: "How we work" },
    ],
    help: [
      {
        title: "We name the mandate",
        body: "Building / transport intercom in AZ, TM or UZ is Safety & Security. Vessel, yard, and energy PAGA or batteryless is Maritime & Energy.",
      },
      {
        title: "We lock the family",
        body: "Turbine vs Exigo vs ICS 6200 vs ICX licences change commercial cover. Changing the SKU can change which mandate applies.",
      },
      {
        title: "We issue the pack",
        body: "Datasheet, marine or voice-alarm documentation, and the quote from our desk — not a generic brochure.",
      },
    ],
    schemesEyebrow: "Distributor mandates",
    schemesTitle: "Two lines, two geographies",
    schemesBody:
      "Use this as a specifier map. Confirm the exact type approval or EN 54 file on the datasheet for that part number.",
    schemes: [
      {
        id: "az",
        mark: "Azerbaijan",
        region: "Safety & Security",
        role: "Regional distributor",
        body: "Authorized to quote and supply Zenitel Safety & Security intercom and related IP stations for projects in Azerbaijan.",
      },
      {
        id: "tm",
        mark: "Turkmenistan",
        region: "Safety & Security",
        role: "Regional distributor",
        body: "Same Safety & Security mandate for Turkmenistan sites — building, transport, and industrial programmes.",
      },
      {
        id: "uz",
        mark: "Uzbekistan",
        region: "Safety & Security",
        role: "Regional distributor",
        body: "Same Safety & Security mandate for Uzbekistan. We match Turbine / IC-EDGE SKUs to the drawing.",
      },
      {
        id: "me",
        mark: "Worldwide",
        region: "Maritime & Energy",
        role: "Worldwide Distributor",
        body: "Authorized to supply Zenitel Maritime & Energy globally — PAGA, batteryless, ICS 6200, marine CCTV, and Ex signalling.",
      },
      {
        id: "paga",
        mark: "PAGA",
        region: "Marine & industry",
        role: "Exigo · SPA-V2 · Vipedia",
        body: "Public address and general alarm packages. EN 54 / marine class files are model-specific — we send the pack for the SKU.",
      },
      {
        id: "icx",
        mark: "Platforms",
        region: "ICX · Connect",
        role: "Cores and licences",
        body: "ICX-AlphaCom and Connect Pro licences travel with the system design. Confirm the licence SKU before submittal.",
      },
    ],
    translatorEyebrow: "Family translator",
    translatorTitle: "Safety & Security next to Maritime & Energy",
    translatorBody:
      "North Sea EPCs and Caspian building programmes speak different Zenitel catalogues. Dual-use SKUs exist — still confirm which mandate we quote under.",
    translatorHeaders: ["Family", "Typical mandate", "What it means"],
    translatorRows: [
      {
        left: "Turbine / IC-EDGE / IP stations",
        mid: "Safety & Security (AZ, TM, UZ)",
        right: "Landside intercom for those three countries.",
      },
      {
        left: "Batteryless VSP / ICS 6200",
        mid: "Maritime & Energy (worldwide)",
        right: "Ship and energy talkback that must survive power loss.",
      },
      {
        left: "Exigo / SPA-V2 / Vipedia",
        mid: "Maritime & Energy (worldwide)",
        right: "PAGA and voice alarm on vessels and plants.",
      },
      {
        left: "ICX-AlphaCom / Connect",
        mid: "By system design",
        right: "Platform SKUs follow the stations they serve.",
      },
    ],
    markingEyebrow: "Documentation literacy",
    markingTitle: "What we send with a Zenitel SKU",
    markingBody:
      "Type approvals, EN 54, and marine class certificates are model-specific. Never copy a sample string onto a submittal without the datasheet.",
    marking: [
      { label: "Landside intercom", value: "SIP / IC-EDGE datasheet · territory quote (AZ, TM, UZ)" },
      { label: "Marine PAGA", value: "Exigo / SPA-V2 pack · class notes as listed on the SKU" },
      { label: "Batteryless", value: "VSP / ICS 6200 system drawing + station list" },
      { label: "Ex stations", value: "ATEX / IECEx file for that assembly — confirm groups" },
    ],
    noteTitle: "Distributor note",
    noteBody:
      "A Turbine station for a Baku building and an Exigo panel for a tanker are different mandates. Tell us the site country and whether the package is marine or landside before we lock the quote.",
    stepsEyebrow: "How we work a package",
    stepsTitle: "Three steps to a usable quote",
    steps: [
      {
        step: "01",
        title: "Name the site",
        body: "Country (especially AZ / TM / UZ) and landside vs vessel / energy.",
      },
      {
        step: "02",
        title: "Lock the family",
        body: "Intercom, PAGA, batteryless, or platform licences — each can change the mandate.",
      },
      {
        step: "03",
        title: "Request the pack",
        body: "We issue pricing and the matching datasheet set for those part numbers.",
      },
    ],
  },
  about: {
    metadataTitle: "Zenitel distributor",
    metadataDescription:
      "Supercore is the Zenitel Safety & Security distributor for Azerbaijan, Turkmenistan and Uzbekistan, and a Worldwide Distributor for Maritime & Energy.",
    eyebrow: "Partnership · distributor",
    title: "Zenitel through our desk, not a distant web cart",
    body: "Supercore Industrial Systems Ltd holds two Zenitel mandates: regional Safety & Security for Azerbaijan, Turkmenistan and Uzbekistan, and worldwide Maritime & Energy. You specify critical voice with a local commercial path.",
    shots: [
      {
        seriesSlug: "safety-security",
        caption: "Safety & Security · AZ TM UZ",
        alt: "Zenitel Safety & Security intercom",
      },
      {
        seriesSlug: "maritime-energy",
        caption: "Maritime & Energy · worldwide",
        alt: "Zenitel maritime and energy hardware",
      },
    ],
    splitEyebrow: "Two names on every package",
    splitTitle: "Norway engineers the system. We sell and support it here.",
    manufacturerTitle: "Zenitel",
    manufacturerBody:
      "Critical communication: IP intercom, PAGA, batteryless talkback, and marine platforms used on ships, plants, and public buildings.",
    ourTitle: "Supercore Industrial Systems Ltd",
    ourBody:
      "Your commercial counterpart. We price the live catalogue, apply the correct mandate (territorial Safety & Security vs worldwide Maritime & Energy), and issue documentation against the SKU.",
    pathEyebrow: "How a project moves",
    pathTitle: "From drawing to a usable order",
    path: [
      {
        step: "01",
        title: "Name the mandate",
        body: "AZ / TM / UZ landside intercom, or worldwide marine / energy.",
      },
      {
        step: "02",
        title: "Lock the family",
        body: "Turbine, Exigo, batteryless, ICS 6200, or ICX licences.",
      },
      {
        step: "03",
        title: "Quote or checkout",
        body: "Trade accounts raise a quote. Checkout remains where terms allow.",
      },
      {
        step: "04",
        title: "Documentation",
        body: "Datasheet and type-approval files for those part numbers.",
      },
    ],
    lineEyebrow: "What we stock",
    lineTitle: "The Zenitel line we sell",
    lineBody:
      "Live catalogue aligned to manufacturer families — priced and supported from our territory.",
    marketsEyebrow: "Typical sites",
    markets: [
      "Oil & gas",
      "Marine",
      "Offshore",
      "Transport",
      "Industry",
      "Public buildings",
    ],
    deskEyebrow: "Why specify through us",
    deskTitle: "A desk that knows both mandates",
    desk: [
      {
        title: "Territorial S&S",
        body: "Azerbaijan, Turkmenistan and Uzbekistan Safety & Security — one commercial cover for those countries.",
      },
      {
        title: "Worldwide M&E",
        body: "Maritime & Energy supplied globally, including PAGA and batteryless packages.",
      },
      {
        title: "Configured systems",
        body: "Stations, amplifiers, and licences are quoted as a system, not a random basket of SKUs.",
      },
    ],
  },
}
