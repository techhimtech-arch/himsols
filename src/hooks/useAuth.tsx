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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Check if phone already exists - clean to last 10 digits
    if (phone) {
      const cleanPhone = phone.replace(/[\s\-+]/g, '').slice(-10);
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", cleanPhone)
        .maybeSingle();
      
      if (existingProfile) {
        toast({
          title: "Signup Error",
          description: "This phone number is already registered",
          variant: "destructive",
        });
        return { error: { message: "Phone number already registered" } };
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

      // Send custom verification email via Resend
      if (data?.user && email && !email.includes('@phone.himsols.local')) {
        try {
          // Get the confirmation URL from Supabase
          const confirmationUrl = `${window.location.origin}/auth?confirm=true`;
          
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                email: email,
                userName: fullName || "User",
                verificationUrl: confirmationUrl,
              }),
            }
          );
          
          toast({
            title: "✅ Account Created!",
            description: "Please check your email to verify your account.",
          });
        } catch (emailError) {
          console.error("Error sending verification email:", emailError);
          // Don't fail signup if email fails
        }
      }

      // Process signup bonuses via edge function
      if (data?.user) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-signup-bonus`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                user_id: data.user.id,
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
    
    // If it's a 10-digit phone number, look up the email from profiles
    const cleanedIdentifier = identifier.replace(/\D/g, '');
    
    if (cleanedIdentifier.length === 10) {
      const { data: profile, error: lookupError } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", cleanedIdentifier)
        .maybeSingle();
      
      if (lookupError) {
        console.error("Phone lookup error:", lookupError);
      }
      
      if (profile?.email) {
        email = profile.email;
      } else {
        toast({
          title: "Login Error",
          description: "No account found with this phone number",
          variant: "destructive",
        });
        return { error: { message: "No account found with this phone number" }, needsVerification: false, email: null };
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check if it's an email not confirmed error
      const isEmailNotConfirmed = error.message.toLowerCase().includes("email not confirmed");
      
      toast({
        title: "Login Error",
        description: isEmailNotConfirmed 
          ? "Email not verified. Please check your inbox or resend verification email."
          : error.message,
        variant: "destructive",
      });

      return { error, needsVerification: isEmailNotConfirmed, email: isEmailNotConfirmed ? email : null };
    }

    return { error, needsVerification: false, email: null };
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("email", email)
        .maybeSingle();

      const confirmationUrl = `${window.location.origin}/auth?confirm=true`;
      
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
            userName: profile?.full_name || "User",
            verificationUrl: confirmationUrl,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Email Sent!",
          description: "Verification email has been sent. Please check your inbox.",
        });
        return { success: true };
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
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
