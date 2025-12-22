import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Building2, Tags, Plus, User, UserPlus, Filter, Calendar as CalendarIcon, ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Analyst } from "@/types/analyst";
import { AddAnalystDialog } from "./AddAnalystDialog";

interface FilterSidebarProps {
  categories: string[];
  companies: string[];
  selectedCategories: string[];
  selectedCompanies: string[];
  searchTerm: string;
  onCategoryToggle: (category: string) => void;
  onCompanyToggle: (company: string) => void;
  onSearchChange: (search: string) => void;
  onAddCompany: (company: string) => void;
  onRemoveCompany: (company: string) => void;
  setSelectedCategories: Dispatch<SetStateAction<string[]>>;
  setSelectedCompanies: Dispatch<SetStateAction<string[]>>;
  analysts: Analyst[];
  selectedAnalyst: string | null;
  onAnalystSelect: (analystId: string | null) => void;
  onAddAnalyst: (name: string, companies: string[]) => void;
  // New Props
  availableSources?: string[];
  selectedSource?: string;
  onSourceChange?: (source: string) => void;

  dateRange?: string | Date;
  onDateRangeChange?: (range: string | Date) => void;
  sortOrder?: "newest" | "oldest";
  onSortChange?: (order: "newest" | "oldest") => void;
  showUnclassifiedOnly?: boolean;
  onUnclassifiedChange?: (show: boolean) => void;
}

