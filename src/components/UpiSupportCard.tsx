import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, HeartHandshake } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";

interface UpiSupportCardProps {
  /** Optional note shown inside the payment app */
  note?: string;
  compact?: boolean;
}

const FALLBACK_UPI = "8618982400m@pnb";
const FALLBACK_PAYEE = "Himsols";

export const UpiSupportCard = ({ note, compact = false }: UpiSupportCardProps) => {
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  const [qr, setQr] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const upiId = settings?.upi_id || FALLBACK_UPI;
  const payeeName = settings?.upi_payee_name || FALLBACK_PAYEE;

  useEffect(() => {
    const params = new URLSearchParams({ pa: upiId, pn: payeeName, cu: "INR" });
    if (note) params.set("tn", note.slice(0, 50));
    QRCode.toDataURL(`upi://pay?${params.toString()}`, {
      width: 320,
      margin: 1,
      color: { dark: "#134e37", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [upiId, payeeName, note]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "UPI ID copied", description: upiId });
    } catch {
      toast({ title: "Copy failed", description: upiId, variant: "destructive" });
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardContent className={compact ? "p-5" : "p-6 md:p-8"}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <HeartHandshake className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Support the cause (optional)</h3>
            <p className="text-sm text-muted-foreground">
              Your plantation is free. If you'd like to help cover saplings, transport and farmer
              support, you can contribute any amount — completely voluntary.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {qr ? (
            <img
              src={qr}
              alt={`UPI QR code to contribute to ${payeeName}`}
              className="w-40 h-40 rounded-xl border border-border bg-background p-2"
              loading="lazy"
            />
          ) : (
            <div className="w-40 h-40 rounded-xl border border-border bg-muted animate-pulse" />
          )}

          <div className="flex-1 w-full text-center sm:text-left">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">UPI ID</div>
            <div className="font-mono text-sm md:text-base font-semibold text-foreground break-all mb-3">
              {upiId}
            </div>
            <Button variant="outline" size="sm" onClick={copyUpi} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy UPI ID"}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Scan with GPay, PhonePe, Paytm or any UPI app. No contribution is required to get your
              trees planted or your certificate.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
