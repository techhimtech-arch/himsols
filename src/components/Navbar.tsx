import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useLanguage } from "@/hooks/useLanguage";
import { CartSheet } from "@/components/CartSheet";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-white/30 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
              {t("nav.home")}
            </Link>
            <Link to="/services" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
              {t("nav.services")}
            </Link>
            <Link to="/tree-plantation" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
              {t("nav.treePlantation")}
            </Link>
            <Link to="/shop" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
              {t("nav.shopTrees")}
            </Link>
            <Link to="/marketplace" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
              Marketplace
            </Link>
            <Link to="/gallery" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
              {t("nav.gallery")}
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
              {t("nav.contact")}
            </Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
              Blog
            </Link>
            <Link to="/corporate" className="text-foreground hover:text-primary transition-all duration-300 font-medium hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full">
              Corporate
            </Link>
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
            <Link
              to="/"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/services"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.services")}
            </Link>
            <Link
              to="/tree-plantation"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.treePlantation")}
            </Link>
            <Link
              to="/shop"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.shopTrees")}
            </Link>
            <Link
              to="/marketplace"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/gallery"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.gallery")}
            </Link>
            <Link
              to="/contact"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.contact")}
            </Link>
            <Link
              to="/blog"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/corporate"
              className="block text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Corporate
            </Link>
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
