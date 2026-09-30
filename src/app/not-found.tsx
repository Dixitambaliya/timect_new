import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageReady from "@/components/PageReady";

export default function NotFound() {
  return (
    <>
      <PageReady />
      <Header />
      <main className="lux-container min-h-[70svh] flex flex-col justify-center py-24">
        <p className="eyebrow text-[var(--champagne)]">404</p>
        <h1 className="display display-lg mt-6 max-w-[14ch]">
          This moment <em>has passed.</em>
        </h1>
        <p className="lede mt-6 text-[var(--muted)]">The page you were looking for is no longer here.</p>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          <Link href="/watches" className="lux-link">
            Explore the collection <span className="lux-arrow" aria-hidden>→</span>
          </Link>
          <Link href="/" className="lux-link text-[var(--muted)]">
            Return home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
