import type { PartnerBrandConfig } from "./types"

export const AXIS_BRAND: PartnerBrandConfig = {
  id: "axis",
  collectionHandle: "axis",
  label: "Axis",
  legalName: "Axis Communications",
  badge: "solution-partner",
  badgeLabel: "Solution Partner",
  hubHref: "/brands/axis",
  catalogHref: "/collections/axis",
  aboutNavLabel: "Partner",
  certsNavLabel: "Certifications",
  metadataTitle: "Axis | Certified Solution Partner",
  metadataDescription:
    "Supercore is an Axis Solution Partner with two Axis Certified Professionals on the team — network video, audio, access control, and analytics.",
  hero: {
    eyebrow: "Supercore · Axis Solution Partner",
    title: "Axis specified by certified people, supplied from our desk",
    body:
      "We are an Axis Solution Partner. Two Axis Certified Professionals sit on the Supercore team — they read the site, lock the SKU, and stay on the design through commissioning. Live GBP / EUR / USD catalogue for cameras, audio, access control, radar, and explosion-protected lines.",
    bullets: [
      "Solution Partner: design-in support, not a grey-market cart.",
      "Two Axis Certified Professionals in-house for product selection, cybersecurity baseline, and project documentation.",
    ],
    images: [
      {
        seriesSlug: "cameras",
        caption: "Network cameras · M / P / Q",
        alt: "Axis network camera",
      },
      {
        seriesSlug: "explosion-protected",
        caption: "Explosion-protected · X-line",
        alt: "Axis explosion-protected camera",
      },
    ],
  },
  intro: [
    {
      title: "Certified Solution Partner",
      body: "Axis recognises Supercore as a Solution Partner. You get partner-channel pricing, design support, and a named desk — not an anonymous web order.",
    },
    {
      title: "Two Certified Professionals",
      body: "Two Axis Certified Professionals on staff. They own SKU selection, firmware / cybersecurity baseline, and the submittal pack for EPCs and end users.",
    },
    {
      title: "Industrial catalogue",
      body: "Cameras, network audio, access control, intercom, radar, and explosion-protected X-line — quoted in GBP with EUR and USD on every variant.",
    },
  ],
  visualRail: {
    eyebrow: "Hardware we specify",
    title: "Built for sites, sold through a certified desk",
    shots: [
      {
        seriesSlug: "network-audio",
        href: "/brands/axis/network-audio",
        label: "Network audio",
        title: "Speakers, horns, and paging",
        alt: "Axis network speaker",
      },
      {
        seriesSlug: "access-control",
        href: "/brands/axis/access-control",
        label: "Access control",
        title: "Controllers and readers",
        alt: "Axis network door controller",
      },
      {
        seriesSlug: "radar",
        href: "/brands/axis/radar",
        label: "Radar",
        title: "Area detection without a camera",
        alt: "Axis security radar",
      },
    ],
  },
  techFacts: {
    eyebrow: "Technical snapshot",
    title: "What engineers ask before they specify",
    items: [
      {
        label: "Partnership",
        value: "Axis Solution Partner",
      },
      {
        label: "On the team",
        value: "2 Axis Certified Professionals",
      },
      {
        label: "Video",
        value: "Box · bullet · dome · PTZ · panoramic · thermal",
      },
      {
        label: "Beyond cameras",
        value: "Audio · access control · intercom · radar",
      },
      {
        label: "Hazardous area",
        value: "X-line and Zone 2 / Div 2 (-XLE) assemblies",
      },
      {
        label: "Open standards",
        value: "ONVIF · Axis OS · edge analytics",
      },
    ],
  },
  seriesHeading: "Axis systems and hardware",
  series: [
    {
      slug: "cameras",
      navLabel: "Cameras",
      title: "Network cameras",
      eyebrow: "M / P / Q / V",
      href: "/brands/axis/cameras",
      description:
        "Box, bullet, dome, PTZ, panoramic, and thermal cameras for industrial and commercial sites.",
      match: {
        any: [
          "cctv-dome",
          "cctv-bullet",
          "cctv-box",
          "cctv-ptz",
          "cctv-panoramic",
          "cctv-thermal",
          "cctv-positioning",
          "cctv-special",
          "cctv-systems",
          "axis p",
          "axis m",
          "axis q",
          "axis v",
          "axis f",
          "network camera",
        ],
        none: ["explosion", "ex-zone", "axis t", "axis s"],
      },
    },
    {
      slug: "explosion-protected",
      navLabel: "Ex cameras",
      title: "Explosion-protected",
      eyebrow: "X-line · Zone / Div",
      href: "/brands/axis/explosion-protected",
      description:
        "Axis X-line and -XLE cameras for classified areas — Zone 1 / Div 1 and Zone 2 / Div 2 listings by model.",
      match: {
        any: [
          "explosion",
          "ex-zone",
          "excam",
          "cctv-explosion",
          "-xle",
          "axis x",
        ],
      },
    },
    {
      slug: "network-audio",
      navLabel: "Audio",
      title: "Network audio",
      eyebrow: "C-line",
      href: "/brands/axis/network-audio",
      description:
        "Network speakers, horns, bridges, and paging consoles for deterrence and public address.",
      match: {
        any: [
          "network-audio",
          "axis c1",
          "axis c8",
          "horn speaker",
          "audio manager",
        ],
      },
    },
    {
      slug: "access-control",
      navLabel: "Access",
      title: "Access control",
      eyebrow: "A-line",
      href: "/brands/axis/access-control",
      description:
        "Network door controllers, readers, and I/O for industrial access control.",
      match: {
        any: [
          "access-control",
          "door controller",
          "card reader",
          "axis a1",
          "axis a4",
          "axis a9",
        ],
      },
    },
    {
      slug: "intercom",
      navLabel: "Intercom",
      title: "Video intercom",
      eyebrow: "I-line · 2N",
      href: "/brands/axis/intercom",
      description:
        "Network video intercoms and door stations for gates, plants, and building entries.",
      match: {
        any: [
          "intercom-ip-sip",
          "door station",
          "video intercom",
          "axis i8",
          "axis i7",
          "axis i5",
          "2n ",
        ],
      },
    },
    {
      slug: "radar",
      navLabel: "Radar",
      title: "Security radar",
      eyebrow: "D-line",
      href: "/brands/axis/radar",
      description:
        "Axis security radar for wide-area detection with analytics, including PTZ auto-tracking triggers.",
      match: {
        any: ["radar", "d2110", "d212", "d2210"],
      },
    },
    {
      slug: "accessories",
      navLabel: "Accessories",
      title: "Accessories & storage",
      eyebrow: "T-line · S-line",
      href: "/brands/axis/accessories",
      description:
        "Mounts, housings, midspans, illuminators, recorders, and licences that complete an Axis install.",
      match: {
        any: [
          "cctv-accessories",
          "cctv-storage",
          "cctv-software",
          "ex-mount",
          "ex-accessor",
          "midspan",
          "axis t",
          "axis s",
        ],
      },
    },
  ],
  landingTileOrder: [
    "cameras",
    "explosion-protected",
    "network-audio",
    "access-control",
    "intercom",
    "radar",
    "accessories",
  ],
  certsStrip: {
    eyebrow: "Certified partner",
    title: "Solution Partner — two Certified Professionals on staff",
    body: "Axis partnership is people, not a logo. Open the partner page for how we design, lock SKUs, and support cybersecurity baseline.",
    marks: [
      { mark: "Partner", note: "Solution Partner" },
      { mark: "×2", note: "Certified Pros" },
      { mark: "ONVIF", note: "Open API" },
      { mark: "Axis OS", note: "Cybersecurity" },
      { mark: "X-line", note: "Ex cameras" },
      { mark: "C-line", note: "Audio" },
    ],
  },
  featuredHeading: "One product from each series",
  cta: {
    title: "Specify Axis through a Solution Partner",
    body: "Two Axis Certified Professionals on the Supercore team — live catalogue, design-in, and documentation against the SKU.",
  },
  certifications: {
    metadataTitle: "Axis Solution Partner",
    metadataDescription:
      "Supercore is an Axis Solution Partner with two Axis Certified Professionals — design-in, SKU lock, and project documentation.",
    eyebrow: "Partnership · Solution Partner",
    title: "Axis through certified people at Supercore",
    body: "Solution Partner status is the commercial channel. Two Axis Certified Professionals are the people who own your design. Product marks (ONVIF, IP/IK, Ex) remain model-specific on the datasheet.",
    nav: [
      { href: "#mandates", label: "Partner" },
      { href: "#families", label: "Roles" },
      { href: "#sites", label: "Submittal pack" },
      { href: "#submittal", label: "How we work" },
    ],
    help: [
      {
        title: "We read the site",
        body: "Lighting, mounting, hazardous-area notes, and whether you need video, audio, access, intercom, or radar.",
      },
      {
        title: "A Certified Professional locks the SKU",
        body: "Two Axis Certified Professionals on staff. They pick the camera / speaker / controller and the firmware baseline.",
      },
      {
        title: "We issue the pack",
        body: "Datasheet, cybersecurity notes, and quote from the Solution Partner desk.",
      },
    ],
    schemesEyebrow: "Who is certified",
    schemesTitle: "Partner programme and people",
    schemesBody:
      "Axis certifies companies and individuals separately. Supercore holds Solution Partner status. Two people on our team hold Axis Certified Professional credentials.",
    schemes: [
      {
        id: "solution-partner",
        mark: "Solution Partner",
        region: "Supercore Industrial Systems Ltd",
        role: "Company credential",
        body: "Authorized Axis Solution Partner. Design-in, partner-channel supply, and ongoing product support through our desk.",
      },
      {
        id: "cp-1",
        mark: "Certified Professional",
        region: "On staff · 1 of 2",
        role: "Individual credential",
        body: "Axis Certified Professional on the Supercore team — product selection and project documentation.",
      },
      {
        id: "cp-2",
        mark: "Certified Professional",
        region: "On staff · 2 of 2",
        role: "Individual credential",
        body: "Second Axis Certified Professional on staff — coverage when the first is on a site or in a design review.",
      },
      {
        id: "onvif",
        mark: "ONVIF",
        region: "Product (model-specific)",
        role: "Open video interface",
        body: "Most Axis cameras and many audio / access devices are ONVIF-conformant. Confirm the profile on the datasheet.",
      },
      {
        id: "axis-os",
        mark: "Axis OS",
        region: "Cybersecurity baseline",
        role: "Signed firmware",
        body: "We specify current Axis OS tracks and hardening notes with the SKU — not a random firmware drop.",
      },
      {
        id: "ex",
        mark: "X-line / -XLE",
        region: "Hazardous area",
        role: "Ex listings",
        body: "Explosion-protected cameras carry their own ATEX / IECEx / NEC files. We match the listing to the drawing.",
      },
    ],
    translatorEyebrow: "Role translator",
    translatorTitle: "Company partner vs people vs product marks",
    translatorBody:
      "EPCs often ask “are you Axis certified?”. Three different answers: the company is a Solution Partner; two staff are Certified Professionals; the camera has its own type tests.",
    translatorHeaders: ["What they asked", "What we hold", "What it means on the job"],
    translatorRows: [
      {
        left: "Are you an Axis partner?",
        mid: "Solution Partner",
        right: "Commercial channel and design-in through Supercore.",
      },
      {
        left: "Who can sign the design?",
        mid: "2 Certified Professionals",
        right: "Named people on our team, not a rented logo.",
      },
      {
        left: "Is the camera ONVIF / Ex?",
        mid: "Model datasheet",
        right: "Product marks stay with the SKU. We send that file.",
      },
      {
        left: "Who owns cybersecurity?",
        mid: "Axis OS baseline + our CP",
        right: "Firmware track and hardening notes with the quote.",
      },
    ],
    markingEyebrow: "What we put on a submittal",
    markingTitle: "Typical Axis pack from this desk",
    markingBody:
      "Partnership letters, datasheets, and Ex files are separate documents. We do not substitute a partner certificate for a camera listing.",
    marking: [
      { label: "Channel", value: "Axis Solution Partner — Supercore Industrial Systems Ltd" },
      { label: "People", value: "2 × Axis Certified Professional (in-house)" },
      { label: "Product", value: "Datasheet + ONVIF profile + IP/IK as listed" },
      { label: "Ex variants", value: "X-line / -XLE certificate set for that part number" },
    ],
    noteTitle: "Partner note",
    noteBody:
      "Certified Professional status belongs to individuals. If a specification requires a named CP on the project, say so on the RFQ and we assign one of the two on staff.",
    stepsEyebrow: "How we work a package",
    stepsTitle: "Three steps to a usable Axis quote",
    steps: [
      {
        step: "01",
        title: "Name the application",
        body: "Video, audio, access, intercom, radar, or classified area — plus mounting and lighting.",
      },
      {
        step: "02",
        title: "CP locks the SKU",
        body: "An Axis Certified Professional selects the part numbers and Axis OS baseline.",
      },
      {
        step: "03",
        title: "Request the pack",
        body: "We issue pricing, datasheets, and Ex files where the assembly is listed.",
      },
    ],
  },
  about: {
    metadataTitle: "Axis Solution Partner",
    metadataDescription:
      "Supercore is an Axis Solution Partner with two Axis Certified Professionals on the team.",
    eyebrow: "Partnership · Solution Partner",
    title: "Axis through certified people, not a distant web cart",
    body: "Supercore Industrial Systems Ltd is an Axis Solution Partner. Two Axis Certified Professionals work in-house. You specify network video, audio, access, and analytics with a local commercial path.",
    shots: [
      {
        seriesSlug: "cameras",
        caption: "Network cameras",
        alt: "Axis network camera",
      },
      {
        seriesSlug: "network-audio",
        caption: "Network audio",
        alt: "Axis network audio device",
      },
    ],
    splitEyebrow: "Two names on every package",
    splitTitle: "Lund builds the camera. Certified people here specify it.",
    manufacturerTitle: "Axis Communications",
    manufacturerBody:
      "Network video, audio, access control, and analytics. Open platform (ONVIF, Axis OS) used across industry, transport, and cities.",
    ourTitle: "Supercore Industrial Systems Ltd",
    ourBody:
      "Axis Solution Partner with two Certified Professionals on staff. We price the live catalogue, lock SKUs, and issue documentation — including explosion-protected X-line where the site drawing requires it.",
    pathEyebrow: "How a project moves",
    pathTitle: "From drawing to a usable order",
    path: [
      {
        step: "01",
        title: "Name the application",
        body: "Camera form factor, audio, access, intercom, radar, or Ex.",
      },
      {
        step: "02",
        title: "CP locks the SKU",
        body: "A Certified Professional matches Axis lines to the drawing.",
      },
      {
        step: "03",
        title: "Quote or checkout",
        body: "Trade accounts raise a quote. Checkout remains where terms allow.",
      },
      {
        step: "04",
        title: "Documentation",
        body: "Datasheet, cybersecurity notes, and Ex files when listed.",
      },
    ],
    lineEyebrow: "What we stock",
    lineTitle: "The Axis line we sell",
    lineBody:
      "Live catalogue across cameras, audio, access, intercom, radar, and accessories — priced from our territory.",
    marketsEyebrow: "Typical sites",
    markets: [
      "Oil & gas",
      "Industry",
      "Marine",
      "Transport",
      "Cities",
      "Critical infrastructure",
    ],
    deskEyebrow: "Why specify through us",
    deskTitle: "A Solution Partner desk with two CPs",
    desk: [
      {
        title: "Solution Partner",
        body: "Official Axis partner channel — design-in and supply through Supercore.",
      },
      {
        title: "Two Certified Professionals",
        body: "In-house Axis CPs for selection, Axis OS baseline, and submittals.",
      },
      {
        title: "Industrial literacy",
        body: "Hazardous-area X-line, radar, and audio alongside standard cameras.",
      },
    ],
  },
}
