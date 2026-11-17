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
  sections: Section[];
  faqs: { question: string; answer: string }[];
};

const articles: Article[] = [
  {
    title: "How to Choose the Perfect Watch for Your Outfit",
    slug: "how-to-choose-perfect-watch-for-your-outfit",
    subtitle: "A practical formula for matching dial, case, strap, and proportions to what you wear.",
    excerpt: "Learn how to choose the perfect watch for any outfit by balancing formality, color, materials, proportions, and the details already in your wardrobe.",
    focusKeyword: "how to choose a watch for your outfit",
    secondaryKeywords: ["match watch with outfit", "watch styling guide", "best watch for clothing style", "watch fashion tips"],
    directAnswer: "Choose a watch for your outfit by matching its level of formality first, then coordinating its case and strap with your other accessories. Keep the watch proportionate to your wrist and clothing silhouette, and use the dial as either a neutral anchor or one deliberate accent color.",
    readTime: 8,
    sections: [
      { heading: "Start with the outfit's level of formality", paragraphs: ["The most reliable way to choose a watch is to read the outfit before looking at the watch box. A tailored suit, a relaxed linen shirt, denim, and sportswear each communicate a different level of formality. The watch should speak the same visual language. Thin dress watches with uncluttered dials suit tailoring; versatile field or everyday watches complement smart casual clothes; robust sports watches belong naturally with relaxed or technical outfits.", "This is a guideline rather than a rigid rule. A restrained steel sports watch can work with a modern suit, but an oversized diving bezel under a narrow shirt cuff usually feels accidental. When in doubt, choose the quieter and slimmer option."], tips: ["Formal tailoring: slim case, simple dial, leather or fine bracelet.", "Smart casual: clean three-hand watch, modest texture, steel or leather.", "Relaxed outfits: field, dive, chronograph, or colorful everyday watch."] },
      { heading: "Coordinate materials before matching exact colors", paragraphs: ["A watch does not need to be the exact color of your clothing. Material harmony matters more. A polished case, glossy leather strap, and refined dial echo a sharp blazer and leather shoes. Brushed steel, canvas, rubber, and matte dials feel more natural beside denim, knitwear, sneakers, and utility fabrics.", "Use your belt, shoes, bag hardware, rings, and cufflinks as visual clues. Brown leather can range from tan to espresso without being identical; the shared warmth makes the combination coherent. Steel watches are highly adaptable and can bridge both warm and cool outfits." ] },
      { heading: "Use dial color as an anchor or an accent", paragraphs: ["Black, white, silver, cream, and navy dials are wardrobe anchors because they repeat easily and rarely compete with patterns. Green, burgundy, ice blue, and other expressive dials work best as a controlled accent. Repeat the accent once-in a tie, pocket square, sock, or subtle print-rather than matching every element.", "For patterned shirts or layered outfits, reduce visual noise with a simple dial. With monochrome clothing, a textured or colored dial can add personality without overwhelming the look."], tips: ["Repeat one watch color once elsewhere in the outfit.", "Pair busy clothing with a calm dial.", "Let a colorful dial be the focal point of a neutral outfit."] },
      { heading: "Check proportion, cuff clearance, and comfort", paragraphs: ["The right watch must look intentional on your wrist. Case diameter matters, but lug-to-lug length and thickness often matter more. The lugs should not overhang your wrist, and a formal watch should slide comfortably beneath the cuff. Wide cases and thick bezels add visual weight, which suits heavier fabrics and relaxed silhouettes; compact cases complement fine tailoring and minimal clothing.", "Finally, wear the combination for several minutes. Sit, move your wrist, and check it in natural light. The perfect outfit watch is not simply photogenic-it stays comfortable and feels like part of what you are wearing."] }
    ],
    faqs: [
      { question: "Does my watch have to match my belt and shoes?", answer: "No exact match is required. Aim for the same color family and level of formality; medium-brown shoes can work with a tan or dark-brown strap when their undertones feel compatible." },
      { question: "Can I wear a sports watch with a suit?", answer: "Yes, if it is reasonably slim, restrained, and fits beneath the cuff. For conservative events, a simple dress watch remains the safest choice." }
    ]
  },
  {
    title: "Best Watch Colors for Different Skin Tones",
    slug: "best-watch-colors-for-different-skin-tones",
    subtitle: "How undertone, contrast, metals, dials, and straps can help a watch flatter your wrist.",
    excerpt: "Find flattering watch colors for warm, cool, and neutral skin tones, with practical guidance on case metals, dial shades, leather straps, and contrast.",
    focusKeyword: "best watch colors for skin tone",
    secondaryKeywords: ["watch for warm skin tone", "watch for cool skin tone", "watch color guide", "gold or silver watch skin tone"],
    directAnswer: "Warm undertones are often complemented by yellow gold, rose gold, bronze, cream, olive, and rich brown; cool undertones often suit steel, silver, white gold, black, navy, and jewel-toned dials. Neutral undertones can wear both. Contrast, outfit colors, and personal preference matter more than any fixed rule.",
    readTime: 7,
    sections: [
      { heading: "Identify undertone-not simply skin depth", paragraphs: ["Skin depth and undertone are different. People with light, medium, or deep skin can have warm, cool, or neutral undertones. In daylight, a golden, peach, or olive cast usually suggests warmth; a pink, red, or bluish cast suggests coolness; a balanced mix suggests neutral undertones. Vein color and preferred jewelry can offer clues, but neither test is definitive.", "Treat undertone guidance as a starting point. Your clothing palette, hair color, and the amount of contrast you enjoy can change which watch looks best." ] },
      { heading: "Colors that complement warm and olive undertones", paragraphs: ["Yellow gold, rose gold, bronze, champagne, cream, chocolate, cognac, olive, and deep green tend to echo the natural warmth in the skin. Brown leather straps are especially effective because their red or golden undertones create a smooth transition between case and wrist.", "For stronger contrast, try a dark navy or black dial in a warm metal case. The cool dial adds definition while the case maintains harmony."], tips: ["Low contrast: champagne dial with gold-tone case.", "Balanced contrast: cream dial with brown leather.", "Bold contrast: black or navy dial with bronze or gold-tone details."] },
      { heading: "Colors that complement cool undertones", paragraphs: ["Stainless steel, titanium, silver, white gold, black, crisp white, navy, blue, plum, and emerald often sit cleanly against cool undertones. Black leather creates a sharp formal look, while grey, navy, or burgundy straps offer color without introducing obvious warmth.", "If yellow gold is your preference, wear it confidently. A white, black, or blue dial can create separation between the warm case and cool skin, making the contrast look deliberate." ] },
      { heading: "Neutral undertones and the importance of contrast", paragraphs: ["Neutral undertones usually accommodate both warm and cool metals, making wardrobe context the better deciding factor. Choose steel when your outfit includes grey, black, blue, or silver hardware; choose gold or brown when wearing camel, cream, rust, olive, or gold accessories.", "Deep skin tones can carry luminous white, saturated jewel tones, polished gold, and bright steel with striking contrast. Lighter skin may favor softer contrast for subtlety or dark dials for definition. The best test is to compare watches in indirect daylight and notice whether you see the watch and wearer together, rather than the color overpowering the wrist." ] }
    ],
    faqs: [
      { question: "Should cool skin tones avoid gold watches?", answer: "No. Undertone advice is optional, not a restriction. Pairing a gold case with a cool dial or clothing palette can create attractive intentional contrast." },
      { question: "What watch color is most universally flattering?", answer: "A stainless-steel case with a black, white, silver, or navy dial is the most adaptable choice across skin tones and wardrobes." }
    ]
  },
  {
    title: "Which Watch to Wear with Formal, Casual, or Traditional Clothing",
    slug: "watch-for-formal-casual-traditional-clothing",
    subtitle: "A dress-code guide for suits, weekend outfits, kurtas, sherwanis, sarees, and festive looks.",
    excerpt: "Choose the right watch for formal, casual, and traditional clothing with clear advice on case size, dial design, straps, metals, and cultural occasion wear.",
    focusKeyword: "watch for formal casual traditional clothing",
    secondaryKeywords: ["watch with suit", "watch with kurta", "watch with sherwani", "watch for casual outfit", "watch with saree"],
    directAnswer: "Wear a slim, simple watch with formal clothing; a durable, expressive watch with casual clothing; and a refined watch coordinated with the metal, embroidery, or color story of traditional clothing. The watch should support the outfit rather than compete with it.",
    readTime: 8,
    sections: [
      { heading: "Formal clothing: quiet design and slim proportions", paragraphs: ["With business suits, tuxedos, and structured dresses, choose a watch that is slim enough to pass beneath the cuff. A clean two- or three-hand dial, discreet indices, and a case around 36–40 mm generally create a polished effect. Black leather is most formal, while dark brown works beautifully with navy, charcoal, and earth-toned tailoring.", "A fine steel bracelet can suit contemporary business wear, particularly when other accessories use silver-tone metal. Avoid bulky bezels, oversized crowns, bright rubber, and crowded dials at conservative events." ] },
      { heading: "Casual clothing: texture, utility, and personality", paragraphs: ["Casual outfits allow more freedom. Denim, polos, overshirts, chinos, knitwear, and sneakers pair naturally with steel sports watches, field watches, chronographs, canvas straps, and textured leather. Let the weight of the watch reflect the clothing: a substantial dive watch suits a denim jacket better than it suits a fine linen shirt.", "Color is welcome, but keep a connection to the outfit. A navy dial can echo jeans; an olive strap can pick up a jacket; a cream dial can soften warm neutrals."], tips: ["Weekend minimal: steel watch with a white or black dial.", "Rugged casual: field watch on canvas or distressed leather.", "Sport-inspired: bracelet or rubber strap with a legible dial."] },
      { heading: "Traditional Indian clothing: coordinate, do not costume", paragraphs: ["For kurtas, bandhgalas, sherwanis, sarees, and festive ensembles, look at the garment's embroidery, buttons, zari, and jewelry. Gold-tone or rose-gold watches harmonize with warm metallic work; polished steel and white dials suit silver, mirror, or cool-toned detailing. A slim case usually integrates more gracefully than a thick tool watch.", "With an ornate garment, choose a restrained dial so the watch does not compete. With a minimal solid-color kurta or saree, a textured dial, elegant bracelet, or rich leather strap can provide the focal detail. Deep green, burgundy, navy, champagne, and ivory are especially versatile festive colors." ] },
      { heading: "A simple dress-code decision", paragraphs: ["Ask three questions: How formal is the event? Which metal or color already leads the outfit? How visually detailed is the clothing? As formality and ornament increase, reduce the watch's size and dial complexity. When the outfit becomes more relaxed and minimal, you can add texture, color, or sportier construction.", "Cultural dress has room for personal expression. Heirloom watches and meaningful gifts can be more appropriate than a technically perfect match because their story belongs to the occasion." ] }
    ],
    faqs: [
      { question: "Can I wear a smartwatch with traditional clothing?", answer: "You can, but a neutral face and refined leather or metal strap will integrate better than a bright silicone band. For weddings and ceremonies, an analog watch usually looks more polished." },
      { question: "What watch works with both formal and casual clothes?", answer: "A medium-size steel three-hand watch with a black, white, silver, or navy dial and an interchangeable leather strap is exceptionally versatile." }
    ]
  },
  {
    title: "How to Match Your Watch with Your Outfit Colors",
    slug: "how-to-match-watch-with-outfit-colors",
    subtitle: "An easy color-theory guide to dials, straps, metals, neutrals, and accent colors.",
    excerpt: "Use simple color theory to match your watch with outfit colors without looking over-coordinated, from neutral combinations to complementary accents.",
    focusKeyword: "how to match watch with outfit colors",
    secondaryKeywords: ["watch color matching", "dial color outfit", "strap color clothing", "watch and outfit combinations"],
    directAnswer: "Match a watch to outfit colors by choosing one of three approaches: repeat a color already present, use a neutral watch that supports the palette, or add one complementary accent. Coordinate metal with accessories and keep either the outfit or the watch visually dominant-not both.",
    readTime: 7,
    sections: [
      { heading: "Build around neutrals first", paragraphs: ["Black, white, grey, navy, cream, brown, and steel behave like wardrobe neutrals. A steel watch with a white, black, or navy dial can accompany most color palettes. Brown leather is strongest with cream, beige, camel, olive, navy, and denim, while black leather sharpens monochrome, charcoal, and cool business colors.", "If your wardrobe is varied, begin with a neutral watch and add alternative straps later. Strap changes alter the visual temperature and formality more dramatically than most people expect." ] },
      { heading: "Choose repetition, harmony, or contrast", paragraphs: ["Repetition is the simplest method: echo the navy dial in a jacket, the brown strap in shoes, or the green accent in a shirt pattern. Harmony uses neighboring colors, such as a blue dial with teal or violet clothing. Contrast uses opposites-a restrained orange detail against navy, or burgundy beside forest green-to create energy.", "Exact matching can feel overly calculated. Aim for related shades and repeat only one or two cues. A pale-blue shirt does not require the same pale-blue dial; navy provides depth while staying connected."], tips: ["Repeat one dominant color or one small accent.", "Use analogous shades for a calm combination.", "Use complementary color in a small dose for contrast."] },
      { heading: "Coordinate case metal with outfit hardware", paragraphs: ["Belt buckles, rings, eyewear, cufflinks, bag hardware, and shoe details create a metallic color story. Matching every metal is unnecessary, but repeating the dominant finish makes an outfit feel considered. Brushed steel reads casual and modern; polished steel feels sharper; yellow and rose gold add warmth and occasion.", "Mixed metals work when repeated. A two-tone watch is a useful bridge if you regularly combine gold jewelry with silver-tone accessories." ] },
      { heading: "Handle prints and statement colors carefully", paragraphs: ["With stripes, checks, florals, or strong traditional textiles, select a watch color from the quieter secondary tones rather than the loudest color. Alternatively, use a neutral dial and let the pattern lead. With an all-neutral outfit, the watch can become the statement through a green, burgundy, blue, or textured dial.", "Before leaving, view the whole outfit from a few steps away. If your eye jumps between several competing accents, simplify the strap or dial. Good color matching creates a clear focal point." ] }
    ],
    faqs: [
      { question: "Should my watch dial match my shirt?", answer: "It can, but it does not need to. A related shade, a neutral dial, or one complementary accent often looks more natural than an exact match." },
      { question: "What watch color goes with everything?", answer: "Steel with a black, white, silver, or navy dial is the easiest universal combination. Dark-brown leather is another versatile choice for warm and smart-casual wardrobes." }
    ]
  },
  {
    title: "Best Watches for Men Based on Personal Style",
    slug: "best-watches-for-men-by-personal-style",
    subtitle: "Find the watch archetype that fits a minimalist, classic, rugged, sporty, creative, or luxury wardrobe.",
    excerpt: "Discover the best watches for men by personal style, with practical recommendations for minimalist, classic, rugged, sporty, creative, and refined wardrobes.",
    focusKeyword: "best watches for men by personal style",
    secondaryKeywords: ["men's watch style guide", "watch for minimalist man", "watch for classic style", "watch for rugged style"],
    directAnswer: "The best watch for a man's personal style mirrors the shapes, colors, and materials he already wears. Minimalists suit clean three-hand watches; classic dressers suit slim dress watches; rugged wardrobes suit field or dive watches; sporty styles suit chronographs; creative dressers can use unusual dial colors or vintage proportions.",
    readTime: 8,
    sections: [
      { heading: "The minimalist", paragraphs: ["A minimalist wardrobe built around clean lines and neutral colors benefits from a simple two- or three-hand watch. Look for a restrained 36–40 mm case, uncluttered markers, a monochrome dial, and a smooth leather strap or fine steel bracelet. Finishing and proportion matter more than extra functions.", "Choose black or white for maximum graphic clarity, silver for softness, or navy for subtle color. Avoid unnecessary dial text and oversized cases that interrupt the calm silhouette." ] },
      { heading: "The classic and tailored dresser", paragraphs: ["If you favor Oxford shirts, tailored trousers, blazers, loafers, and timeless outerwear, consider a slim dress watch or an elegant everyday watch. Roman numerals, applied indices, small seconds, and warm leather can add character without dating quickly.", "A steel case with both a bracelet and a leather strap creates a compact two-look collection: bracelet for daily business wear, leather for formal occasions." ] },
      { heading: "The rugged or outdoors-inspired dresser", paragraphs: ["Workwear, boots, denim, flannel, and utility jackets suit watches with high legibility and tactile materials. Field watches, dive watches, brushed cases, canvas straps, and grained leather feel authentic in this context. Water resistance and lume also add practical value.", "Keep scale controlled. Rugged does not require enormous; a compact field watch often looks more purposeful and is easier to wear every day." ] },
      { heading: "The sporty, creative, and statement dresser", paragraphs: ["Athletic wardrobes work well with chronographs, integrated bracelets, dive watches, and durable rubber straps. Creative wardrobes can support asymmetrical cases, vintage sizing, unusual typography, stone or textured dials, and saturated color. The key is to connect the watch to at least one repeated element-shape, material, or color-so it feels curated.", "For a luxury-oriented style, prioritize finish, bracelet articulation, dial depth, and proportion over visible branding. A watch appears more refined when it fits properly and complements the wardrobe consistently."], tips: ["Buy for the clothes you wear weekly, not an imagined future wardrobe.", "Choose one versatile watch before adding specialist pieces.", "Personality comes from proportion and detail as much as price."] }
    ],
    faqs: [
      { question: "How many watches does a man need?", answer: "One versatile everyday watch can be enough. A practical three-watch collection might include an everyday steel watch, a slim formal watch, and a durable sports or casual watch." },
      { question: "What is the safest first watch style for men?", answer: "A 38–40 mm steel watch with a clean black, white, silver, or navy dial is adaptable across office, casual, and many formal settings." }
    ]
  },
  {
    title: "How to Choose the Right Watch for Different Occasions",
    slug: "how-to-choose-watch-for-different-occasions",
    subtitle: "From interviews and client meetings to travel, dates, celebrations, and weekends.",
    excerpt: "Choose the right watch for work, interviews, dates, travel, weddings, sports, and everyday occasions using this practical dress-code guide.",
    focusKeyword: "watch for different occasions",
    secondaryKeywords: ["watch for interview", "watch for wedding", "watch for date night", "watch for travel", "occasion watch guide"],
    directAnswer: "Choose an occasion watch by balancing dress code, activity, and desired impression. Formal events call for slim, restrained designs; work favors legible versatility; travel benefits from durability and useful time-zone functions; active settings require water resistance and secure straps.",
    readTime: 8,
    sections: [
      { heading: "Interviews, office days, and client meetings", paragraphs: ["For an interview, choose a discreet watch that signals care without demanding attention. A clean dial, medium size, and steel bracelet or dark leather strap works in most industries. In conservative fields, avoid conspicuous branding, loud colors, and oversized sports cases.", "Daily office wear can be more expressive. A navy or green dial, textured leather, or refined sports bracelet adds personality while remaining professional. Ensure the watch clears the cuff and is comfortable at a keyboard." ] },
      { heading: "Dates, dinners, and parties", paragraphs: ["Evening occasions reward texture and controlled contrast. A dark dial, polished case, rich leather strap, or subtle metallic finish catches low light attractively. Coordinate with shoes, jewelry, or jacket hardware, but avoid matching every detail.", "For a party, a colorful dial or distinctive bracelet can become a conversation piece. On a date, choose something that reflects your actual style; authenticity is more compelling than wearing the most expensive watch available." ] },
      { heading: "Weddings and traditional celebrations", paragraphs: ["Guests should match the event's formality without upstaging the principal participants. A slim dress watch, elegant bracelet watch, or tasteful heirloom is appropriate. Coordinate gold or silver tones with garment embroidery and jewelry. For daytime celebrations, cream, champagne, silver, or pale dials feel light; dark dials bring drama to evening events.", "If you are the groom, consider a watch with personal meaning and enough versatility to wear after the wedding. Check that it sits comfortably beneath sherwani, bandhgala, or suit sleeves during fittings." ] },
      { heading: "Travel, weekends, and active occasions", paragraphs: ["Travel watches should be legible, comfortable, and adaptable. A GMT or dual-time function is useful, but strong water resistance, a secure bracelet, and a neutral dial may matter more. Avoid taking an irreplaceable heirloom into conditions where loss or impact is likely.", "For swimming or sport, follow the manufacturer's water-resistance guidance and use a secure bracelet or rubber strap. For relaxed weekends, choose freely: this is where field watches, dive watches, chronographs, and playful colors feel most natural."], tips: ["Match the watch to the activity, not only the venue.", "Choose discretion when the occasion centers on someone else.", "Prioritize comfort for long events and travel days."] }
    ],
    faqs: [
      { question: "What watch should I wear to a job interview?", answer: "Choose a clean, medium-size watch on steel or dark leather. It should look maintained and discreet, without bright colors or distracting complications." },
      { question: "Is it acceptable to wear no watch to a formal event?", answer: "Yes. A watch is optional, and traditional etiquette sometimes discourages visibly checking the time at highly formal social events." }
    ]
  },
  {
    title: "Leather Strap vs Metal Bracelet: Which Suits Your Style?",
    slug: "leather-strap-vs-metal-bracelet-style-guide",
    subtitle: "Compare formality, comfort, climate, durability, color, and wardrobe versatility.",
    excerpt: "Compare leather watch straps and metal bracelets to decide which best suits your wardrobe, climate, comfort preferences, occasions, and personal style.",
    focusKeyword: "leather strap vs metal bracelet",
    secondaryKeywords: ["leather watch strap style", "metal watch bracelet style", "best watch strap for outfit", "watch strap guide"],
    directAnswer: "Choose leather for warmth, lightness, traditional formality, and easy color changes. Choose a metal bracelet for durability, water resistance, visual presence, and all-season versatility. The best option depends on climate, dress code, and how much maintenance you accept.",
    readTime: 7,
    sections: [
      { heading: "How each option changes the character of a watch", paragraphs: ["Leather softens a watch and adds color, texture, and traditional elegance. Smooth black leather makes a watch more formal; brown calf or suede makes it relaxed; grained or distressed leather adds a rugged note. Because straps are easy to change, one watch can move between several wardrobes.", "A metal bracelet gives more visual structure and continuity from case to wrist. Fine links and polished details feel dressier, while brushed three-link bracelets feel sporty and robust. An integrated bracelet creates an especially modern, design-led look." ] },
      { heading: "Comfort, climate, and daily wear", paragraphs: ["Leather is lightweight and warms quickly to the wrist, but sweat, rain, and humidity shorten its life. In hot or monsoon climates, rotate straps, allow them to dry, and avoid wearing fine leather during exercise. Lined or water-resistant leather improves practicality but still needs care.", "Steel and titanium tolerate moisture better and are easier to clean. A well-fitted bracelet should move without pinching and should not slide over the hand. Titanium is lighter and useful for those who find steel heavy, though its grey tone looks more technical." ] },
      { heading: "Which one fits your wardrobe?", paragraphs: ["Choose leather if your wardrobe centers on tailoring, business casual, knitwear, heritage pieces, or warm earth colors. Choose a bracelet if you wear denim, polos, technical fabrics, monochrome outfits, or need one watch to move from work to weekends. Both can cross categories when the case and dial are restrained.", "Consider other accessories. Leather straps can echo belts, shoes, and bags; bracelets connect naturally with rings, eyewear hardware, and belt buckles."], tips: ["Black smooth leather: most formal.", "Brown grained leather: versatile smart casual.", "Brushed steel: durable everyday option.", "Fine-link or polished bracelet: refined and dress-oriented."] },
      { heading: "The versatile answer: use both", paragraphs: ["If the watch has conventional lugs, owning both a bracelet and two leather straps is often more useful than buying another watch. Start with the factory bracelet because a perfectly fitted replacement can be difficult to source later. Add black or dark-brown leather for formal wear and a lighter textured strap for casual outfits.", "Use quick-release spring bars when compatible, but confirm strap width and keep the case supported during changes. A secure fit matters more than novelty." ] }
    ],
    faqs: [
      { question: "Is a leather strap more formal than a metal bracelet?", answer: "Traditionally, smooth dark leather is the most formal. Fine metal bracelets can still look elegant and are common with modern business and occasion wear." },
      { question: "Which lasts longer, leather or metal?", answer: "A maintained metal bracelet can last decades. Leather is a consumable item and may last from one to several years depending on quality, climate, sweat, and rotation." }
    ]
  },
  {
    title: "Watch Styling Tips for Office Wear, Parties, and Weddings",
    slug: "watch-styling-office-parties-weddings",
    subtitle: "Three dress codes, one clear guide to choosing the right dial, case, strap, and accessories.",
    excerpt: "Master watch styling for office wear, parties, and weddings with practical advice on formality, color coordination, proportions, straps, and accessories.",
    focusKeyword: "watch styling tips for office parties weddings",
    secondaryKeywords: ["watch for office wear", "watch for party outfit", "watch for wedding outfit", "formal watch styling"],
    directAnswer: "For office wear, choose a legible, understated watch that fits beneath the cuff. For parties, introduce controlled color, shine, or texture. For weddings, prioritize elegance, cultural context, and coordination with tailoring, jewelry, or traditional garment details.",
    readTime: 8,
    sections: [
      { heading: "Office wear: polished, legible, and comfortable", paragraphs: ["An office watch should support your professional image and remain comfortable through a full day. A medium-size three-hand watch, restrained chronograph, or refined steel sports watch works across most workplaces. Black, white, silver, and navy dials are easy to combine; dark green and burgundy add subtle personality.", "Check that the case does not catch on a shirt cuff and that a bracelet does not strike the desk while typing. Match the watch's finish to the workplace: polished leather and slim cases for formal offices; brushed steel and textured straps for creative or business-casual environments."], tips: ["Keep the dial readable at a glance.", "Avoid a case that overhangs the wrist.", "Use one subtle color connection to a shirt, tie, or belt."] },
      { heading: "Parties: let one detail lead", paragraphs: ["Parties give you permission to be expressive. Select one leading feature: a vivid dial, polished bracelet, unusual case shape, or richly textured strap. Keep the remaining elements controlled so the watch feels intentional rather than crowded.", "Evening light rewards sunburst dials, applied markers, polished bevels, and deeper colors such as black, navy, emerald, and burgundy. For a relaxed daytime event, lighter dials and tan or suede straps feel more effortless." ] },
      { heading: "Weddings: elegance with personal meaning", paragraphs: ["For suits and tuxedos, a slim dress watch on dark leather is the classic answer. With a sherwani, bandhgala, kurta, saree, or lehenga, coordinate the case metal with embroidery, jewelry, buttons, or other hardware. Champagne and gold tones suit warm zari; steel, white, and blue pair well with cool silver details.", "Avoid a watch so bulky that it disrupts the sleeve or competes with ornate clothing. An heirloom or gifted watch is often ideal because weddings are about memory as much as visual perfection." ] },
      { heading: "Details that improve every combination", paragraphs: ["Fit is the foundation: center the watch on the wrist, size the bracelet correctly, and keep leather in good condition. Clean the crystal and case before an important event. Coordinate metals loosely and leathers by family rather than chasing exact matches.", "Most importantly, preserve your personal style. A minimalist need not wear a jeweled watch to a party, and a sports-watch enthusiast can choose a slimmer steel model for a wedding. The goal is an elevated version of yourself."], tips: ["Office: quiet confidence.", "Party: one expressive focal point.", "Wedding: refined proportion and meaningful detail."] }
    ],
    faqs: [
      { question: "Can I wear the same watch to work and a wedding?", answer: "Yes. A slim steel watch with a clean dial can move from office bracelet to formal leather strap, making it suitable for both." },
      { question: "What watch dial color is best for weddings?", answer: "White, silver, cream, champagne, black, and navy are dependable. Choose based on the outfit's metal details, time of day, and desired contrast." }
    ]
  }
];

