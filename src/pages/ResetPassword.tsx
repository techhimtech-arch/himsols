import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase recovery link puts a session in the URL hash and auto-signs in.
    // Wait a tick for the client to process it, then check.
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    check();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(!!session);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password kam se kam 6 characters ka hona chahiye.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Dono passwords same hone chahiye.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setDone(true);
      toast({
        title: "✅ Password Updated",
        description: "Naye password se login kar lein.",
      });

      // Sign out so they log in fresh with the new password.
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Password update nahi ho paaya.",
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
            <h1 className="text-3xl font-bold text-foreground">Set New Password</h1>
            <p className="text-muted-foreground mt-2">
              Naya password enter karein apne account ke liye.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {done ? (
                <div className="text-center py-4 space-y-3">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-semibold text-lg">Password Updated!</h2>
                  <p className="text-sm text-muted-foreground">
                    Login page pe redirect kar rahe hain...
                  </p>
                </div>
              ) : hasSession === false ? (
                <div className="text-center py-4 space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-7 w-7 text-destructive" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Invalid or Expired Link</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Yeh reset link expire ho gaya hai ya invalid hai. Please naya reset
                      link request karein.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/forgot-password")} className="w-full">
                    Request New Link
                  </Button>
                </div>
              ) : hasSession === null ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
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

export default ResetPassword;
