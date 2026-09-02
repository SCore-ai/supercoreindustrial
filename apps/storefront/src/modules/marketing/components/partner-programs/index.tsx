import LocalizedClientLink from "@modules/common/components/localized-client-link"

const PARTNER_PROGRAMS = [
  {
    id: "spectrum",
    title: "Spectrum Camera",
    description:
      "Authorized regional distributor for explosion-proof cameras, junction boxes, and hazardous-area accessories (Class I Div 1/2, Zone 1/2).",
    ctaLabel: "Shop Spectrum",
    ctaHref: "/brands/spectrum",
    details: [
      "D-Series dome/PTZ and F-Series fixed explosion-proof cameras",
      "316L TEZP & FEZB for offshore and marine sites",
      "Certified junction boxes, mounts, and industrial network accessories",
    ],
  },
  {
    id: "zenitel",
    title: "Zenitel",
    description:
      "Regional Safety & Security distributor for Azerbaijan, Turkmenistan and Uzbekistan, and Worldwide Distributor for Zenitel Maritime & Energy — intercom, PAGA, and marine communication.",
    ctaLabel: "Shop Zenitel",
    ctaHref: "/brands/zenitel",
    details: [
      "Safety & Security: Turbine / IC-EDGE intercom for Azerbaijan, Turkmenistan and Uzbekistan",
      "Maritime & Energy worldwide: PAGA, batteryless talkback, ICS 6200, marine CCTV",
      "ICX-AlphaCom and Connect platforms quoted as a system with the stations they serve",
    ],
  },
  {
    id: "axis",
    title: "Axis Communications",
    description:
      "Certified Axis Solution Partner. Two Axis Certified Professionals work in-house for product selection, cybersecurity baseline, and project documentation.",
    ctaLabel: "Shop Axis",
    ctaHref: "/brands/axis",
    details: [
      "Company credential: Axis Solution Partner",
      "People: two Axis Certified Professionals on the Supercore team",
      "Network cameras, audio, access control, intercom, radar, and explosion-protected X-line",
    ],
  },
  {
    id: "integrator",
    title: "Integrator Program",
    description:
      "Qualified integrators receive competitive discounts, partner portal access, expert product selection guidance, and technical documentation for submittals.",
    ctaLabel: "Contact Us to Qualify",
    ctaHref: "/contact-us",
    details: [
      "Multiple partnership levels determined by purchase volume",
      "Competitive pricing on industrial Ethernet, cellular, KVM, and FO converters",
      "Knowledgeable pre and post-sales consultations and product support",
      "Training classes offered regularly around the country",
    ],
  },
  {
    id: "emerson",
    title: "Emerson Alliance Program",
    description:
      "Authorized distributor of Hirschmann and Adder products for Emerson Process Management Impact Partners across North America and Europe.",
    ctaLabel: "Contact Us to Qualify",
    ctaHref: "/contact-us",
    details: [
      "Hirschmann industrial Ethernet for DeltaV Digital Automation System",
      "Adder KVM technology as exclusive KVM for DeltaV",
    ],
  },
  {
    id: "cisco",
    title: "Cisco Integrator Program",
    description:
      "Qualify for the Cisco Integrator Program with Supercore to access discounts, training, support, and recognition.",
    ctaLabel: "Contact Us to Qualify",
    ctaHref: "/contact-us",
    details: [
      "Cisco OT Supplier Partner expertise",
      "OT hardware in stock with exclusive pricing",
      "Comprehensive Cisco OTS sales support",
    ],
  },
  {
    id: "belden",
    title: "Belden Partner Alliance",
    description:
      "Connect to a powerful network of contractors and distributors with opportunities only available to Belden Partner Alliance members.",
    ctaLabel: "Contact Us to Qualify",
    ctaHref: "/contact-us",
    details: [],
  },
  {
    id: "gsa",
    title: "GSA Program",
    description:
      "Government and enterprise procurement support with established fair pricing and streamlined ordering for qualified organizations.",
    ctaLabel: "Contact Us",
    ctaHref: "/contact-us",
    details: [
      "Electronic equipment and networking devices",
      "Equipment maintenance and lifecycle services",
      "Surveillance and vehicular video solutions",
      "Software licenses and IT professional services",
    ],
  },
]

const PartnerPrograms = () => {
  return (
    <section className="bg-white">
      <div className="content-container space-y-16 py-16 small:py-20">
        {PARTNER_PROGRAMS.map((program) => (
          <article
            key={program.id}
            className="grid grid-cols-1 gap-8 border-b border-sc-line pb-16 last:border-b-0 large:grid-cols-[1fr_320px]"
          >
            <div>
              <h2 className="font-display text-3xl tracking-tight text-sc-ink">
                {program.title}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-sc-steel">
                {program.description}
              </p>
              {program.details.length > 0 && (
                <ul className="mt-6 space-y-2 text-sm text-sc-steel">
                  {program.details.map((detail) => (
                    <li key={detail} className="flex gap-2">
                      <span className="text-sc-cta">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
              <LocalizedClientLink
                href={program.ctaHref}
                className="mt-8 inline-flex rounded-md bg-sc-cta px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-sc-cta-hover"
              >
                {program.ctaLabel}
              </LocalizedClientLink>
            </div>
          </article>
        ))}

        <div className="rounded-lg bg-sc-paper p-10 text-center">
          <h2 className="font-display text-3xl tracking-tight text-sc-ink">
            Put Our Partnerships to Work for You
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sc-steel">
            If our partner programs align with your goals, reach out to discuss your
            application and explore the most effective solution for your networking needs.
          </p>
          <LocalizedClientLink
            href="/contact-us"
            className="mt-8 inline-flex rounded-md bg-sc-cta px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sc-ink hover:bg-sc-cta-hover"
          >
            Contact Us
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default PartnerPrograms
