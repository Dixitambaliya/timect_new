"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/admin/components/layout/Breadcrumbs";
import ImageField from "@/admin/components/ui/ImageField";
import { adminGetStorefront, adminSaveStorefront } from "@/admin/actions/storefront";
import { useToast } from "@/admin/hooks/useToast";
import type { HeroSlide, PromoBanner, StorefrontSettings } from "@/data/storefront";

type Tab = "hero" | "banners" | "content" | "contact";

const TABS: [Tab, string][] = [
  ["hero", "Hero slides"],
  ["banners", "Promo banners"],
  ["content", "Announcements & text"],
  ["contact", "Contact & social"],
];

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-[var(--admin-muted)]">{hint}</span>}
    </label>
  );
}

function RowActions({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-1">
      <button type="button" className="admin-btn admin-btn-ghost !px-2" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Move up">
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" className="admin-btn admin-btn-ghost !px-2" disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label="Move down">
        <ArrowDown className="h-4 w-4" />
      </button>
      <button type="button" className="admin-btn admin-btn-danger !px-2" onClick={onRemove} aria-label="Remove">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function StorefrontPage() {
  const { success, error } = useToast();
  const [data, setData] = useState<StorefrontSettings | null>(null);
  const [tab, setTab] = useState<Tab>("hero");
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    adminGetStorefront().then(setData);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!data) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-muted)]" />
      </div>
    );
  }

  const patch = (p: Partial<StorefrontSettings>) => {
    setData({ ...data, ...p });
    setDirty(true);
  };
  const setSlide = (i: number, s: Partial<HeroSlide>) =>
    patch({ heroSlides: data.heroSlides.map((x, j) => (j === i ? { ...x, ...s } : x)) });
  const setBanner = (i: number, b: Partial<PromoBanner>) =>
    patch({ banners: data.banners.map((x, j) => (j === i ? { ...x, ...b } : x)) });

  const save = () =>
    startTransition(async () => {
      const res = await adminSaveStorefront(data);
      if (res.ok) {
        success("Storefront saved — changes are live");
        setDirty(false);
      } else error(res.error);
    });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Storefront" }]}
        title="Homepage & content"
        description="Hero slider, promo banners, announcement bar, brand copy and contact details shown on the storefront"
        actions={
          <>
            <a href="/" target="_blank" rel="noreferrer" className="admin-btn admin-btn-secondary">
              <ExternalLink className="h-4 w-4" />
              Preview
            </a>
            <button type="button" className="admin-btn admin-btn-primary" onClick={save} disabled={pending || !dirty}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {dirty ? "Save changes" : "Saved"}
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className={`admin-pill ${tab === id ? "is-active" : ""}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "hero" && (
        <div className="space-y-3">
          {data.heroSlides.map((s, i) => (
            <div key={s.id || i} className="admin-card p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-[17px] font-bold">
                  Slide {i + 1}
                  <span className="ms-2 font-normal text-[var(--admin-muted)]">{s.title}</span>
                </h2>
                <RowActions
                  index={i}
                  count={data.heroSlides.length}
                  onMove={(to) => patch({ heroSlides: move(data.heroSlides, i, to) })}
                  onRemove={() => patch({ heroSlides: data.heroSlides.filter((_, j) => j !== i) })}
                />
              </div>
              <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                <ImageField label="Watch image" value={s.image} onChange={(image) => setSlide(i, { image })} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Eyebrow">
                    <input className="admin-input" value={s.eyebrow} onChange={(e) => setSlide(i, { eyebrow: e.target.value })} />
                  </Field>
                  <Field label="Price (optional)">
                    <input className="admin-input" value={s.price || ""} onChange={(e) => setSlide(i, { price: e.target.value })} placeholder="₹1,30,000" />
                  </Field>
                  <Field label="Title">
                    <input className="admin-input" value={s.title} onChange={(e) => setSlide(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Subtitle">
                    <input className="admin-input" value={s.subtitle} onChange={(e) => setSlide(i, { subtitle: e.target.value })} />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Description">
                      <textarea className="admin-input resize-y" rows={3} value={s.description} onChange={(e) => setSlide(i, { description: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Button label">
                    <input className="admin-input" value={s.buttonLabel} onChange={(e) => setSlide(i, { buttonLabel: e.target.value })} />
                  </Field>
                  <Field label="Button link" hint="e.g. /watches, /product/slug, /watches?filter=blue">
                    <input className="admin-input font-mono text-[13px]" value={s.href} onChange={(e) => setSlide(i, { href: e.target.value })} />
                  </Field>
                </div>
              </div>
              <div className="mt-5 rounded-fuse-md bg-[var(--admin-bg)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="admin-label !mb-0">Highlighted specs (up to 6)</span>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary !py-1.5"
                    disabled={s.specs.length >= 6}
                    onClick={() => setSlide(i, { specs: [...s.specs, { label: "", value: "" }] })}
                  >
                    <Plus className="h-4 w-4" /> Add spec
                  </button>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {s.specs.map((sp, k) => (
                    <div key={k} className="flex gap-2">
                      <input
                        className="admin-input"
                        placeholder="Label"
                        value={sp.label}
                        onChange={(e) => setSlide(i, { specs: s.specs.map((x, j) => (j === k ? { ...x, label: e.target.value } : x)) })}
                      />
                      <input
                        className="admin-input"
                        placeholder="Value"
                        value={sp.value}
                        onChange={(e) => setSlide(i, { specs: s.specs.map((x, j) => (j === k ? { ...x, value: e.target.value } : x)) })}
                      />
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost !px-2"
                        aria-label="Remove spec"
                        onClick={() => setSlide(i, { specs: s.specs.filter((_, j) => j !== k) })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="admin-card flex w-full items-center justify-center gap-2 border-dashed !border-[var(--admin-line-strong)] p-6 font-semibold text-[var(--admin-muted)] hover:text-[var(--admin-ink)]"
            onClick={() =>
              patch({
                heroSlides: [
                  ...data.heroSlides,
                  { id: `slide-${Date.now()}`, eyebrow: "", title: "New slide", subtitle: "", description: "", price: "", image: "", href: "/watches", buttonLabel: "Explore", specs: [] },
                ],
              })
            }
          >
            <Plus className="h-4 w-4" /> Add hero slide
          </button>
        </div>
      )}

      {tab === "banners" && (
        <div className="space-y-3">
          {data.banners.map((b, i) => (
            <div key={b.id || i} className="admin-card p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[17px] font-bold">Banner {i + 1}</h2>
                <RowActions
                  index={i}
                  count={data.banners.length}
                  onMove={(to) => patch({ banners: move(data.banners, i, to) })}
                  onRemove={() => patch({ banners: data.banners.filter((_, j) => j !== i) })}
                />
              </div>
              <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                <ImageField label="Image" value={b.image} onChange={(image) => setBanner(i, { image })} aspect="aspect-[4/5]" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Title">
                    <input className="admin-input" value={b.title} onChange={(e) => setBanner(i, { title: e.target.value })} />
                  </Field>
                  <Field label="Button label">
                    <input className="admin-input" value={b.buttonLabel} onChange={(e) => setBanner(i, { buttonLabel: e.target.value })} />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Text">
                      <textarea className="admin-input resize-y" rows={2} value={b.text} onChange={(e) => setBanner(i, { text: e.target.value })} />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Link" hint="e.g. /watches?gender=Men">
                      <input className="admin-input font-mono text-[13px]" value={b.href} onChange={(e) => setBanner(i, { href: e.target.value })} />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {data.banners.length < 4 && (
            <button
              type="button"
              className="admin-card flex w-full items-center justify-center gap-2 border-dashed !border-[var(--admin-line-strong)] p-6 font-semibold text-[var(--admin-muted)] hover:text-[var(--admin-ink)]"
              onClick={() =>
                patch({ banners: [...data.banners, { id: `banner-${Date.now()}`, title: "New banner", text: "", image: "", href: "/watches", buttonLabel: "Explore" }] })
              }
            >
              <Plus className="h-4 w-4" /> Add banner
            </button>
          )}
        </div>
      )}

      {tab === "content" && (
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="admin-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-bold">Announcement bar</h2>
              <button
                type="button"
                className="admin-btn admin-btn-secondary !py-1.5"
                onClick={() => patch({ announcement: [...data.announcement, ""] })}
              >
                <Plus className="h-4 w-4" /> Add message
              </button>
            </div>
            <div className="space-y-2">
              {data.announcement.length === 0 && <p className="text-sm text-[var(--admin-muted)]">No messages — the bar will be empty.</p>}
              {data.announcement.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="admin-input"
                    value={m}
                    onChange={(e) => patch({ announcement: data.announcement.map((x, j) => (j === i ? e.target.value : x)) })}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost !px-2"
                    aria-label="Remove message"
                    onClick={() => patch({ announcement: data.announcement.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card space-y-4 p-5 md:p-6">
            <h2 className="text-[17px] font-bold">Brand quote</h2>
            <Field label="Quote">
              <input className="admin-input" value={data.quote.text} onChange={(e) => patch({ quote: { ...data.quote, text: e.target.value } })} />
            </Field>
            <Field label="Attribution">
              <input className="admin-input" value={data.quote.author} onChange={(e) => patch({ quote: { ...data.quote, author: e.target.value } })} />
            </Field>
          </div>

          <div className="admin-card space-y-4 p-5 md:p-6 xl:col-span-2">
            <h2 className="text-[17px] font-bold">Homepage statement</h2>
            <Field label="Heading">
              <input className="admin-input" value={data.statement.heading} onChange={(e) => patch({ statement: { ...data.statement, heading: e.target.value } })} />
            </Field>
            <Field label="Text">
              <textarea className="admin-input resize-y" rows={4} value={data.statement.text} onChange={(e) => patch({ statement: { ...data.statement, text: e.target.value } })} />
            </Field>
          </div>
        </div>
      )}

      {tab === "contact" && (
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="admin-card space-y-4 p-5 md:p-6">
            <h2 className="text-[17px] font-bold">Contact details</h2>
            {(
              [
                ["careEmail", "Customer care email"],
                ["serviceEmail", "Service & warranty email"],
                ["phone", "Phone (optional)"],
                ["hours", "Opening hours"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input className="admin-input" value={data.contact[key]} onChange={(e) => patch({ contact: { ...data.contact, [key]: e.target.value } })} />
              </Field>
            ))}
            <Field label="WhatsApp number" hint="Digits with country code, e.g. 919876543210. Leave empty to use NEXT_PUBLIC_WHATSAPP_NUMBER.">
              <input className="admin-input font-mono" value={data.contact.whatsapp} onChange={(e) => patch({ contact: { ...data.contact, whatsapp: e.target.value } })} />
            </Field>
          </div>
          <div className="admin-card space-y-4 p-5 md:p-6">
            <h2 className="text-[17px] font-bold">Social links</h2>
            {(["instagram", "facebook", "youtube"] as const).map((key) => (
              <Field key={key} label={key[0].toUpperCase() + key.slice(1)} hint="Leave empty to hide the icon">
                <input className="admin-input font-mono text-[13px]" value={data.social[key]} onChange={(e) => patch({ social: { ...data.social, [key]: e.target.value } })} />
              </Field>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
