export type NavLink = {
  label: string
  href: string
  description?: string
}

export type NavColumn = {
  title: string
  href?: string
  items: NavLink[]
}

export type NavMenu = {
  label: string
  href?: string
  columns?: NavColumn[]
  featured?: NavLink[]
}

/** Supercore-native catalogue — Medusa category routes */
export const SUPERCORE_PRODUCT_CATEGORIES: NavLink[] = [
  { label: "Shop All Products", href: "/store" },
  { label: "CCTV Systems", href: "/categories/cctv-systems" },
  { label: "PAGA Systems", href: "/categories/paga-systems" },
  { label: "Intercom Systems", href: "/categories/intercom-systems" },
  { label: "Public Address Systems", href: "/categories/public-address-systems" },
  { label: "Solution Platforms", href: "/categories/solution-platforms" },
  {
    label: "Explosion-Protected Devices",
    href: "/categories/explosion-protected-devices",
  },
  { label: "Network audio", href: "/categories/network-audio" },
  { label: "Access control", href: "/categories/access-control" },
  { label: "Radar", href: "/categories/radar" },
  { label: "Video analytics", href: "/categories/video-analytics" },
  { label: "Hazardous Area", href: "/categories/hazardous-area" },
  { label: "Safe Area", href: "/categories/safe-area" },
  { label: "Cables", href: "/categories/cables" },
]

/** Partner / extended connectivity catalogue — marketing routes */
export const PARTNER_PRODUCT_CATEGORIES: NavLink[] = [
  { label: "All Partner Products", href: "/all-products" },
  { label: "Antennas", href: "/all-products/antennas" },
  { label: "Cabinetry & Enclosures", href: "/all-products/cabinetry-enclosures" },
  { label: "Cable Entry Seals", href: "/all-products/cable-entry-seals" },
  { label: "Cabling", href: "/all-products/cabling" },
  { label: "Cabling Tools & Testers", href: "/all-products/cabling-tools-testers" },
  { label: "Cameras & Video", href: "/all-products/cameras-video" },
  { label: "Cellular Routers & Gateways", href: "/all-products/cellular-routers-gateways" },
  { label: "Connectors", href: "/all-products/connectors" },
  { label: "Ethernet Extenders", href: "/all-products/ethernet-extenders" },
  { label: "Ethernet Switches", href: "/all-products/ethernet-switches" },
  { label: "Fieldbus Cards & Modules", href: "/all-products/fieldbus-cards-modules" },
  { label: "IoT Gateways, Computers & Monitors", href: "/all-products/iot-gateways-computers-monitors" },
  { label: "Industrial I/O", href: "/all-products/industrial-i-o" },
  { label: "KVM Switches & Extenders", href: "/all-products/kvm-switches-extenders" },
  { label: "Media Converters", href: "/all-products/media-converters" },
  { label: "Mounting Hardware", href: "/mounting-hardware" },
  { label: "Network Management", href: "/all-products/network-management-software-appliances" },
  { label: "Network Security & Routers", href: "/all-products/network-security-routers" },
  { label: "Patch Panels", href: "/all-products/patch-panels" },
  { label: "Power Solutions", href: "/all-products/power-solutions" },
  { label: "Remote Access", href: "/all-products/remote-access" },
  { label: "Serial & USB Connectivity", href: "/all-products/serial-usb-connectivity" },
  {
    label: "Serial Device Servers & Protocol Converters",
    href: "/all-products/serial-device-servers-protocol-converters",
  },
  { label: "Surge & Lightning Protection", href: "/all-products/surge-lightning-protection" },
  { label: "Wireless Radios", href: "/all-products/wireless-radios" },
]

/** Combined list for footer and legacy references */
export const PRODUCT_CATEGORIES: NavLink[] = [
  ...SUPERCORE_PRODUCT_CATEGORIES,
  ...PARTNER_PRODUCT_CATEGORIES.slice(1),
]

/** Live catalogue brands only — Spectrum first (regional distributor). */
export const PRODUCT_BRANDS: NavLink[] = [
  { label: "Spectrum", href: "/brands/spectrum" },
  { label: "Axis", href: "/brands/axis" },
  { label: "Zenitel", href: "/brands/zenitel" },
  { label: "View All Brands", href: "/brands" },
]