function articleHtml(article: Article) {
  const sections = article.sections.map((section, index) => `
    <section>
      <h2 id="${article.slug}-section-${index + 1}" class="text-2xl font-serif font-bold text-ink mt-10 mb-4">${section.heading}</h2>
      ${section.paragraphs.map((paragraph) => `<p class="mb-4 text-ink/80 leading-relaxed">${paragraph}</p>`).join("\n")}
      ${section.tips ? `<div class="my-7 rounded-fuse bg-bg/80 border border-line p-6"><h3 class="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Practical styling notes</h3><ul class="list-disc pl-5 space-y-2 text-ink/80 text-sm">${section.tips.map((tip) => `<li>${tip}</li>`).join("")}</ul></div>` : ""}
    </section>`).join("\n");

  return `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">${article.directAnswer}</p>${sections}<div class="my-10 rounded-fuse border border-line bg-white p-6"><h2 class="text-xl font-serif font-bold text-ink mb-3">The final fit check</h2><p class="text-ink/80 leading-relaxed">Use these principles as a framework rather than a rulebook. The best-styled watch fits comfortably, supports the occasion, and feels authentic to the person wearing it.</p></div>`;
}

function editorialSvg(title: string, index: number) {
  const palettes = [
    ["#ece5d8", "#6f4b36", "#d1a35b"], ["#dfe7ec", "#263746", "#b8c7d1"],
    ["#e5dfd5", "#253c35", "#c5a35b"], ["#e8e2dc", "#4b2940", "#d4a4b7"]
  ];
  const [background, strap, accent] = palettes[index % palettes.length];
  const safeTitle = title.replace(/[<>&"]/g, " ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${background}"/><circle cx="600" cy="400" r="330" fill="none" stroke="#ffffff" opacity=".28"/><rect x="530" y="42" width="140" height="716" rx="30" fill="${strap}"/><circle cx="600" cy="400" r="215" fill="${accent}"/><circle cx="600" cy="400" r="194" fill="#f9f7f2"/><g stroke="#34312d" stroke-width="5"><line x1="600" y1="226" x2="600" y2="252"/><line x1="600" y1="548" x2="600" y2="574"/><line x1="426" y1="400" x2="452" y2="400"/><line x1="748" y1="400" x2="774" y2="400"/></g><line x1="600" y1="400" x2="600" y2="292" stroke="#34312d" stroke-width="8" stroke-linecap="round"/><line x1="600" y1="400" x2="690" y2="442" stroke="${accent}" stroke-width="6" stroke-linecap="round"/><circle cx="600" cy="400" r="10" fill="#34312d"/><text x="600" y="352" text-anchor="middle" font-family="serif" font-size="18" letter-spacing="5" fill="#34312d">TIMECT</text><text x="52" y="725" font-family="sans-serif" font-size="15" letter-spacing="3" fill="#6b6258">WATCH STYLE &amp; FASHION</text><text x="52" y="755" font-family="serif" font-size="22" fill="#34312d">${safeTitle}</text></svg>`;
}

async function seedFashionArticles() {
  const authorRows = await sql`SELECT id FROM blog_authors ORDER BY id LIMIT 1`;
  if (!authorRows.length) throw new Error("No blog author exists. Run the base blog seed first.");
  const authorId = authorRows[0].id;

  const categoryRows = await sql`
    INSERT INTO blog_categories (name, slug, description, seo_title, seo_description, sort_order)
    VALUES ('Watch Style & Fashion', 'watch-style-fashion', 'Practical watch styling advice for outfits, skin tones, occasions, dress codes, and personal expression.', 'Watch Style & Fashion Guides | Timect Watches', 'Learn how to match watches with outfits, colors, skin tones, occasions, office wear, parties, weddings, and personal style.', 1)
    ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description
    RETURNING id
  `;
  const categoryId = categoryRows[0].id;

  const tagRows = await sql`
    INSERT INTO blog_tags (name, slug, description)
    VALUES ('Watch Style', 'watch-style', 'Watch styling, wardrobe coordination, and personal fashion advice.')
    ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
  `;
  const tagId = tagRows[0].id;

  for (let index = 0; index < articles.length; index++) {
    const article = articles[index];
    const existing = await sql`SELECT id, featured_image_id, featured_image_url FROM blog_posts WHERE slug = ${article.slug} LIMIT 1`;
    let imageId = existing[0]?.featured_image_id ?? null;
    let imageUrl = existing[0]?.featured_image_url ?? null;

    if (!imageId) {
      const image = Buffer.from(editorialSvg(article.title, index), "utf8");
      const imageRows = await sql`
        INSERT INTO blog_images (file_name, mime_type, image_data, alt_text, caption, width, height, file_size, image_type, prompt)
        VALUES (${`${article.slug}.svg`}, 'image/svg+xml', ${image}, ${`${article.title} - watch styling guide`}, ${`Editorial illustration for ${article.title}`}, 1200, 800, ${image.length}, 'editorial', ${`Fashion editorial watch illustration: ${article.title}`})
        RETURNING id
      `;
      imageId = imageRows[0].id;
      imageUrl = `/api/blog/images/${imageId}`;
    }

    const publishedAt = new Date(Date.now() - index * 86_400_000).toISOString();
    const postRows = await sql`
      INSERT INTO blog_posts (title, slug, subtitle, excerpt, content_html, featured_image_id, featured_image_url, author_id, category_id, status, is_featured, is_trending, reading_time_minutes, published_at, created_at, updated_at)
      VALUES (${article.title}, ${article.slug}, ${article.subtitle}, ${article.excerpt}, ${articleHtml(article)}, ${imageId}, ${imageUrl}, ${authorId}, ${categoryId}, 'published', FALSE, ${index < 2}, ${article.readTime}, ${publishedAt}, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, excerpt = EXCLUDED.excerpt, content_html = EXCLUDED.content_html, featured_image_id = EXCLUDED.featured_image_id, featured_image_url = EXCLUDED.featured_image_url, author_id = EXCLUDED.author_id, category_id = EXCLUDED.category_id, status = EXCLUDED.status, is_trending = EXCLUDED.is_trending, reading_time_minutes = EXCLUDED.reading_time_minutes, updated_at = NOW()
      RETURNING id
    `;
    const postId = postRows[0].id;
    const metaTitle = article.title.length <= 58 ? article.title : `${article.title.slice(0, 55).trim()}...`;

    await sql`
      INSERT INTO blog_post_seo (blog_post_id, meta_title, meta_description, canonical_url, focus_keyword, secondary_keywords, og_title, og_description, og_image_url, robots_index, robots_follow, search_intent, target_entities, direct_answer, seo_score, geo_score, aeo_score, schema_type)
      VALUES (${postId}, ${metaTitle}, ${article.excerpt.slice(0, 158)}, ${`/blog/${article.slug}`}, ${article.focusKeyword}, ${article.secondaryKeywords}, ${article.title}, ${article.excerpt}, ${imageUrl}, TRUE, TRUE, 'Informational', ${["Wristwatch", "Fashion", "Personal styling", "Watch strap", "Dress code"]}, ${article.directAnswer}, 94, 91, 95, 'Article')
      ON CONFLICT (blog_post_id) DO UPDATE SET meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description, canonical_url = EXCLUDED.canonical_url, focus_keyword = EXCLUDED.focus_keyword, secondary_keywords = EXCLUDED.secondary_keywords, og_title = EXCLUDED.og_title, og_description = EXCLUDED.og_description, og_image_url = EXCLUDED.og_image_url, direct_answer = EXCLUDED.direct_answer, updated_at = NOW()
    `;

    const faqFeed = buildSeedFaqs(article.faqs, {
      focusKeyword: article.focusKeyword,
      directAnswer: article.directAnswer,
    });
    await sql`DELETE FROM blog_post_faqs WHERE blog_post_id = ${postId}`;
    for (let faqIndex = 0; faqIndex < faqFeed.length; faqIndex++) {
      const faq = faqFeed[faqIndex];
      await sql`INSERT INTO blog_post_faqs (blog_post_id, question, answer, sort_order) VALUES (${postId}, ${faq.question}, ${faq.answer}, ${faqIndex})`;
    }
    await sql`INSERT INTO blog_post_tags (blog_post_id, blog_tag_id) VALUES (${postId}, ${tagId}) ON CONFLICT DO NOTHING`;
    console.log(`Published: ${article.title}`);
  }

  console.log(`Seeded ${articles.length} Watch Style & Fashion articles.`);
}

seedFashionArticles().catch((error) => {
  console.error("Fashion blog seed failed:", error);
  process.exit(1);
});
