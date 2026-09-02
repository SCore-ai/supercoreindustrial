export type HeroSlide = {
  id: string
  tag: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  image: string
  imageAlt: string
  tabLabel: string
}

export type QuickLink = {
  label: string
  href: string
  icon: "catalog" | "contact" | "industries" | "quote" | "about" | "support"
}

export type ServiceCard = {
  title: string
  description: string
  ctaLabel: string
  href: string
}

export type ResourceCard = {
  tag: string
  title: string
  date: string
  href: string
  image: string
  imageAlt: string
}

export type FeaturedCategoryTile = {
  handle: string
  title: string
  image: string
  imageAlt: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "services",
    tag: "Service Offerings",
    title: "Real-World Industrial & Enterprise Services",
    description:
      "From system design and integration to ongoing support, Supercore delivers end-to-end services that simplify complex sites and keep critical operations online.",
    ctaLabel: "Explore Services",
    ctaHref: "/offerings",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/ins-homepage-header01.jpg?t=1770319796",
    imageAlt: "Engineers reviewing industrial systems plans",
    tabLabel: "Real-World Industrial & Enterprise Services",
  },
  {
    id: "equipment",
    tag: "Connectivity Equipment",
    title: "Critical Hardware for Every Network",
    description:
      "Explore CCTV, PAGA, intercom, explosion-protected devices, and industrial networking hardware engineered for hazardous and remote environments.",
    ctaLabel: "Shop Products",
    ctaHref: "/all-products",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/02-istock-1450443859-3.jpg?t=1759161556",
    imageAlt: "Industrial facility with connectivity hardware",
    tabLabel: "Critical Hardware for Every Network",
  },
  {
    id: "contact",
    tag: "Contact Supercore",
    title: "Your Partner for Seamless Connectivity",
    description:
      "We combine deep technical experience with a collaborative approach to help enterprises deploy, manage, and scale industrial communication systems.",
    ctaLabel: "Work With Supercore",
    ctaHref: "/contact-us",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/ins-homepage-header03.jpg?t=1770319829",
    imageAlt: "Industrial team collaborating on a connectivity project",
    tabLabel: "Your Partner for Seamless Connectivity",
  },
]

export const QUICK_LINKS: QuickLink[] = [
  { label: "Explore Catalog", href: "/store", icon: "catalog" },
  { label: "Contact Us", href: "/contact-us", icon: "contact" },
  { label: "Markets We Serve", href: "/industries", icon: "industries" },
  { label: "Request Quote", href: "/get-a-quote", icon: "quote" },
  { label: "About Supercore", href: "/about", icon: "about" },
  { label: "Support", href: "/support", icon: "support" },
]

/** Original Supercore product/service families */
export const CORE_SERVICE_CARDS: ServiceCard[] = [
  {
    title: "CCTV & Video Systems",
    description:
      "Keep operations visible across platforms, vessels, and hazardous zones with rugged cameras, analytics, and recording infrastructure.",
    ctaLabel: "Explore CCTV",
    href: "/categories/cctv-systems",
  },
  {
    title: "PAGA & Public Address",
    description:
      "Deploy zone-based paging and alarm systems designed for noisy industrial environments, marine decks, and remote sites.",
    ctaLabel: "Explore PAGA",
    href: "/categories/paga-systems",
  },
  {
    title: "Intercom & Access",
    description:
      "Connect control rooms, gates, and field teams with explosion-protected intercom, access control, and edge communication hardware.",
    ctaLabel: "Explore Intercom",
    href: "/categories/intercom-systems",
  },
  {
    title: "Hazardous Area Equipment",
    description:
      "Specify certified EX devices, cabling, and enclosures built for oil & gas, renewables, subsea, and marine applications.",
    ctaLabel: "Explore Hazardous Area",
    href: "/categories/hazardous-area",
  },
]

/** Extended connectivity technologies (INS-style partner catalogue) */
export const CONNECTIVITY_TECHNOLOGY_CARDS: ServiceCard[] = [
  {
    title: "Industrial Networking",
    description:
      "Keep your operations connected across factories, plants, and industrial sites with high performance wired and wireless networks.",
    ctaLabel: "Explore Industrial Networking",
    href: "/industrial-network-design-architecture-services",
  },
  {
    title: "Private Cellular",
    description:
      "Deploy secure, dedicated LTE/5G networks for your sites and teams without relying on public infrastructure.",
    ctaLabel: "Learn About Private Cellular",
    href: "/technologies/private-cellular-networking",
  },
  {
    title: "Public Cellular",
    description:
      "Connect branch offices, remote teams, and mobile operations with enterprise grade LTE/5G WAN that's fast to deploy and reliable.",
    ctaLabel: "Learn About Public Cellular",
    href: "/public-cellular-networking",
  },
  {
    title: "Managed Services",
    description:
      "Simplify operations with end-to-end support, monitoring, and lifecycle management for your networks and devices.",
    ctaLabel: "See Managed Services",
    href: "/managed-services",
  },
]

export const FEATURED_CATEGORY_TILES: FeaturedCategoryTile[] = [
  {
    handle: "ethernet-switches",
    title: "Ethernet Switches",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/hp-industrial-switches.png?t=1743435056",
    imageAlt: "Industrial Ethernet switches",
  },
  {
    handle: "cellular-routers-gateways",
    title: "Cellular Gateways",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/hp-cellular-router.png?t=1743435822",
    imageAlt: "Cellular IoT routers and gateways",
  },
  {
    handle: "network-security-routers",
    title: "Security Appliances",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/hp-industrial-security-appliance.png?t=1743436021",
    imageAlt: "Industrial security appliances",
  },
  {
    handle: "cabling",
    title: "Cabling & Connectivity",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/hp-industrial-cabling.png?t=1743436463",
    imageAlt: "Industrial cables and connectivity",
  },
]

export const RESOURCE_CARDS: ResourceCard[] = [
  {
    tag: "Insight",
    title: "Designing CCTV for Hazardous and Offshore Environments",
    date: "December 2025",
    href: "/resources/tag/Blog",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/istock-869376164-homepage.jpg?t=1770318057",
    imageAlt: "Offshore platform connectivity",
  },
  {
    tag: "Insight",
    title: "Private 5G vs Wi-Fi: Which Technology Is Right for Your Site?",
    date: "December 2025",
    href: "/resources/tag/Blog",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/istock-2225223849-homepage.jpg?t=1770318068",
    imageAlt: "Industrial plant networking",
  },
  {
    tag: "Insight",
    title: "The Most Overlooked Part of Site Comms Is the Cable Plant",
    date: "December 2025",
    href: "/resources/tag/Blog",
    image:
      "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/blog-three.jpg?t=1770321486",
    imageAlt: "Industrial cabling infrastructure",
  },
]

export const ABOUT_COPY =
  "Supercore Industrial Systems Ltd delivers advanced CCTV, PAGA, intercom, networking, and hazardous-area communication technologies that keep operations connected, secure, and operational. With experience across oil & gas, renewables, marine, and remote industrial sites, we combine engineering expertise with practical deployment support."

export const ABOUT_IMAGE =
  "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/istock-1211420945.jpg?t=1770302810"
