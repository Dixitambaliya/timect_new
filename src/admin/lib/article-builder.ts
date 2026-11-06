export interface ArticleSection {
  id: string;
  type: "paragraph" | "heading" | "italic_lead" | "bullet_points";
  content: string; // text or newline-separated items for bullet_points
}

/**
 * Converts structured blocks into clean semantic HTML for frontend rendering & SEO
 */
export function sectionsToHtml(sections: ArticleSection[]): string {
  return sections
    .map((sec) => {
      const trimmed = (sec.content || "").trim();
      if (!trimmed) return "";

      switch (sec.type) {
        case "heading":
          return `<h2 class="text-2xl font-serif font-bold text-ink mt-8 mb-4">${escapeHtml(trimmed)}</h2>`;

        case "italic_lead":
          return `<p class="lead font-serif text-xl italic text-ink/90 leading-relaxed border-l-2 border-primary/40 pl-5 mb-8">${escapeHtml(trimmed)}</p>`;

        case "bullet_points": {
          const items = trimmed
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
          if (!items.length) return "";
          const listHtml = items.map((li) => `<li class="my-1.5">${escapeHtml(li)}</li>`).join("");
          return `<ul class="list-disc pl-6 my-4 space-y-1.5 text-ink/80">${listHtml}</ul>`;
        }

        case "paragraph":
        default:
          return `<p class="mb-4 text-ink/80 leading-relaxed">${escapeHtml(trimmed)}</p>`;
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Parses existing HTML content or fallback text into structured blocks
 */
export function htmlToSections(htmlOrText: string): ArticleSection[] {
  if (!htmlOrText || !htmlOrText.trim()) {
    return [
      { id: "1", type: "italic_lead", content: "" },
      { id: "2", type: "paragraph", content: "" },
    ];
  }

  // Quick parser if raw text or standard HTML
  const clean = htmlOrText.trim();
  const sections: ArticleSection[] = [];

  // Match HTML tags if present
  const regex = /<(h2|p|ul)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  let index = 0;

  while ((match = regex.exec(clean)) !== null) {
    const tag = match[1].toLowerCase();
    const rawInner = match[2];

    if (tag === "h2") {
      sections.push({
        id: String(++index),
        type: "heading",
        content: stripHtmlTags(rawInner),
      });
    } else if (tag === "p") {
      const isLead = match[0].includes("italic") || match[0].includes("lead");
      sections.push({
        id: String(++index),
        type: isLead ? "italic_lead" : "paragraph",
        content: stripHtmlTags(rawInner),
      });
    } else if (tag === "ul") {
      const liMatches = rawInner.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      const items = liMatches.map((li) => stripHtmlTags(li.replace(/<\/?li[^>]*>/gi, "")));
      sections.push({
        id: String(++index),
        type: "bullet_points",
        content: items.join("\n"),
      });
    }
  }

  if (sections.length > 0) {
    return sections;
  }

  // Fallback: split by double line breaks
  const paragraphs = clean.split(/\n\s*\n/);
  return paragraphs.map((p, i) => ({
    id: String(i + 1),
    type: i === 0 ? "italic_lead" : "paragraph",
    content: stripHtmlTags(p),
  }));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}
