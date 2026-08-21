import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, ChevronDown, Sprout } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  parent_id: string | null;
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

  const topLevel = navItems.filter((i) => !i.parent_id);
  const childrenOf = (id: string) => navItems.filter((i) => i.parent_id === id);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-white/30 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6">
            {topLevel.map((item) => {
              const children = childrenOf(item.id);
              if (children.length === 0) {
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="whitespace-nowrap text-sm lg:text-base text-foreground hover:text-primary transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                  >
                    {getLabel(item)}
                  </Link>
                );
              }
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger className="whitespace-nowrap flex items-center gap-1 text-sm lg:text-base text-foreground hover:text-primary transition-colors font-medium outline-none">
                    {getLabel(item)}
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-background z-50">
                    <DropdownMenuItem asChild>
                      <Link to={item.path}>{getLabel(item)}</Link>
                    </DropdownMenuItem>
                    {children.map((child) => (
                      <DropdownMenuItem key={child.id} asChild>
                        <Link to={child.path}>{getLabel(child)}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
            {isAdmin && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
                {t("nav.admin")}
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/tree-plantation">
              <Button size="sm" className="gap-2">
                <Sprout className="h-4 w-4" />
                {language === "hi" ? "पेड़ लगवाओ" : "Plant trees"}
              </Button>
            </Link>

            <LanguageToggle />

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
                <Button variant="outline">{t("nav.login")}</Button>
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
            {topLevel
              .filter((item) => item.is_visible_mobile)
              .map((item) => (
                <div key={item.id}>
                  <Link
                    to={item.path}
                    className="block text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {getLabel(item)}
                  </Link>
                  {childrenOf(item.id)
                    .filter((child) => child.is_visible_mobile)
                    .map((child) => (
                      <Link
                        key={child.id}
                        to={child.path}
                        className="block pl-4 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {getLabel(child)}
                      </Link>
                    ))}
                </div>
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
            <div className="pt-4 space-y-3">
              <Link to="/tree-plantation" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full gap-2">
                  <Sprout className="h-4 w-4" />
                  {language === "hi" ? "पेड़ लगवाओ" : "Plant trees"}
                </Button>
              </Link>


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