/** Engineering & project services — from Supercore Categories doc */
export const ENGINEERING_SERVICES: NavLink[] = [
  { label: "Industrial Communication", href: "/engineering/industrial-communication" },
  {
    label: "Information and Security Systems",
    href: "/engineering/information-security-systems",
  },
  { label: "Fire & Gas", href: "/engineering/fire-gas" },
  { label: "Trace Heating", href: "/engineering/trace-heating" },
  {
    label: "Design Scopes / Modifications",
    href: "/engineering/design-scopes-modifications",
  },
  {
    label: "Electrical / Construction Scopes",
    href: "/engineering/electrical-construction-scopes",
  },
  {
    label: "Ex Equipment Inspection & Maintenance",
    href: "/engineering/ex-equipment-inspection-maintenance",
  },
  { label: "System Integration", href: "/engineering/system-integration" },
  { label: "Lighting Maintenance", href: "/engineering/lighting-maintenance" },
  { label: "Navigational Lighting", href: "/engineering/navigational-lighting" },
  { label: "Global Supply", href: "/engineering/global-supply" },
]

/** Extended connectivity & managed services */
export const CONNECTIVITY_SERVICES: NavLink[] = [
  {
    label: "Industrial Network Design & Architecture Services",
    href: "/industrial-network-design-architecture-services",
  },
  {
    label: "OT Network Configuration & Installation Services",
    href: "/ot-network-configuration-installation-services",
  },
  {
    label: "OT Network Commissioning & Validation Services",
    href: "/ot-network-commissioning-validation-services",
  },
  {
    label: "Industrial Network Post-Project Support & Maintenance",
    href: "/industrial-network-post-project-support-maintenance",
  },
  {
    label: "Industrial Network Training & Certification",
    href: "/industrial-network-training-certification",
  },
  { label: "Fixed Wireless Site Surveys", href: "/fixed-wireless-site-surveys" },
  {
    label: "Fixed Wireless Installation & Startup",
    href: "/fixed-wireless-installation-and-startup",
  },
  {
    label: "Fleet Wireless Connectivity Assessment Services",
    href: "/fleet-wireless-connectivity-assessment-services",
  },
  {
    label: "Fleet Wireless Installation & Startup",
    href: "/fleet-wireless-installation-startup",
  },
  { label: "Provisioning & Kitting Services", href: "/provisioning-kitting-services" },
  { label: "Managed Services", href: "/managed-services" },
  { label: "Custom Managed Network Services", href: "/custom-managed-network-services" },
  {
    label: "Network Device Lifecycle Management Services",
    href: "/network-device-lifecycle-management-services",
  },
]

export const SERVICE_OFFERINGS: NavLink[] = [
  { label: "Supercore Service Offerings", href: "/offerings" },
  ...ENGINEERING_SERVICES,
  ...CONNECTIVITY_SERVICES,
]

/** Markets we serve — Services mega menu column C */
export const MARKETS_WE_SERVE: NavLink[] = [
  { label: "Markets We Serve", href: "/industries" },
  { label: "Upstream Oil & Gas", href: "/upstream-oil-gas" },
  { label: "Midstream Oil & Gas", href: "/midstream-oil-gas" },
  { label: "Refining & Petrochemical", href: "/refining-petrochemical" },
  { label: "Subsea", href: "/subsea" },
  { label: "Renewables", href: "/renewables" },
  { label: "Ports & Marine Operations", href: "/ports-marine-operations" },
  { label: "Power Generation", href: "/power-generation" },
  { label: "ITS & Transportation", href: "/its-transportation" },
  { label: "Industrial", href: "/industrial" },
  { label: "Healthcare", href: "/healthcare" },
]

/** @deprecated Use MARKETS_WE_SERVE */
export const INDUSTRY_OFFERINGS = MARKETS_WE_SERVE

export const INDUSTRIAL_TECHNOLOGIES: NavLink[] = [
  { label: "Industrial Technologies", href: "/technologies/industrial" },
  { label: "Industrial Cybersecurity", href: "/technologies/industrial-cybersecurity" },
  { label: "Industrial IP Video", href: "/industrial-ip-video" },
  {
    label: "Data Integration and Visualization",
    href: "/data-integration-and-visualization",
  },
  { label: "Industrial Ethernet", href: "/industrial-ethernet" },
  { label: "Private Cellular Networks", href: "/technologies/private-cellular-networking" },
  {
    label: "IP Keyboard, Video and Monitor Extension",
    href: "/ip-keyboard-video-and-monitor-extension",
  },
  {
    label: "Cable, Connectivity and Hardware",
    href: "/cable-connectivity-and-hardware",
  },
  { label: "Public Cellular Networking", href: "/public-cellular-networking" },
  { label: "Wi-Fi Networking", href: "/wifi-networking" },
  { label: "Point-to-Point Networking", href: "/point-to-point-networking" },
  { label: "Edge Computing", href: "/edge-computing" },
  { label: "Satellite Broadband", href: "/satellite" },
]

