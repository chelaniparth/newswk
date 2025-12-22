/**
 * Generate smart keyword variations for a company name
 * Handles common variations like hyphenation, spacing, apostrophes, abbreviations
 */
export const generateCompanyKeywords = (companyName: string): string[] => {
  const keywords = new Set<string>();
  const name = companyName.trim();
  
  if (!name) return [];
  
  // Add original name
  keywords.add(name);
  
  // Lowercase version
  const lowerName = name.toLowerCase();
  
  // Handle hyphenated names (e.g., "Wal-Mart" -> "Walmart", "Wal Mart")
  if (name.includes('-')) {
    keywords.add(name.replace(/-/g, '')); // Remove hyphens
    keywords.add(name.replace(/-/g, ' ')); // Replace with spaces
  }
  
  // Handle spaces (e.g., "Wal Mart" -> "Walmart", "Wal-Mart")
  if (name.includes(' ')) {
    keywords.add(name.replace(/ /g, '')); // Remove spaces
    keywords.add(name.replace(/ /g, '-')); // Replace with hyphens
  }
  
  // Handle apostrophes (e.g., "Kohl's" -> "Kohls")
  if (name.includes("'")) {
    keywords.add(name.replace(/'/g, '')); // Remove apostrophe
  }
  
  // Handle common suffixes
  const suffixes = ["'s", "'s", " Inc", " Inc.", " Corp", " Corp.", " Co", " Co.", " LLC", " Ltd"];
  suffixes.forEach(suffix => {
    if (name.endsWith(suffix)) {
      keywords.add(name.slice(0, -suffix.length));
    }
  });
  
  // Handle "&" vs "and"
  if (name.includes(' & ')) {
    keywords.add(name.replace(/ & /g, ' and '));
  }
  if (name.includes(' and ')) {
    keywords.add(name.replace(/ and /g, ' & '));
  }
  
  // Handle common retail abbreviations
  const abbreviations: Record<string, string[]> = {
    'dick\'s': ['dicks', 'dick\'s sporting goods', 'dicks sporting goods'],
    'macy\'s': ['macys', 'macy\'s', 'macys inc'],
    'kohl\'s': ['kohls', 'kohl\'s', 'kohls corp'],
    'lowe\'s': ['lowes', 'lowe\'s', 'lowes home improvement'],
    'walmart': ['wal-mart', 'wal mart', 'walmart inc', 'walmart stores'],
    'target': ['target corp', 'target corporation'],
    'costco': ['costco wholesale', 'costco wholesale corp'],
    'jcpenney': ['jc penney', 'j.c. penney', 'jcp', 'j c penney'],
    'tjx': ['tjx companies', 'the tjx companies'],
    'home depot': ['the home depot', 'homedepot'],
    'bed bath & beyond': ['bed bath and beyond', 'bbb', 'bbby'],
    'ross': ['ross stores', 'ross dress for less'],
    'h&m': ['h and m', 'h & m', 'hennes & mauritz'],
  };
  
  // Check if the lowercase name matches any known abbreviation patterns
  Object.entries(abbreviations).forEach(([key, variations]) => {
    if (lowerName === key || variations.includes(lowerName)) {
      keywords.add(key);
      variations.forEach(v => keywords.add(v));
    }
  });
  
  // Add title case and lowercase versions
  keywords.forEach(kw => {
    keywords.add(kw.toLowerCase());
    keywords.add(toTitleCaseSimple(kw));
  });
  
  return [...keywords];
};

/**
 * Simple title case conversion
 */
const toTitleCaseSimple = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get unique display companies (primary names only, not variations)
 */
export const getDisplayCompanies = (companies: string[]): string[] => {
  // Return unique companies, preferring the properly capitalized version
  const seen = new Set<string>();
  const result: string[] = [];
  
  companies.forEach(company => {
    const lower = company.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(company);
    }
  });
  
  return result;
};
