import Link from "next/link";
import Image from "next/image";
import { LOGO_SRC } from "@/lib/cloudinary";

const groups = [
  {
    title: "Collections",
    links: [
      { label: "All Watches", href: "/watches" },
      { label: "New Arrivals", href: "/watches?category=new" },
      { label: "For Him", href: "/watches?gender=Men" },
      { label: "For Her", href: "/watches?gender=Women" },
    ],
  },
  {
    title: "Maison",
    links: [
      { label: "About Timect", href: "/about" },
      { label: "Corporate Gifting", href: "/corporate-gifting" },
    ],
  },
  {
    title: "Client Care",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
];

const social = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--noir)] text-[var(--ivory)]" data-header-theme="dark">
      <div className="lux-container pt-24 md:pt-32 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" aria-label="Timect — home" className="inline-block">
              <Image src={LOGO_SRC} alt="Timect" width={1552} height={889} className="h-12 w-auto invert" />
            </Link>
            <p className="display text-[1.9rem] md:text-[2.3rem] leading-[1.1] mt-12 max-w-[22rem]">
              Time never stops, <em>why should we?</em>
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-12">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="eyebrow text-[var(--champagne)] mb-6">{group.title}</h2>
                <ul className="space-y-3.5">
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-[0.9rem] font-light text-[var(--ivory)]/70 hover:text-[var(--ivory)] transition-colors duration-500"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 md:mt-32 pt-8 border-t border-[var(--line-dark)] flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 text-[0.72rem] tracking-[0.12em] text-[var(--muted-dark)]">
          <span>© {new Date().getFullYear()} Timect. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-8 gap-y-3 uppercase tracking-[0.22em] text-[0.65rem]">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--ivory)] transition-colors duration-500"
              >
                {s.label}
              </a>
            ))}
            <Link href="/privacy" className="hover:text-[var(--ivory)] transition-colors duration-500">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--ivory)] transition-colors duration-500">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
