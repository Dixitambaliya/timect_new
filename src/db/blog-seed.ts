import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

// Load env
for (const envFile of [".env.local", ".env"]) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const firstEqual = trimmed.indexOf("=");
        if (firstEqual !== -1) {
          const key = trimmed.substring(0, firstEqual).trim();
          const val = trimmed.substring(firstEqual + 1).trim().replace(/^['"]|['"]$/g, "");
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
    break;
  }
}

const sql = neon(process.env.DATABASE_URL!);

function generateWatchEditorialSvg(title: string, isDark = false, accent = "#D4AF37") {
  const bg = isDark ? "#121316" : "#F7F5EE";
  const caseColor = isDark ? "#282A30" : "#E5E1D5";
  const dialBg = isDark ? "#191B20" : "#FFFFFF";
  const markerColor = isDark ? "#E0D7C6" : "#212224";
  const textColor = isDark ? "#A5A9B8" : "#686763";
  const cleanTitle = title.replace(/[<>&"]/g, " ").substring(0, 42);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <radialGradient id="v" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="100%" stop-color="${isDark ? "#0A0B0D" : "#E2DDD0"}" />
    </radialGradient>
    <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EDEDED" />
      <stop offset="50%" stop-color="#A8A8A8" />
      <stop offset="100%" stop-color="#6E6E6E" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCEFC7" />
      <stop offset="50%" stop-color="${accent}" />
      <stop offset="100%" stop-color="#9C7709" />
    </linearGradient>
    <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="${isDark ? "0.6" : "0.14"}" />
    </filter>
  </defs>
  <rect width="1200" height="800" fill="url(#v)" />
  <circle cx="600" cy="400" r="380" fill="none" stroke="${isDark ? "#ffffff08" : "#00000006"}" stroke-width="1.5" />
  <circle cx="600" cy="400" r="480" fill="none" stroke="${isDark ? "#ffffff05" : "#00000004"}" stroke-width="1.5" />
  <g transform="translate(600, 400)" filter="url(#drop)">
    <rect x="-65" y="-310" width="130" height="150" rx="6" fill="${isDark ? "#1E2024" : "#282624"}" opacity="0.95" />
    <rect x="-65" y="160" width="130" height="150" rx="6" fill="${isDark ? "#1E2024" : "#282624"}" opacity="0.95" />
    <circle cx="0" cy="0" r="185" fill="url(#gold)" />
    <circle cx="0" cy="0" r="176" fill="${caseColor}" />
    <circle cx="0" cy="0" r="162" fill="url(#metal)" />
    <circle cx="0" cy="0" r="158" fill="${dialBg}" />
    <circle cx="0" cy="0" r="148" fill="none" stroke="${markerColor}" stroke-opacity="0.1" stroke-width="1" />
    <circle cx="0" cy="62" r="38" fill="none" stroke="${markerColor}" stroke-opacity="0.2" stroke-width="1.2" />
    <line x1="0" y1="62" x2="16" y2="52" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" />
    <g stroke="${accent}" stroke-width="3" stroke-linecap="round">
      <line x1="0" y1="-146" x2="0" y2="-128" stroke-width="4" />
      <line x1="146" y1="0" x2="128" y2="0" />
      <line x1="0" y1="146" x2="0" y2="128" stroke-width="4" />
      <line x1="-146" y1="0" x2="-128" y2="0" />
      <line x1="73" y1="-126" x2="64" y2="-110" stroke-width="2" />
      <line x1="126" y1="-73" x2="110" y2="-64" stroke-width="2" />
      <line x1="126" y1="73" x2="110" y2="64" stroke-width="2" />
      <line x1="73" y1="126" x2="64" y2="110" stroke-width="2" />
      <line x1="-73" y1="126" x2="-64" y2="110" stroke-width="2" />
      <line x1="-126" y1="73" x2="-110" y2="64" stroke-width="2" />
      <line x1="-126" y1="-73" x2="-110" y2="-64" stroke-width="2" />
      <line x1="-73" y1="-126" x2="-64" y2="-110" stroke-width="2" />
    </g>
    <text x="0" y="-62" text-anchor="middle" font-family="'Cinzel', serif" font-size="14" font-weight="700" letter-spacing="4" fill="${markerColor}">TIMECT</text>
    <text x="0" y="-48" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="600" letter-spacing="2" fill="${textColor}">CHRONOMETER</text>
    <text x="0" y="118" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="500" letter-spacing="1.5" fill="${textColor}">AUTOMATIC 28,800 VPH</text>
    <g transform="rotate(-38)">
      <polygon points="-4,15 0,-105 4,15" fill="${markerColor}" opacity="0.9" />
    </g>
    <g transform="rotate(72)">
      <polygon points="-3,15 0,-138 3,15" fill="${markerColor}" opacity="0.9" />
    </g>
    <g transform="rotate(145)">
      <line x1="0" y1="28" x2="0" y2="-152" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="0" cy="0" r="5" fill="${accent}" />
    </g>
    <rect x="185" y="-18" width="14" height="36" rx="3" fill="url(#gold)" />
  </g>
  <g transform="translate(60, 750)">
    <text x="0" y="0" font-family="'Cinzel', serif" font-size="11" font-weight="600" letter-spacing="3" fill="${accent}">TIMECT JOURNAL</text>
    <text x="0" y="20" font-family="sans-serif" font-size="13" font-weight="500" letter-spacing="0.5" fill="${textColor}">${cleanTitle}</text>
  </g>
</svg>`;
}

export async function seedBlogDatabase() {
  console.log("Seeding Watch Journal database with 30 authoritative articles...");

  // 1. Authors
  const authorsData = [
    {
      name: "Marcus Vance",
      slug: "marcus-vance",
      bio: "Senior Horological Editor and movement specialist with over 15 years analyzing Swiss and German calibres.",
      designation: "Editor-in-Chief & Horology Specialist",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
      socialLinks: { twitter: "https://twitter.com/timect", linkedin: "https://linkedin.com/company/timect" },
    },
    {
      name: "Helena Rostova",
      slug: "helena-rostova",
      bio: "Luxury watch curator specializing in vintage chronographs, dial preservation, and emerging independent manufactures.",
      designation: "Senior Features Editor",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80",
      socialLinks: { instagram: "https://instagram.com/timect" },
    },
    {
      name: "Devon Aris",
      slug: "devon-aris",
      bio: "Material engineer and watch collector exploring metallurgical innovations, sapphire synthesis, and titanium finishing.",
      designation: "Technical Editor",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
      socialLinks: { twitter: "https://twitter.com/timect" },
    },
  ];

  const authorIds: Record<string, number> = {};
  for (const a of authorsData) {
    const res = await sql`
      INSERT INTO blog_authors (name, slug, bio, designation, avatar_url, social_links)
      VALUES (${a.name}, ${a.slug}, ${a.bio}, ${a.designation}, ${a.avatarUrl}, ${JSON.stringify(a.socialLinks)}::jsonb)
      ON CONFLICT (slug) DO UPDATE SET bio = EXCLUDED.bio, designation = EXCLUDED.designation
      RETURNING id, slug
    `;
    authorIds[res[0].slug] = res[0].id;
  }
  console.log("✓ Seeded authors:", Object.keys(authorIds).length);

  // 2. Categories
  const categoriesData = [
    { name: "Buying Guides", slug: "buying-guides", description: "Comprehensive, unbiased recommendations for choosing watches by lifestyle, budget, and complication." },
    { name: "Watch Knowledge", slug: "watch-knowledge", description: "Deep educational primers on movements, complications, escapements, and horological mechanics." },
    { name: "Watch Reviews", slug: "watch-reviews", description: "Hands-on editorial assessments, ergonomic analysis, and chronometric testing." },
    { name: "Mechanical & Automatic", slug: "mechanical-and-automatic", description: "Exploring self-winding rotors, manual-wind barrels, and mechanical engineering traditions." },
    { name: "Materials & Craftsmanship", slug: "materials-and-craftsmanship", description: "An in-depth study of case metallurgy, sapphire crystals, ceramic bezels, and guilloché dials." },
    { name: "Collecting & Preservation", slug: "collecting-and-preservation", description: "Curator perspectives on value retention, servicing schedules, storage, and building a cohesive collection." },
  ];

  const categoryIds: Record<string, number> = {};
  for (let i = 0; i < categoriesData.length; i++) {
    const c = categoriesData[i];
    const res = await sql`
      INSERT INTO blog_categories (name, slug, description, sort_order)
      VALUES (${c.name}, ${c.slug}, ${c.description}, ${i})
      ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
      RETURNING id, slug
    `;
    categoryIds[res[0].slug] = res[0].id;
  }
  console.log("✓ Seeded categories:", Object.keys(categoryIds).length);

  // 3. Tags
  const tagsData = [
    { name: "Automatic", slug: "automatic" },
    { name: "Chronograph", slug: "chronograph" },
    { name: "Sapphire Crystal", slug: "sapphire-crystal" },
    { name: "Dress Watch", slug: "dress-watch" },
    { name: "Divers Watch", slug: "divers-watch" },
    { name: "Heritage", slug: "heritage" },
    { name: "Movement", slug: "movement" },
    { name: "Horology", slug: "horology" },
  ];

  const tagIds: Record<string, number> = {};
  for (const t of tagsData) {
    const res = await sql`
      INSERT INTO blog_tags (name, slug)
      VALUES (${t.name}, ${t.slug})
      ON CONFLICT (slug) DO NOTHING
      RETURNING id, slug
    `;
    if (res.length) tagIds[res[0].slug] = res[0].id;
  }

  // 4. 30 Comprehensive Original Articles
  const articles = [
    {
      title: "How to Choose Your First Automatic Watch: The Collector's Blueprint",
      slug: "how-to-choose-your-first-automatic-watch",
      subtitle: "A practical guide to movement architecture, case proportions, and enduring value.",
      category: "buying-guides",
      author: "marcus-vance",
      isFeatured: true,
      isTrending: true,
      readTime: 7,
      focusKeyword: "first automatic watch",
      directAnswer: "Choosing your first automatic watch comes down to three crucial parameters: movement reliability (such as a high-beat 28,800 vph caliber with 40+ hours power reserve), wearable proportions (typically 38mm–41mm diameter and under 12.5mm thickness), and durable materials like 316L stainless steel and scratch-resistant sapphire crystal.",
      excerpt: "Stepping into mechanical horology is an exhilarating journey. Here is everything you need to know about caliber architecture, case dimensions, and daily ergonomics before buying your first self-winding timepiece.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          Choosing your first automatic watch comes down to three crucial parameters: movement reliability, wearable proportions, and durable materials like 316L stainless steel and scratch-resistant sapphire crystal.
        </p>
        <h2 id="understanding-automatic-movements" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">1. Understanding the Self-Winding Caliber</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Unlike quartz timepieces powered by silver-oxide batteries, an automatic watch harnesses kinetic energy from natural wrist movements. A weighted semicircular rotor swings freely, winding the mainspring coiled tightly within the barrel. Look for a movement that beats at 21,600 or 28,800 vibrations per hour (vph), providing a smooth sweeping seconds hand and reliable chronometry.</p>
        <h2 id="dimensions-and-ergonomics" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">2. Case Dimensions & Lug-to-Lug Distance</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Case diameter only tells half the story. The lug-to-lug distance—the vertical measurement from top horn to bottom horn—dictates whether a watch will overhang your wrist. A 40mm watch with 47mm lug-to-lug wears comfortably on almost all wrist circumferences between 6.25 and 7.5 inches.</p>
        <div class="my-8 rounded-fuse bg-bg/80 border border-line p-6">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Key Takeaways for First-Time Buyers</h3>
          <ul class="list-disc pl-5 space-y-2 text-ink/80 text-sm">
            <li>Insist on sapphire crystal with anti-reflective coating on the underside.</li>
            <li>Look for water resistance of at least 50m (5 ATM) for safe daily washing.</li>
            <li>Choose a versatile dial palette (matte black, sunburst silver, or deep navy).</li>
          </ul>
        </div>
        <h2 id="maintenance-and-ownership" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">3. Long-Term Ownership and Servicing</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">A well-engineered mechanical watch does not become obsolete. With preventative service intervals every 4 to 6 years—refreshing synthetic lubricants and water gaskets—an automatic timepiece will outlive digital smartwatches by generations.</p>
      `,
      faqs: [
        { question: "How often does an automatic watch need winding?", answer: "If worn daily for 8-10 hours, wrist motion keeps it fully wound. If left untouched past its power reserve (typically 38 to 48 hours), gently wind the crown 20 to 30 turns to kickstart the balance wheel." },
        { question: "Can I wear an automatic watch while playing sports?", answer: "Light sports and swimming are fine if rated for 100m water resistance, but avoid heavy high-impact vibrations such as golfing or operating jackhammers to protect the balance staff." },
      ],
    },
    {
      title: "Automatic vs Quartz Watches: The Engineering, Soul, and Truth",
      slug: "automatic-vs-quartz-watches",
      subtitle: "Comparing kinetic mechanical escapements against battery-driven quartz oscillators.",
      category: "mechanical-and-automatic",
      author: "marcus-vance",
      isFeatured: true,
      isTrending: true,
      readTime: 6,
      focusKeyword: "automatic vs quartz",
      directAnswer: "The key difference between automatic and quartz watches is their power source and regulation: automatic watches are mechanical machines powered by a mainspring and regulated by a balance wheel with a sweeping seconds hand, while quartz watches are battery-powered, regulated by an electronic quartz crystal, and tick once per second with superior numerical accuracy.",
      excerpt: "While quartz delivers pinpoint electronic accuracy, automatic horology offers a living mechanical pulse. We analyze their mechanisms, maintenance, lifespan, and collector appeal.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          The difference between automatic and quartz watches is not merely battery versus spring—it is an ideological divide between micro-mechanical soul and electronic quartz oscillation.
        </p>
        <h2 id="how-they-differ" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">Direct Comparison: Mechanics vs Electronics</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">A quartz watch utilizes a synthetic quartz crystal tuning fork vibrating at 32,768 Hz when stimulated by electrical voltage. A stepping motor translates this into a distinct once-per-second jump. In contrast, an automatic watch uses a coiled mainspring releasing tension through an escapement and balance wheel, producing between 6 and 8 micro-beats every single second.</p>
        <div class="my-8 overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="border-b border-line text-muted">
                <th class="py-3 px-4 font-semibold uppercase tracking-wider">Feature</th>
                <th class="py-3 px-4 font-semibold uppercase tracking-wider">Automatic Watch</th>
                <th class="py-3 px-4 font-semibold uppercase tracking-wider">Quartz Watch</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/60 text-ink/80">
              <tr><td class="py-3 px-4 font-medium">Power Source</td><td class="py-3 px-4">Kinetic wrist motion / Mainspring</td><td class="py-3 px-4">Silver-oxide Battery</td></tr>
              <tr><td class="py-3 px-4 font-medium">Seconds Hand Motion</td><td class="py-3 px-4">Continuous smooth sweep (6-8 beats/sec)</td><td class="py-3 px-4">Single tick per second</td></tr>
              <tr><td class="py-3 px-4 font-medium">Accuracy</td><td class="py-3 px-4">+/- 5 to 15 seconds per day</td><td class="py-3 px-4">+/- 15 seconds per month</td></tr>
              <tr><td class="py-3 px-4 font-medium">Service Lifespan</td><td class="py-3 px-4">Generations (100+ years repairable)</td><td class="py-3 px-4">15 to 30 years (circuit dependent)</td></tr>
            </tbody>
          </table>
        </div>
        <h2 id="why-collectors-prefer-automatic" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">Why Enthusiasts Cherish Mechanical Calibers</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Mechanical calibers represent centuries of horological heritage. Wearing an automatic watch connects you directly to the centuries-old lineage of watchmakers who conquered navigation and astronomical observation using pure gears and springs.</p>
      `,
      faqs: [
        { question: "Is an automatic watch more expensive to maintain?", answer: "Yes, an automatic watch requires mechanical overhaul every 4-6 years, whereas a quartz watch usually only requires periodic battery replacements." },
      ],
    },
    {
      title: "Sapphire Crystal vs Mineral Glass: The Ultimate Crystal Guide",
      slug: "sapphire-crystal-vs-mineral-glass",
      subtitle: "Why synthetic corundum crystal is the defining hallmark of true luxury watches.",
      category: "materials-and-craftsmanship",
      author: "devon-aris",
      isFeatured: false,
      isTrending: true,
      readTime: 5,
      focusKeyword: "sapphire crystal vs mineral",
      directAnswer: "Sapphire crystal is made of synthetic corundum with a Mohs hardness of 9 (second only to diamond), making it virtually scratch-proof in everyday wear, whereas mineral glass has a hardness rating of 5 to 6 and is significantly more prone to hairline scratches and scuffs over time.",
      excerpt: "When investing in a quality watch, the crystal protects the dial's beauty. We compare sapphire crystal, mineral glass, and acrylic plexiglass across hardness, optics, and impact resistance.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          Synthetic sapphire crystal is rated at 9 on the Mohs hardness scale—meaning only diamond or silicon carbide can scratch its surface during typical daily life.
        </p>
        <h2 id="crystal-hardness" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">The Science of Synthetic Corundum</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Produced via the Verneuil process by crystallizing aluminum oxide at temperatures exceeding 2,000°C, sapphire crystals offer crystalline clarity and impenetrable scratch resistance. In contrast, mineral glass is heat-tempered silicate glass. While cost-effective, mineral glass inevitably accumulates visible swirls from contact with desks, keys, and doorframes.</p>
        <h2 id="anti-reflective-coatings" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">Anti-Reflective (AR) Treatments</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Because raw sapphire has a higher refractive index than glass, premium watches apply anti-reflective coatings. The best practice is inner-side AR application, which preserves crystal durability without risking exterior coating scratches.</p>
      `,
      faqs: [
        { question: "Can sapphire crystal shatter?", answer: "While sapphire is extremely scratch-resistant due to hardness, hard direct blunt impact against granite or ceramic tiles can shatter it. For normal wrist wear, however, it is virtually indestructible." },
      ],
    },
    {
      title: "What Makes a Luxury Watch Expensive? Unveiling Horological Value",
      slug: "what-makes-a-luxury-watch-expensive",
      subtitle: "From hand-beveled anglage to proprietary metallurgy: where the cost truly goes.",
      category: "watch-knowledge",
      author: "helena-rostova",
      isFeatured: true,
      isTrending: false,
      readTime: 8,
      focusKeyword: "what makes a luxury watch expensive",
      directAnswer: "A luxury watch commands premium value due to six distinct factors: hand-applied decorative finishing (anglage, perlage, black polishing), in-house caliber engineering and regulation, high-grade metals (316L/904L steel, titanium, precious gold alloys), strict quality tolerances, limited production volume, and enduring brand heritage.",
      excerpt: "Beyond marketing and prestige, discover the microscopic hand-finishing, chronometric regulation, and proprietary metallurgy that elevate high horology into wearable art.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          The cost of a luxury timepiece is justified under high magnification. Where mass-market watches rely on stamped components, haute horlogerie demands hundreds of hours of artisanal human finishing.
        </p>
        <h2 id="artisanal-finishing" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">1. Hand Finishing: Anglage, Perlage & Black Polish</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Anglage involves beveling the sharp 90-degree edges of steel bridges by hand using diamond paste and gentian wood pegs until they achieve a 45-degree mirror polish. Black polishing (polissage bloqué) is so flat that light reflects in only one direction, appearing pitch black from any other angle.</p>
        <h2 id="tolerances-and-materials" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">2. Microscopic Tolerances and Materials</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Movement components operate within tolerances measured in microns (thousandths of a millimeter). High-grade hairsprings made from non-magnetic alloys ensure isochronism regardless of temperature variations or magnetic fields.</p>
      `,
      faqs: [
        { question: "Do luxury watches hold their value?", answer: "Certain iconic models maintain or appreciate in value, but watches should primarily be purchased for emotional resonance, mechanical admiration, and daily pleasure rather than pure speculation." },
      ],
    },
    {
      title: "Understanding Watch Water Resistance: From 30m to 300m Explained",
      slug: "understanding-watch-water-resistance",
      subtitle: "Why a 30m water-resistant watch is not meant for 30-meter deep diving.",
      category: "watch-knowledge",
      author: "devon-aris",
      isFeatured: false,
      isTrending: true,
      readTime: 5,
      focusKeyword: "watch water resistance explained",
      directAnswer: "Watch water resistance ratings indicate static laboratory pressure, not dynamic depth. A 30m (3 ATM) watch is splash-resistant only; 50m (5 ATM) handles dishwashing and showers; 100m (10 ATM) is safe for swimming and snorkeling; and 200m–300m with a screw-down crown is required for scuba diving.",
      excerpt: "Static bar pressure tests differ vastly from swimming motion. Here is your definitive guide to screw-down crowns, rubber O-ring gaskets, and real-world water ratings.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          A common misconception among watch owners is assuming a 30m water resistance rating permits swimming at 30 meters depth. In reality, depth ratings measure static laboratory pressure.
        </p>
        <h2 id="water-resistance-breakdown" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">The Water Resistance Hierarchy</h2>
        <ul class="space-y-3 mb-6 text-ink/80">
          <li><strong>30m (3 ATM / 3 Bar):</strong> Splash resistant. Safe for light rain or handwashing. Do not submerge.</li>
          <li><strong>50m (5 ATM / 5 Bar):</strong> Safe for brief surface submersion, sink washing, and shallow water exposure.</li>
          <li><strong>100m (10 ATM / 10 Bar):</strong> True sports versatility. Safe for swimming pools, lakes, and snorkeling.</li>
          <li><strong>200m+ (20 ATM+):</strong> Certified dive watch specification. Incorporates screw-down crowns and helium escape valves.</li>
        </ul>
        <h2 id="screw-down-crowns" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">The Role of the Screw-Down Crown</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">A screw-down crown compresses an internal synthetic rubber gasket firmly against the case tube, preventing water ingress under dynamic water pressure. Always ensure the crown is threaded tight before entering water.</p>
      `,
      faqs: [
        { question: "Can I wear my watch into a hot sauna or jacuzzi?", answer: "No. Extreme steam and rapid temperature changes cause metal components to expand at different rates, potentially letting moisture bypass rubber gaskets and fogging the crystal." },
      ],
    },
    {
      title: "What is a Chronograph? How Stopwatch Complications Function",
      slug: "what-is-a-chronograph-watch",
      subtitle: "A detailed breakdown of column wheels, horizontal clutches, and register subdials.",
      category: "watch-knowledge",
      author: "marcus-vance",
      isFeatured: false,
      isTrending: true,
      readTime: 7,
      focusKeyword: "what is a chronograph",
      directAnswer: "A chronograph is a timepiece equipped with an independent stopwatch complication operable via pushers, allowing the wearer to measure elapsed intervals of seconds, minutes, and hours without interrupting standard timekeeping.",
      excerpt: "From motorsport tachymeters to column-wheel architecture, explore the mechanical complexity behind horology's most beloved complication.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          The chronograph is arguably the most interactive mechanical complication in watchmaking, transforming a wrist instrument into an active timing device.
        </p>
        <h2 id="column-wheel-vs-cam" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">Column Wheel vs Cam-Actuated Chronographs</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Traditional luxury chronographs feature a machined column wheel resembling a castle turret. It provides crisp, buttery pusher resistance. Cam-actuated systems, popularized by movements like the Valjoux 7750, utilize stamped levers for robust, reliable operation at accessible price points.</p>
      `,
      faqs: [
        { question: "Can I leave the chronograph running continuously?", answer: "On a vertical clutch chronograph, continuous running causes negligible wear. On a traditional lateral/horizontal clutch mechanism, leaving it running continuously can increase friction and accelerate gear tooth wear." },
      ],
    },
    {
      title: "Dress Watches vs Sports Watches: Style Codes and Occasion Etiquette",
      slug: "dress-watches-vs-sports-watches",
      subtitle: "Navigating tuxedo cuffs, boardroom meetings, and weekend adventures.",
      category: "buying-guides",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: false,
      readTime: 6,
      focusKeyword: "dress watch vs sports watch",
      directAnswer: "A classic dress watch is defined by slim proportions (under 10mm), minimal clutter, precious metals or polished steel, and a leather strap designed to slide effortlessly beneath a dress cuff. A sports watch features robust water resistance (100m+), luminescent hands, rotating bezels or metal bracelets, and shock-resistant cases.",
      excerpt: "Decoding the sartorial boundaries between understated two-hand dress elegance and all-terrain steel sports timepieces.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          While modern fashion permits steel sports watches with tailored suits, understanding traditional horological etiquette ensures your watch harmonizes with every dress code.
        </p>
        <h2 id="the-anatomy-of-a-dress-watch" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">The Classic Dress Watch</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">A traditional dress watch exercises restraint. Devoid of date windows or luminous paint, it features clean hour batons, leaf hands, and an alligator or fine calfskin strap matched to your leather shoes and belt.</p>
      `,
      faqs: [
        { question: "Can a sports watch be worn with a suit?", answer: "Yes, modern steel sports watches with integrated bracelets or restrained dials (such as sub-40mm dive watches) are widely accepted in business casual and contemporary formal wear." },
      ],
    },
    {
      title: "Watch Case Materials: Steel, Titanium, Bronze, and Gold Compared",
      slug: "guide-to-watch-case-materials",
      subtitle: "Metallurgical characteristics, corrosion resistance, and patina evolution.",
      category: "materials-and-craftsmanship",
      author: "devon-aris",
      isFeatured: false,
      isTrending: false,
      readTime: 7,
      focusKeyword: "watch case materials",
      directAnswer: "The most popular watch case materials are 316L stainless steel (the industry benchmark for durability and polishability), Grade 5 titanium (40% lighter, hypoallergenic, and scratch-resistant), bronze (which develops an organic unique patina over time), and solid gold alloys (cherished for timeless warmth and prestige).",
      excerpt: "Every case metal interacts uniquely with skin, ocean salt, and time. We analyze the tensile strength, weight, and aesthetics of modern case alloys.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          The metal wrapping around a mechanical caliber dictates its physical weight, wrist presence, and tactile experience.
        </p>
        <h2 id="stainless-steel" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">316L and 904L Stainless Steel</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Austenitic 316L stainless steel contains molybdenum, giving it exceptional resistance to chlorides like ocean water and perspiration. It finishes brilliantly with brushed satin or high mirror polish.</p>
        <h2 id="titanium" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">Grade 2 vs Grade 5 Titanium</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Grade 5 titanium is an aerospace alloy infused with aluminum and vanadium. It can be mirror-polished and possesses a tensile strength superior to mild steel while reducing total watch weight by nearly half.</p>
      `,
      faqs: [
        { question: "Does bronze turn your skin green?", answer: "When raw bronze reacts with sweat, copper carbonate oxidizes on the surface. Quality bronze watches feature hypoallergenic titanium or steel casebacks to shield your skin from direct contact." },
      ],
    },
    {
      title: "How to Maintain and Care for an Automatic Watch",
      slug: "how-to-maintain-an-automatic-watch",
      subtitle: "Essential daily habits to protect gear trains, escapements, and water gaskets.",
      category: "collecting-and-preservation",
      author: "marcus-vance",
      isFeatured: false,
      isTrending: true,
      readTime: 5,
      focusKeyword: "how to care for automatic watch",
      directAnswer: "Maintaining an automatic watch requires keeping it away from strong magnets (laptops, speakers), cleaning the case periodically with a microfiber cloth and warm water, never adjusting the quickset date between 9 PM and 3 AM, and having gaskets pressure-tested every 2 years.",
      excerpt: "Avoid costly service bills with these fundamental horological care rules. Learn the danger zone for date-setting and how to store your timepieces properly.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          A fine mechanical watch is engineered to last for generations, but simple daily mistakes—like changing the date at midnight—can cause avoidable mechanical damage.
        </p>
        <h2 id="the-midnight-danger-zone" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">1. The 9 PM to 3 AM Date-Setting Rule</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">During late evening hours, the movement's date change wheel actively engages the teeth of the date disc. Using the crown's quickset date during this window can shear the delicate gear teeth. Always advance the hands to 6:30 before adjusting the calendar.</p>
        <h2 id="magnetism-and-demagnetization" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">2. Shielding from Magnetic Fields</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">Modern laptops, iPad covers, and phone cases contain neodymium magnets. If a balance spring becomes magnetized, coils stick together and the watch runs fast by minutes or hours per day. A simple handheld demagnetizer can instantly restore its beat.</p>
      `,
      faqs: [
        { question: "Do I need a watch winder when not wearing my watch?", answer: "Watch winders are convenient for complex perpetual calendars, but for simple three-hand watches, letting the movement rest unpowered causes zero harm." },
      ],
    },
    {
      title: "What is a GMT Watch? Dual-Time Horology for Frequent Travelers",
      slug: "what-is-a-gmt-watch",
      subtitle: "The origins of Greenwich Mean Time bezels and how caller vs flyer GMTs differ.",
      category: "watch-knowledge",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: true,
      readTime: 6,
      focusKeyword: "what is a gmt watch",
      directAnswer: "A GMT watch features an auxiliary 24-hour hand and a 24-hour bezel, allowing the wearer to track two or three distinct time zones simultaneously. Originally designed for transatlantic aviation pilots in the 1950s, GMT watches remain the quintessential complication for world travelers.",
      excerpt: "Track local time and home time in a single glance. Discover the mechanical ingenuity of 'True' Flyer GMTs versus Office Caller GMT movements.",
      html: `
        <p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">
          Conceived during the advent of the jet age, the GMT watch solved aviation's biggest challenge: coordinating local destination time with Greenwich Mean Time reference coordinates.
        </p>
        <h2 id="flyer-vs-caller" class="text-2xl font-serif font-bold text-ink mt-8 mb-4">True Flyer GMT vs Office Caller GMT</h2>
        <p class="mb-4 text-ink/80 leading-relaxed">A 'Flyer' or true traveler GMT allows the main 12-hour hand to jump independently backwards or forwards in one-hour increments without stopping the seconds hand. A 'Caller' or office GMT jumps the 24-hour hand instead, perfect for tracking overseas colleagues from your home desk.</p>
      `,
      faqs: [
        { question: "How do you read a GMT watch bezel?", answer: "The 24-hour hand points to numbers on the rotating outer bezel. Top 12 represents noon (12:00 PM), while 24 at the crown represents midnight (00:00)." },
      ],
    },
    // Adding 20 more distinct topics to reach 30 complete articles:
    {
      title: "The Anatomy of a Watch Dial: Guilloché, Enamel, and Sunburst Finishes",
      slug: "understanding-watch-dial-finishes",
      subtitle: "How master dial artisans transform metal blanks into horological masterpieces.",
      category: "materials-and-craftsmanship",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: false,
      readTime: 6,
      focusKeyword: "watch dial finishes",
      directAnswer: "A watch dial is the visual interface of horology, finished using traditional techniques like engine-turned Guilloché, fired Grand Feu enamel, brushing for sunburst textures, or electroplating for rich galvanic tones.",
      excerpt: "Explore the painstaking art of Grand Feu vitreous enamel, engine-turned guilloché rose engines, and luminous Super-LumiNova application.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">The dial is the face through which a timepiece expresses its personality and artisanal distinction.</p><h2 class="text-2xl font-serif font-bold text-ink mt-8 mb-4">Grand Feu Enamel</h2><p class="mb-4 text-ink/80">Fired in kilns at over 800 degrees Celsius, genuine enamel dials will never fade or oxidize over centuries of exposure to sunlight.</p>`,
      faqs: [{ question: "Why are enamel dials rare?", answer: "Due to high failure rates during kiln cooling where cracks can ruin hours of work." }],
    },
    {
      title: "How to Measure Wrist Size and Choose the Perfect Watch Proportions",
      slug: "how-to-measure-wrist-size-watch-fit",
      subtitle: "The relationship between lug-to-lug, wrist span, and case diameter.",
      category: "buying-guides",
      author: "devon-aris",
      isFeatured: false,
      isTrending: false,
      readTime: 5,
      focusKeyword: "watch sizing and wrist fit",
      directAnswer: "To measure your wrist, wrap a flexible tailor's tape just behind your wrist bone. If your wrist is under 6.5 inches, opt for 36mm–39mm cases with under 46mm lug-to-lug; for 6.5–7.5 inches, 39mm–42mm fits naturally; and for wrists above 7.5 inches, 42mm–45mm wears proportionally.",
      excerpt: "Avoid oversized cases that overhang your wrist. Learn the mathematics of wrist-top surface area and ergonomic lug curvature.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">A watch should flatter your wrist anatomy, not overwhelm it.</p><h2 class="text-2xl font-serif font-bold text-ink mt-8 mb-4">The Importance of Lug Curvature</h2><p class="mb-4 text-ink/80">Lugs that slope downward embrace the wrist bone, allowing larger cases to wear comfortably on smaller wrists.</p>`,
      faqs: [{ question: "Does dial opening affect visual size?", answer: "Yes, watches with thin bezels (like dress watches) visually appear 2mm larger than dive watches of the same case diameter." }],
    },
    {
      title: "The Evolution of Watch Lume: From Radium and Tritium to Super-LumiNova",
      slug: "watch-lume-history-radium-super-luminova",
      subtitle: "From radioactive isotopes to photoluminescent strontium aluminate compounds.",
      category: "watch-knowledge",
      author: "devon-aris",
      isFeatured: false,
      isTrending: false,
      readTime: 6,
      focusKeyword: "watch lume history",
      directAnswer: "Watch luminescence evolved from radioactive radium (used until the 1960s) to low-radiation tritium (until the late 1990s), to modern non-radioactive photoluminescent pigments like Super-LumiNova (strontium aluminate) which charge under light and glow safely for hours.",
      excerpt: "How watchmakers illuminated dials in the dark across a century of military and underwater horology.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">Modern Super-LumiNova operates like a light battery, absorbing UV photons and releasing green or blue luminescence without any radiation hazard.</p>`,
      faqs: [{ question: "Does Super-LumiNova ever degrade?", answer: "Unlike tritium which has a 12.3 year half-life, Super-LumiNova pigments can be recharged indefinitely without losing capacity if kept dry." }],
    },
    {
      title: "Understanding Watch Complications: From Date Windows to Perpetual Calendars",
      slug: "understanding-watch-complications",
      subtitle: "A hierarchy of mechanical complexity, from simple dates to minute repeaters.",
      category: "watch-knowledge",
      author: "marcus-vance",
      isFeatured: false,
      isTrending: false,
      readTime: 7,
      focusKeyword: "watch complications guide",
      directAnswer: "In horology, a complication is any function on a mechanical watch beyond simple hours, minutes, and seconds. Major complications include chronographs, GMT dual-time displays, power reserve indicators, moon phases, annual calendars, perpetual calendars, and chiming minute repeaters.",
      excerpt: "Explore the engineering feats that push micro-mechanical gears to calculate leap years and strike cathedral chimes.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">A perpetual calendar accounts for 30- and 31-day months as well as leap years, requiring zero manual adjustment until the secular year 2100.</p>`,
      faqs: [{ question: "What is a Grand Complication?", answer: "A grand complication watch traditionally combines at least three distinct high complications: a timing mechanism (chronograph), an astronomical display (perpetual calendar), and a chiming mechanism (minute repeater)." }],
    },
    {
      title: "Leather, Steel, Rubber, or NATO? Choosing the Right Watch Strap",
      slug: "how-to-choose-the-right-watch-strap",
      subtitle: "How changing a strap completely transforms the versatility of your timepiece.",
      category: "buying-guides",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: false,
      readTime: 5,
      focusKeyword: "watch strap guide",
      directAnswer: "Choosing a strap depends on use: stainless steel bracelets offer maximum all-weather durability; fine calfskin or alligator leather suits formal and business attire; FKM vulcanized rubber is ideal for aquatic sports; and woven NATO nylon straps provide rugged military charm and fail-safe security.",
      excerpt: "A single watch can play multiple sartorial roles simply by swapping its bracelet for leather, rubber, or woven nylon.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">Learning to change straps using a spring bar tool unlocks exponential versatility from your watch collection.</p>`,
      faqs: [{ question: "What is FKM rubber?", answer: "Fluoroelastomer rubber (FKM) is a high-grade synthetic rubber that resists sweat, saltwater, UV rays, and dust without cracking or attracting lint." }],
    },
    {
      title: "Why Swiss, German, and Japanese Watchmaking Excel in Unique Ways",
      slug: "swiss-german-japanese-watchmaking-compared",
      subtitle: "Contrasting Genevan elegance, Glashütte precision, and Japanese high-tech mastery.",
      category: "watch-knowledge",
      author: "marcus-vance",
      isFeatured: false,
      isTrending: false,
      readTime: 8,
      focusKeyword: "swiss vs german vs japanese watches",
      directAnswer: "Swiss watchmaking is celebrated for classical finishing, centuries of continuous prestige, and the Geneva Seal; German watchmaking (centered in Glashütte) is known for three-quarter plates, untreated German silver, and screw-mounted gold chatons; while Japanese horology excels in vertical integration, high-beat calibers, and Spring Drive precision.",
      excerpt: "Discover how national philosophies shape movement architecture, finishing techniques, and chronometric philosophies.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">Each horological center brings its own distinctive philosophy to the art of measuring time.</p>`,
      faqs: [{ question: "What is untreated German silver?", answer: "German silver (maillechort) is an alloy of copper, zinc, and nickel that develops a warm golden-honey patina over decades rather than requiring rhodium plating." }],
    },
    {
      title: "The Rise of Microbrand Watches: Innovation, Passion, and Accessible Horology",
      slug: "the-rise-of-microbrand-watches",
      subtitle: "How enthusiast-driven independent brands are challenging heritage Swiss giants.",
      category: "watch-reviews",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: true,
      readTime: 6,
      focusKeyword: "microbrand watches",
      directAnswer: "Microbrands are independent boutique watch companies founded by enthusiasts that produce limited production runs directly to consumers. By eliminating distributor margins and luxury boutique overhead, microbrands deliver premium specifications—such as sapphire crystals, ceramic inserts, and regulated movements—at exceptional value.",
      excerpt: "Direct-to-consumer models and horological passion have catalyzed a vibrant renaissance of inventive watch design.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">Microbrands have democratized luxury specifications that previously were reserved for four-figure luxury timepieces.</p>`,
      faqs: [{ question: "Are microbrand watches reliable?", answer: "Yes, most microbrands rely on workhorse calibers from Miyota, Seiko, or Sellita that can be serviced affordably by any independent watchmaker worldwide." }],
    },
    {
      title: "The Art of Mechanical Watch Regulation: Beats, Errors, and Isochronism",
      slug: "mechanical-watch-regulation-isochronism",
      subtitle: "How watchmakers adjust index pins, free-sprung balances, and positions.",
      category: "watch-knowledge",
      author: "devon-aris",
      isFeatured: false,
      isTrending: false,
      readTime: 7,
      focusKeyword: "watch regulation isochronism",
      directAnswer: "Watch regulation involves adjusting the active length or inertia of the balance hairspring to ensure the movement keeps consistent time across different spatial positions (dial up, crown down, etc.) and temperature fluctuations.",
      excerpt: "Deep dive into timegrapher readings, lift angles, amplitude, beat error, and free-sprung balance architectures.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">A timegrapher listens to the acoustic tick of the escapement pallet stones to diagnose mechanical health in real time.</p>`,
      faqs: [{ question: "What is healthy balance amplitude?", answer: "A healthy mechanical movement typically displays an amplitude between 270 and 315 degrees when fully wound in horizontal positions." }],
    },
    {
      title: "Building a Three-Watch Collection: The Dress, Everyday, and Sports Trio",
      slug: "three-watch-collection-guide",
      subtitle: "A balanced framework to cover every occasion without unnecessary redundancy.",
      category: "buying-guides",
      author: "marcus-vance",
      isFeatured: true,
      isTrending: false,
      readTime: 6,
      focusKeyword: "three watch collection",
      directAnswer: "A curated three-watch collection consists of: 1) A rugged Sports/Diver watch for water activities and weekend wear; 2) A versatile 'GADA' (Go Anywhere, Do Anything) everyday steel watch on a bracelet; and 3) An understated dress watch on leather for formal occasions and celebrations.",
      excerpt: "Why owning fewer, higher-quality timepieces often brings greater collector satisfaction than accumulating dozens of impulse purchases.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">The three-watch framework is the gold standard of thoughtful horological curatorship.</p>`,
      faqs: [{ question: "What does GADA stand for?", answer: "'Go Anywhere, Do Anything'—a watch featuring clean styling, 100m water resistance, and a metal bracelet that looks equally sharp with a t-shirt or tailored blazer." }],
    },
    {
      title: "Demystifying Power Reserve: How Mainspring Energy is Stored and Delivered",
      slug: "demystifying-watch-power-reserve",
      subtitle: "From standard 38-hour calibers to 8-day twin-barrel horological endurance.",
      category: "mechanical-and-automatic",
      author: "devon-aris",
      isFeatured: false,
      isTrending: false,
      readTime: 5,
      focusKeyword: "watch power reserve explained",
      directAnswer: "A watch's power reserve is the number of hours the movement continues running autonomously once fully wound before unwinding completely. Modern automatic watches typically offer between 40 to 80 hours of power reserve.",
      excerpt: "Understand how mainspring barrel alloys like Nivaflex deliver steady torque curve distribution across their entire unwinding cycle.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">A 70-hour weekend-proof power reserve allows you to take off your watch on Friday evening and pick it up on Monday morning still ticking accurately.</p>`,
      faqs: [{ question: "Can you overwind an automatic watch?", answer: "No. Automatic mainsprings feature a bridal slipping-spring mechanism that safely slips along the barrel wall once fully tensioned, preventing overwinding." }],
    },
    // 10 more to reach 30:
    {
      title: "Why Ceramic Bezels Have Revolutionized Modern Dive Watches",
      slug: "ceramic-bezels-modern-dive-watches",
      subtitle: "Impervious to ultraviolet fading and diamond-level scratch resistance.",
      category: "materials-and-craftsmanship",
      author: "devon-aris",
      isFeatured: false,
      isTrending: false,
      readTime: 5,
      focusKeyword: "ceramic watch bezels",
      directAnswer: "Zirconium oxide ceramic bezels are formed under extreme pressure and sintered at 1,500°C. They eliminate the fading, chipping, and scratching common in traditional aluminum bezel inserts.",
      excerpt: "How modern metallurgy and ceramic sintering created dive watches that maintain showroom crispness for decades.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">Ceramic bezels stay vibrant even under decades of salt water and intense equatorial sunlight.</p>`,
      faqs: [{ question: "Can a ceramic bezel fade in the sun?", answer: "No, zirconium dioxide ceramic is completely impervious to UV radiation and will never fade." }],
    },
    {
      title: "The Historical Importance of Marine Chronometers in Global Navigation",
      slug: "history-marine-chronometers-navigation",
      subtitle: "How John Harrison's mechanical clocks unlocked longitude and maritime trade.",
      category: "watch-knowledge",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: false,
      readTime: 7,
      focusKeyword: "marine chronometer history",
      directAnswer: "Marine chronometers were high-precision gimballed clocks invented in the 18th century by John Harrison that maintained accurate Greenwich time aboard ships, enabling sailors to calculate longitude and navigate oceans safely.",
      excerpt: "The heroic scientific quest to solve the longitude problem through mechanical clockmaking innovation.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">Without precision horology, safe global ocean navigation would have been impossible.</p>`,
      faqs: [{ question: "What is longitude?", answer: "The east-west geographical coordinate measured in degrees from the Prime Meridian at Greenwich." }],
    },
    {
      title: "What is an Escapement? The Ticking Heart of Mechanical Timekeeping",
      slug: "what-is-a-watch-escapement",
      subtitle: "Swiss levers, co-axial systems, and how potential energy becomes discrete time.",
      category: "watch-knowledge",
      author: "marcus-vance",
      isFeatured: false,
      isTrending: false,
      readTime: 6,
      focusKeyword: "watch escapement mechanism",
      directAnswer: "The escapement is the mechanical regulating organ that controls the release of energy from the mainspring to the gear train, impulsing the balance wheel and creating the audible 'tick-tock' sound.",
      excerpt: "How pallet jewels and escape wheels divide unwinding mainspring energy into precise fractions of a second.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">The escapement converts continuous rotational force into discrete, mathematically measured oscillations.</p>`,
      faqs: [{ question: "What jewels are used in escapements?", answer: "Synthetic rubies, chosen for their hardness and extremely low friction coefficient when paired with polished steel." }],
    },
    {
      title: "Understanding Watch Antimagnetism: Silicon Hairsprings and Faraday Cages",
      slug: "watch-antimagnetism-silicon-hairsprings",
      subtitle: "How horology engineered solutions against pervasive modern magnetic fields.",
      category: "materials-and-craftsmanship",
      author: "devon-aris",
      isFeatured: false,
      isTrending: false,
      readTime: 6,
      focusKeyword: "antimagnetic watches",
      directAnswer: "Antimagnetic watches resist magnetic interference either through passive shielding (a soft-iron Faraday cage enclosing the movement) or non-ferrous movement components like silicon (silicium) hairsprings and titanium balance wheels.",
      excerpt: "In a world surrounded by laptops, smartphones, and MRI machines, antimagnetic horology is more vital than ever.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">Silicon hairsprings are completely non-magnetic, corrosion-free, and thermally stable.</p>`,
      faqs: [{ question: "How does magnetism harm a watch?", answer: "It magnetizes the balance spring coils, pulling them together and causing the watch to gain several minutes per hour." }],
    },
    {
      title: "How to Spot High-Quality Watch Finishing Under a Loupe",
      slug: "how-to-spot-high-quality-watch-finishing",
      subtitle: "Evaluating bevels, geneva stripes, perlage, and screw polishing like a seasoned connoisseur.",
      category: "collecting-and-preservation",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: false,
      readTime: 6,
      focusKeyword: "evaluating watch finishing",
      directAnswer: "Under a 10x loupe, examine bridge chamfers for hand-beveled anglage, inspect Côtes de Genève for parallel depth without tool marks, look for centered circular perlage graining, and verify that screw heads are flat-polished with beveled slots.",
      excerpt: "Train your eye to distinguish between industrial CNC machining and authentic haute horlogerie bench craft.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">A 10x jeweler's loupe reveals the genuine soul and dedication invested into high-end mechanical movements.</p>`,
      faqs: [{ question: "What is heat-blued steel?", answer: "Polished steel heated precisely to 290–310°C develops an iridescent blue oxide layer that also shields against rust." }],
    },
    {
      title: "Vintage vs Modern Watches: Charisma and Patina Against Modern Durability",
      slug: "vintage-vs-modern-watches-comparison",
      subtitle: "Weighing historical charm, tritium patina, and fragility against modern sapphire resilience.",
      category: "collecting-and-preservation",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: false,
      readTime: 7,
      focusKeyword: "vintage vs modern watches",
      directAnswer: "Vintage watches offer incomparable historic charisma, smaller classic proportions, and warm patina, but require delicate care and frequent servicing. Modern watches deliver superior water resistance, shock-proof calibers, and scratch-free sapphire crystals for carefree daily wear.",
      excerpt: "Should your next purchase be a 1960s survivor or a high-spec modern creation? Here is how to evaluate the tradeoff.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">Vintage collecting is an emotional embrace of history, while modern horology provides engineered peace of mind.</p>`,
      faqs: [{ question: "Can vintage watches be worn in water?", answer: "Generally no. Old acrylic crystals and deteriorated case threads make submerging vintage pieces a substantial risk." }],
    },
    {
      title: "Understanding Watch Bezel Functions: Tachymeters, Pulsometers, and Countdowns",
      slug: "understanding-watch-bezel-functions",
      subtitle: "How rotating and fixed bezels calculate speed, distance, heart rate, and dive time.",
      category: "watch-knowledge",
      author: "marcus-vance",
      isFeatured: false,
      isTrending: false,
      readTime: 5,
      focusKeyword: "watch bezel functions explained",
      directAnswer: "Watch bezels serve distinct computational purposes: Tachymeters measure speed over a measured mile/kilometer; Pulsometers measure pulse rates; Dive bezels track elapsed underwater dive time; and Countdown bezels time remaining intervals.",
      excerpt: "Transform your watch bezel from a decorative ring into a practical analog instrument.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">A tachymeter scale converts elapsed seconds into units per hour with simple mechanical mathematics.</p>`,
      faqs: [{ question: "Why do dive bezels only rotate counter-clockwise?", answer: "As a safety precaution: if bumped underwater, elapsed time can only appear longer, preventing a diver from overstaying their air supply." }],
    },
    {
      title: "The Ultimate Guide to Watch Gifting: Milestone Birthdays, Anniversaries, and Promotions",
      slug: "the-ultimate-guide-to-watch-gifting",
      subtitle: "How to select a personal, memorable timepiece that will be cherished for decades.",
      category: "buying-guides",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: true,
      readTime: 6,
      focusKeyword: "watch gifting guide",
      directAnswer: "When gifting a watch, prioritize timeless versatile aesthetics over polarizing fashion trends. A classic 38mm-40mm stainless steel timepiece with clean dial batons, 50m+ water resistance, and an engraved caseback creates an enduring personal heirloom.",
      excerpt: "A fine timepiece is the ultimate milestone gift—marking weddings, graduations, corporate achievements, and personal triumphs.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">A watch gift is unique: it sits directly on the recipient's skin every day, serving as an enduring reminder of your bond.</p>`,
      faqs: [{ question: "Should I engrave a gift watch?", answer: "Yes, an understated monogram or milestone date on the caseback personalizes the timepiece forever." }],
    },
    {
      title: "The Science of Shock Protection in Mechanical Watches: Incabloc and Parashock",
      slug: "watch-shock-protection-incabloc",
      subtitle: "How micro-springs protect microscopic balance pivots from catastrophic drops.",
      category: "mechanical-and-automatic",
      author: "devon-aris",
      isFeatured: false,
      isTrending: false,
      readTime: 5,
      focusKeyword: "watch shock protection",
      directAnswer: "Shock protection systems (like Incabloc and Kif) mount the delicate balance staff jewels on flexible spring clips. When a watch experiences an impact, the springs yield momentarily, allowing the robust shoulder of the staff to absorb shock rather than snapping the microscopic pivot.",
      excerpt: "How a tiny Lyre-shaped gold spring revolutionized the survivability of wristwatches in the 1930s.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">Balance pivots are thinner than a human hair; without shock springs, a two-foot drop would instantly break them.</p>`,
      faqs: [{ question: "Can a mechanical watch survive a drop?", answer: "With modern Incabloc shock springs, drops from desk height onto carpet are usually absorbed safely, though hard tile impacts may still affect regulation." }],
    },
    {
      title: "Horological Ethics and Sustainability: Recycled Steel, Solar, and Responsible Luxury",
      slug: "sustainability-in-luxury-watchmaking",
      subtitle: "How circular economy practices, recycled ocean plastics, and solar power are shaping tomorrow's watches.",
      category: "materials-and-craftsmanship",
      author: "helena-rostova",
      isFeatured: false,
      isTrending: false,
      readTime: 6,
      focusKeyword: "sustainable luxury watchmaking",
      directAnswer: "Sustainability in watchmaking combines the inherently circular nature of mechanical timepieces (designed to be repaired indefinitely rather than discarded) with recycled metals (like ThyssenKrupp recycled steel), vegan strap materials, and ethically sourced fairmined gold.",
      excerpt: "Unlike disposable electronic gadgets replaced every two years, mechanical timepieces embody genuine multi-generational longevity.",
      html: `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">A mechanical watch is by definition the most sustainable personal technology: it runs on human motion and lasts over a century.</p>`,
      faqs: [{ question: "Are smartwatches less sustainable than mechanical watches?", answer: "Yes. Smartwatches rely on lithium batteries with a 3-5 year lifespan and quickly become unsupported e-waste, whereas mechanical watches remain repairable indefinitely." }],
    },
  ];

  let postCount = 0;
  for (const art of articles) {
    const authorId = authorIds[art.author] || authorIds["marcus-vance"];
    const categoryId = categoryIds[art.category] || categoryIds["buying-guides"];

    // 1. Generate & store binary editorial image into blog_images
    const svgStr = generateWatchEditorialSvg(art.title, postCount % 2 === 1);
    const svgBuffer = Buffer.from(svgStr, "utf-8");

    const imgRes = await sql`
      INSERT INTO blog_images (
        file_name,
        mime_type,
        image_data,
        alt_text,
        caption,
        width,
        height,
        file_size,
        image_type,
        prompt
      ) VALUES (
        ${`${art.slug}-editorial.svg`},
        'image/svg+xml',
        ${svgBuffer},
        ${art.title},
        ${`Editorial watch visual for ${art.title}`},
        1200,
        800,
        ${svgBuffer.length},
        'editorial',
        ${`Editorial luxury watch visual for ${art.title}`}
      )
      RETURNING id
    `;
    const imageId = imgRes[0].id;
    const imageUrl = `/api/blog/images/${imageId}`;

    const publishedDate = new Date(Date.now() - postCount * 2 * 86400000).toISOString();
    // 2. Insert blog post
    const postRes = await sql`
      INSERT INTO blog_posts (
        title,
        slug,
        subtitle,
        excerpt,
        content_html,
        featured_image_id,
        featured_image_url,
        author_id,
        category_id,
        status,
        is_featured,
        is_trending,
        reading_time_minutes,
        published_at,
        created_at,
        updated_at
      ) VALUES (
        ${art.title},
        ${art.slug},
        ${art.subtitle},
        ${art.excerpt},
        ${art.html},
        ${imageId},
        ${imageUrl},
        ${authorId},
        ${categoryId},
        'published',
        ${Boolean(art.isFeatured)},
        ${Boolean(art.isTrending)},
        ${art.readTime},
        ${publishedDate},
        NOW(),
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        content_html = EXCLUDED.content_html,
        featured_image_id = EXCLUDED.featured_image_id,
        featured_image_url = EXCLUDED.featured_image_url
      RETURNING id
    `;
    const postId = postRes[0].id;

    // 3. Insert SEO, GEO, AEO metadata
    await sql`
      INSERT INTO blog_post_seo (
        blog_post_id,
        meta_title,
        meta_description,
        focus_keyword,
        secondary_keywords,
        og_title,
        og_description,
        og_image_url,
        direct_answer,
        search_intent,
        target_entities,
        seo_score,
        geo_score,
        aeo_score
      ) VALUES (
        ${postId},
        ${art.title.slice(0, 55) + " | Timect Journal"},
        ${art.excerpt.slice(0, 155)},
        ${art.focusKeyword},
        ${["luxury watches", "horology", "automatic watches"]},
        ${art.title},
        ${art.excerpt},
        ${imageUrl},
        ${art.directAnswer},
        'Informational Guide',
        ${["Automatic Calibre", "Sapphire Crystal", "Chronometer", "316L Stainless Steel"]},
        92,
        90,
        94
      )
      ON CONFLICT (blog_post_id) DO UPDATE SET
        direct_answer = EXCLUDED.direct_answer,
        seo_score = EXCLUDED.seo_score,
        geo_score = EXCLUDED.geo_score,
        aeo_score = EXCLUDED.aeo_score
    `;

    // 4. Insert FAQs
    await sql`DELETE FROM blog_post_faqs WHERE blog_post_id = ${postId}`;
    for (let i = 0; i < art.faqs.length; i++) {
      await sql`
        INSERT INTO blog_post_faqs (blog_post_id, question, answer, sort_order)
        VALUES (${postId}, ${art.faqs[i].question}, ${art.faqs[i].answer}, ${i})
      `;
    }

    // 5. Connect Tag
    const tagKey = postCount % 2 === 0 ? "automatic" : "movement";
    if (tagIds[tagKey]) {
      await sql`
        INSERT INTO blog_post_tags (blog_post_id, blog_tag_id)
        VALUES (${postId}, ${tagIds[tagKey]})
        ON CONFLICT DO NOTHING
      `;
    }

    postCount++;
  }

  console.log(`\nSuccessfully seeded ${postCount} complete luxury watch articles with database images, SEO, GEO, and AEO data!`);
}

if (require.main === module) {
  seedBlogDatabase()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
