import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

interface FooterLink {
  id: string;
  section: string;
  label: string;
  label_hi: string | null;
  url: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  is_external: boolean;
}

export const Footer = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();

  // Fetch dynamic footer links
  const { data: footerLinks = [] } = useQuery({
    queryKey: ["footer-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as FooterLink[];
    },
  });

  const getLinksForSection = (section: string) => footerLinks.filter(link => link.section === section);
  
  const getLabel = (link: FooterLink) => {
    return language === "hi" && link.label_hi ? link.label_hi : link.label;
  };

  const renderLink = (link: FooterLink) => {
    if (link.is_external) {
      return (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors text-xs md:text-sm"
        >
          {getLabel(link)}
        </a>
      );
    }
    return (
      <Link
        to={link.url}
        className="text-muted-foreground hover:text-primary transition-colors text-xs md:text-sm"
      >
        {getLabel(link)}
      </Link>
    );
  };

  const servicesLinks = getLinksForSection("services");
  const companyLinks = getLinksForSection("company");
  const supportLinks = getLinksForSection("support");

  return (
    <footer className="bg-muted mt-12 md:mt-20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 md:mb-4">
              <Logo size="md" />
            </div>
            <p className="text-muted-foreground text-xs md:text-sm">
              {t("footer.tagline")}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary/10 p-1.5 md:p-2 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <Facebook className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary/10 p-1.5 md:p-2 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <Instagram className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </a>
              )}
              {settings?.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary/10 p-1.5 md:p-2 rounded-full hover:bg-primary/20 transition-colors"
                >
                  <Twitter className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </a>
              )}
            </div>
          </div>

          {/* Services Links (Dynamic) */}
          <div>
            <h3 className="font-semibold text-foreground text-sm md:text-base mb-3 md:mb-4">
              {servicesLinks.length > 0 ? (language === "hi" ? "सेवाएं" : "Services") : t("footer.quickLinks")}
            </h3>
            <ul className="space-y-1.5 md:space-y-2">
              {servicesLinks.length > 0 ? (
                servicesLinks.map((link) => (
                  <li key={link.id}>{renderLink(link)}</li>
                ))
              ) : (
                <>
                  <li>
                    <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-xs md:text-sm">
                      {t("nav.home")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors text-xs md:text-sm">
                      {t("nav.services")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/tree-plantation" className="text-muted-foreground hover:text-primary transition-colors text-xs md:text-sm">
                      {t("nav.treePlantation")}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Company/Support Links (Dynamic) */}
          <div className="hidden md:block">
            <h3 className="font-semibold text-foreground mb-4">
              {companyLinks.length > 0 ? (language === "hi" ? "कंपनी" : "Company") : t("services.title")}
            </h3>
            <ul className="space-y-2">
              {companyLinks.length > 0 ? (
                companyLinks.map((link) => (
                  <li key={link.id}>{renderLink(link)}</li>
                ))
              ) : (
                <>
                  <li className="text-muted-foreground text-sm">{t("services.treePlantation")}</li>
                  <li className="text-muted-foreground text-sm">{t("services.wasteManagement")}</li>
                  <li className="text-muted-foreground text-sm">{t("services.conservation")}</li>
                  <li className="text-muted-foreground text-sm">{t("services.ecoEvents")}</li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground text-sm md:text-base mb-3 md:mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-2 md:space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
                <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                <span className="truncate">{settings?.contact_email || "info@himsols.com"}</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
                <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                <span>{settings?.contact_phone || "+91 1234567890"}</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                <span>Himachal Pradesh</span>
              </li>
            </ul>
            {/* Support Links */}
            {supportLinks.length > 0 && (
              <ul className="space-y-1.5 mt-3">
                {supportLinks.map((link) => (
                  <li key={link.id}>{renderLink(link)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-border mt-6 md:mt-8 pt-6 md:pt-8 text-center">
          <p className="text-muted-foreground text-xs md:text-sm">
            © {new Date().getFullYear()} Himsols. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};
