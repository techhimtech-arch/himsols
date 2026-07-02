import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-reset-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            redirectTo: `${window.location.origin}/reset-password`,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send reset email");
      }

      setSent(true);
      toast({
        title: "✅ Check your inbox",
        description: "Agar account exist karta hai, to reset link email par bhej diya gaya hai.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Kuch galat ho gaya. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-16 px-4 min-h-screen flex items-center">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" showText={false} linkTo={null} />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Forgot Password?</h1>
            <p className="text-muted-foreground mt-2">
              Apna email daalein, hum reset link bhej denge.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {sent ? (
                <div className="text-center py-4 space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <MailCheck className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Email Sent</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Agar <span className="font-medium">{email}</span> se koi account
                      registered hai, to reset link inbox mein aa jaayega. Spam folder bhi
                      check kar lein.
                    </p>
                  </div>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                  <Link to="/auth" className="block">
                    <Button type="button" variant="ghost" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Phone number se registered ho? Support se contact karein:{" "}
                    <a href="/contact" className="text-primary hover:underline">
                      Contact Us
                    </a>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
