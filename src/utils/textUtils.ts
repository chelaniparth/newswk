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
 * Extract company names mentioned in a headline
 */
export const extractCompanies = (headline: string, companyList: string[]): string[] => {
  const found: string[] = [];
  const lowerHeadline = headline.toLowerCase();
  
  companyList.forEach(company => {
    // Escape special regex characters and handle apostrophes
    const escapedCompany = company
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/[']/g, "[']?"); // Make apostrophes optional
    
    // Match whole word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${escapedCompany}\\b`, 'i');
    if (regex.test(lowerHeadline)) {
      found.push(company);
    }
  });
  
  return found;
};
