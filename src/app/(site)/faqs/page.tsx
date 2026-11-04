import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/site/ContentPage";
import FaqAccordion from "@/components/site/FaqAccordion";
import { ButtonPrimary } from "@/components/fuse/buttons";
import { createPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = createPageMetadata({
  title: "Watch FAQs & Practical Guides",
  description: "Clear answers about automatic and quartz watches, sizing, water resistance, chronographs, crystals, straps, care, and TIMECT enquiries.",
  path: "/faqs",
});

const FAQS = [
  { q: "How do I choose a watch?", a: "Start with how and where you will wear it, then compare case size, movement, water resistance, dial legibility, and strap material. Use the specifications on each TIMECT product page to compare models rather than choosing from appearance alone." },
  { q: "What is an automatic watch?", a: "An automatic watch is a mechanical watch whose mainspring is wound by a rotor that moves as the wearer moves. It can also require manual winding, and its running time depends on the movement's actual power-reserve specification." },
  { q: "What is a quartz watch?", a: "A quartz watch uses a battery-powered electronic oscillator regulated by a quartz crystal. Quartz movements generally require less routine attention than mechanical movements, although batteries and seals still need appropriate service." },
  { q: "What is the difference between automatic and quartz watches?", a: "Automatic watches use a mechanical gear train powered by a wound spring, while quartz watches use a battery and quartz oscillator. Quartz is typically more accurate; automatic movements appeal to people who value mechanical construction and do not mind periodic servicing." },
  { q: "What does water resistance mean?", a: "A water-resistance rating describes laboratory pressure testing, not a guarantee for every real-world activity. Follow the model instructions, keep the crown closed, avoid operating controls underwater, and have seals checked after opening or servicing the case." },
  { q: "What is a chronograph?", a: "A chronograph is a watch with an elapsed-time function, usually controlled by pushers and displayed using a central seconds hand or subdials. It is separate from the watch's ordinary time display." },
  { q: "What watch size is best for my wrist?", a: "There is no universal best size. Compare case diameter, lug-to-lug length, thickness, and strap fit with your wrist measurement; lug-to-lug length is especially useful for judging whether the watch will overhang the wrist." },
  { q: "How do I care for a stainless steel watch?", a: "Wipe it with a soft cloth after wear and keep the crown closed. If the model's instructions permit water contact, use a lightly damp cloth for residue; avoid abrasives, harsh chemicals, and polishing compounds that can alter brushed or polished finishes." },
  { q: "How do I maintain a leather watch strap?", a: "Keep leather away from water, perfume, cosmetics, and prolonged heat. Wipe it gently with a dry cloth, let moisture dry naturally, and rotate straps when possible to reduce repeated stress and perspiration exposure." },
  { q: "What is a sapphire crystal?", a: "Sapphire crystal is a transparent watch-cover material made from synthetic crystalline aluminium oxide. It is highly scratch resistant, but it can still chip or break after a sufficiently hard impact." },
  { q: "How should I store my watch?", a: "Store it clean and dry, away from strong magnets, direct sunlight, extreme temperatures, and objects that could scratch the case or crystal. Use a soft-lined watch box and do not leave a depleted battery in a quartz watch for an extended period." },
  { q: "How often does an automatic watch need servicing?", a: "Service intervals depend on the movement, use, environment, and manufacturer guidance. Arrange an assessment if timekeeping changes noticeably, the power reserve drops, moisture appears, or the crown and winding action feel abnormal." },
  { q: "What is the difference between case diameter and lug-to-lug?", a: "Case diameter measures across the case, normally excluding the crown. Lug-to-lug measures from the tip of the upper lugs to the tip of the lower lugs and often predicts wrist overhang more directly." },
  { q: "How can I enquire about a TIMECT watch?", a: "Open the watch's product page and use its enquiry option, or contact TIMECT with the model name or reference. Including the exact product helps the team answer specification and availability questions accurately." },
  { q: "How do I contact customer support?", a: "Use the TIMECT contact page for product and support enquiries. Include the watch model or reference and a concise description of your question so it can be directed appropriately." },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
};

export default function FaqsPage() {
  return (
    <ContentPage title="Watch FAQs" subtitle="Direct, practical answers about watch movements, sizing, materials, water resistance, care, and TIMECT product enquiries." bare>
      <JsonLd data={FAQ_SCHEMA} />
      <JsonLd data={webPageSchema({ name: "TIMECT Watch FAQs", description: "Practical answers about watch movements, sizing, water resistance, materials, and care.", path: "/faqs", type: "FAQPage" })} />
      <FaqAccordion items={FAQS} />
      <p className="mt-6 text-center text-[15px] text-muted">
        Browse <Link href="/watches" className="link-underline">watch specifications</Link> or use the{" "}
        <Link href="/contact" className="link-underline">TIMECT enquiry form</Link> for a specific model.
      </p>
      <div className="mt-6 flex flex-col items-center gap-6 rounded-fuse bg-white p-8 text-center md:p-12">
        <h2 className="fuse-h5">Still need help?</h2>
        <p className="text-muted">Contact us with the watch model or reference and your question.</p>
        <ButtonPrimary href="/contact" bg="#f0f2f4">Contact us</ButtonPrimary>
      </div>
    </ContentPage>
  );
}
