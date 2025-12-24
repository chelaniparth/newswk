import { useState, useMemo, useEffect } from "react";
import { NewsHeader } from "@/components/NewsHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ArticleCard } from "@/components/ArticleCard";
import { UploadDialog } from "@/components/UploadDialog";
import { Article, NewsData, DEFAULT_CATEGORIES } from "@/types/news";
import { Analyst, DEFAULT_ANALYSTS } from "@/types/analyst";
import { Inbox } from "lucide-react";
import { isNavigationLink, normalizeHeadline, extractCompanies, classifyCategory } from "@/utils/textUtils";

import { supabase } from "@/lib/supabaseClient";
import { isSameDay, isSameMonth, parseISO } from "date-fns";

const Index = () => {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [companies, setCompanies] = useState<string[]>([]);
  const [analysts, setAnalysts] = useState<Analyst[]>(DEFAULT_ANALYSTS);
  const [selectedAnalyst, setSelectedAnalyst] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // New Filters
  const [selectedSource, setSelectedSource] = useState<string>("All");

  const [dateRange, setDateRange] = useState<string | Date>("All"); // "All", "Today", "Last 7 Days", "Last 30 Days", "Current Month" or Date object
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showUnclassifiedOnly, setShowUnclassifiedOnly] = useState(false);

  // Derive available sources from articles
  const availableSources = useMemo(() => {
    const sources = articles.map(a => a.source || "Unknown").filter(Boolean);
    return ["All", ...new Set(sources)];
  }, [articles]);

  // Get all unique companies from all analysts
  const allAnalystCompanies = useMemo(() => {
    const allCompanies = analysts.flatMap(a => a.companies);
    return [...new Set(allCompanies)];
  }, [analysts]);

  // Initialize companies list from analysts (merged from DB and hardcoded for now if needed, but we aim for DB)
  // We'll update this once we fetch analysts
  useEffect(() => {
    setCompanies(allAnalystCompanies);
  }, [allAnalystCompanies]);

  // Fetch from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [analystsResponse, articlesResponse] = await Promise.all([
          supabase.from('analysts').select('*').order('name'),
          supabase.from('articles').select('*').order('created_at', { ascending: false })
        ]);

        // 1. Process Analysts first to get company list
        let fetchedCompanies: string[] = [];
        if (analystsResponse.data) {
          const dbAnalysts: Analyst[] = analystsResponse.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            companies: item.companies || []
          }));
          setAnalysts(dbAnalysts);

          // Merge DB companies + DEFAULT_ANALYSTS companies to ensure we catch everything
          // (e.g. if DB is outdated but local code has new Luxury brands)
          const dbCompanies = dbAnalysts.flatMap(a => a.companies);
          const defaultCompanies = DEFAULT_ANALYSTS.flatMap(a => a.companies);
          fetchedCompanies = [...new Set([...dbCompanies, ...defaultCompanies])];

          setCompanies(fetchedCompanies);
        } else {
          setAnalysts(DEFAULT_ANALYSTS);
          fetchedCompanies = [...new Set(DEFAULT_ANALYSTS.flatMap(a => a.companies))];
          setCompanies(fetchedCompanies);
        }

        // 2. Process Articles using the fetched companies
        if (articlesResponse.data) {
          const sbArticles: Article[] = articlesResponse.data.map((item: any) => ({
            id: item.id, // Map ID
            headline: item.headline,
            url: item.url,
            page: item.page_number || 1,
            category: item.category,
            companies: item.companies || [],
            source: item.source,
            created_at: item.created_at
          }));

          const cleanedArticles = sbArticles
            .filter(article => !isNavigationLink(article.headline, article.url))
            .map(article => {
              const headline = normalizeHeadline(article.headline);
              // CRITICAL: Detect companies immediately before first render
              const detectedCompanies = extractCompanies(headline, fetchedCompanies);

              const existingCompanies = article.companies || [];
              const mergedCompanies = [...new Set([...existingCompanies, ...detectedCompanies])];

              // Auto-classify category if missing
              let finalCategory = article.category;
              if (!finalCategory || finalCategory === "N/A" || finalCategory === "Category..." || finalCategory.trim() === "") {
                finalCategory = classifyCategory(headline);
              }

              return {
                ...article,
                headline,
                category: finalCategory || undefined,
                companies: mergedCompanies,
              };
            });

          setArticles(cleanedArticles);

          // Create synthetic NewsData
          const syntheticNewsData: NewsData = {
            source: 'Supabase',
            url: '',
            days: 1,
            cutoff_date: new Date().toISOString(),
            total: articlesResponse.data.length,
            pages: 1,
            timestamp: new Date().toISOString(),
            articles: cleanedArticles
          };
          setNewsData(syntheticNewsData);
        }

      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Run once on mount

  // Get current analyst's companies for filtering
  const currentAnalystCompanies = useMemo(() => {
    if (!selectedAnalyst) return null;
    const analyst = analysts.find(a => a.id === selectedAnalyst);
    return analyst?.companies || null;
  }, [selectedAnalyst, analysts]);

  const handleDataLoaded = (data: NewsData) => {
    setNewsData(data);

    // Filter out navigation links and normalize text
    const cleanedArticles = data.articles
      .filter(article => !isNavigationLink(article.headline, article.url))
      .map(article => {
        const headline = normalizeHeadline(article.headline);
        // Detect companies immediately when loading
        const detectedCompanies = extractCompanies(headline, allAnalystCompanies);
        return {
          ...article,
          headline,
          category: undefined,
          companies: detectedCompanies,
        };
      });

    setArticles(cleanedArticles);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCompanyToggle = (company: string) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const handleAddCompany = (company: string) => {
    if (!company.trim()) return;

    const newCompany = company.trim();
    setCompanies(prev => [...prev, newCompany]);

    // Auto-tag all existing articles that mention this company
    setArticles(prev => prev.map(article => {
      const detectedCompanies = extractCompanies(article.headline, [newCompany]);
      if (detectedCompanies.length > 0) {
        return {
          ...article,
          companies: [...(article.companies || []), ...detectedCompanies],
        };
      }
      return article;
    }));
  };

  const handleRemoveCompany = (company: string) => {
    setCompanies(prev => prev.filter(c => c !== company));
    setSelectedCompanies(prev => prev.filter(c => c !== company));
    // Remove company from all articles
    setArticles(prev => prev.map(article => ({
      ...article,
      companies: article.companies?.filter(c => c !== company),
    })));
  };

  const updateArticle = (index: number, updates: Partial<Article>) => {
    setArticles(prev => prev.map((article, i) =>
      i === index ? { ...article, ...updates } : article
    ));
  };

  const handleArticleCategoryChange = async (index: number, category: string) => {
    updateArticle(index, { category });

    // Persist to Supabase
    const article = articles[index];
    if (article.id) {
      const { error } = await supabase
        .from('articles')
        .update({ category })
        .eq('id', article.id);

      if (error) {
        console.error("Error updating category:", error);
        // Optionally revert local state here if strict consistency is needed
      }
    }
  };

  const handleArticleCompanyToggle = (index: number, company: string) => {
    setArticles(prev => prev.map((article, i) => {
      if (i !== index) return article;
      const currentCompanies = article.companies || [];
      const companies = currentCompanies.includes(company)
        ? currentCompanies.filter(c => c !== company)
        : [...currentCompanies, company];
      return { ...article, companies };
    }));
  };

  // Handle analyst selection
  const handleAnalystSelect = (analystId: string | null) => {
    setSelectedAnalyst(analystId);
    setSelectedCompanies([]); // Reset company filter when switching analysts
  };

  // Handle adding new analyst
  const handleAddAnalyst = (name: string, companies: string[]) => {
    const newAnalyst: Analyst = {
      id: `analyst-${Date.now()}`,
      name,
      companies,
    };
    setAnalysts(prev => [...prev, newAnalyst]);

    // Re-tag articles with new companies
    setArticles(prev => prev.map(article => {
      const newDetectedCompanies = extractCompanies(article.headline, companies);
      if (newDetectedCompanies.length > 0) {
        const existingCompanies = article.companies || [];
        const mergedCompanies = [...new Set([...existingCompanies, ...newDetectedCompanies])];
        return { ...article, companies: mergedCompanies };
      }
      return article;
    }));
  };

  const filteredArticles = useMemo(() => {
    let result = articles.filter(article => {
      // Unclassified Filter
      if (showUnclassifiedOnly) {
        const categoryCallback = (c: string | null | undefined) => {
          if (!c) return false;
          const normalized = c.toLowerCase().trim();
          if (!normalized) return false;
          // Catch "Category...", "Category…", "Select Category" etc
          if (normalized.includes("category")) return false;
          return !["n/a", "unknown", "uncategorized"].includes(normalized);
        };
        const hasCategory = categoryCallback(article.category);
        const hasCompanies = article.companies && article.companies.length > 0;

        // CLASSIFIED if: Has a valid Category OR Has valid Companies
        // UNCLASSIFIED if: No Category AND No Companies
        if (hasCategory || hasCompanies) return false;
      }

      // Search filter
      if (searchTerm && !article.headline.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        if (!article.category || !selectedCategories.includes(article.category)) {
          return false;
        }
      }

      // Analyst filter - show only articles mentioning analyst's portfolio companies
      if (currentAnalystCompanies) {
        if (!article.companies?.some(c => currentAnalystCompanies.includes(c))) {
          return false;
        }
      }

      // Company filter (within analyst's portfolio if analyst is selected)
      if (selectedCompanies.length > 0) {
        if (!article.companies?.some(c => selectedCompanies.includes(c))) {
          return false;
        }
      }

      // Source Filter
      if (selectedSource !== "All") {
        if ((article.source || "Unknown") !== selectedSource) return false;
      }

      // Date Filter
      // Date Filter
      if (dateRange !== "All") {
        const articleDate = new Date(article.created_at || "");
        const today = new Date();

        if (dateRange instanceof Date) {
          // Specific date match
          if (!isSameDay(articleDate, dateRange)) return false;
        } else {
          // String filters
          const diffTime = Math.abs(today.getTime() - articleDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (dateRange === "Today" && !isSameDay(articleDate, today)) return false;
          if (dateRange === "Last 7 Days" && diffDays > 7) return false;
          if (dateRange === "Last 30 Days" && diffDays > 30) return false;
          if (dateRange === "Current Month" && !isSameMonth(articleDate, today)) return false;
        }
      }

      return true;
    });

    // Sort Logic
    return result.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  }, [articles, searchTerm, selectedCategories, selectedCompanies, currentAnalystCompanies, selectedSource, dateRange, sortOrder, showUnclassifiedOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Loading articles from database...</p>
      </div>
    );
  }

  if (!newsData) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 px-6">
            <div className="space-y-3">
              <Inbox className="w-16 h-16 mx-auto text-muted-foreground" />
              <h1 className="text-4xl font-serif font-bold text-foreground">
                News Classifier
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Upload your scraped news data to start classifying articles by category and company
              </p>
            </div>
            <button
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-news text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-elevated"
            >
              <Inbox className="w-5 h-5" />
              Upload JSON File
            </button>
          </div>
        </div>
        <UploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onDataLoaded={handleDataLoaded}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">
        <NewsHeader
          onUpload={() => setUploadOpen(true)}
          articlesCount={articles.length}
        />

        <div className="flex flex-1 overflow-hidden">
          <FilterSidebar
            categories={DEFAULT_CATEGORIES}
            companies={currentAnalystCompanies || companies}
            selectedCategories={selectedCategories}
            selectedCompanies={selectedCompanies}
            searchTerm={searchTerm}
            onCategoryToggle={handleCategoryToggle}
            onCompanyToggle={handleCompanyToggle}
            onSearchChange={setSearchTerm}
            onAddCompany={handleAddCompany}
            onRemoveCompany={handleRemoveCompany}
            setSelectedCategories={setSelectedCategories}
            setSelectedCompanies={setSelectedCompanies}
            analysts={analysts}
            selectedAnalyst={selectedAnalyst}
            onAnalystSelect={handleAnalystSelect}
            onAddAnalyst={handleAddAnalyst}
            availableSources={availableSources}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            showUnclassifiedOnly={showUnclassifiedOnly}
            onUnclassifiedChange={setShowUnclassifiedOnly}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-16">
                  <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">
                    No articles match your filters
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredArticles.map((article, index) => {
                    const originalIndex = articles.findIndex(a => a === article);
                    return (
                      <ArticleCard
                        key={`${article.url}-${originalIndex}`}
                        article={article}
                        categories={DEFAULT_CATEGORIES}
                        companies={companies}
                        onCategoryChange={(cat) => handleArticleCategoryChange(originalIndex, cat)}
                        onCompanyToggle={(comp) => handleArticleCompanyToggle(originalIndex, comp)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onDataLoaded={handleDataLoaded}
      />
    </>
  );
};

export default Index;
