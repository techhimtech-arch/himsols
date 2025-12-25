import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkTreeUploadProps {
  onBulkUpload: (trees: any[]) => Promise<void>;
}

interface ParsedTree {
  name: string;
  name_hi?: string;
  scientific_name?: string;
  description: string;
  description_hi?: string;
  price: number;
  stock_quantity: number;
  category: string;
  category_hi?: string;
  growth_rate?: string;
  max_height?: string;
  image_url?: string;
  is_active: boolean;
}

const SAMPLE_CSV = `name,name_hi,scientific_name,description,description_hi,price,stock_quantity,category,category_hi,growth_rate,max_height,image_url,is_active
Deodar Cedar,देवदार,Cedrus deodara,A majestic evergreen tree native to the Himalayas,हिमालय का शानदार सदाबहार वृक्ष,350,100,Timber Trees,इमारती पेड़,Medium,40-50m,,true
Apple Tree,सेब का पेड़,Malus domestica,Fruit-bearing tree perfect for hilly regions,पहाड़ी क्षेत्रों के लिए उत्तम फलदार वृक्ष,250,150,Fruit Trees,फल के पेड़,Medium,4-12m,,true`;

export const BulkTreeUpload = ({ onBulkUpload }: BulkTreeUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [parsedTrees, setParsedTrees] = useState<ParsedTree[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const downloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_trees.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (content: string): { trees: ParsedTree[]; errors: string[] } => {
    const lines = content.trim().split("\n");
    const errors: string[] = [];
    const trees: ParsedTree[] = [];

    if (lines.length < 2) {
      return { trees: [], errors: ["CSV file is empty or has no data rows"] };
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredFields = ["name", "description", "price", "stock_quantity", "category"];

    for (const field of requiredFields) {
      if (!headers.includes(field)) {
        errors.push(`Missing required column: ${field}`);
      }
    }

    if (errors.length > 0) {
      return { trees: [], errors };
    }

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() || "";
      });

      const price = parseFloat(row.price);
      const stock = parseInt(row.stock_quantity);

      if (isNaN(price) || price < 0) {
        errors.push(`Row ${i + 1}: Invalid price "${row.price}"`);
        continue;
      }

      if (isNaN(stock) || stock < 0) {
        errors.push(`Row ${i + 1}: Invalid stock quantity "${row.stock_quantity}"`);
        continue;
      }

      if (!row.name) {
        errors.push(`Row ${i + 1}: Name is required`);
        continue;
      }

      if (!row.description) {
        errors.push(`Row ${i + 1}: Description is required`);
        continue;
      }

      if (!row.category) {
        errors.push(`Row ${i + 1}: Category is required`);
        continue;
      }

      trees.push({
        name: row.name,
        name_hi: row.name_hi || undefined,
        scientific_name: row.scientific_name || undefined,
        description: row.description,
        description_hi: row.description_hi || undefined,
        price,
        stock_quantity: stock,
        category: row.category,
        category_hi: row.category_hi || undefined,
        growth_rate: row.growth_rate || undefined,
        max_height: row.max_height || undefined,
        image_url: row.image_url || undefined,
        is_active: row.is_active?.toLowerCase() !== "false",
      });
    }

    return { trees, errors };
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { trees, errors } = parseCSV(content);
      setParsedTrees(trees);
      setErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (parsedTrees.length === 0) return;

    setUploading(true);
    try {
      await onBulkUpload(parsedTrees);
      toast({
        title: "Success",
        description: `${parsedTrees.length} trees uploaded successfully.`,
      });
      setParsedTrees([]);
      setErrors([]);
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload trees.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setParsedTrees([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Bulk Upload</span>
          <span className="sm:hidden">CSV</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Trees</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple trees at once. Download the sample to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Sample */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
              <Download className="mr-2 h-4 w-4" />
              Download Sample CSV
            </Button>
            <span className="text-sm text-muted-foreground">
              Use this as a template for your data
            </span>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload CSV File</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Found {errors.length} error(s):</p>
                <ul className="list-disc pl-4 space-y-1 text-sm max-h-32 overflow-y-auto">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {parsedTrees.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">
                  Ready to upload {parsedTrees.length} tree(s):
                </p>
                <ul className="list-disc pl-4 space-y-1 text-sm max-h-40 overflow-y-auto">
                  {parsedTrees.map((tree, i) => (
                    <li key={i}>
                      {tree.name} {tree.name_hi && `(${tree.name_hi})`} - ₹{tree.price} - {tree.stock_quantity} in stock
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={parsedTrees.length === 0 || uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : `Upload ${parsedTrees.length} Tree(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
