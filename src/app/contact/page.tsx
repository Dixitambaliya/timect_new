import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Contact Us | Timect",
  description:
    "Contact Timect for product questions, orders, warranty support, and after-sales service for your wristwatch.",
};

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact Us"
      subtitle="Questions about a Timect wristwatch, an order, or after-sales service? We are here to help."
      maxWidth="max-w-[1240px]"
      headerPy="py-6 md:py-8"
      contentPy="py-6 md:py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Customer Care, Service & Warranty, Before you write, Response times */}
        <div className="lg:col-span-7 space-y-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border border-[var(--line)] p-6 rounded-xl bg-white shadow-xs">
              <h2 className="tracked-sm text-[11px] font-semibold text-[var(--muted)] mb-3">
                CUSTOMER CARE
              </h2>
              <p className="text-[#111] font-medium mb-1">Email</p>
              <a
                href="mailto:care@timect.com"
                className="text-[#111] font-semibold underline underline-offset-4 hover:opacity-75 transition"
              >
                care@timect.com
              </a>
              <p className="text-[var(--muted)] text-[13px] mt-4 leading-relaxed">
                For orders, shipping, returns, and product questions.
              </p>
            </div>

            <div className="border border-[var(--line)] p-6 rounded-xl bg-white shadow-xs">
              <h2 className="tracked-sm text-[11px] font-semibold text-[var(--muted)] mb-3">
                SERVICE & WARRANTY
              </h2>
              <p className="text-[#111] font-medium mb-1">Email</p>
              <a
                href="mailto:service@timect.com"
                className="text-[#111] font-semibold underline underline-offset-4 hover:opacity-75 transition"
              >
                service@timect.com
              </a>
              <p className="text-[var(--muted)] text-[13px] mt-4 leading-relaxed">
                For repairs, movement service, and warranty claims.
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-8">
            <h2 className="serif text-[24px] font-medium text-[#111] mb-4">
              Before you write
            </h2>
            <ul className="list-disc pl-5 space-y-2.5 text-[#444] text-[14px]">
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
            <h2 className="serif text-[24px] font-medium text-[#111] mb-4">
              Response times
            </h2>
            <p className="text-[#444] text-[14px] leading-relaxed">
              Our customer care team typically responds within 1–2 business days.
              Service assessments for mechanical or quartz issues may take
              additional time depending on workshop schedule and spare-part
              availability.
            </p>
          </div>
        </div>

        {/* Right Column: Send a message Form */}
        <div className="lg:col-span-5 bg-[#fafafa] border border-[var(--line)] p-7 md:p-8 rounded-2xl h-fit lg:sticky lg:top-28 shadow-xs">
          <h2 className="serif text-[24px] font-medium text-[#111] mb-2">
            Send a message
          </h2>
          <p className="text-[13px] text-[var(--muted)] mb-6">
            Fill in the details below and our team will get in touch with you.
          </p>
          <form className="space-y-4" action="#" method="post">
            <div>
              <label
                htmlFor="name"
                className="block text-[11px] font-semibold tracked-sm text-[var(--muted)] mb-2"
              >
                NAME
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full bg-white border border-[var(--line)] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#111] transition"
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold tracked-sm text-[var(--muted)] mb-2"
              >
                EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full bg-white border border-[var(--line)] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#111] transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-[11px] font-semibold tracked-sm text-[var(--muted)] mb-2"
              >
                MESSAGE
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full bg-white border border-[var(--line)] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#111] resize-y transition"
                placeholder="How can we help with your Timect watch?"
              />
            </div>
            <button
              type="button"
              className="w-full bg-black text-white text-[12px] font-bold tracked-sm px-8 py-3.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              SEND MESSAGE
            </button>
            <p className="text-[11px] text-[var(--muted)] text-center mt-3">
              This form is a front-end placeholder. Please email us directly
              until live messaging is connected.
            </p>
          </form>
        </div>
      </div>
    </StaticPage>
  );
}
