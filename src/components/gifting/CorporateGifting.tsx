"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { GiftSample } from "@/data/giftSamples";
import { cx } from "@/lib/cx";
import { catalogThumbUrl } from "@/lib/catalog-image";
import { Breadcrumbs, ButtonPrimary, ButtonOutline } from "@/components/fuse/buttons";
import { Modal, CloseButton } from "@/components/fuse/Overlay";
import { Reveal, Section } from "@/components/fuse/ui";
import { Gift, Mail, Shield, Spinner, Watch, WhatsApp } from "@/components/fuse/icons";
import { useSite, whatsappLink } from "@/components/site/SiteProvider";

const COLOURS = [
  { id: "all", label: "All", swatch: "#f5f2ec" },
  { id: "silver", label: "Silver", swatch: "#c5c8ce" },
  { id: "gold", label: "Gold", swatch: "#c4a574" },
  { id: "black", label: "Black", swatch: "#1a1a1a" },
  { id: "blue", label: "Blue", swatch: "#2c4a6e" },
  { id: "green", label: "Green", swatch: "#3d5c4a" },
  { id: "rose", label: "Rose", swatch: "#c48b7a" },
] as const;

const OCCASIONS = [
  { icon: Gift, title: "Employee recognition", text: "Mark service anniversaries and outstanding contributions with a watch built to last." },
  { icon: Watch, title: "Client gifts", text: "A precision timepiece that keeps your relationship in mind, every day." },
  { icon: Shield, title: "Milestone celebrations", text: "Launches, retirements and company anniversaries, marked with Timect craftsmanship." },
];

/** Soft circle colour from the gift's accent, or derived from its name. */
function accentFor(p: GiftSample): string {
  if (p.accentColor) return p.accentColor;
  const t = `${p.name} ${p.collection || ""} ${p.title || ""}`.toLowerCase();
  if (t.includes("rose") || t.includes("pink")) return "#8f6a5e";
  if (t.includes("gold") || t.includes("truton")) return "#8a7355";
  if (t.includes("blue") || t.includes("azure") || t.includes("heritage")) return "#4a5d6e";
  if (t.includes("green") || t.includes("forest")) return "#5a6b55";
  if (t.includes("black") || t.includes("noir") || t.includes("graphite")) return "#3a3a3a";
  if (t.includes("silver") || t.includes("steel")) return "#7a7e86";
  return "#6b7168";
}

function specsFor(p: GiftSample) {
  if (p.specifications?.length) return p.specifications;
  return [
    p.collection && { label: "Collection", value: p.collection },
    p.caseSize && { label: "Case", value: p.caseSize },
    p.gender && { label: "Designed for", value: p.gender },
  ].filter(Boolean) as { label: string; value: string }[];
}

function GiftCard({ item, onOpen, index }: { item: GiftSample; onOpen: () => void; index: number }) {
  const accent = accentFor(item);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group/g flex h-full w-full animate-rise-in flex-col overflow-hidden rounded-fuse bg-white text-start"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <span className="relative block aspect-square overflow-hidden">
        <span
          className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 transition-transform duration-700 ease-fuse-out group-hover/g:scale-110"
          style={{ background: accent }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={catalogThumbUrl(item.image, 600)}
          alt={item.name}
          loading="lazy"
          className="img-fill object-contain p-8 transition-transform duration-700 ease-fuse group-hover/g:scale-[1.05]"
        />
      </span>
      <span className="flex flex-1 flex-col px-4 pb-5 pt-2 md:px-5">
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">{item.collection || item.brand || "Timect"}</span>
        <span className="mt-1 line-clamp-2 text-[16px] font-medium">{item.name}</span>
        <span className="mt-auto pt-3 text-[18px] font-semibold">{item.price}</span>
      </span>
    </button>
  );
}

