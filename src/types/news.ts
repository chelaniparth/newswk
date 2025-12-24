export interface Article {
  id?: number; // Added optional ID for database updates
  headline: string;
  url: string;
  page: number;
  category?: string;
  companies?: string[];
  source?: string;
  created_at?: string;
}

export interface NewsData {
  source: string;
  url: string;
  days: number;
  cutoff_date: string;
  total: number;
  pages: number;
  timestamp: string;
  articles: Article[];
}

export const DEFAULT_CATEGORIES = [
  "Mergers & Acquisitions",
  "Business Features",
  "Government & Trade",
  "Financial",
  "Technology",
  "Retail",
  "Legal",
  "Markets",
  "Human Resources",
  "Media",
  "Other"
];
