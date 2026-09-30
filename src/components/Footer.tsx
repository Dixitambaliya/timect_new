import Link from "next/link";

const collections = [
  { label: "All Watches", href: "/watches" },
  { label: "New Arrivals", href: "/watches?category=new" },
];

const support = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
];

const company = [
  { label: "About Us", href: "/about" },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v8h4v-8h3l1-4h-4V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.2s0-3.4-.4-5c-.2-.9-.9-1.6-1.8-1.8C17.8 5 12 5 12 5s-5.8 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12.2 2 12.2s0 3.4.4 5c.2.9.9 1.6 1.8 1.8 2 .4 7.8.4 7.8.4s5.8 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-5 .4-5zM10 15.5v-6.6l5.5 3.3-5.5 3.3z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-14 pb-6 px-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-[12px] tracked-sm">
        {/* Brand */}
        <div className="footer-col col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-3 cursor-pointer">
            <img
              src="https://res.cloudinary.com/dphscxzb4/image/upload/v1784048492/timect/timect_logo.png"
              alt="Timect Logo"
              className="h-10 w-10 object-contain rounded-full"
            />
            <span className="serif text-[20px] font-medium tracking-wider">
              Timect
            </span>
          </Link>
          <p className="text-gray-400 leading-relaxed max-w-[200px]">
            Precision wristwatches engineered with care — from movement to case,
            built for lasting craftsmanship.
          </p>
          <div className="flex gap-4 mt-5 text-gray-300">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <IconInstagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <IconFacebook className="h-4 w-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <IconYoutube className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Collections */}
        <div className="footer-col">
          <div className="text-gray-300 mb-4">COLLECTIONS</div>
          <ul className="space-y-2 text-gray-400">
            {collections.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="footer-link hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="footer-col">
          <div className="text-gray-300 mb-4">SUPPORT</div>
          <ul className="space-y-2 text-gray-400">
            {support.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="footer-link hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="footer-col">
          <div className="text-gray-300 mb-4">COMPANY</div>
          <ul className="space-y-2 text-gray-400">
            {company.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="footer-link hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3 mt-12 pt-5 border-t border-gray-800 text-[11px] text-gray-400">
        <span>© {new Date().getFullYear()} Timect. All Rights Reserved.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