export default function CorporateGifting({ items }: { items: GiftSample[] }) {
  const { whatsappNumber } = useSite();
  const [colour, setColour] = useState("all");
  const [list, setList] = useState(items);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<GiftSample | null>(null);

  // Colour filter is served by /api/corporate-gifting
  useEffect(() => {
    if (colour === "all") {
      setList(items);
      return;
    }
    let active = true;
    setLoading(true);
    fetch(`/api/corporate-gifting?colour=${encodeURIComponent(colour)}`)
      .then((r) => r.json())
      .then((data) => {
        if (active && data.success && Array.isArray(data.products)) setList(data.products);
      })
      .catch((err) => console.error("Failed to fetch gifts:", err))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [colour, items]);

  const visible = useMemo(() => list.filter((p) => p.image), [list]);
  const enquiryHref = (name?: string) =>
    `/contact?subject=${encodeURIComponent(name ? `Corporate gifting: ${name}` : "Corporate gifting enquiry")}`;

  return (
    <div className="container-fuse pb-10 pt-12 md:pt-20">
      <div className="px-2 text-center">
        <Breadcrumbs items={[["Home", "/"], ["Corporate Gifting"]]} />
        <h1 className="fuse-h1 mx-auto mt-2 max-w-[1000px] animate-rise-in">Find your gift</h1>
        <p className="mx-auto mt-5 max-w-[640px] text-[16px] leading-[1.6] text-muted md:text-[18px]">
          Timect timepieces for employee recognition, client gifts and milestone celebrations — chosen by colour, delivered
          with our concierge’s help.
        </p>
      </div>

      <Section className="mt-10 md:mt-14">
        <ul className="grid gap-3 md:grid-cols-3">
          {OCCASIONS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="reveal-rise flex gap-4 rounded-fuse bg-white p-6 md:p-8" style={{ "--delay": `${i * 0.08}s` } as CSSProperties}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-fuse-md bg-bg text-heading">
                <Icon />
              </span>
              <span>
                <span className="block text-[18px] font-bold text-heading">{title}</span>
                <span className="mt-2 block text-[15px] leading-relaxed text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-10 flex flex-col items-center gap-4 md:mt-14">
        <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-muted">Pick a colour</p>
        <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Colour">
          {COLOURS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={colour === c.id}
              onClick={() => setColour(c.id)}
              className={cx("pill gap-2 px-4 py-2.5", colour === c.id && "is-active")}
            >
              <span className="h-5 w-5 rounded-full border border-black/10" style={{ background: c.swatch }} />
              {c.label}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-2 text-[14px] text-muted" aria-live="polite">
          {loading ? <Spinner className="h-4 w-4" /> : null}
          {visible.length} gifts
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4">
        {visible.map((item, i) => (
          <li key={item.id}>
            <GiftCard item={item} index={i} onOpen={() => setSelected(item)} />
          </li>
        ))}
      </ul>
      {!loading && visible.length === 0 && (
        <div className="py-16 text-center">
          <p className="fuse-h5">No gifts in this colour yet</p>
          <button type="button" className="btn-secondary mt-6" onClick={() => setColour("all")}>
            Show all gifts
          </button>
        </div>
      )}

      <Reveal className="mt-3 flex flex-col items-center gap-6 rounded-fuse bg-white px-6 py-12 text-center md:py-16">
        <h2 className="fuse-h3 max-w-[760px]">Ordering for a team?</h2>
        <p className="max-w-[560px] text-muted">
          Tell us the occasion, quantity and timeline — our concierge will put together a selection for you.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonPrimary href={enquiryHref()} bg="#f0f2f4">
            Start a gifting enquiry
          </ButtonPrimary>
          <ButtonOutline href={whatsappLink(whatsappNumber, "Hi Timect, I'd like help with a corporate gifting order.")} external>
            Chat on WhatsApp
          </ButtonOutline>
        </div>
      </Reveal>

      <Modal open={!!selected} onClose={() => setSelected(null)} label={selected?.name || "Gift"} className="max-w-[1100px]">
        {selected && (
          <div className="relative grid max-h-[calc(100vh-48px)] gap-2 overflow-y-auto p-2 md:grid-cols-[1.1fr_1fr] md:gap-3 md:p-4">
            <CloseButton onClick={() => setSelected(null)} className="absolute right-4 top-4 z-10" />
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-fuse bg-white">
              <span
                className="absolute h-[78%] w-[78%] animate-fade-in rounded-full"
                style={{ background: accentFor(selected), opacity: 0.85 }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={catalogThumbUrl(selected.image, 1000)}
                alt={selected.name}
                className="relative z-[1] h-[82%] w-[82%] animate-rise-in object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,.25)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="rounded-fuse bg-white p-6 md:p-8">
                <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted">{selected.collection || selected.brand || "Timect"}</p>
                <h2 className="fuse-h4 mt-3 pr-14">{selected.name}</h2>
                {(selected.subtitle || selected.title) && <p className="mt-3 text-muted">{selected.subtitle || selected.title}</p>}
                <p className="mt-6 text-[26px] font-semibold">{selected.price}</p>
              </div>
              {specsFor(selected).length > 0 && (
                <div className="rounded-fuse bg-white p-6 md:p-8">
                  <p className="mb-4 text-[14px] font-semibold uppercase tracking-[0.14em] text-muted">Specifications</p>
                  <dl className="grid grid-cols-[minmax(110px,40%)_1fr] gap-y-3">
                    {specsFor(selected).map((s) => (
                      <div key={`${s.label}-${s.value}`} className="contents">
                        <dt className="text-muted">{s.label}</dt>
                        <dd className="font-medium">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
              <div className="flex flex-col gap-2 rounded-fuse bg-white p-3 md:p-4">
                <a
                  href={whatsappLink(whatsappNumber, `Hi, I'm interested in ${selected.name} (${selected.price}) for corporate gifting.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 rounded-fuse bg-whatsapp px-6 py-[17px] font-semibold text-white transition-[filter] duration-400 hover:brightness-95"
                >
                  <WhatsApp /> Ask on WhatsApp
                </a>
                <a
                  href={enquiryHref(selected.name)}
                  className="flex items-center justify-center gap-2.5 rounded-fuse border border-line bg-btn px-6 py-[17px] font-semibold transition-colors duration-400 hover:border-line-hover hover:bg-white"
                >
                  <Mail className="h-5 w-5" /> Enquire by email
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