export const FilterSidebar = ({
  categories,
  companies,
  selectedCategories,
  selectedCompanies,
  searchTerm,
  onCategoryToggle,
  onCompanyToggle,
  onSearchChange,
  onAddCompany,
  onRemoveCompany,
  setSelectedCategories,
  setSelectedCompanies,
  analysts,
  selectedAnalyst,
  onAnalystSelect,
  onAddAnalyst,
  availableSources = [],
  selectedSource = "All",
  onSourceChange,
  dateRange = "All",
  onDateRangeChange,
  sortOrder = "newest",
  onSortChange,
  showUnclassifiedOnly = false,
  onUnclassifiedChange,
}: FilterSidebarProps) => {
  const [newCompany, setNewCompany] = useState("");
  const [addAnalystOpen, setAddAnalystOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [analystsOpen, setAnalystsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const handleAddCompany = () => {
    if (newCompany.trim() && !companies.includes(newCompany.trim())) {
      onAddCompany(newCompany.trim());
      setNewCompany("");
    }
  };

  // Filter companies for autocomplete
  const companySuggestions = newCompany.trim()
    ? companies.filter(c => c.toLowerCase().includes(newCompany.toLowerCase()) && !selectedCompanies.includes(c)).slice(0, 5)
    : [];

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Sync prop -> local (e.g. if cleared from outside)
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Debounce local -> prop
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearchChange]);

  return (
    <aside className="w-80 border-r border-border bg-card p-6 overflow-y-auto">
      <div className="space-y-8">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search Articles
          </Label>
          <Input
            id="search"
            placeholder="Search headlines..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Collapsible Filters: Sort, Unclassified, Source, Date */}
        {(onSourceChange || onDateRangeChange || onSortChange || onUnclassifiedChange) && (
          <div className="space-y-4 pt-2 border-t border-border">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="w-4 h-4 text-accent" />
                Filters
              </div>
              <ChevronsUpDown className={cn("w-4 h-4 text-muted-foreground transition-transform", filtersOpen && "rotate-180")} />
            </button>

            {filtersOpen && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Unclassified Only Switch */}
                {onUnclassifiedChange && (
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Unclassified Only</Label>
                    <Button
                      variant={showUnclassifiedOnly ? "default" : "outline"}
                      size="sm"
                      className={cn("h-7 text-xs", showUnclassifiedOnly && "bg-accent hover:bg-accent/90")}
                      onClick={() => onUnclassifiedChange(!showUnclassifiedOnly)}
                    >
                      {showUnclassifiedOnly ? "On" : "Off"}
                    </Button>
                  </div>
                )}

                {/* Sort Order */}
                {onSortChange && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Sort By</Label>
                    <Select value={sortOrder} onValueChange={(val: any) => onSortChange(val)}>
                      <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue placeholder="Sort..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Date Range */}
                {onDateRangeChange && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Date Range</Label>
                    <div className="flex flex-col gap-2">
                      <Select
                        value={dateRange instanceof Date ? "Specific Date" : dateRange}
                        onValueChange={(val) => {
                          if (val !== "Specific Date") onDateRangeChange(val);
                        }}
                      >
                        <SelectTrigger className="w-full h-8 text-sm">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Time</SelectItem>
                          <SelectItem value="Today">Today</SelectItem>
                          <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                          <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                          <SelectItem value="Current Month">Current Month</SelectItem>
                          {dateRange instanceof Date && (
                            <SelectItem value="Specific Date">{format(dateRange, "PPP")}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal h-8",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange instanceof Date ? format(dateRange, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange instanceof Date ? dateRange : undefined}
                            onSelect={(date) => date && onDateRangeChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {/* Source */}
                {onSourceChange && availableSources.length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Source</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={selectedSource}
                      onChange={(e) => onSourceChange(e.target.value)}
                    >
                      {availableSources.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analysts */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setAnalystsOpen(!analystsOpen)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <User className="w-4 h-4 text-accent" />
                Analysts
              </div>
              <ChevronsUpDown className={cn("w-4 h-4 text-muted-foreground transition-transform", analystsOpen && "rotate-180")} />
            </button>
            <div className="flex items-center gap-2">
              {selectedAnalyst && (
                <button
                  onClick={() => onAnalystSelect(null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setAddAnalystOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {analystsOpen && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              {analysts.map((analyst) => (
                <button
                  key={analyst.id}
                  onClick={() => onAnalystSelect(selectedAnalyst === analyst.id ? null : analyst.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedAnalyst === analyst.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                    }`}
                >
                  <div className="font-medium">{analyst.name}</div>
                  <div className="text-xs opacity-70">
                    {analyst.companies.length} companies
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <AddAnalystDialog
          open={addAnalystOpen}
          onOpenChange={setAddAnalystOpen}
          onAddAnalyst={onAddAnalyst}
        />

        {/* Categories */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Tags className="w-4 h-4 text-accent" />
                Categories
              </div>
              <ChevronsUpDown className={cn("w-4 h-4 text-muted-foreground transition-transform", categoriesOpen && "rotate-180")} />
            </button>

            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {categoriesOpen && (
            <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => onCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Companies (Portfolio) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 className="w-4 h-4 text-accent" />
              {selectedAnalyst ? "Portfolio Companies" : "Companies"}
            </div>
            {selectedCompanies.length > 0 && (
              <button
                onClick={() => setSelectedCompanies([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Company - only show when no analyst selected */}
          {!selectedAnalyst && (
            <div className="relative z-50">
              <div className="flex gap-2">
                <Input
                  placeholder="Add or search company..."
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCompany();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddCompany}
                  size="icon"
                  variant="secondary"
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Autocomplete Suggestions */}
              {companySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {companySuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                      onClick={() => {
                        onCompanyToggle(suggestion);
                        setNewCompany("");
                      }}
                    >
                      <Building2 className="w-3 h-3 opacity-50" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Company List */}
          {/* Company Dropdown (Multi-select style) */}
          <div className="space-y-2">
            <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={companyOpen}
                  className="w-full justify-between"
                >
                  {selectedCompanies.length > 0
                    ? `${selectedCompanies.length} selected`
                    : "Filter companies..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search companies..." />
                  <CommandEmpty>No company found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {companies.map((company) => (
                      <CommandItem
                        key={company}
                        value={company}
                        onSelect={() => {
                          onCompanyToggle(company);
                          // Keep open for multiple selection
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCompanies.includes(company) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {company}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Company Tags (Active Filters) */}
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedCompanies.map(company => (
                <Badge key={company} variant="secondary" className="gap-1 animate-fade-in">
                  {company}
                  <button onClick={() => onRemoveCompany(company)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
