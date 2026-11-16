export interface SeedFaq {
  question: string;
  answer: string;
}

/**
 * Produces a clean FAQ feed for seeded articles and guarantees enough content
 * for both the on-page FAQ section and FAQPage structured data.
 */
export function buildSeedFaqs(
  faqs: SeedFaq[] | undefined,
  context: { focusKeyword: string; directAnswer: string },
  minimum = 5,
): SeedFaq[] {
  const seen = new Set<string>();
  const normalized = (faqs ?? []).flatMap((faq) => {
    const question = faq.question.trim();
    const answer = faq.answer.trim();
    const key = question.toLocaleLowerCase();
    if (!question || !answer || seen.has(key)) return [];
    seen.add(key);
    return [{ question, answer }];
  });

  const fallbackFaqs: SeedFaq[] = [
    {
      question: `What should readers know about ${context.focusKeyword}?`,
      answer: context.directAnswer.trim(),
    },
    {
      question: `Why does ${context.focusKeyword} matter when choosing a watch?`,
      answer: `It helps narrow the options to watches that suit your real needs, wardrobe, and daily routine. Use the article's core criteria as a shortlist, then compare fit, comfort, materials, and long-term versatility before deciding.`,
    },
    {
      question: `What should beginners prioritize when considering ${context.focusKeyword}?`,
      answer: `Start with comfort, proportion, legibility, and how often the watch will be worn. A balanced, versatile choice is usually more useful than selecting a highly specialized design based on one feature alone.`,
    },
    {
      question: `Is there one best option for ${context.focusKeyword}?`,
      answer: `No single option suits everyone. Wrist size, personal taste, dress code, climate, budget, and maintenance preferences can all change the right choice, so treat recommendations as a practical framework rather than a fixed rule.`,
    },
    {
      question: `How can you apply this ${context.focusKeyword} advice in practice?`,
      answer: `Shortlist two or three options, try them with the clothing and activities they are intended for, and inspect the combination in natural light. Choose the watch that remains comfortable and visually balanced instead of relying only on specifications or trends.`,
    },
  ];

  for (const faq of fallbackFaqs) {
    if (normalized.length >= minimum) break;
    const key = faq.question.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(faq);
  }

  return normalized;
}
