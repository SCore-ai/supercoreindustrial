import {
  COMPANY_LINKS,
  CONNECTIVITY_SERVICES,
  ENGINEERING_SERVICES,
  ENTERPRISE_TECHNOLOGIES,
  INDUSTRIAL_TECHNOLOGIES,
  MARKETS_WE_SERVE,
  PARTNER_PRODUCT_CATEGORIES,
  SUPERCORE_PRODUCT_CATEGORIES,
  type NavLink,
} from "@lib/site-navigation"

import type { SitePage } from "./types"

const CDN = "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager"

function slugFromHref(href: string): string {
  return href.replace(/^\//, "")
}

function standardPage(
  href: string,
  title: string,
  description: string,
  eyebrow?: string
): SitePage {
  const slug = slugFromHref(href)

  return {
    slug,
    title,
    description,
    template: "standard",
    hero: {
      eyebrow,
      heading: title,
      subheading: description,
      image: `${CDN}/ins-homepage-header01.jpg?t=1770319796`,
      imageAlt: title,
    },
    sections: [
      {
        type: "intro",
        body: description,
      },
      {
        type: "cta",
        heading: "Ready for the next step?",
        body: "Connect with our experts to find the right solution for your wired and wireless networking needs.",
        primaryLabel: "Contact Us",
        primaryHref: "/contact-us",
        secondaryLabel: "Request Quote",
        secondaryHref: "/get-a-quote",
      },
    ],
  }
}

function pagesFromLinks(
  links: NavLink[],
  eyebrow: string,
  descriptionPrefix: string
): SitePage[] {
  return links
    .filter((link) => link.href.startsWith("/") && !link.href.includes("mailto:"))
    .map((link) =>
      standardPage(
        link.href,
        link.label,
        `${descriptionPrefix} ${link.label.toLowerCase()} solutions from Supercore Industrial Systems Ltd.`
      )
    )
    .map((page) => ({
      ...page,
      hero: page.hero
        ? { ...page.hero, eyebrow }
        : undefined,
    }))
}

const CATEGORY_IMAGES: Record<string, string> = {
  antennas:
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/j/cat-antennas-25__45590.original.png",
  "cabinetry-enclosures":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/l/cat-cabinetryenclosure-25__80148.original.png",
  "cable-entry-seals":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/u/cat-cableentryseal-25__63932.original.png",
  cabling:
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/p/cat-cabling-25__72006.original.png",
  "cabling-tools-testers":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/k/cat-cablingtools-25__89107.original.png",
  "cameras-video":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/s/cat-mobotixvideo-25__25370.original.png",
  "cellular-routers-gateways":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/c/cat-cellrouter-25__87479.original.png",
  connectors:
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/m/cat-connectors-25__17470.original.png",
  "ethernet-extenders":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/a/cat-ethernetextenders-25__91594.original.png",
  "ethernet-switches":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/y/cat-industrial-ethernet-switches-25__71162.original.png",
  "fieldbus-cards-modules":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/y/cat-fieldbusinterfacecard-25__39653.original.png",
  "iot-gateways-computers-monitors":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/o/cat-computers-monitors-25__63363.original.png",
  "industrial-i-o":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/y/cat-industrial-io-25__72811.original.png",
  "kvm-switches-extenders":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/t/cat-kvm-switches-extenders-25__16115.original.png",
  "media-converters":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/p/cat-media-converter-25__38890.original.png",
  "mounting-hardware":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/o/cat-mounting-hardware__20409.original.png",
  "network-management-software-appliances":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/d/cat-moxamanagement-25__08525.original.png",
  "network-security-routers":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/y/cat-industrial-security-appliances-25__81696.original.png",
  "patch-panels":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/i/cat-patchpanel-25__25010.original.png",
  "power-solutions":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/s/cat-powersupply-25__13334.original.png",
  "remote-access":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/h/cat-remoteaccess-25__73192.original.png",
  "serial-usb-connectivity":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/b/cat-serial-usb-connectivity-25__16261.original.png",
  "serial-device-servers-protocol-converters":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/p/cat-serial-device-servers-25__98602.original.png",
  "surge-lightning-protection":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/f/cat-surge-protection-25__58288.original.png",
  "wireless-radios":
    "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/300x300/x/cat-industrial-ethernet-radios-25__41382.original.png",
}

const CORE_PAGES: SitePage[] = [
  {
    slug: "about",
    title: "About Supercore",
    description:
      "Learn how Supercore powers digital transformation with rugged, reliable networking solutions, expert support, and enterprise-scale connectivity nationwide.",
    template: "about",
    hero: {
      eyebrow: "About Us",
      heading: "Delivering Innovative Networking Solutions for Industry",
      subheading:
        "Supercore Industrial Systems Ltd has been a leader in industrial networking since 1998.",
      image: `${CDN}/ins-company-photo-2025.png?t=1761764576`,
      imageAlt: "Supercore team at annual meeting",
    },
    sections: [
      {
        type: "intro",
        heading: "Our Company",
        body: "Supercore Industrial Systems Ltd has been a leader in industrial networking since 1998, delivering best-in-class products, technical expertise, and OT services for wired and wireless machine-networking environments. As the industry has evolved from Industrial Ethernet to M2M and now IoT, our focus has remained the same: providing reliable, high-quality networking solutions that customers can count on.",
      },
      {
        type: "values",
        heading: "Our Core Values",
        items: [
          {
            title: "Customer-Driven",
            description:
              "We exceed expectations, simplify processes, and put customer success at the center of everything we do.",
          },
          {
            title: "One Team, One Vision",
            description:
              "We collaborate with trust and accountability, recognizing that our combined strengths create greater success.",
          },
          {
            title: "Entrepreneurial Spirit",
            description:
              "We embrace innovation, solve problems with agility, and continuously push the boundaries of what's possible.",
          },
        ],
      },
      {
        type: "cards",
        heading: "Our Expertise",
        items: [
          {
            title: "Products",
            description:
              "Industry-leading hardware and software, rigorously selected for reliability, performance, and long-term compatibility.",
            href: "/all-products",
            ctaLabel: "Explore Products",
          },
          {
            title: "Services",
            description:
              "Full-range services from front-end engineering and installation to ongoing managed services and user training.",
            href: "/offerings",
            ctaLabel: "Explore Services",
          },
          {
            title: "Industry Solutions",
            description:
              "Specialized industrial networking expertise expanded into select enterprise sectors.",
            href: "/industries",
            ctaLabel: "Explore by Industry",
          },
        ],
      },
      {
        type: "cta",
        heading: "Interested in Joining Our Team?",
        body: "Explore our current openings in sales, engineering, operations, and support roles.",
        primaryLabel: "Browse Career Opportunities",
        primaryHref: "/careers",
      },
    ],
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    description:
      "Connect with Supercore for your networking needs. Our experts design, deploy, and support secure, scalable OT/IT solutions.",
    template: "contact",
    hero: {
      heading: "Contact Us",
      subheading: "Need to get in touch? Call us at (800) 889-1461 or send a message below.",
    },
    sections: [{ type: "contact-info" }],
  },
  {
    slug: "get-a-quote",
    title: "Request a Quote",
    description: "Request pricing and availability for industrial networking products and services.",
    template: "quote",
    hero: {
      eyebrow: "Request Quote",
      heading: "Get a Quote",
      subheading:
        "Tell us about your application and our team will respond with pricing, availability, and recommendations.",
    },
    sections: [{ type: "contact-info" }],
  },
  {
    slug: "partners-programs",
    title: "Partners & Programs",
    description:
      "Partner with Supercore to access expert support, innovative solutions, and top technology providers.",
    template: "partners",
    hero: {
      eyebrow: "Partner Programs",
      heading: "Empower Your Business",
      subheading:
        "Exclusive resources, expert support, and innovative solutions tailored for industrial environments.",
    },
    sections: [{ type: "partner-programs" }],
  },
  {
    slug: "support",
    title: "Help Desk CARE Support",
    description:
      "Get nationwide support for industrial networks. Supercore experts troubleshoot issues and optimize performance.",
    template: "standard",
    hero: {
      eyebrow: "Support",
      heading: "Help Desk CARE Support",
      subheading:
        "Connect, Assess, Resolve, Educate — expert technical support for product and network issues.",
      image: `${CDN}/istock-2085648010-cropped.jpg?t=1757865535`,
      imageAlt: "Supercore Help Desk Support",
    },
    sections: [
      {
        type: "cards",
        heading: "Support Options",
        items: [
          {
            title: "Help Desk CARE Ticketing",
            description:
              "Open a support ticket for product or network issues. Priority escalation available at 800-889-1461.",
            href: "/contact-us",
            ctaLabel: "Open Trouble Ticket",
          },
          {
            title: "Tips & Tricks Blog",
            description:
              "Real technical inquiries, how-to guides, and insights from our support team.",
            href: "/resources/tag/Blog",
            ctaLabel: "View Blog",
          },
          {
            title: "Supercore CARE Managed Services",
            description:
              "Managed services keep your cellular networks performing so your team stays focused on production.",
            href: "/ins-care",
            ctaLabel: "Explore Supercore CARE",
          },
        ],
      },
      {
        type: "cards",
        heading: "Featured Services",
        items: CONNECTIVITY_SERVICES.slice(0, 6).map((item) => ({
          title: item.label,
          description: `Learn more about ${item.label.toLowerCase()} from Supercore.`,
          href: item.href,
          ctaLabel: "Learn More",
        })),
      },
    ],
  },
  {
    slug: "offerings",
    title: "Supercore Service Offerings",
    description:
      "Tailored OT and IIoT network solutions from design and deployment to ongoing support.",
    template: "standard",
    hero: {
      eyebrow: "Supercore Service Offerings",
      heading: "Tailored Solutions for Your Industry's Unique Challenges",
      subheading:
        "Supercore's OT Services Group specializes in designing, deploying, and supporting critical Operational Technology networks.",
    },
    sections: [
      {
        type: "cards",
        heading: "Engineering Services",
        items: ENGINEERING_SERVICES.map((item) => ({
          title: item.label,
          description: `Expert ${item.label.toLowerCase()} from Supercore engineering teams.`,
          href: item.href,
          ctaLabel: "Learn More",
        })),
      },
      {
        type: "cards",
        heading: "Connectivity & Managed Services",
        items: CONNECTIVITY_SERVICES.map((item) => ({
          title: item.label,
          description: `Expert ${item.label.toLowerCase()} from Supercore.`,
          href: item.href,
          ctaLabel: "Learn More",
        })),
      },
      {
        type: "cta",
        heading: "Ready for the Next Step?",
        body: "Whether optimizing infrastructure, enhancing cybersecurity, or deploying private cellular networks, our team delivers the expertise you need.",
        primaryLabel: "Contact Us",
        primaryHref: "/contact-us",
      },
    ],
  },
  {
    slug: "industries",
    title: "Markets We Serve",
    description: "Markets and sectors served by Supercore industrial communication and systems solutions.",
    template: "standard",
    hero: {
      eyebrow: "Markets We Serve",
      heading: "Solutions Built for Your Market",
      subheading:
        "Supercore delivers tailored systems and connectivity for energy, marine, industrial, and healthcare sectors.",
    },
    sections: [
      {
        type: "cards",
        items: MARKETS_WE_SERVE.slice(1).map((item) => ({
          title: item.label,
          description: `Networking solutions for ${item.label.toLowerCase()}.`,
          href: item.href,
          ctaLabel: "Learn More",
        })),
      },
    ],
  },
  {
    slug: "services",
    title: "Services",
    description: "End-to-end industrial networking services from Supercore.",
    template: "standard",
    hero: {
      heading: "Industrial Networking Services",
      subheading: "Design, deploy, and support critical OT and enterprise networks nationwide.",
    },
    sections: [
      {
        type: "cards",
        heading: "Engineering Services",
        items: ENGINEERING_SERVICES.map((item) => ({
          title: item.label,
          description: `Explore ${item.label.toLowerCase()}.`,
          href: item.href,
          ctaLabel: "Learn More",
        })),
      },
      {
        type: "cards",
        heading: "Connectivity & Managed Services",
        items: CONNECTIVITY_SERVICES.map((item) => ({
          title: item.label,
          description: `Explore ${item.label.toLowerCase()}.`,
          href: item.href,
          ctaLabel: "Learn More",
        })),
      },
      {
        type: "cards",
        heading: "Markets We Serve",
        items: MARKETS_WE_SERVE.slice(1).map((item) => ({
          title: item.label,
          description: `Explore ${item.label.toLowerCase()}.`,
          href: item.href,
          ctaLabel: "Learn More",
        })),
      },
    ],
  },
  {
    slug: "technologies",
    title: "Technologies",
    description: "Industrial and enterprise networking technologies from Supercore.",
    template: "standard",
    hero: {
      heading: "Our Services and Technologies",
      subheading: "Wired, wireless, cellular, and edge technologies for mission-critical operations.",
    },
    sections: [
      {
        type: "cards",
        heading: "Industrial Technologies",
        items: INDUSTRIAL_TECHNOLOGIES.map((item) => ({
          title: item.label,
          description: `Learn about ${item.label.toLowerCase()}.`,
          href: item.href,
          ctaLabel: "Learn More",
        })),
      },
      {
        type: "cards",
        heading: "Enterprise Technologies",
        items: ENTERPRISE_TECHNOLOGIES.map((item) => ({
          title: item.label,
          description: `Learn about ${item.label.toLowerCase()}.`,
          href: item.href,
          ctaLabel: "Learn More",
        })),
      },
    ],
  },
  {
    slug: "all-products",
    title: "All Products",
    description:
      "Supercore supplies leading wired and wireless Industrial and Enterprise IoT networking products for mission-critical operations.",
    template: "catalog",
    hero: {
      heading: "All Products",
      subheading:
        "Supercore Industrial Systems Ltd supplies leading wired and wireless Industrial and Enterprise IoT networking products.",
    },
    sections: [
      {
        type: "category-grid",
        items: [
          ...SUPERCORE_PRODUCT_CATEGORIES.slice(1).map((cat) => ({
            title: cat.label,
            href: cat.href,
          })),
          ...PARTNER_PRODUCT_CATEGORIES.slice(1).map((cat) => {
          const key = cat.href.split("/").pop() || ""
          const imageKey = key === "mounting-hardware" ? "mounting-hardware" : key

          return {
            title: cat.label,
            href: cat.href,
            image: CATEGORY_IMAGES[imageKey],
          }
        }),
        ],
      },
      {
        type: "cta",
        heading: "Can't Locate the Product You Need?",
        body: "Our team can help source exactly what you need. Contact us and we'll deliver the right solution.",
        primaryLabel: "Contact Us",
        primaryHref: "/contact-us",
        secondaryLabel: "Get a Quote",
        secondaryHref: "/get-a-quote",
      },
    ],
  },
  {
    slug: "careers",
    title: "Careers",
    description: "Join the Supercore team in sales, engineering, operations, and support.",
    template: "standard",
    hero: {
      eyebrow: "Careers",
      heading: "Join Our Team",
      subheading: "Build your career in industrial networking with Supercore.",
    },
    sections: [
      {
        type: "intro",
        body: "We're always looking for talented people to join our team. Explore current openings in sales, engineering, operations, and support roles across the United States.",
      },
      {
        type: "cta",
        heading: "Ready to apply?",
        primaryLabel: "Contact Us",
        primaryHref: "/contact-us",
      },
    ],
  },
  {
    slug: "news",
    title: "News",
    description: "Latest news and announcements from Supercore Industrial Systems Ltd.",
    template: "standard",
    hero: { heading: "Company News", subheading: "Awards, partnerships, and industry updates from Supercore." },
    sections: [
      {
        type: "cards",
        items: [
          {
            title: "Supercore Named Semtech 2025 Partner of the Year",
            description: "Deal Registration Champion — May 2026",
            href: "/resources/tag/News",
            ctaLabel: "Read More",
          },
          {
            title: "Supercore Named Digi 2025 North American Partner of the Year",
            description: "April 2026",
            href: "/resources/tag/News",
            ctaLabel: "Read More",
          },
          {
            title: "Supercore Named Platinum Partner in Celona Frequency Partner Program",
            description: "December 2025",
            href: "/resources/tag/News",
            ctaLabel: "Read More",
          },
        ],
      },
    ],
  },
  {
    slug: "case-studies",
    title: "Case Studies",
    description: "Real-world results from Supercore Industrial Systems Ltd networking deployments.",
    template: "standard",
    hero: {
      heading: "Case Studies",
      subheading: "Proven results and real-world impact from Supercore customer deployments.",
    },
    sections: [
      {
        type: "cards",
        items: [
          {
            title: "Rodents, Remote Land, and the Case for Going Cellular",
            description: "Utility-scale solar cellular connectivity — July 2026",
            href: "/resources/tag/Case+Studies",
            ctaLabel: "Read More",
          },
          {
            title: "Food Manufacturing Facility Scales from Startup to Industry Leader",
            description: "Hirschmann industrial networking deployment — June 2026",
            href: "/resources/tag/Case+Studies",
            ctaLabel: "Read More",
          },
          {
            title: "Smart Safe Connectivity Across 12,000+ Deployments",
            description: "Semtech / Verizon cellular connectivity — June 2026",
            href: "/resources/tag/Case+Studies",
            ctaLabel: "Read More",
          },
        ],
      },
    ],
  },
  {
    slug: "sitemap",
    title: "Sitemap",
    description: "Complete sitemap for Supercore Industrial Systems Ltd.",
    template: "standard",
    hero: { heading: "Sitemap" },
    sections: [
      {
        type: "cards",
        heading: "Pages",
        items: [
          { title: "About", description: "", href: "/about", ctaLabel: "Visit" },
          { title: "Services", description: "", href: "/services", ctaLabel: "Visit" },
          { title: "Technologies", description: "", href: "/technologies", ctaLabel: "Visit" },
          { title: "All Products", description: "", href: "/all-products", ctaLabel: "Visit" },
          { title: "Contact", description: "", href: "/contact-us", ctaLabel: "Visit" },
        ],
      },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "Privacy policy for Supercore Industrial Systems Ltd.",
    template: "standard",
    hero: { heading: "Privacy Policy" },
    sections: [
      {
        type: "intro",
        body: "Supercore Industrial Systems Ltd respects your privacy. This policy describes how we collect, use, and protect personal information submitted through our website and services.",
      },
    ],
  },
  {
    slug: "resources/tag/Blog",
    title: "Tips & Tricks Blog",
    description: "Insights, how-to guides, and best practices for industrial IoT and networking.",
    template: "standard",
    hero: {
      heading: "Tips & Tricks Blog",
      subheading: "Real technical inquiries and practical insights from the Supercore team.",
    },
    sections: [
      {
        type: "cards",
        items: [
          {
            title: "Private 5G vs Wi-Fi: Which Technology Is Right for Your Business?",
            description: "December 2025",
            href: "/resources/tag/Blog",
            ctaLabel: "Read More",
          },
          {
            title: "Industrial Networking Isn't Just IT With Hard Hats",
            description: "December 2025",
            href: "/resources/tag/Blog",
            ctaLabel: "Read More",
          },
          {
            title: "The Most Overlooked Part of Networking Is the One Everything Depends On",
            description: "December 2025",
            href: "/resources/tag/Blog",
            ctaLabel: "Read More",
          },
        ],
      },
    ],
  },
  {
    slug: "resources/tag/News",
    title: "News",
    description: "Company news from Supercore Industrial Systems Ltd.",
    template: "standard",
    hero: { heading: "News" },
    sections: [
      {
        type: "cards",
        items: [
          {
            title: "Supercore Named Semtech 2025 Partner of the Year",
            description: "May 2026",
            href: "/news",
            ctaLabel: "Read More",
          },
        ],
      },
    ],
  },
  {
    slug: "resources/tag/Case+Studies",
    title: "Case Studies",
    description: "Customer success stories from Supercore.",
    template: "standard",
    hero: { heading: "Case Studies" },
    sections: [
      {
        type: "cards",
        items: [
          {
            title: "View all case studies",
            description: "Real-world deployment results from Supercore customers.",
            href: "/case-studies",
            ctaLabel: "Browse",
          },
        ],
      },
    ],
  },
  {
    slug: "resources/tag/Insights",
    title: "Insights",
    description: "Insights and best practices from Supercore.",
    template: "standard",
    hero: { heading: "Insights" },
    sections: [
      {
        type: "cards",
        items: [
          {
            title: "Browse Blog",
            description: "Tips, tricks, and technical insights.",
            href: "/resources/tag/Blog",
            ctaLabel: "View Blog",
          },
        ],
      },
    ],
  },
  {
    slug: "ins-care",
    title: "Supercore CARE Managed Services",
    description: "Managed services for cellular network performance and reliability.",
    template: "standard",
    hero: {
      eyebrow: "Supercore CARE",
      heading: "Managed Services That Keep You Connected",
      subheading: "Proactive monitoring and management of cellular devices with break/fix support.",
    },
    sections: [
      {
        type: "intro",
        body: "Our managed services program keeps your cellular networks performing so your people can stay focused on production, safety, and results.",
      },
      {
        type: "cta",
        heading: "Learn more About Supercore CARE",
        primaryLabel: "Contact Us",
        primaryHref: "/contact-us",
      },
    ],
  },
  {
    slug: "mounting-hardware",
    title: "Mounting Hardware",
    description: "Industrial mounting hardware for network equipment installations.",
    template: "catalog",
    hero: { heading: "Mounting Hardware" },
    sections: [
      {
        type: "intro",
        body: "Browse mounting hardware for industrial network equipment. Contact Supercore for availability and pricing.",
      },
      {
        type: "cta",
        heading: "Need help selecting hardware?",
        primaryLabel: "Contact Us",
        primaryHref: "/contact-us",
        secondaryLabel: "Browse All Products",
        secondaryHref: "/all-products",
      },
    ],
  },
]

const GENERATED_PAGES: SitePage[] = [
  ...pagesFromLinks(ENGINEERING_SERVICES, "Engineering", "Expert engineering"),
  ...pagesFromLinks(CONNECTIVITY_SERVICES, "Services", "Expert"),
  ...pagesFromLinks(MARKETS_WE_SERVE.slice(1), "Markets", "Market-specific"),
  ...pagesFromLinks(INDUSTRIAL_TECHNOLOGIES.slice(1), "Technologies", "Industrial"),
  ...pagesFromLinks(ENTERPRISE_TECHNOLOGIES.slice(1), "Technologies", "Enterprise"),
  ...pagesFromLinks(
    PARTNER_PRODUCT_CATEGORIES.slice(1),
    "Products",
    "Shop"
  ).map((page) => ({
    ...page,
    template: "catalog" as const,
    sections: [
      {
        type: "intro" as const,
        body: page.description,
      },
      {
        type: "cta" as const,
        heading: "Browse products in this category",
        primaryLabel: "Shop Catalog",
        primaryHref: "/store",
        secondaryLabel: "Request Quote",
        secondaryHref: "/get-a-quote",
      },
    ],
  })),
  ...pagesFromLinks(
    COMPANY_LINKS.filter(
      (link) =>
        !["about", "news", "careers", "partners-programs", "case-studies"].includes(
          slugFromHref(link.href)
        )
    ),
    "Company",
    "Learn about"
  ),
  standardPage(
    "/technologies/industrial",
    "Industrial Technologies",
    "Industrial networking technologies for factories, plants, and critical infrastructure.",
    "Technologies"
  ),
  standardPage(
    "/technologies/enterprise",
    "Enterprise Technologies",
    "Enterprise networking technologies for branch offices, retail, and distributed operations.",
    "Technologies"
  ),
]

export const SITE_PAGES: SitePage[] = [...GENERATED_PAGES, ...CORE_PAGES]

export const SITE_PAGES_BY_SLUG = new Map(
  SITE_PAGES.map((page) => [page.slug, page])
)

export function getPageBySlug(slugParts: string[]): SitePage | null {
  const slug = slugParts.join("/")
  return SITE_PAGES_BY_SLUG.get(slug) ?? null
}

export function getAllPageSlugs(): string[] {
  return SITE_PAGES.map((page) => page.slug)
}