export const ENTERPRISE_TECHNOLOGIES: NavLink[] = [
  { label: "Enterprise Technologies", href: "/technologies/enterprise" },
  { label: "Digital Signage", href: "/digital-signage" },
  { label: "POTS Line Replacement", href: "/pots-line-replacement-services" },
  { label: "Pop-Up Networking", href: "/pop-up-networking" },
  {
    label: "Enterprise Public Cellular Networking",
    href: "/enterprise-public-cellular-networking",
  },
  {
    label: "Communication & Legacy Conversion Solutions",
    href: "/communication-legacy-conversion-solutions",
  },
  { label: "Wired Networking Technologies", href: "/wired-networking-technologies" },
]

/** Company pages — from Supercore Categories doc */
export const COMPANY_LINKS: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Our History", href: "/our-history" },
  { label: "Meet The Team", href: "/meet-the-team" },
  { label: "Manufacturing Partners", href: "/manufacturing-partners" },
  { label: "QHSE", href: "/qhse" },
  { label: "Our Core Values", href: "/our-core-values" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Net Zero", href: "/net-zero" },
  { label: "News", href: "/news" },
  { label: "Partners & Programs", href: "/partners-programs" },
  { label: "Careers", href: "/careers" },
  { label: "Case Studies", href: "/case-studies" },
]

export const SUPPORT_LINKS: NavLink[] = [
  { label: "Support", href: "/support" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Request Quote", href: "/get-a-quote" },
  { label: "Quote cart", href: "/quote" },
  { label: "Quick Order Terminal", href: "/quick-order" },
  { label: "Request a Bulk Quote (RFQ)", href: "/quote" },
  { label: "Quote cart", href: "/quote/cart" },
  { label: "Customer Service", href: "/support" },
  { label: "Tips & Tricks Blog", href: "/resources/tag/Blog" },
]

export const FOOTER_COMPANY: NavLink[] = COMPANY_LINKS

export const FOOTER_QUICK_LINKS: NavLink[] = [
  { label: "Contact", href: "/contact-us" },
  { label: "Spectrum Camera", href: "/brands/spectrum" },
  { label: "Zenitel", href: "/brands/zenitel" },
  { label: "Axis", href: "/brands/axis" },
  { label: "Explore Catalog", href: "/store" },
  { label: "Account", href: "/account" },
  { label: "Quote cart", href: "/quote" },
  { label: "Quick Order Terminal", href: "/quick-order" },
  { label: "Request a Bulk Quote (RFQ)", href: "/quote" },
  { label: "Quote cart", href: "/quote/cart" },
  { label: "Tips & Tricks Blog", href: "/resources/tag/Blog" },
  { label: "Customer Service", href: "/support" },
]

// Desktop Products mega menu is built from Medusa categories in lib/mega-menu/catalog-nav.ts.
// Remaining top-level items below — do not add a hardcoded Products entry here.
export const MAIN_NAV: NavMenu[] = [
  {
    label: "Services",
    href: "/services",
    columns: [
      {
        title: "Engineering Services",
        href: "/offerings",
        items: ENGINEERING_SERVICES,
      },
      {
        title: "Connectivity & Managed Services",
        href: "/managed-services",
        items: CONNECTIVITY_SERVICES,
      },
      {
        title: "Markets We Serve",
        href: "/industries",
        items: MARKETS_WE_SERVE.slice(1),
      },
    ],
  },
  {
    label: "Technologies",
    href: "/technologies",
    columns: [
      { title: "Industrial", href: "/technologies/industrial", items: INDUSTRIAL_TECHNOLOGIES.slice(1) },
      {
        title: "Enterprise",
        href: "/technologies/enterprise",
        items: ENTERPRISE_TECHNOLOGIES.slice(1),
      },
    ],
  },
  {
    label: "Company",
    href: "/about",
    columns: [
      {
        title: "About Us",
        href: "/about",
        items: COMPANY_LINKS.slice(0, 6),
      },
      {
        title: "Impact & Stories",
        href: "/success-stories",
        items: COMPANY_LINKS.slice(6, 9),
      },
      {
        title: "News & Careers",
        href: "/news",
        items: COMPANY_LINKS.slice(9),
      },
    ],
  },
  {
    label: "Support",
    href: "/support",
    columns: [{ title: "Support", items: SUPPORT_LINKS }],
  },
]

export const CONTACT_MENU: NavLink[] = [
  { label: "Contact Us", href: "/contact-us" },
  { label: "Request Quote", href: "/get-a-quote" },
  { label: "Quote cart", href: "/quote" },
  { label: "Support", href: "/support" },
  { label: "Email Sales", href: "mailto:sales@supercore.local" },
]
