import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Contact Us",
  alternates: { canonical: "/contact" },
  description:
    "Contact Timect for product questions, orders, warranty support, and after-sales service for your wristwatch.",
};

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact Us"
      subtitle="Questions about a Timect wristwatch, an order, or after-sales service? We are here to help."
      eyebrow="Client Care"
      maxWidth="max-w-none"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Customer Care, Service & Warranty, Before you write, Response times */}
        <div className="lg:col-span-7 space-y-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border-t border-[var(--ink)] pt-6">
              <h2 className="eyebrow text-[var(--champagne)] mb-5">
                Customer care
              </h2>
              <p className="eyebrow text-[0.58rem] text-[var(--muted)] mb-2">Email</p>
              <a
                href="mailto:care@timect.com"
                className="display text-[1.6rem] leading-none hover:opacity-70 transition-opacity"
              >
                care@timect.com
              </a>
              <p className="text-[var(--muted)] text-[0.88rem] mt-4 leading-relaxed">
                For orders, shipping, returns, and product questions.
              </p>
            </div>

            <div className="border-t border-[var(--ink)] pt-6">
              <h2 className="eyebrow text-[var(--champagne)] mb-5">
                Service & warranty
              </h2>
              <p className="eyebrow text-[0.58rem] text-[var(--muted)] mb-2">Email</p>
              <a
                href="mailto:service@timect.com"
                className="display text-[1.6rem] leading-none hover:opacity-70 transition-opacity"
              >
                service@timect.com
              </a>
              <p className="text-[var(--muted)] text-[0.88rem] mt-4 leading-relaxed">
                For repairs, movement service, and warranty claims.
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-8">
            <h2 className="mb-5">
              Before you write
            </h2>
            <ul className="list-disc pl-5 space-y-2.5">
              <li>
                Include your order number if your message is about a purchase.
              </li>
              <li>
                For service requests, note the model name, serial or case reference
                if available, and a brief description of the issue.
              </li>
              <li>
                Photos of the dial, case back, and any damage help our watchmakers
                advise faster.
              </li>
            </ul>
          </div>

          <div className="border-t border-[var(--line)] pt-8">
            <h2 className="mb-5">
              Response times
            </h2>
            <p className="">
              Our customer care team typically responds within 1–2 business days.
              Service assessments for mechanical or quartz issues may take
              additional time depending on workshop schedule and spare-part
              availability.
            </p>
          </div>
        </div>

        {/* Right Column: Send a message Form */}
        <div className="lg:col-span-5 bg-[var(--ivory)] p-7 md:p-10 h-fit lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
          <h2 className="mb-2">
            Send a message
          </h2>
          <p className="text-[0.88rem] text-[var(--muted)] mb-8">
            Fill in the details below and our team will get in touch with you.
          </p>
          <form className="space-y-7" action="#" method="post">
            <div>
              <label
                htmlFor="name"
                className="block eyebrow text-[0.58rem] text-[var(--muted)] mb-1"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full bg-transparent border-0 border-b border-[var(--ink)]/25 px-0 py-3 text-[0.95rem] font-light outline-none focus:border-[var(--ink)] placeholder:text-[var(--muted)]/70 transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block eyebrow text-[0.58rem] text-[var(--muted)] mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full bg-transparent border-0 border-b border-[var(--ink)]/25 px-0 py-3 text-[0.95rem] font-light outline-none focus:border-[var(--ink)] placeholder:text-[var(--muted)]/70 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block eyebrow text-[0.58rem] text-[var(--muted)] mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full bg-transparent border-0 border-b border-[var(--ink)]/25 px-0 py-3 text-[0.95rem] font-light outline-none focus:border-[var(--ink)] placeholder:text-[var(--muted)]/70 resize-y transition-colors"
                placeholder="How can we help with your Timect watch?"
              />
            </div>
            <button
              type="button"
              className="lux-btn lux-btn--solid w-full"
            >
              Send message
            </button>
            <p className="text-[0.72rem] text-[var(--muted)] text-center mt-3 leading-relaxed">
              This form is a front-end placeholder. Please email us directly
              until live messaging is connected.
            </p>
          </form>
        </div>
      </div>
    </StaticPage>
  );
}
