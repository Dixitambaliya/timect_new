import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQs | Timect",
  description:
    "Frequently asked questions about Timect wristwatches, orders, water resistance, care, and warranty.",
};

const faqs = [
  {
    q: "Are Timect watches manufactured in-house?",
    a: "Timect designs its collections and oversees manufacturing to brand specifications. Cases, dials, hands, and straps are produced and finished to our standards, then assembled and inspected before shipment. Movement calibres are selected for reliability and serviceability in daily wear.",
  },
  {
    q: "How accurate should my watch keep time?",
    a: "Quartz Timect models are expected to keep very stable time under normal conditions. Mechanical models may vary slightly depending on wear position, temperature, and power reserve. If your watch gains or loses time beyond normal tolerance, contact our service team for assessment.",
  },
  {
    q: "What does the water-resistance rating mean?",
    a: "Water-resistance ratings indicate tested resistance under laboratory conditions — not a guarantee for all swimming or diving use. Avoid operating the crown underwater. After exposure to water, rinse with fresh water if needed and dry the watch carefully. Gaskets should be checked during routine service.",
  },
  {
    q: "How should I care for my Timect wristwatch?",
    a: "Wipe the case and crystal with a soft, dry cloth. Avoid strong chemicals, solvents, and prolonged exposure to extreme heat or magnets. Store the watch away from moisture when not worn. For leather straps, keep them dry and clean; for metal bracelets, occasional gentle cleaning maintains finish.",
  },
  {
    q: "How long is the warranty?",
    a: "Timect watches include a limited manufacturer warranty covering defects in materials and workmanship under normal use. The warranty does not cover accidental damage, unauthorized service, battery replacement after initial period (where applicable), or normal wear of straps and finishes. See product packaging or contact us for your model’s terms.",
  },
  {
    q: "Can I service my watch with Timect?",
    a: "Yes. We support after-sales service including movement checks, gasket replacement, battery changes on quartz models, and refinishing assessments where available. Email service@timect.com with your model details and a description of the issue.",
  },
  {
    q: "How long does shipping take?",
    a: "Orders are typically processed within a few business days. Delivery times depend on your location and the carrier. You will receive tracking details once the package ships. For delays or missing parcels, contact care@timect.com with your order number.",
  },
  {
    q: "What is your return policy?",
    a: "Unused Timect watches in original packaging may be eligible for return within the stated return window after delivery, subject to inspection. Custom or final-sale items may be excluded. Contact customer care before returning any item so we can guide you through the process.",
  },
  {
    q: "How do I choose the right case size?",
    a: "Case diameter is measured across the watch face, excluding the crown. Smaller wrists often suit 36–40 mm; larger wrists may prefer 40–42 mm or more. Lug-to-lug length and thickness also affect fit. If you need help matching a model to your wrist, reach out with a wrist measurement.",
  },
];

export default function FaqsPage() {
  return (
    <StaticPage
      title="FAQs"
      subtitle="Answers about Timect wristwatches, care, service, and shopping — written for owners and collectors of precision timepieces."
    >
      <FaqAccordion items={faqs} />

      <p className="mt-12 text-[var(--muted)]">
        Still need help?{" "}
        <Link
          href="/contact"
          className="text-[#111] underline underline-offset-4"
        >
          Contact us
        </Link>{" "}
        and our team will respond as soon as possible.
      </p>
    </StaticPage>
  );
}
