"use client";

import Link from "next/link";
import { useActionState, useState, type CSSProperties } from "react";
import { cx } from "@/lib/cx";
import { subscribeNewsletter, type NewsletterState } from "@/db/inquiries";
import { Reveal, Section } from "@/components/fuse/ui";
import { ArrowRight, ArrowUp, Clock, Facebook, Instagram, Mail, Phone, Plus, WhatsApp, YouTube } from "@/components/fuse/icons";
import { FOOTER_MENUS } from "./navigation";
import { useSite, whatsappLink } from "./SiteProvider";

const WORDMARK_IMG =
  "https://res.cloudinary.com/dphscxzb4/image/upload/f_auto,q_auto,w_2000/v1784048470/timect/gold_truton_chronograph.jpg";
const NEWSLETTER_BG =
  "https://res.cloudinary.com/dphscxzb4/image/upload/f_auto,q_auto,w_900/v1784048474/timect/image_4.png";

function Newsletter() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribeNewsletter, null);
  return (
    <Section className="mb-3">
      <div className="reveal-fade relative isolate overflow-hidden rounded-fuse px-6 py-10 text-white md:px-20 md:py-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={NEWSLETTER_BG} alt="" aria-hidden className="img-fill -z-10 scale-125 blur-[50px]" />
        <div className="absolute inset-0 -z-10 bg-[#404b62]/70" />
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div>
            <h2 className="reveal-wipe text-[28px] font-bold text-white md:text-[32px]">Newsletter</h2>
            <p className="mt-4 text-[16px] font-medium text-white/90">
              New releases, limited editions and watch-care notes from the Timect workshop.
            </p>
          </div>
          {state?.ok ? (
            <p className="animate-rise-in text-[20px] font-semibold">{state.message}</p>
          ) : (
            <form action={action} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email
              </label>
              <div className="min-w-0 flex-1">
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter email address..."
                  className="w-full rounded-fuse border border-white/25 bg-white/15 px-6 py-4 text-white outline-none transition-colors placeholder:text-white focus:border-white"
                />
                {state && !state.ok && <p className="mt-2 text-[14px] text-white">{state.message}</p>}
              </div>
              <button type="submit" className="btn-primary h-fit min-w-[220px] !bg-white/20" style={{ "--btn-bg": "#fff" } as CSSProperties} disabled={pending}>
                <span className="btn-text">{pending ? "Subscribing…" : "Subscribe"}</span>
                <span className="btn-icon">
                  <ArrowRight />
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}

function FooterColumn({ menu, i }: { menu: (typeof FOOTER_MENUS)[number]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={i * 0.08} className="rounded-fuse bg-white p-6 md:p-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-start md:pointer-events-none"
      >
        <h2 className="text-[20px] font-semibold md:text-[24px]">{menu.title}</h2>
        <Plus className={cx("h-5 w-5 transition-transform duration-400 md:hidden", open && "rotate-45")} />
      </button>
      <div className={cx("grid transition-[grid-template-rows] duration-400 md:grid-rows-[1fr]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <ul className="flex flex-col gap-3 overflow-hidden [&>li:first-child]:mt-6 md:pt-10 md:[&>li:first-child]:mt-0">
          {menu.links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="link-hover text-[16px]">
                {l.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export default function Footer() {
  const { storefront, whatsappNumber } = useSite();
  const { contact, social } = storefront;
  const socials = [
    [Instagram, "Instagram", social.instagram],
    [Facebook, "Facebook", social.facebook],
    [YouTube, "YouTube", social.youtube],
  ] as const;

  return (
    <footer className="container-fuse mt-3 pb-3">
      <Newsletter />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {FOOTER_MENUS.map((m, i) => (
          <FooterColumn key={m.title} menu={m} i={i} />
        ))}
        <Reveal delay={0.24} className="rounded-fuse bg-white p-6 md:p-8">
          <h2 className="text-[20px] font-semibold md:text-[24px]">Contact</h2>
          <ul className="mt-6 flex flex-col gap-3 font-semibold md:mt-10">
            {contact.careEmail && (
              <li className="flex items-start gap-3">
                <Mail className="h-6 w-6 shrink-0 text-heading" />
                <a href={`mailto:${contact.careEmail}`} className="link-hover break-all">
                  {contact.careEmail}
                </a>
              </li>
            )}
            {contact.phone && (
              <li className="flex items-start gap-3">
                <Phone className="h-6 w-6 shrink-0 text-heading" />
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="link-hover">
                  {contact.phone}
                </a>
              </li>
            )}
            <li className="flex items-start gap-3">
              <WhatsApp className="h-6 w-6 shrink-0 text-whatsapp" />
              <a href={whatsappLink(whatsappNumber, "Hi Timect, I have a question.")} target="_blank" rel="noreferrer" className="link-hover">
                WhatsApp concierge
              </a>
            </li>
            {contact.hours && (
              <li className="flex items-start gap-3 font-normal">
                <Clock className="h-6 w-6 shrink-0 text-heading" />
                {contact.hours}
              </li>
            )}
          </ul>
          <ul className="mt-8 flex flex-wrap gap-3">
            {socials
              .filter(([, , href]) => href)
              .map(([Icon, name, href]) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={name}
                    className="group/s relative flex h-16 w-16 items-center justify-center rounded-fuse border border-line-soft bg-white text-heading transition-colors duration-400 hover:border-heading hover:bg-heading hover:text-white"
                  >
                    <Icon />
                    <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-ink px-2 py-1 text-[13px] text-white opacity-0 transition-opacity duration-400 group-hover/s:opacity-100">
                      {name}
                    </span>
                  </a>
                </li>
              ))}
          </ul>
        </Reveal>
      </div>

      <div className="mt-3 rounded-fuse bg-white px-4 pb-8 pt-10 md:px-8 md:pt-24">
        <Reveal
          as="p"
          type="wipe"
          aria-label="Timect"
          className="text-image text-center font-chivo text-[64px] font-black leading-[1] tracking-[.06em] md:text-[150px] xl:text-[240px]"
          style={{ "--text-image": `url(${WORDMARK_IMG})` } as CSSProperties}
        >
          TIMECT
        </Reveal>
        <p className="mt-10 text-center text-[16px] font-medium text-heading md:mt-14">
          «{storefront.quote.text}» <span className="text-muted">— {storefront.quote.author}</span>
        </p>
        <div className="mt-10 grid items-center gap-6 lg:grid-cols-3">
          <p className="flex flex-wrap items-center justify-center gap-3 text-[16px] text-muted lg:justify-start">
            © {new Date().getFullYear()} Timect. All rights reserved.
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="group/t flex h-14 w-[148px] items-center justify-center overflow-hidden rounded-fuse border border-line transition-colors duration-400 hover:border-line-hover"
            >
              <ArrowUp className="h-6 w-6 transition-transform duration-400 group-hover/t:-translate-y-1" />
            </button>
          </div>
          <div className="flex justify-center gap-6 text-[16px] lg:justify-end">
            <Link href="/privacy" className="link-underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="link-underline">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
