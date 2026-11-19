import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { buildSeedFaqs } from "./blog-faq-utils";

for (const envFile of [".env.local", ".env"]) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 0) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
  break;
}

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
const sql = neon(process.env.DATABASE_URL);

type Section = { heading: string; paragraphs: string[]; tips?: string[] };
type Article = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  directAnswer: string;
  readTime: number;
  isFeatured: boolean;
  isTrending: boolean;
  sections: Section[];
  faqs: { question: string; answer: string }[];
};

const articles: Article[] = [
  {
    title: "Trending Watches for Women in 2026: 10 Styles Every Girl Should Know",
    slug: "trending-watches-for-women-2026",
    subtitle: "The definitive guide to the watch styles dominating wrists this year.",
    excerpt: "From ultra-thin minis to bold retro rectangles, discover the 10 trending watch styles for women in 2026 and how to wear each one effortlessly.",
    focusKeyword: "trending watches for women",
    secondaryKeywords: ["best women's watches 2026", "fashionable watches for women", "women's watch trends", "stylish watches for girls"],
    directAnswer: "The trending watches for women in 2026 include small-dial minimalist designs, rectangular vintage-inspired cases, dainty gold-tone bracelets, two-tone metal links, pearlescent dials, pastel color watches, eco-conscious straps, sport-chic hybrids, gemstone-accented bezels, and ultra-thin dress watches. These styles balance personal expression with wearability.",
    readTime: 7,
    isFeatured: true,
    isTrending: true,
    sections: [
      {
        heading: "1. Small-Dial Minimalist Watches",
        paragraphs: [
          "Tiny dials — typically 24 mm to 30 mm — are firmly back after years of oversized dominance. The appeal is in their quiet elegance: a slim case that sits flush on the wrist without shouting for attention. Brands are pairing them with ultra-thin movements and plain sunburst dials for a barely-there aesthetic.",
          "These suit layered stacking with thin bangles or worn alone with an evening dress. The less-is-more approach makes them incredibly versatile across smart and casual settings.",
        ],
        tips: ["Stack two or three small watches or bracelets for a curated arm party.", "Choose a sunburst silver or cream dial for maximum versatility."],
      },
      {
        heading: "2. Rectangular and Vintage-Inspired Shapes",
        paragraphs: [
          "The rectangular watch revival continues into 2026, drawing from 1970s Art Deco influences. Cushion-shaped cases, tank-style proportions, and elongated rectangles all carry an instantly editorial quality that round dials simply cannot replicate.",
          "They photograph beautifully and pair well with tailored blazers, shirt dresses, and even relaxed denim — the contrast creates intentional, fashion-forward styling.",
        ],
      },
      {
        heading: "3. Gold-Tone Bracelet Watches",
        paragraphs: [
          "Integrated gold-tone mesh bracelets and link bracelets have become a wardrobe staple rather than a special-occasion piece. The warmth of gold harmonises with neutral wardrobes and skin tones across the spectrum.",
          "Look for adjustable mesh bands, which allow a custom fit without a jeweller. Butterfly clasps ensure the watch stays secure during active days.",
        ],
        tips: ["Coordinate gold hardware with earrings or rings rather than matching exactly.", "Mesh bands are more comfortable in warm weather than solid-link bracelets."],
      },
      {
        heading: "4. Two-Tone Metal and Mixed Finishes",
        paragraphs: [
          "Two-tone watches — combining yellow gold with polished steel — solve the gold-or-silver dilemma entirely. They bridge warm and cool accessories, making them the most adaptable choice for a mixed-metal wardrobe.",
          "Modern two-tone designs use alternating brushed and polished finishes on the same link for a contemporary, textured look rather than the stark contrast of earlier decades.",
        ],
      },
      {
        heading: "5. Pearlescent and Pastel Dials",
        paragraphs: [
          "Mother-of-pearl dials remain perennially popular, but 2026 sees an expansion into lavender, dusty rose, sage, and sky blue. These pastel dials are paired with white or gold cases for a soft, luminous aesthetic.",
          "They work particularly well under natural light, where the dial shifts color subtly as the angle changes — an almost jewellery-like quality that makes the watch feel precious.",
        ],
      },
      {
        heading: "6. Sport-Chic Hybrid Watches",
        paragraphs: [
          "Athletic silhouettes with feminine proportions are growing rapidly. Think a 36 mm cushion-case chronograph on a rubber strap in pale pink, or a diver-inspired bezel on a sleek white dial. These are designed for women who want performance credentials without sacrificing style.",
          "The sport-chic trend means you can transition from a morning run to a brunch without changing your watch — it looks intentionally stylish rather than merely functional.",
        ],
        tips: ["Choose a monochromatic color palette (all white or all black) for the most elegant sport-chic effect.", "Silicone straps are hypoallergenic and easy to clean."],
      },
      {
        heading: "7. Gemstone and Crystal-Set Bezels",
        paragraphs: [
          "Diamond-set and crystal-accented bezels are trending at multiple price points, from genuine diamond pavé on luxury pieces to high-quality cubic zirconia on fashion watches. The key shift is restraint: a single row of stones around the bezel rather than covering the entire dial.",
          "These add occasion-dressing capability to an everyday watch without making it impractical to wear daily.",
        ],
      },
      {
        heading: "8. Ultra-Thin Dress Watches",
        paragraphs: [
          "Movements under 5 mm thick are a technical achievement and a styling triumph. Ultra-thin watches disappear beneath a cuff and create an almost sculptural quality on the wrist. They are almost always paired with leather straps in neutral tones.",
          "The best ultra-thin designs rely on restraint for impact — no date window, no complications, just a perfect case-to-dial ratio.",
        ],
      },
      {
        heading: "9. Eco-Conscious Sustainable Strap Watches",
        paragraphs: [
          "Recycled ocean plastic, apple leather, and cork-based strap materials are gaining serious traction. Brands are pairing these sustainable bands with stainless steel cases to offer an ethical choice without compromising aesthetics.",
          "Sustainable watches resonate with values-led consumers who want their accessories to reflect their commitments. They are often priced accessibly, making them a great entry-level choice.",
        ],
      },
      {
        heading: "10. Personalised and Engraved Watches",
        paragraphs: [
          "Customisation is a mega-trend across fashion, and watches are no exception. Brands offering dial colour choices, interchangeable straps, or case-back engraving are seeing strong demand. A monogrammed or engraved watch also makes the most meaningful gift.",
          "The combination of personal story and functional elegance makes these watches deeply wearable — they are not just accessories but keepsakes.",
        ],
        tips: ["Choose an engraving font that matches the watch's overall aesthetic: serif for classic, sans-serif for modern.", "Interchangeable strap systems multiply a single watch's versatility dramatically."],
      },
    ],
    faqs: [
      { question: "What watch style is trending for women in 2026?", answer: "Small-dial minimalist watches, rectangular vintage shapes, gold-tone bracelets, pearlescent dials, and sport-chic hybrids are the dominant trends for women's watches in 2026." },
      { question: "Are small watches back in fashion for women?", answer: "Yes. Dials between 24 mm and 32 mm are strongly trending as a reaction to years of oversized watches, with brands emphasising elegance and subtlety over statement sizing." },
    ],
  },
  {
    title: "Small Dial Watches for Women: Why Tiny Watches Are Back in Fashion",
    slug: "small-dial-watches-for-women",
    subtitle: "The elegant comeback of the delicate, feminine watch dial.",
    excerpt: "Small dial watches are reclaiming the spotlight in women's fashion. Discover why tiny watches are trending, which wrist sizes suit them best, and how to style them beautifully.",
    focusKeyword: "small dial watches for women",
    secondaryKeywords: ["tiny watches for women", "small wrist watches for women", "dainty watches women", "minimalist women's watches"],
    directAnswer: "Small dial watches for women — typically 24 mm to 32 mm — are back in fashion because they emphasise elegance, feminine proportions, and minimalist aesthetics. They work best on petite to medium wrists and pair beautifully with delicate jewellery, smart-casual, and evening outfits.",
    readTime: 6,
    isFeatured: false,
    isTrending: true,
    sections: [
      {
        heading: "Why tiny watches became unfashionable — and why they're back",
        paragraphs: [
          "Through the 2010s, oversized watches dominated for both men and women, driven by the belief that a large watch read as confident and bold. However, fashion's natural pendulum has swung back toward refinement, restraint, and femininity. The result is a renewed appreciation for dials under 32 mm.",
          "Luxury heritage brands and independent designers alike are reintroducing their most compact references, understanding that proportion and intention matter more than scale. When a small watch fits perfectly, it has a jewellery-like quality that larger watches can never replicate.",
        ],
      },
      {
        heading: "What wrist size suits a small dial watch?",
        paragraphs: [
          "Small dial watches are most flattering on wrists measuring 5.5 inches (14 cm) to 6.5 inches (16.5 cm) in circumference. However, the key measurement is lug-to-lug distance — how the case sits across the width of your wrist — rather than dial diameter alone.",
          "Petite wrists are most naturally suited to 24–28 mm cases. Medium wrists wear 28–32 mm comfortably. Even larger wrists can carry a small watch as a deliberate fashion choice; the contrast creates an intentionally styled, editorial look.",
        ],
        tips: ["Measure your wrist with a tape measure and compare to the watch's lug-to-lug dimension.", "A thin case (under 8 mm) amplifies the delicate effect of a small dial."],
      },
      {
        heading: "Best strap choices for small dial watches",
        paragraphs: [
          "Narrow straps (10–14 mm) are proportionally correct for small cases. Mesh bracelets, fine satin ribbon, slim smooth leather, and petite link bracelets all enhance the dainty aesthetic. Avoid thick rubber or wide NATO straps, which overwhelm a small dial.",
          "Gold-toned mesh or Milanese loop bracelets are especially popular for small watches — they add warmth, flexibility, and a bracelet-like quality that blurs the line between watch and jewellery.",
        ],
      },
      {
        heading: "How to style a small dial watch",
        paragraphs: [
          "Small watches layer beautifully with thin bangle bracelets, tennis bracelets, and delicate chain jewelry. Keep scale consistent: fine jewellery with fine watches, substantial jewellery with slightly larger pieces.",
          "For evening wear, a small diamond-set or pearl-dial watch on a satin strap is an effortlessly elegant choice that doubles as fine jewellery. For daytime, a simple steel or gold-tone mini on leather keeps the look refined without feeling overdressed.",
        ],
        tips: ["Mix metals intentionally: a rose gold watch with yellow gold rings creates a modern eclectic feel.", "Let a small watch be the focal point of a minimal wrist — sometimes one piece is enough."],
      },
    ],
    faqs: [
      { question: "Are small dial watches suitable for large wrists?", answer: "Yes. Worn as a deliberate styling choice, a small dial on a larger wrist creates an intentional contrast that reads as editorial and fashion-forward." },
      { question: "What is the ideal dial size for a petite wrist?", answer: "24 mm to 28 mm is ideal for very petite wrists. 28–32 mm works for small to medium wrists and still maintains a dainty aesthetic." },
    ],
  },
  {
    title: "Square vs Round Watches for Women: Which Looks More Elegant?",
    slug: "square-watches-for-women",
    subtitle: "Comparing the geometric case shapes that define two distinct aesthetics.",
    excerpt: "Square or round? This classic debate in women's watch styling has no single answer — it depends on wrist shape, personal style, and the occasion. Here's everything you need to know.",
    focusKeyword: "square watches for women",
    secondaryKeywords: ["square dial watches for women", "round vs square women's watch", "best women's watch shape", "geometric watches for women"],
    directAnswer: "Square watches look more architectural and editorial, suiting fashion-forward and tailored styles. Round watches are considered more universally elegant and versatile. For formal occasions, round dials are traditional; for a distinctive, design-led look, square or rectangular cases stand out.",
    readTime: 6,
    isFeatured: false,
    isTrending: false,
    sections: [
      {
        heading: "The elegance case for round watches",
        paragraphs: [
          "Round dials have been the horological standard for over a century because they mirror the natural movement of clock hands and work harmoniously with the circular shape of the watch mechanism. This inherent logic gives round watches a timeless, refined quality.",
          "On the wrist, a round case sits smoothly against the skin and blends with almost any outfit — formal, casual, or traditional. It is the most universally flattering shape across different wrist widths and proportions.",
        ],
        tips: ["Round watches in sizes 28–34 mm suit most women's wrists elegantly.", "A sunburst or guilloché dial adds depth to a round watch without sacrificing simplicity."],
      },
      {
        heading: "The elegance case for square watches",
        paragraphs: [
          "Square and cushion-shaped watches carry an inherently architectural quality. Historically associated with dress watches — the Cartier Tank and Jaeger-LeCoultre Reverso are the definitive examples — square cases feel deliberately designed rather than conventional.",
          "The straight edges of a square case align naturally with cuffs, bracelets, and the lines of tailored clothing. This geometric quality is what makes square watches feel fashion-forward and editorial.",
        ],
      },
      {
        heading: "Wrist shape and how it influences which looks better",
        paragraphs: [
          "Rounder, fuller wrists tend to look softer and more balanced with round cases, which echo their natural curves. Narrower, more angular wrists can carry square or rectangular cases effectively because the geometric contrast is more visually harmonious.",
          "The best test is to try both shapes in your size range. A 28 mm square case on a narrow wrist often reads as more elegant than expected, while a round 36 mm watch on a fuller wrist sits more naturally.",
        ],
      },
      {
        heading: "Occasion and styling guide",
        paragraphs: [
          "For weddings, formal events, and conservative professional settings, round watches remain the safest and most accepted choice. For fashion-focused occasions, editorial styling, artistic environments, or simply as a personal signature, square and rectangular watches make a more distinctive statement.",
          "Many collectors and style enthusiasts own both: a round everyday watch and a square dress watch for occasions where they want their timepiece to be part of the story.",
        ],
        tips: ["Square watches photograph particularly well — worth considering for events.", "A cushion-shaped case is a softer halfway point between round and square if you are undecided."],
      },
    ],
    faqs: [
      { question: "Are square watches considered elegant for women?", answer: "Yes. Square and rectangular watches are associated with historic luxury dress watches and carry a distinctive, architectural elegance — especially when worn with tailored or evening outfits." },
      { question: "Which watch shape is more versatile for everyday wear?", answer: "Round watches are more versatile for daily wear as they suit the widest range of outfits, occasions, and wrist sizes." },
    ],
  },
  {
    title: "Gold vs Rose Gold vs Silver Watches: Which Should Women Choose?",
    slug: "gold-watches-for-women",
    subtitle: "A complete guide to choosing the right metal tone for your skin, wardrobe, and style.",
    excerpt: "Gold, rose gold, or silver — choosing a watch metal tone can transform how a watch looks on your wrist. This guide helps you decide based on skin tone, wardrobe, and personal style.",
    focusKeyword: "gold watches for women",
    secondaryKeywords: ["rose gold watches for women", "silver watches for women", "best metal tone women's watch", "gold vs silver watch women"],
    directAnswer: "Yellow gold watches complement warm and olive skin tones and warm-coloured wardrobes. Rose gold is universally flattering and suits romantic, feminine, or eclectic styles. Silver and steel work best with cool skin tones and neutral or cool wardrobes. All three can be worn confidently by any woman — personal preference and outfit context matter most.",
    readTime: 7,
    isFeatured: true,
    isTrending: false,
    sections: [
      {
        heading: "Yellow gold watches: warmth and heritage",
        paragraphs: [
          "Yellow gold is the most traditional and historically prestigious watch metal. It carries associations with heirloom jewellery, occasion dressing, and enduring luxury. Modern yellow gold watches range from subtle champagne tones to rich, saturated gold finishes.",
          "On the wrist, yellow gold creates warmth and richness against medium-to-deep skin tones. For lighter cool-toned skin, yellow gold provides a striking contrast. The key is pairing gold with warm-toned clothing — camel, cream, olive, terracotta, and burgundy all complement yellow gold beautifully.",
        ],
        tips: ["Yellow gold pairs naturally with brown leather straps for a heritage aesthetic.", "A sunburst champagne dial in a yellow gold case is one of the most elegant daytime combinations."],
      },
      {
        heading: "Rose gold watches: romance and versatility",
        paragraphs: [
          "Rose gold has been the most popular women's watch tone for the past decade, and for good reason. The pink-copper alloy is universally flattering — it adds warmth without overwhelming fair skin and harmonises beautifully with medium and deep tones.",
          "Rose gold also crosses aesthetic boundaries: it suits feminine romantic styles, modern minimalist aesthetics, and even streetwear-influenced looks depending on the case shape and dial design. Its warmth is softer than yellow gold, which makes it feel more contemporary and less traditional.",
        ],
      },
      {
        heading: "Silver and steel watches: clean, modern, and cool",
        paragraphs: [
          "Stainless steel is the most practical and durable case material and serves as the default 'silver' tone in most watches. Its neutral, cool-grey finish suits a wider range of outfits than any single metal colour, particularly navy, black, white, grey, and cool jewel tones.",
          "For cool or pink-toned skin, silver harmonises naturally and looks sophisticated without trying. Steel watches also hold up better to daily wear and are significantly more cost-effective than gold alloys.",
        ],
        tips: ["Steel watches on mesh bracelets have an almost jewellery-like quality — a great alternative to yellow gold at a lower price point.", "White dials and steel cases are the ultimate neutral watch combination."],
      },
      {
        heading: "How to choose based on your existing jewellery",
        paragraphs: [
          "The simplest decision-making framework is to match your watch to your most commonly worn jewellery. If you wear gold rings and earrings daily, a gold or rose gold watch creates continuity. If you wear silver or platinum, steel is the natural choice.",
          "Two-tone watches (steel and gold) are a practical compromise if your jewellery collection is mixed. They have enough of each tone to coordinate without clashing, and they photograph beautifully in any light.",
        ],
      },
    ],
    faqs: [
      { question: "Is rose gold or yellow gold better for a women's watch?", answer: "Rose gold is more universally flattering and contemporary. Yellow gold suits warm skin tones and traditional or occasion dressing more naturally. Both are beautiful — the choice comes down to personal style and existing jewellery." },
      { question: "Does silver or gold look better on fair skin?", answer: "Both work on fair skin. Silver and steel create a cool, clean look. Yellow gold provides warm contrast. Rose gold offers a soft flattering middle ground. Try both in natural light to see which resonates most with your colouring." },
    ],
  },
  {
    title: "Best Watches for College Girls: Trendy and Stylish Everyday Designs",
    slug: "watches-for-college-girls",
    subtitle: "Smart, affordable, and stylish watches that keep up with student life.",
    excerpt: "Find the best watches for college girls — from minimalist everyday pieces to colourful statement designs. Practical, stylish, and suited to campus life at every budget.",
    focusKeyword: "watches for college girls",
    secondaryKeywords: ["best watches for college students", "trendy watches for young women", "affordable women's watches", "stylish watches for teens"],
    directAnswer: "The best watches for college girls combine durability, style, and affordability. Look for lightweight cases (28–36 mm), easy-to-clean straps (silicone or mesh), clear dials for quick time-reading, and designs versatile enough to move from class to social settings. Minimalist, sport-chic, and colourful fashion watches are most popular.",
    readTime: 6,
    isFeatured: false,
    isTrending: true,
    sections: [
      {
        heading: "What makes a watch right for college life?",
        paragraphs: [
          "College life demands a watch that is practical enough for a full day on campus and stylish enough for evenings and social events. This means prioritising comfort for long wears, legibility for checking time between classes, durability for everyday bumps, and versatility across casual and smart-casual outfits.",
          "Water resistance is a bonus — especially for students who cycle, attend sports, or live in unpredictable climates. A watch that survives a splash or light rain without anxiety is worth choosing.",
        ],
        tips: ["Choose a watch rated to at least 30m water resistance for everyday practicality.", "Interchangeable straps let one watch serve multiple style purposes."],
      },
      {
        heading: "Minimalist watches: the campus wardrobe staple",
        paragraphs: [
          "A clean three-hand watch with a white, black, or cream dial and a simple leather or mesh strap is the most versatile option for student life. It looks equally appropriate in a lecture hall, library, café, or evening out.",
          "Sizes around 28–32 mm are ideal for a feminine, polished look without being too casual. Steel cases are the most durable; gold-tone plating adds warmth but can wear over time with heavy daily use.",
        ],
      },
      {
        heading: "Sport and casual watches for active students",
        paragraphs: [
          "For students with active schedules — gym sessions, outdoor classes, sports clubs — a sport-inspired watch on a silicone or rubber strap is practical and stylish. Colourful bands, bold dials, and water-resistant cases suit an active campus lifestyle.",
          "Sport-chic designs that remain attractive off the court or track are especially useful. A 32–36 mm cushion-case watch on a tonal silicone band looks intentional rather than purely athletic.",
        ],
      },
      {
        heading: "Fashion and statement watches for self-expression",
        paragraphs: [
          "College is the ideal time to experiment with bolder watch designs — geometric cases, pastel dials, transparent faces, or playful colours that reflect your personal aesthetic. These need not be expensive; fashion watches at accessible price points offer tremendous variety.",
          "A statement watch can be the foundation of an outfit on casual days, eliminating the need for additional jewellery. It is worth owning one practical everyday watch and one more expressive piece for style experimentation.",
        ],
        tips: ["Transparent or skeleton dials are particularly popular with students for their unique visual appeal.", "Colourful silicone straps are easy to swap out and clean — perfect for daily wear."],
      },
    ],
    faqs: [
      { question: "What is a good watch budget for college students?", answer: "A solid, stylish everyday watch can be found in the ₹1,500–₹5,000 range. At that budget, look for mineral or hardened crystal, clean dials, and durable strap materials." },
      { question: "Should college girls buy analog or digital watches?", answer: "Analog watches are more versatile and stylish for most college settings. Digital or hybrid watches are useful if you want additional functions like stopwatch or fitness tracking." },
    ],
  },
  {
    title: "Bracelet Watches for Women: How to Style Them with Jewellery",
    slug: "bracelet-watches-for-women",
    subtitle: "The art of blending your bracelet watch seamlessly with rings, bangles, and necklaces.",
    excerpt: "Bracelet watches blur the line between timepiece and jewellery. Learn how to coordinate them with rings, bangles, tennis bracelets, and other accessories for a polished, cohesive look.",
    focusKeyword: "bracelet watches for women",
    secondaryKeywords: ["women's bracelet watch styling", "watch and jewellery combination", "bangle watch style", "how to stack watch with bracelets"],
    directAnswer: "Style a bracelet watch with jewellery by coordinating metal tones, keeping scale consistent, and stacking thin pieces on the same wrist or balancing with the opposite wrist. A bracelet watch can anchor an arm party of bangles and bracelets or stand alone as a statement piece.",
    readTime: 7,
    isFeatured: false,
    isTrending: true,
    sections: [
      {
        heading: "What is a bracelet watch and why it's both a timepiece and jewellery",
        paragraphs: [
          "A bracelet watch features an integrated or matching metal bracelet where the strap and case form one continuous design — it functions as a watch but presents as jewellery. The most iconic examples include fine mesh (Milanese loop), link bracelets, and bangle-style cuffs.",
          "Because the bracelet is as visible as the dial, the styling logic shifts: you are coordinating jewellery-to-jewellery rather than watch-to-outfit. This elevates the complexity and the reward of getting it right.",
        ],
      },
      {
        heading: "Matching metals: the first rule of bracelet watch styling",
        paragraphs: [
          "The simplest approach is to coordinate metal tones across your watch and jewellery. A yellow gold bracelet watch reads most harmoniously with yellow gold rings and earrings. Rose gold suits rose gold or warm silver jewellery. Steel and silver-tone watches work with platinum, white gold, and silver accessories.",
          "Mixed metals are increasingly accepted in contemporary styling but require deliberate execution. A rose gold watch with a silver chain ring and yellow gold hoops works if the combination feels intentional and is repeated consistently across the look.",
        ],
        tips: ["Warm metals together (yellow gold + rose gold) can work well and feel richly layered.", "Cool metals together (silver + steel) create a sharp, modern aesthetic."],
      },
      {
        heading: "Stacking the same wrist: arm party styling",
        paragraphs: [
          "Stacking a bracelet watch with bangles and bracelets on the same wrist is one of the most popular styling approaches. The key is graduating scale: lead with the watch as the largest piece, then add medium bangles, and finish with delicate chains or stacking rings.",
          "Keep all pieces in the same metal family for a curated look. Mixing textures — a smooth link watch with a hammered bangle and a beaded bracelet — creates visual interest without colour conflict.",
        ],
      },
      {
        heading: "Balancing jewellery across both wrists",
        paragraphs: [
          "If the stacked look feels too heavy, balance instead: wear the bracelet watch alone on one wrist and complementary jewellery on the other. A gold bracelet watch on the left can be paired with gold rings on the right hand for a coordinated but uncluttered effect.",
          "This approach is particularly effective for formal settings where stacking can feel too casual. A single bracelet watch with refined ring and ear jewellery is always appropriately elegant.",
        ],
        tips: ["Keep the total accessory weight proportionate to the outfit's formality.", "For weddings and events, a bracelet watch alone on a bare wrist can be more impactful than a fully stacked arm."],
      },
    ],
    faqs: [
      { question: "Can I wear a bracelet watch with a bangle?", answer: "Yes. Place the watch closest to your hand and stack bangles above it, graduating from smaller to larger. Keep them in the same metal tone for a cohesive look." },
      { question: "Should my watch and rings match?", answer: "They don't need to be identical, but should share a metal tone family (warm or cool). Slight variations in shade and texture within the same metal family create a more natural, layered effect." },
    ],
  },
  {
    title: "Rectangular Dial Watches for Women: The Vintage Trend Making a Comeback",
    slug: "rectangular-watches-for-women",
    subtitle: "Why the elongated case shape is the most fashionable watch design of the decade.",
    excerpt: "Rectangular watches are having a major fashion moment. Discover why the elongated dial is trending, its heritage roots, how to identify quality designs, and the best ways to style them.",
    focusKeyword: "rectangular watches for women",
    secondaryKeywords: ["rectangle dial women's watch", "vintage style watches for women", "tank style women's watch", "oblong watches for women"],
    directAnswer: "Rectangular dial watches for women are trending due to their Art Deco heritage, distinctly fashion-forward aesthetic, and the way their straight lines complement both tailored and casual outfits. The shape references iconic luxury designs and photographs beautifully, making it a go-to for style-conscious women.",
    readTime: 6,
    isFeatured: false,
    isTrending: true,
    sections: [
      {
        heading: "The heritage roots of the rectangular watch",
        paragraphs: [
          "The rectangular watch case emerged in the early 20th century as watchmakers explored geometric case shapes that departed from the pocket watch's traditional round form. The Cartier Tank — launched in 1917 and inspired by the overhead view of a World War I tank — became the defining example of the rectangular watch and remains one of the most referenced designs in horological history.",
          "The elongated case's straight lines were an expression of Art Deco architecture's obsession with geometry and clean structure. These qualities make rectangular watches feel inherently architectural and design-conscious — qualities that resonate strongly with contemporary fashion.",
        ],
      },
      {
        heading: "Why rectangular watches are trending now",
        paragraphs: [
          "Fashion operates in cycles, and after a decade of sporty, round watches dominating women's wardrobes, the appetite for something more considered and visually distinctive has grown. Rectangular cases offer an editorial quality — they look equally compelling on red carpets, street style shoots, and editorial fashion imagery.",
          "The vintage revival across all categories of fashion and design has made the rectangular watch a natural beneficiary. Its association with the 1960s and 1970s haute horlogerie tradition makes it simultaneously nostalgic and fresh.",
        ],
        tips: ["Look for a rectangular case with thin lugs — it creates an elongated, elegant effect on the wrist.", "Roman numerals pair particularly well with rectangular dials for a heritage-inspired aesthetic."],
      },
      {
        heading: "How to style a rectangular watch",
        paragraphs: [
          "Rectangular watches are inherently elegant and lean toward dressier styling. They work beautifully with tailored trousers, blazers, shirt dresses, and evening outfits. The straight case edge sits flush against a cuff in a visually satisfying way that round watches cannot replicate.",
          "For casual styling, pair a rectangular watch with a fine leather strap and simple everyday clothing — the contrast between the watch's formality and relaxed clothing creates the kind of intentional styling that fashion-forward dressing is built on.",
        ],
      },
      {
        heading: "What to look for in a quality rectangular watch",
        paragraphs: [
          "Case finishing is critical — a well-made rectangular watch should have sharp, defined edges with consistent polished and brushed surface contrasts. The dial should be symmetrically aligned within the case, with indices that sit correctly in the corners of the rectangular frame.",
          "Leather strap quality matters as much as the case. Rectangular watches look most refined on slim, fine-grained leather in classic colours — black, tan, navy, burgundy. Avoid thick or chunky straps that overpower the elegant case proportions.",
        ],
      },
    ],
    faqs: [
      { question: "Are rectangular watches in fashion for women in 2026?", answer: "Yes. Rectangular and tank-shaped watches are one of the strongest trends in women's watches, driven by vintage fashion revival, editorial styling influence, and the shapes' inherently elegant aesthetic." },
      { question: "How wide should a rectangular watch be for a woman's wrist?", answer: "A width of 20–28 mm with a length of 30–40 mm works well for most women's wrists. The elongated shape means the case reads slightly larger than its width measurement suggests." },
    ],
  },
  {
    title: "Best Watches for Working Women: Elegant Office-Wear Styles",
    slug: "office-watches-for-women",
    subtitle: "Professional, polished, and practical — the watches that work as hard as you do.",
    excerpt: "The best office watches for women balance professionalism with personal style. Discover the key criteria for choosing a work watch and the styles that shine in every professional setting.",
    focusKeyword: "office watches for women",
    secondaryKeywords: ["professional watches for women", "work watches for women", "best watches for businesswomen", "elegant watches for office"],
    directAnswer: "The best office watches for working women are slim (under 10 mm thick), legible, and proportionate to the wrist (30–36 mm). Choose clean dials in neutral tones, quality steel or leather bands, and minimal complications. A refined watch communicates attention to detail and professionalism without distraction.",
    readTime: 7,
    isFeatured: false,
    isTrending: false,
    sections: [
      {
        heading: "What makes a watch right for professional settings?",
        paragraphs: [
          "In a professional environment, your watch communicates more than the time — it signals your attention to detail, your personal standards, and your cultural literacy around quality and presentation. A well-chosen office watch does this quietly and effectively.",
          "The criteria are consistent across industries: the watch should be proportionate (not oversized), legible (readable at a glance), slim enough to clear the cuff, and finished in materials that read as quality — genuine leather, sapphire crystal, stainless steel.",
        ],
        tips: ["Keep the dial clean and readable — avoid overly complicated dials with too many sub-registers.", "A dark leather strap (black or dark brown) reads most formally."],
      },
      {
        heading: "Three-hand watches: the professional classic",
        paragraphs: [
          "Hours, minutes, and seconds — that is all most professional settings require. A clean three-hand watch on a leather strap or fine steel bracelet is the most reliably professional choice. It signals restraint, good taste, and practicality in equal measure.",
          "Look for a dial with applied (raised) indices rather than printed — they catch light and add depth to the design. A date window at 3 or 6 o'clock adds practical value without complicating the dial unnecessarily.",
        ],
      },
      {
        heading: "Slim dress watches for formal offices",
        paragraphs: [
          "In highly formal or conservative environments — finance, law, senior management, or formal client-facing roles — an ultra-slim dress watch on a smooth leather strap is the most appropriate choice. The watch should feel like an extension of the clothing rather than a separate accessory.",
          "Dial sizes of 28–34 mm are most common in this category. The case should sit flush on the wrist without overhanging the edges. A sapphire crystal is worth prioritising, as mineral glass accumulates visible scratches that look unprofessional over time.",
        ],
      },
      {
        heading: "Steel bracelet watches for modern professional settings",
        paragraphs: [
          "For contemporary professional environments — creative industries, tech, consulting, flexible workplaces — a steel bracelet watch reads as smart and versatile. It transitions smoothly from desk to after-work social settings and requires less maintenance than leather.",
          "The bracelet should fit correctly: it should sit without sliding over the hand but not so tight that it leaves marks. A butterfly clasp is more secure and less prone to accidental opening than a push-button clasp.",
        ],
        tips: ["A steel watch on a mesh bracelet is an excellent modern professional choice — it adjusts easily for a perfect fit.", "Avoid overly sporty designs (large bezels, bright colours, rubber straps) in conservative professional environments."],
      },
    ],
    faqs: [
      { question: "What watch size is appropriate for the office?", answer: "30–36 mm is the most professional size range for women's office watches. It is proportionate without being too delicate, and suits most dress-code contexts." },
      { question: "Should office watches be analog or digital?", answer: "Analog is universally appropriate for professional settings. Smartwatches are acceptable in many modern workplaces but should use a refined strap and understated face design." },
    ],
  },
  {
    title: "Minimalist Watches for Women: Simple Styles That Look Luxurious",
    slug: "minimalist-watches-for-women",
    subtitle: "How the most restrained watches achieve the most impactful elegance.",
    excerpt: "Minimalist watches let proportion, materials, and craftsmanship do all the work. Discover why less truly is more in women's watch design and how to identify quality in a simple dial.",
    focusKeyword: "minimalist watches for women",
    secondaryKeywords: ["simple watches for women", "clean dial watches for women", "luxury minimalist women's watch", "understated watches for women"],
    directAnswer: "Minimalist watches for women achieve a luxurious appearance through precise proportions, quality materials (sapphire crystal, genuine leather, stainless steel), and flawless surface finishing rather than complications or ornamentation. The best minimalist watches are defined by what they leave out as much as what they include.",
    readTime: 6,
    isFeatured: true,
    isTrending: true,
    sections: [
      {
        heading: "Why minimalism looks luxurious in watches",
        paragraphs: [
          "In watchmaking, restraint is expensive. Achieving a truly clean dial — with no distracting text, minimal indices, and a perfectly proportioned case — requires confidence in the fundamentals: movement quality, case finishing, and material selection. Cheap watches add details to distract from poor construction; quality watches can afford to remove them.",
          "The result is that a genuinely minimalist watch often reads as more luxurious than a heavily decorated one. The eye has nowhere to hide, so every surface must be perfect.",
        ],
      },
      {
        heading: "Key design principles of a great minimalist watch",
        paragraphs: [
          "Case-to-dial ratio: the dial should fill the case without feeling cramped. Indices should be proportionate — slender applied hour markers rather than thick printed numbers. The hands should be thin and elegant, reaching close to the dial edge without touching it.",
          "Colour discipline: the finest minimalist watches use two or three colours maximum — often a neutral case, single-tone dial, and matching or contrasting strap. White, black, silver, cream, and navy are the most effective minimalist dial colours.",
        ],
        tips: ["Look for applied (raised) hour markers rather than printed — they catch light and add depth without visual clutter.", "A matching strap colour (tonal dressing) is the most sophisticated minimalist approach."],
      },
      {
        heading: "Materials that elevate minimalist watches",
        paragraphs: [
          "Because decoration is absent, material quality is immediately exposed. Sapphire crystal reveals its quality by being completely scratch-free and optically clear. High-grade stainless steel holds its polished and brushed surfaces distinctly over time. Genuine calf leather develops a patina that adds character.",
          "Ceramic and titanium cases are increasingly used in minimalist designs — both have a tactile and visual quality that feels inherently premium despite (or because of) their understated appearance.",
        ],
      },
      {
        heading: "How to style a minimalist watch",
        paragraphs: [
          "Minimalist watches have a natural affinity with minimal clothing — simple cuts, neutral palettes, quality fabrics. They let your face and overall silhouette be the focus, anchoring rather than competing. With a monochrome outfit (all black, all white, or all cream), a minimalist watch becomes the single intentional detail.",
          "Conversely, a minimalist watch provides visual calm in a more complex outfit — with prints, pattern, or layered styling. It says 'I haven't tried too hard' while elevating the whole look.",
        ],
        tips: ["A white or cream dial minimalist watch is one of the most universally flattering accessories a woman can own.", "The same minimalist watch on a mesh bracelet (for work) and a leather strap (for evenings) becomes two distinct looks."],
      },
    ],
    faqs: [
      { question: "What makes a minimalist watch look expensive?", answer: "Quality materials (sapphire crystal, genuine leather, polished stainless steel), precise proportions, applied hour markers, and flawless finishing are the marks of an expensive-feeling minimalist watch." },
      { question: "Are minimalist watches suitable for formal occasions?", answer: "Yes. A slim minimalist watch is one of the most appropriate formal watches, particularly for weddings, galas, and professional events where restraint signals confidence." },
    ],
  },
  {
    title: "Best Watches for Thin Wrists: A Women's Watch Size Guide",
    slug: "watches-for-small-wrists",
    subtitle: "How to find the perfect case size, lug-to-lug dimension, and proportions for a petite wrist.",
    excerpt: "Finding a watch that sits beautifully on a thin or petite wrist requires knowing what to look for beyond dial size. This complete size guide covers case dimensions, lug fitting, and styling principles.",
    focusKeyword: "watches for small wrists",
    secondaryKeywords: ["watches for petite women", "watches for thin wrists women", "small wrist women's watch guide", "best women's watch size"],
    directAnswer: "For thin or petite wrists (typically under 15 cm circumference), the ideal watch has a case diameter of 24–34 mm, a lug-to-lug distance under 42 mm, and a case thickness under 8 mm. These dimensions ensure the watch sits flush on the wrist without overhanging the edges or appearing bulky.",
    readTime: 7,
    isFeatured: false,
    isTrending: true,
    sections: [
      {
        heading: "Why dial diameter alone doesn't determine fit",
        paragraphs: [
          "Many women measure their wrist, look at a watch's listed diameter, and assume a 32 mm watch will fit because their wrist is small. But dial diameter is not the most important measurement. Lug-to-lug distance — the total length of the case from the top to bottom lug where the strap attaches — determines whether the watch overhangs the wrist edges.",
          "A compact 36 mm watch with short lugs can sit better on a thin wrist than a 30 mm watch with long lugs that protrude past the wrist edges. Always check the lug-to-lug dimension alongside the dial size.",
        ],
        tips: ["Under 42 mm lug-to-lug is the target for thin wrists.", "Under 8 mm case thickness ensures the watch doesn't feel bulky on a petite frame."],
      },
      {
        heading: "Recommended size ranges for petite and thin wrists",
        paragraphs: [
          "For wrists measuring 13–14 cm (5–5.5 inches): aim for 24–28 mm dial diameter and under 38 mm lug-to-lug. These are the most delicate proportions and work best with ultra-slim cases under 7 mm.",
          "For wrists measuring 14–15.5 cm (5.5–6 inches): 28–34 mm works well. This is the most populated size range for women's watches and offers the widest variety of styles. Keep lug-to-lug under 42 mm for the best fit.",
          "For wrists measuring 15.5–17 cm (6–6.5 inches): 32–36 mm suits well. This range has the most versatility and can accommodate slimmer sports or dress watches without looking overwhelmed.",
        ],
      },
      {
        heading: "Strap width and how it affects proportion",
        paragraphs: [
          "Narrow straps (10–14 mm) are proportionally correct for small cases and thin wrists. They maintain the visual delicacy of the watch and don't add bulk at the wrist. Wide straps (18–20 mm) can overpower a small case and make a petite wrist look shorter.",
          "Mesh and Milanese loop bracelets are excellent for thin wrists because they adjust to the exact circumference, sitting closer to the skin than link bracelets with pre-set adjustment points.",
        ],
        tips: ["Taper in the strap (wider at the case, narrower at the buckle) adds elegance to any small watch.", "Fine-link or mesh bracelets are more comfortable and flattering on thin wrists than broad oyster-style links."],
      },
      {
        heading: "Style approaches that work for thin wrists",
        paragraphs: [
          "A single small watch on a thin wrist often looks more elegant than stacking — there is simply less space to add additional pieces without overcrowding. If you enjoy the stacked look, choose one very thin bangle and pair it with the watch on the same wrist.",
          "Avoid excessively thick bezels or rotating ring complications on small cases — they increase visual bulk without adding proportionate dial size. A clean, unadorned bezel keeps the case looking crisp and proportionate.",
        ],
      },
    ],
    faqs: [
      { question: "What watch size is best for a 14 cm wrist?", answer: "A dial diameter of 24–30 mm with a lug-to-lug distance under 38 mm is ideal for a 14 cm wrist. Focus on slim case thickness (under 7 mm) for the most flattering fit." },
      { question: "Can women with small wrists wear a 36 mm watch?", answer: "Yes, if the lug-to-lug is under 42 mm and the case is slim. Some 36 mm watches are proportioned to wear very close to the wrist and can look elegant even on petite frames." },
    ],
  },
];

