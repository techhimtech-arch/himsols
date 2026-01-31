import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Loader2 } from "lucide-react";

interface ParsedCard {
  value: number;
  recipientName?: string;
  recipientEmail?: string;
  giftMessage?: string;
  isValid: boolean;
  error?: string;
}

export const BulkGiftCardUpload = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedCards, setParsedCards] = useState<ParsedCard[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const csvContent = `value,recipient_name,recipient_email,gift_message
500,John Doe,john@company.com,Happy Diwali from our team!
1000,Jane Smith,jane@company.com,Thank you for your partnership
2500,,,
1000,Team Member,team@corp.in,Congratulations on your work anniversary!`;
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_gift_cards_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (content: string): ParsedCard[] => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) return [];
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    return dataLines.map((line, index) => {
      const parts = line.split(",").map(p => p.trim().replace(/^"|"$/g, ""));
      const [valueStr, recipientName, recipientEmail, giftMessage] = parts;
      
      const value = parseFloat(valueStr);
      
      if (isNaN(value) || value < 1) {
        return {
          value: 0,
          recipientName,
          recipientEmail,
          giftMessage,
          isValid: false,
          error: `Row ${index + 2}: Invalid value (must be ≥ ₹1)`
        };
      }
      
      if (recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
        return {
          value,
          recipientName,
          recipientEmail,
          giftMessage,
          isValid: false,
          error: `Row ${index + 2}: Invalid email format`
        };
      }
      
      return {
        value,
        recipientName: recipientName || undefined,
        recipientEmail: recipientEmail || undefined,
        giftMessage: giftMessage || undefined,
        isValid: true
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);
      setParsedCards(parsed);
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleBulkCreate = async () => {
    const validCards = parsedCards.filter(c => c.isValid);
    if (validCards.length === 0) {
      toast({
        title: "No Valid Cards",
        description: "Please fix errors before creating",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    setCreatedCount(0);
    
    try {
      for (let i = 0; i < validCards.length; i++) {
        const card = validCards[i];
        
        // Generate unique code
        const { data: codeData, error: codeError } = await supabase
          .rpc("generate_gift_card_code");
        
        if (codeError) throw codeError;
        
        // Insert gift card
        const { error: insertError } = await supabase
          .from("gift_cards")
          .insert({
            code: codeData,
            value: card.value,
            balance: card.value,
            status: "active",
            recipient_name: card.recipientName || null,
            recipient_email: card.recipientEmail || null,
            gift_message: card.giftMessage || null,
            purchaser_name: "Admin (Bulk)",
            purchaser_email: "admin@himsols.com",
            payment_gateway: "admin_bulk",
            payment_id: `bulk_${Date.now()}_${i}`,
          });
        
        if (insertError) throw insertError;
        setCreatedCount(i + 1);
      }
      
      toast({
        title: "Bulk Creation Complete! 🎉",
        description: `Successfully created ${validCards.length} gift cards`,
      });
      
      setParsedCards([]);
      setIsOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["admin-gift-cards"] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const validCount = parsedCards.filter(c => c.isValid).length;
  const invalidCount = parsedCards.filter(c => !c.isValid).length;
  const totalValue = parsedCards.filter(c => c.isValid).reduce((sum, c) => sum + c.value, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Gift Card Creation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Step 1: Download Template */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Step 1: Download Template</CardTitle>
              <CardDescription>Get the CSV template with required columns</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>
          
          {/* Step 2: Upload CSV */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Step 2: Upload Your CSV</CardTitle>
              <CardDescription>Fill the template and upload</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Step 3: Preview & Create */}
          {parsedCards.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Step 3: Review & Create</CardTitle>
                <div className="flex gap-3 mt-2">
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {validCount} Valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {invalidCount} Errors
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    Total: ₹{totalValue.toLocaleString("en-IN")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedCards.map((card, idx) => (
                        <TableRow key={idx} className={!card.isValid ? "bg-destructive/10" : ""}>
                          <TableCell className="font-mono text-sm">{idx + 1}</TableCell>
                          <TableCell>₹{card.value.toLocaleString("en-IN")}</TableCell>
                          <TableCell>{card.recipientName || "-"}</TableCell>
                          <TableCell className="text-sm">{card.recipientEmail || "-"}</TableCell>
                          <TableCell>
                            {card.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-xs text-destructive">{card.error}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setParsedCards([]);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleBulkCreate}
                    disabled={isCreating || validCount === 0}
                    className="gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating {createdCount}/{validCount}...
                      </>
                    ) : (
                      <>
                        Create {validCount} Gift Cards
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  ⚠️ This creates gift cards without payment (Admin only)
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
