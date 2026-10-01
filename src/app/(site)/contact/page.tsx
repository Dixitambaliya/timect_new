import type { Metadata } from "next";
import ContentPage from "@/components/site/ContentPage";
import ContactForm from "@/components/site/ContactForm";
import { Clock, Mail, Phone } from "@/components/fuse/icons";
import { getStorefront } from "@/db/content";
import { getProductBySlug } from "@/db/actions";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Timect for product questions, orders, warranty support, and after-sales service for your wristwatch.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; subject?: string }>;
}) {
  const { product: productSlug, subject } = await searchParams;
  const [storefront, product] = await Promise.all([
    getStorefront(),
    productSlug ? getProductBySlug(productSlug) : Promise.resolve(null),
  ]);
  const { contact } = storefront;
  const productName = product ? product.title || product.name : "";

  return (
    <ContentPage
      title="Contact Us"
      subtitle="Questions about a Timect wristwatch, an order, or after-sales service? We are here to help."
      width="max-w-[1400px]"
      bare
    >
      <div className="grid items-start gap-3 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Customer care", contact.careEmail, "For orders, shipping, returns, and product questions."],
              ["Service & warranty", contact.serviceEmail, "For repairs, movement service, and warranty claims."],
            ]
              .filter(([, email]) => email)
              .map(([title, email, text]) => (
                <div key={title} className="hover-lift rounded-fuse bg-white p-6 md:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-fuse-md bg-bg text-heading">
                    <Mail />
                  </span>
                  <h2 className="mt-5 text-[14px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>
                  <a href={`mailto:${email}`} className="link-underline mt-2 inline-block break-all text-[18px] font-semibold text-ink">
                    {email}
                  </a>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted">{text}</p>
                </div>
              ))}
          </div>

          {(contact.phone || contact.hours) && (
            <div className="flex flex-wrap gap-x-10 gap-y-4 rounded-fuse bg-white p-6 md:p-8">
              {contact.phone && (
                <p className="flex items-center gap-3 font-semibold">
                  <Phone className="h-6 w-6 text-heading" />
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="link-hover">
                    {contact.phone}
                  </a>
                </p>
              )}
              {contact.hours && (
                <p className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-heading" />
                  {contact.hours}
                </p>
              )}
            </div>
          )}

          <div className="rounded-fuse bg-white p-6 md:p-8">
            <h2 className="fuse-h5">Before you write</h2>
            <ul className="mt-4 list-disc space-y-2.5 ps-5 text-[16px] leading-relaxed text-[#2b2f38]">
              <li>Include your order number if your message is about a purchase.</li>
              <li>
                For service requests, note the model name, serial or case reference if available, and a brief description of
                the issue.
              </li>
              <li>Photos of the dial, case back, and any damage help our watchmakers advise faster.</li>
            </ul>
          </div>

          <div className="rounded-fuse bg-white p-6 md:p-8">
            <h2 className="fuse-h5">Response times</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#2b2f38]">
              Our customer care team typically responds within 1–2 business days. Service assessments for mechanical or
              quartz issues may take additional time depending on workshop schedule and spare-part availability.
            </p>
          </div>
        </div>

        <div className="rounded-fuse bg-white p-6 md:p-10 lg:sticky lg:top-6 lg:col-span-6">
          <h2 className="fuse-h4">Send a message</h2>
          <p className="mb-8 mt-3 text-muted">
            {productName
              ? `Your enquiry will reference ${productName}.`
              : "Fill in the details below and our team will get in touch with you."}
          </p>
          <ContactForm
            productSlug={product?.slug}
            defaultSubject={productName ? `Enquiry: ${productName}` : subject?.slice(0, 200)}
          />
        </div>
      </div>
    </ContentPage>
  );
}
