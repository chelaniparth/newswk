/**
 * Convert text to title case (proper capitalization)
 */
export const toTitleCase = (str: string): string => {
  // Words that should stay lowercase unless they're the first word
  const minorWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in',
    'into', 'nor', 'of', 'on', 'or', 'over', 'the', 'to', 'with'
  ]);

  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize first word, or if not a minor word
      if (index === 0 || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
};

/**
 * Check if text is likely a navigation/category link rather than a real article
 */
export const isNavigationLink = (headline: string, url: string): boolean => {
  // Navigation links are usually short, all caps, and end with category URLs
  const categoryPatterns = [
    /\/government-trade\/?$/,
    /\/business-features\/?$/,
    /\/mergers-acquisitions\/?$/,
    /\/human-resources\/?$/,
    /\/financial\/?$/,
    /\/retail\/?$/,
    /\/legal\/?$/,
    /\/markets\/?$/,
    /\/media\/?$/,
    /\/technology\/?$/
  ];

  // Check if URL matches category patterns
  const isCategory = categoryPatterns.some(pattern => pattern.test(url));

  // Check if headline is very short and all caps (likely a category title)
  const isAllCaps = headline === headline.toUpperCase();
  const isShort = headline.split(' ').length <= 4;

  return isCategory && isAllCaps && isShort;
};

/**
 * Normalize headline text
 */
export const normalizeHeadline = (headline: string): string => {
  // If the headline is all caps, convert to title case
  if (headline === headline.toUpperCase() && headline.length > 10) {
    return toTitleCase(headline);
  }
  return headline;
};

/**
 * Auto-classify category based on headline keywords
 */
export const classifyCategory = (headline: string): string | undefined => {
  const lower = headline.toLowerCase();

  const rules: Record<string, string[]> = {
    "Mergers & Acquisitions": ["acquisition", " acquires ", " to buy ", "bought", "merger", "takeover", "buyout", "stake in"],
    "Human Resources": ["ceo", "appointed", "names", "executive", "president", "resigns", "steps down", "hired", "chief", "officer", "joins as"],
    "Financial": ["quarter", "earnings", "revenue", "sales", "profit", "results", "growth", "losses", "shares", "stock", "ipo"],
    "Retail": ["store", "opens", "launch", "popup", "flagship", "expansion", "retail", "shop"],
    "Legal": ["sues", "lawsuit", "legal", "court", "trademark", "ban", "regulation"],
    "Technology": ["ai ", "metaverse", "digital", "tech ", "software", "app ", " e-commerce"],
    "Deals": ["partnership", "collab", "deal", "agreement"]
  };

  for (const [category, keywords] of Object.entries(rules)) {
    if (keywords.some(k => lower.includes(k))) {
      return category;
    }
  }
  return undefined;
};

/**
 * Extract company names from headline with progressive matching (longest match wins)
 */
export const extractCompanies = (headline: string, companyList: string[]): string[] => {
  let found: string[] = [];
  const lowerHeadline = headline.toLowerCase();

  // Sort companies by length (long to short) to prioritize "Armani Group" over "Armani"
  const sortedCompanies = [...companyList].sort((a, b) => b.length - a.length);

  sortedCompanies.forEach(company => {
    // Escape special regex characters
    const escaped = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match whole word boundaries generally, but be flexible
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');

    if (regex.test(lowerHeadline)) {
      found.push(company);
    }
  });

  // Filter out redundant matches (e.g. if we found "Armani Group", remove "Armani")
  // Keep 'c' if there is NO 'other' in the list that includes 'c' (and is strictly longer)
  found = found.filter(c => !found.some(other => other !== c && other.includes(c)));

  return found;
};
