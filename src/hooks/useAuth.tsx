import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
  signIn: (identifier: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Check if phone already exists
    if (phone) {
      const cleanPhone = phone.replace(/\s/g, '').replace(/^\+91/, '');
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .or(`phone.eq.${cleanPhone},phone.eq.+${cleanPhone},phone.eq.+91${cleanPhone},phone.eq.${phone}`)
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
    
    const { error } = await supabase.auth.signUp({
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
      // Also update phone in profiles table
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase
          .from("profiles")
          .update({ phone })
          .eq("id", userData.user.id);
      }
    }

    return { error };
  };

  // Check if identifier is phone or email
  const isPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[\s\-+]/g, '');
    return /^\d{10,12}$/.test(cleaned);
  };

  const signIn = async (identifier: string, password: string) => {
    let email = identifier;
    
    // If it's a phone number, look up the email from profiles
    if (isPhoneNumber(identifier)) {
      // Clean the phone - remove spaces, dashes, and +91 prefix
      let cleanPhone = identifier.replace(/[\s\-]/g, '');
      if (cleanPhone.startsWith('+91')) {
        cleanPhone = cleanPhone.substring(3);
      } else if (cleanPhone.startsWith('91') && cleanPhone.length > 10) {
        cleanPhone = cleanPhone.substring(2);
      }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", cleanPhone)
        .maybeSingle();
      
      if (profile?.email) {
        email = profile.email;
      } else {
        toast({
          title: "Login Error",
          description: "No account found with this phone number",
          variant: "destructive",
        });
        return { error: { message: "No account found with this phone number" } };
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
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