function articleHtml(article: Article) {
  const sections = article.sections
    .map(
      (section, index) => `
    <section>
      <h2 id="${article.slug}-section-${index + 1}" class="text-2xl font-serif font-bold text-ink mt-10 mb-4">${section.heading}</h2>
      ${section.paragraphs.map((p) => `<p class="mb-4 text-ink/80 leading-relaxed">${p}</p>`).join("\n")}
      ${
        section.tips
          ? `<div class="my-7 rounded-fuse bg-bg/80 border border-line p-6"><h3 class="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Styling notes</h3><ul class="list-disc pl-5 space-y-2 text-ink/80 text-sm">${section.tips.map((t) => `<li>${t}</li>`).join("")}</ul></div>`
          : ""
      }
    </section>`
    )
    .join("\n");

  return `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">${article.directAnswer}</p>${sections}<div class="my-10 rounded-fuse border border-line bg-white p-6"><h2 class="text-xl font-serif font-bold text-ink mb-3">The final word</h2><p class="text-ink/80 leading-relaxed">Use these principles as a framework rather than a rulebook. The best women's watch is the one that fits your wrist, your wardrobe, and your life — worn confidently, every day.</p></div>`;
}

function editorialSvg(title: string, index: number) {
  const palettes = [
    ["#f5ede4", "#c09060", "#e8c8a0"],
    ["#eee4f0", "#8060a0", "#c8a8d8"],
    ["#e4eef5", "#406080", "#a0c8e0"],
    ["#f0eee4", "#806040", "#d8c0a8"],
    ["#f5e4ee", "#a06080", "#e0a8c8"],
  ];
  const [background, accent, mid] = palettes[index % palettes.length];
  const safeTitle = title.replace(/[<>&"]/g, " ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${background}"/><circle cx="600" cy="400" r="310" fill="none" stroke="${mid}" stroke-width="1" opacity=".5"/><circle cx="600" cy="400" r="430" fill="none" stroke="${mid}" stroke-width="1" opacity=".3"/><rect x="542" y="52" width="116" height="696" rx="24" fill="${accent}" opacity=".25"/><circle cx="600" cy="400" r="195" fill="${accent}"/><circle cx="600" cy="400" r="178" fill="${background}"/><g stroke="${accent}" stroke-width="4"><line x1="600" y1="232" x2="600" y2="254"/><line x1="600" y1="546" x2="600" y2="568"/><line x1="432" y1="400" x2="454" y2="400"/><line x1="746" y1="400" x2="768" y2="400"/></g><line x1="600" y1="400" x2="600" y2="300" stroke="${accent}" stroke-width="7" stroke-linecap="round"/><line x1="600" y1="400" x2="672" y2="436" stroke="${accent}" stroke-width="5" stroke-linecap="round"/><circle cx="600" cy="400" r="8" fill="${accent}"/><text x="600" y="358" text-anchor="middle" font-family="serif" font-size="16" letter-spacing="4" fill="${accent}">TIMECT</text><text x="52" y="732" font-family="sans-serif" font-size="13" letter-spacing="3" fill="${accent}">WOMEN'S WATCH GUIDE</text><text x="52" y="762" font-family="serif" font-size="20" fill="${accent}">${safeTitle}</text></svg>`;
}

async function seedWomenWatchesArticles() {
  const authorRows = await sql`SELECT id FROM blog_authors ORDER BY id LIMIT 1`;
  if (!authorRows.length) throw new Error("No blog author found. Run the base blog seed first.");
  const authorId = authorRows[0].id;

  const categoryRows = await sql`
    INSERT INTO blog_categories (name, slug, description, seo_title, seo_description, sort_order)
    VALUES (
      'Women''s Watches',
      'womens-watches',
      'Style guides, size advice, trending designs, and buying recommendations for women''s watches.',
      'Women''s Watch Guides | Timect',
      'Discover trending women''s watches, size guides, style tips, and expert buying advice for every occasion.',
      2
    )
    ON CONFLICT (slug) DO UPDATE
      SET description = EXCLUDED.description,
          seo_title = EXCLUDED.seo_title,
          seo_description = EXCLUDED.seo_description
    RETURNING id
  `;
  const categoryId = categoryRows[0].id;

  const tagRows = await sql`
    INSERT INTO blog_tags (name, slug, description)
    VALUES ('Women''s Watches', 'womens-watches', 'Guides and style advice for women''s watch selection and styling.')
    ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
  `;
  const tagId = tagRows[0].id;

  for (let index = 0; index < articles.length; index++) {
    const article = articles[index];

    const existing = await sql`
      SELECT id, featured_image_id, featured_image_url FROM blog_posts WHERE slug = ${article.slug} LIMIT 1
    `;
    let imageId: number | null = existing[0]?.featured_image_id ?? null;
    let imageUrl: string | null = existing[0]?.featured_image_url ?? null;

    if (!imageId) {
      const svgBuffer = Buffer.from(editorialSvg(article.title, index), "utf8");
      const imageRows = await sql`
        INSERT INTO blog_images (file_name, mime_type, image_data, alt_text, caption, width, height, file_size, image_type, prompt)
        VALUES (
          ${`${article.slug}.svg`},
          'image/svg+xml',
          ${svgBuffer},
          ${`${article.title} - women's watch guide illustration`},
          ${`Editorial illustration for ${article.title}`},
          1200,
          800,
          ${svgBuffer.length},
          'editorial',
          ${`Women's watch editorial illustration: ${article.title}`}
        )
        RETURNING id
      `;
      imageId = imageRows[0].id;
      imageUrl = `/api/blog/images/${imageId}`;
    }

    const publishedAt = new Date(Date.now() - index * 86_400_000).toISOString();

    const postRows = await sql`
      INSERT INTO blog_posts (
        title, slug, subtitle, excerpt, content_html,
        featured_image_id, featured_image_url,
        author_id, category_id,
        status, is_featured, is_trending,
        reading_time_minutes, published_at, created_at, updated_at
      )
      VALUES (
        ${article.title}, ${article.slug}, ${article.subtitle}, ${article.excerpt},
        ${articleHtml(article)},
        ${imageId}, ${imageUrl},
        ${authorId}, ${categoryId},
        'published', ${article.isFeatured}, ${article.isTrending},
        ${article.readTime}, ${publishedAt}, NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        excerpt = EXCLUDED.excerpt,
        content_html = EXCLUDED.content_html,
        featured_image_id = EXCLUDED.featured_image_id,
        featured_image_url = EXCLUDED.featured_image_url,
        author_id = EXCLUDED.author_id,
        category_id = EXCLUDED.category_id,
        status = EXCLUDED.status,
        is_featured = EXCLUDED.is_featured,
        is_trending = EXCLUDED.is_trending,
        reading_time_minutes = EXCLUDED.reading_time_minutes,
        updated_at = NOW()
      RETURNING id
    `;
    const postId = postRows[0].id;

    const metaTitle =
      article.title.length <= 58 ? article.title : `${article.title.slice(0, 55).trim()}...`;

    await sql`
      INSERT INTO blog_post_seo (
        blog_post_id, meta_title, meta_description, canonical_url,
        focus_keyword, secondary_keywords,
        og_title, og_description, og_image_url,
        robots_index, robots_follow,
        search_intent, target_entities, direct_answer,
        seo_score, geo_score, aeo_score, schema_type
      )
      VALUES (
        ${postId}, ${metaTitle}, ${article.excerpt.slice(0, 158)},
        ${`/blog/${article.slug}`},
        ${article.focusKeyword}, ${article.secondaryKeywords},
        ${article.title}, ${article.excerpt}, ${imageUrl},
        TRUE, TRUE,
        'Informational',
        ${["Wristwatch", "Women's Fashion", "Watch Styling", "Jewellery", "Personal Style"]},
        ${article.directAnswer},
        92, 89, 93, 'Article'
      )
      ON CONFLICT (blog_post_id) DO UPDATE SET
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        canonical_url = EXCLUDED.canonical_url,
        focus_keyword = EXCLUDED.focus_keyword,
        secondary_keywords = EXCLUDED.secondary_keywords,
        og_title = EXCLUDED.og_title,
        og_description = EXCLUDED.og_description,
        og_image_url = EXCLUDED.og_image_url,
        direct_answer = EXCLUDED.direct_answer,
        updated_at = NOW()
    `;

    const faqFeed = buildSeedFaqs(article.faqs, {
      focusKeyword: article.focusKeyword,
      directAnswer: article.directAnswer,
    });

    await sql`DELETE FROM blog_post_faqs WHERE blog_post_id = ${postId}`;
    for (let faqIndex = 0; faqIndex < faqFeed.length; faqIndex++) {
      const faq = faqFeed[faqIndex];
      await sql`
        INSERT INTO blog_post_faqs (blog_post_id, question, answer, sort_order)
        VALUES (${postId}, ${faq.question}, ${faq.answer}, ${faqIndex})
      `;
    }

    await sql`
      INSERT INTO blog_post_tags (blog_post_id, blog_tag_id)
      VALUES (${postId}, ${tagId})
      ON CONFLICT DO NOTHING
    `;

    console.log(`✓ Published: ${article.title}`);
  }

  console.log(`\n✅ Seeded ${articles.length} Women's Watches articles successfully.`);
}

seedWomenWatchesArticles().catch((error) => {
  console.error("Women's watches blog seed failed:", error);
  process.exit(1);
});
