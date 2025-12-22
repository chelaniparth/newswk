import { Article } from "@/types/news";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Tag, Building2, Calendar, Newspaper } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  categories: string[];
  companies: string[];
  onCategoryChange: (category: string) => void;
  onCompanyToggle: (company: string) => void;
}

export const ArticleCard = ({
  article,
  categories,
  companies,
  onCategoryChange,
  onCompanyToggle,
}: ArticleCardProps) => {
  return (
    <Card className="flex flex-col p-5 hover:shadow-lg transition-all duration-300 animate-fade-in group h-full border-muted/60">
      <div className="space-y-3 mb-4 flex-1">
        {/* Header: Source and Date on one precise line */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0 max-w-[70%]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/50 bg-secondary/50 text-foreground font-medium truncate">
              <Newspaper className="w-3 h-3 shrink-0 opacity-70" />
              <span className="truncate">{article.source || "Unknown Source"}</span>
            </div>
          </div>

          {article.created_at && (
            <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap font-medium shrink-0">
              <Calendar className="w-3 h-3" />
              {new Date(article.created_at).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-serif font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-primary/30 underline-offset-4">
            {article.headline}
          </a>
        </h3>

        {/* URL Link - Subtle */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground/80 truncate">
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">{new URL(article.url).hostname.replace('www.', '')}</span>
        </div>
      </div>

      {/* Footer: Unified Action Line */}
      <div className="pt-4 mt-auto border-t border-border/50 flex items-center justify-between gap-3">
        {/* Category Dropdown - Compact */}
        <div className="w-[140px] shrink-0">
          <Select value={article.category || ""} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-8 text-xs bg-background/50 border-border/60">
              <div className="flex items-center gap-2 truncate">
                <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Category..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Company Tags - Horizontal Scroll if needed, or clamped */}
        <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0 overflow-hidden">
          {article.companies && article.companies.length > 0 ? (
            <>
              {article.companies.slice(0, 2).map((company) => (
                <Badge
                  key={company}
                  variant="secondary"
                  className="text-[10px] px-2 h-6 whitespace-nowrap bg-secondary/80 hover:bg-secondary truncate max-w-[100px]"
                >
                  {company}
                </Badge>
              ))}
              {article.companies.length > 2 && (
                <Badge variant="outline" className="text-[10px] h-6 px-1.5 text-muted-foreground">
                  +{article.companies.length - 2}
                </Badge>
              )}
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground/50 italic mr-1">--</span>
          )}

          {/* Add Company Trigger (Mini) */}
          <button
            className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            title="Manage Companies"
          >
            <Building2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Card>
  );
};
