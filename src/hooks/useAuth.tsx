import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, phone: string, referralCode?: string) => Promise<{ error: any }>;
  signIn: (identifier: string, password: string) => Promise<{ error: any; needsVerification: boolean; email: string | null }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let sessionCleared = false;

    const clearStaleSession = () => {
      if (sessionCleared) return;
      sessionCleared = true;

      // Stop background refresh loop immediately
      try {
        (supabase.auth as any).stopAutoRefresh?.();
      } catch {
        // no-op
      }

      // Also clear in-memory auth state in client
      supabase.auth.signOut({ scope: 'local' }).catch(() => {
        // no-op
      });

      // Remove all auth keys from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      setSession(null);
      setUser(null);
      setLoading(false);
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // If token refresh failed or signed out, clear everything
        if (event === 'TOKEN_REFRESHED' && !currentSession) {
          clearStaleSession();
          return;
        }
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        // When user logs in via magiclink, mark email as verified
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setTimeout(async () => {
            try {
              await supabase
                .from('profiles')
                .update({ email_verified: true })
                .eq('id', currentSession.user.id);
            } catch (e) {
              console.error('Failed to mark email as verified:', e);
            }
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession }, error }) => {
      if (error) {
        console.warn("Session invalid, clearing:", error.message);
        clearStaleSession();
        return;
      }
      if (!existingSession) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setSession(existingSession);
      setUser(existingSession.user);
      setLoading(false);
    }).catch(() => {
      clearStaleSession();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Check if phone already exists via secure edge function
    if (phone) {
      const cleanPhone = phone.replace(/[\s\-+]/g, '').slice(-10);
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/phone-lookup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ phone: cleanPhone }),
          }
        );
        
        const result = await response.json();
        
        if (result.found) {
          toast({
            title: "Signup Error",
            description: "This phone number is already registered",
            variant: "destructive",
          });
          return { error: { message: "Phone number already registered" } };
        }
      } catch (error) {
        console.error("Phone lookup error:", error);
        // Continue with signup if lookup fails
      }
    }

    // If no email provided, generate placeholder from phone
    let authEmail = email;
    if (!email && phone) {
      const cleanPhone = phone.replace(/\s/g, '').replace(/[^0-9]/g, '');
      authEmail = `${cleanPhone}@phone.himsols.local`;
    }
    
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });

    if (error) {
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Store clean phone (10 digits only) in profiles table
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user && phone) {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        await supabase
          .from("profiles")
          .update({ phone: cleanPhone })
          .eq("id", userData.user.id);
      }

      // Send branded verification email via Resend
      if (data?.user && email && !email.includes('@phone.himsols.local')) {
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                email: authEmail,
                userName: fullName,
                redirectTo: redirectUrl,
              }),
            }
          );
        } catch (emailError) {
          console.error("Error sending branded verification email:", emailError);
        }
        
        toast({
          title: "✅ Account Created!",
          description: "Please check your email to verify your account before logging in.",
        });
      }

      // Process signup bonuses via edge function (requires authenticated session)
      if (data?.user && data?.session?.access_token) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-signup-bonus`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.session.access_token}`,
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({
                referral_code: referralCode?.trim() || null,
              }),
            }
          );

          const result = await response.json();

          if (result.success && result.total_bonus > 0) {
            toast({
              title: "🎉 Welcome Bonus!",
              description: `₹${result.total_bonus} has been credited to your wallet!`,
            });
          }
        } catch (bonusError) {
          console.error("Error processing signup bonus:", bonusError);
          // Don't fail the signup if bonus processing fails
        }
      }
    }

    return { error };
  };

  // Check if identifier is phone (10 digits only)
  const isPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, ''); // Remove all non-digits
    return cleaned.length === 10;
  };

  const signIn = async (identifier: string, password: string) => {
    let email = identifier.trim();
    
    // If it's a 10-digit phone number, look up the email via secure edge function
    const cleanedIdentifier = identifier.replace(/\D/g, '');
    
    if (cleanedIdentifier.length === 10) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/phone-lookup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ phone: cleanedIdentifier }),
          }
        );
        
        const result = await response.json();
        
        if (result.found && result.email) {
          email = result.email;
        } else {
          toast({
            title: "Login Error",
            description: "No account found with this phone number",
            variant: "destructive",
          });
          return { error: { message: "No account found with this phone number" }, needsVerification: false, email: null };
        }
      } catch (error) {
        console.error("Phone lookup error:", error);
        toast({
          title: "Login Error",
          description: "Unable to verify phone number. Please try again.",
          variant: "destructive",
        });
        return { error: { message: "Phone lookup failed" }, needsVerification: false, email: null };
      }
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      return { error, needsVerification: false, email: null };
    }

    // Check custom email_verified flag in profiles
    if (signInData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', signInData.user.id)
        .single();

      if (profile && !profile.email_verified) {
        // Sign out the user since email is not verified
        await supabase.auth.signOut({ scope: 'local' });
        toast({
          title: "Login Error",
          description: "Email not verified. Please check your inbox or resend verification email.",
          variant: "destructive",
        });
        return { error: { message: "Email not verified" }, needsVerification: true, email };
      }
    }

    return { error: null, needsVerification: false, email: null };
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      // Send branded verification email via Resend edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            email: email,
            userName: "User",
            redirectTo: `${window.location.origin}/`,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to send verification email");
      }

      toast({
        title: "✅ Email Sent!",
        description: "Verification email has been sent from noreply@himsols.online. Please check your inbox.",
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, resendVerificationEmail, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Safe version that returns null values when used outside AuthProvider
export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  return context ?? { user: null, session: null, loading: true, signUp: async () => ({ error: null }), signIn: async () => ({ error: null, needsVerification: false, email: null }), signOut: async () => {}, resendVerificationEmail: async () => ({ success: false }) };
};
