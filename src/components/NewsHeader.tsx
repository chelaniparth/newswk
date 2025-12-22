import { FileUp, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsHeaderProps {
  onUpload: () => void;
  articlesCount: number;
}

export const NewsHeader = ({ onUpload, articlesCount }: NewsHeaderProps) => {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4" />
              {articlesCount} articles loaded
            </p>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <h1 className="text-3xl font-serif font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              News Classifier
            </h1>
          </div>

          <div className="flex-1 flex justify-end">
            <Button onClick={onUpload} variant="default" className="gap-2 shadow-sm">
              <FileUp className="w-4 h-4" />
              Upload JSON
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
