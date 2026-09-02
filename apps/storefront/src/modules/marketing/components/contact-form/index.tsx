"use client"

import { useState } from "react"

import { BRAND, BRAND_OFFICES } from "@lib/brand"

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="bg-white">
      <div className="content-container py-16 small:py-20">
        <div className="grid grid-cols-1 gap-12 large:grid-cols-[1fr_420px]">
          <div>
            <div className="rounded-lg border border-sc-line bg-sc-paper p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-sc-steel">
                Need to get in touch?
              </p>
              <p className="mt-3 text-2xl font-semibold text-sc-ink">
                Call{" "}
                <a href={`tel:${BRAND.phoneTel}`} className="text-sc-body hover:text-sc-cta hover:underline">
                  {BRAND.phone}
                </a>
              </p>
              <div className="mt-6 space-y-2 text-sm text-sc-steel">
                <p>
                  Sales:{" "}
                  <a href={`mailto:${BRAND.email}`} className="text-sc-body hover:text-sc-cta hover:underline">
                    {BRAND.email}
                  </a>
                </p>
                <p>
                  Help Desk:{" "}
                  <a
                    href="mailto:tech-eng@supercore.local"
                    className="text-sc-body hover:text-sc-cta hover:underline"
                  >
                    tech-eng@supercore.local
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 small:grid-cols-3">
              {BRAND_OFFICES.map((office) => (
                <div
                  key={office.name}
                  className="rounded-lg border border-sc-line bg-white p-6"
                >
                  <h3 className="font-semibold text-sc-ink">{office.name}</h3>
                  <div className="mt-3 space-y-1 text-sm text-sc-steel">
                    {office.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <a
                    href={office.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-sc-body hover:text-sc-cta hover:underline"
                  >
                    Map
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-sc-line bg-sc-paper p-8">
            <h2 className="text-xl font-semibold text-sc-ink">Send a message</h2>
            {submitted ? (
              <p className="mt-6 text-sc-steel">
                Thank you. Your submission has been received and our team will respond shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-sc-steel">
                    First Name
                  </label>
                  <input
                    required
                    className="h-11 w-full rounded-md border border-sc-line bg-white px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-sc-steel">
                    Last Name
                  </label>
                  <input
                    required
                    className="h-11 w-full rounded-md border border-sc-line bg-white px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-sc-steel">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="h-11 w-full rounded-md border border-sc-line bg-white px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-sc-steel">
                    Phone Number
                  </label>
                  <input
                    className="h-11 w-full rounded-md border border-sc-line bg-white px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-sc-steel">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    maxLength={800}
                    className="w-full rounded-md border border-sc-line bg-white px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-md bg-sc-cta px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-sc-cta-hover"
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactForm
