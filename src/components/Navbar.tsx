import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CartSheet } from "@/components/CartSheet";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  id: string;
  label: string;
  label_hi: string | null;
  path: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  is_visible_mobile: boolean;
}

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { t, language } = useLanguage();

  // Fetch dynamic navigation items
  const { data: navItems = [] } = useQuery({
    queryKey: ["navigation-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as NavItem[];
    },
  });

  const getLabel = (item: NavItem) => {
    return language === "hi" && item.label_hi ? item.label_hi : item.label;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-white/30 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {getLabel(item)}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                {t("nav.admin")}
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <CartSheet />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/order-history">{t("nav.myOrders")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    {t("nav.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button>{t("nav.login")}</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            {navItems
              .filter((item) => item.is_visible_mobile)
              .map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {getLabel(item)}
                </Link>
              ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.admin")}
              </Link>
            )}
            <div className="flex flex-col gap-4 pt-4">
              <CartSheet />
              {user ? (
                <>
                  <Link to="/profile" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">My Profile</Button>
                  </Link>
                  <Button className="w-full" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                    {t("nav.signOut")}
                  </Button>
                </>
              ) : (
                <Link to="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">{t("nav.login")}</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
