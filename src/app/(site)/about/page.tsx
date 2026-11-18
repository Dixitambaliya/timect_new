/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Ban, Handshake, PackageCheck, Watch } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema, webPageSchema } from "@/lib/seo/structured-data";
import styles from "./about.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "About Timect Watches",
  description: "Discover the people, passion, and attention to detail behind Timect Watches. Thoughtful timepieces and a personal approach to finding your next watch.",
  path: "/about",
  keywords: ["about Timect Watches", "Timect watch brand", "watch design", "Timect official brand"],
});

const CDN = "https://res.cloudinary.com/dphscxzb4/image/upload/f_auto,q_auto";
const watches = [
  `${CDN}/v1784048468/timect/daydate_blue.png`,
  `${CDN}/v1784048487/timect/rose_gents_date.png`,
  `${CDN}/v1784048484/timect/right-main.png`,
  `${CDN}/v1784048481/timect/ladies_gold_tt.png`,
  `${CDN}/v1784048491/timect/rose_ladies.png`,
];
const brands = [
  ["richard-mille", "Richard Mille"], ["patek-philippe", "Patek Philippe"],
  ["audemars-piguet", "Audemars Piguet"], ["rolex", "Rolex"], ["cartier", "Cartier"],
];
const features = [
  { title: "Attention to every detail", text: "Considered design, carefully selected components, and clear specifications for every watch.", icon: BadgeCheck, position: styles.authenticity },
  { title: "Personalized advice", text: "A dedicated team to help you find a watch that fits your style and your everyday life.", icon: Handshake, position: styles.advisory },
  { title: "Confident ownership", text: "Practical product information, watch-care guidance, and support whenever you need it.", icon: Watch, position: styles.ownership },
  { title: "Carefully handled delivery", text: "From our collection to your wrist, your timepiece is packed and handled with care.", icon: PackageCheck, position: styles.delivery },
];

export default function AboutPage() {
  const years = new Date().getFullYear() - 2003;
  return (
    <>
      <JsonLd data={webPageSchema({ name: "About Timect Watches", description: "The people, passion, and attention to detail behind Timect Watches.", path: "/about", type: "AboutPage" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About Timect Watches", path: "/about" }])} />
      <div className={styles.page}>
        <section className={styles.hero} aria-labelledby="about-title">
          <img className={styles.heroImage} src="/images/about/access.webp" alt="A collection of timepieces in a carefully crafted watch case" fetchPriority="high" width={1050} height={1200} />
          <div className={styles.heroShade} />
          <h1 id="about-title" className="reveal-rise">Watch collecting<br />should be seamless, memorable,<br />and tailored to you.</h1>
        </section>

        <div className={`${styles.brands} reveal-fade`} aria-label="Celebrating the world of watchmaking">
          {brands.map(([file, name]) => <img key={file} src={`/images/about/${file}.png`} alt={name} width={190} height={70} />)}
        </div>

        <section className={styles.intro} aria-labelledby="freedom-title">
          <h2 id="freedom-title" className="reveal-rise">Everyday Luxury<br />Watch Freedom</h2>
          <p className="reveal-rise">Whether you’re starting a collection, finding your everyday companion, or choosing a meaningful gift, we bring considered design and a personal approach to every timepiece. <span>Discover watches that make every moment your own.</span></p>
        </section>

        <section className={styles.access} aria-label="A more personal watch experience">
          <div className={`${styles.photo} reveal-rise`}>
            <img src="https://res.cloudinary.com/dphscxzb4/image/upload/v1794995812/Luxury_TIMECT_Chronograph_on_Watch_Catalogue_copy_fvc1jq.webp" alt="Gold Timect chronograph with a finely detailed dial" loading="lazy" width={1000} height={1100} />
          </div>
          <div className={`${styles.accessText} reveal-rise`}>
            <p>Our passion for watches starts with the details. From the shape of a case to the clarity of a dial, we bring together thoughtful design, selected movements, and practical information to make choosing your next watch feel effortless.</p>
            <ul>{["No guesswork", "No unnecessary complexity", "A personal approach, every time"].map(text => <li key={text}><Ban size={25} strokeWidth={1.2} aria-hidden="true" />{text}</li>)}</ul>
          </div>
        </section>

        <section className={styles.difference} aria-labelledby="difference-title">
          <h2 id="difference-title" className="reveal-rise">What<br />sets us apart</h2>
          <div className={styles.features}>
            {features.map(({ title, text, icon: Icon, position }) => <article key={title} className={`${styles.feature} ${position} reveal-rise`}><Icon size={35} strokeWidth={1.1} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}
            <article className={`${styles.exclusive} reveal-rise`}>
              <div className={styles.watchTrio} aria-hidden="true">{watches.slice(0, 3).map((src, i) => <img key={src} src={src} alt="" loading="lazy" className={styles[`trio${i}`]} width={240} height={320} />)}</div>
              <div><h3>A considered collection</h3><p>Distinctive dials, timeless proportions, and timepieces chosen for everyday life.</p><Link href="/watches" className={styles.collectionLink}>Explore our watches <span aria-hidden="true">↗</span></Link></div>
            </article>
          </div>
        </section>

        <section className={styles.story} aria-labelledby="story-title">
          <div className={styles.storyLeft}>
            <div className={`${styles.storyHeading} reveal-rise`}><span>OUR STORY</span><h2 id="story-title">Enthusiasts. Collectors.<br />Entrepreneurs.</h2></div>
            <article className={`${styles.vision} reveal-rise`}><p>We founded Timect with a clear vision—to create considered watches while valuing the significance beyond price.</p><img src="/images/about/globe.png" alt="A globe celebrating the shared international passion for watchmaking" loading="lazy" width={1376} height={1030} /></article>
            <article className={`${styles.experience} reveal-rise`}><strong>{years}<span>+</span></strong><p>Since our founding in 2003, our passion for watch design, craftsmanship, and the details of everyday wear has guided our journey. We believe every purchase should feel informed, intentional, and timeless.</p></article>
          </div>
          <div className={styles.storyRight}>
            <div className={`${styles.wrist} reveal-rise`}><img src="/images/about/detail.jpg" alt="A classic steel wristwatch paired with a crisp white cuff" loading="lazy" width={1400} height={1600} /></div>
            <article className={`${styles.meaning} reveal-rise`}><p>A watch is more than an instrument of time.<br />It represents history, craftsmanship, and personal meaning. It marks an achievement, a gift, a moment that matters. Whether it’s a vintage classic or a modern icon, every timepiece tells a story.</p><div className={styles.timeline} aria-label="A timepiece for every chapter">{watches.map((src, i) => <div key={src} className={`${styles.timelineWatch} ${i % 2 ? styles.above : styles.below}`}><img src={src} alt="" loading="lazy" width={100} height={130} /><span /></div>)}</div></article>
          </div>
        </section>

        <section className={styles.concierge} aria-labelledby="concierge-title">
          <div className={`${styles.conciergeText} reveal-rise`}><h2 id="concierge-title">Need a specific watch?<br />Looking for expert advice?</h2><p>Our team is ready to assist with personal recommendations<br className={styles.desktopBreak} /> and every detail of your watch journey.</p><Link href="/contact" className={styles.contactButton}>CONTACT US <span aria-hidden="true">↗</span></Link></div>
          <img className={styles.conciergeWatch} src={watches[0]} alt="A blue-dial Timect watch with a polished steel bracelet" loading="lazy" width={650} height={780} />
        </section>
      </div>
    </>
  );
}
