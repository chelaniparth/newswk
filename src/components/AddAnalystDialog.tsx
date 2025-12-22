import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles } from "lucide-react";
import { generateCompanyKeywords } from "@/utils/companyKeywords";

interface AddAnalystDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAnalyst: (name: string, companies: string[]) => void;
}

export const AddAnalystDialog = ({
  open,
  onOpenChange,
  onAddAnalyst,
}: AddAnalystDialogProps) => {
  const [analystName, setAnalystName] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [companies, setCompanies] = useState<string[]>([]);
  const [generatedKeywords, setGeneratedKeywords] = useState<Record<string, string[]>>({});

  const handleAddCompany = () => {
    const company = companyInput.trim();
    if (!company) return;
    
    // Generate smart keywords for this company
    const keywords = generateCompanyKeywords(company);
    
    // Add the primary company name
    if (!companies.includes(company)) {
      setCompanies(prev => [...prev, company]);
      setGeneratedKeywords(prev => ({
        ...prev,
        [company]: keywords.filter(k => k.toLowerCase() !== company.toLowerCase()),
      }));
    }
    
    setCompanyInput("");
  };

  const handleRemoveCompany = (company: string) => {
    setCompanies(prev => prev.filter(c => c !== company));
    setGeneratedKeywords(prev => {
      const updated = { ...prev };
      delete updated[company];
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!analystName.trim() || companies.length === 0) return;
    
    // Combine primary companies with their generated keywords
    const allCompanies: string[] = [];
    companies.forEach(company => {
      allCompanies.push(company);
      const keywords = generatedKeywords[company] || [];
      keywords.forEach(kw => {
        if (!allCompanies.includes(kw)) {
          allCompanies.push(kw);
        }
      });
    });
    
    onAddAnalyst(analystName.trim(), allCompanies);
    
    // Reset form
    setAnalystName("");
    setCompanyInput("");
    setCompanies([]);
    setGeneratedKeywords({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setAnalystName("");
    setCompanyInput("");
    setCompanies([]);
    setGeneratedKeywords({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Analyst</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Analyst Name */}
          <div className="space-y-2">
            <Label htmlFor="analyst-name">Analyst Name</Label>
            <Input
              id="analyst-name"
              placeholder="e.g., John Smith"
              value={analystName}
              onChange={(e) => setAnalystName(e.target.value)}
            />
          </div>
          
          {/* Add Company */}
          <div className="space-y-2">
            <Label>Portfolio Companies</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter company name..."
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCompany()}
              />
              <Button onClick={handleAddCompany} size="icon" variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Keywords will be auto-generated for better matching
            </p>
          </div>
          
          {/* Company List with Keywords */}
          {companies.length > 0 && (
            <div className="space-y-3">
              {companies.map((company) => (
                <div key={company} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{company}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleRemoveCompany(company)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {generatedKeywords[company]?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground mr-1">Keywords:</span>
                      {generatedKeywords[company].slice(0, 6).map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-xs py-0">
                          {kw}
                        </Badge>
                      ))}
                      {generatedKeywords[company].length > 6 && (
                        <span className="text-xs text-muted-foreground">
                          +{generatedKeywords[company].length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!analystName.trim() || companies.length === 0}
          >
            Add Analyst
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
