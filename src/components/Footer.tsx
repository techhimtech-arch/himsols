import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Eye } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { useEffect, useRef } from "react";

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
  const { settings, isLoading: settingsLoading } = useSiteSettings();
  const visitRecorded = useRef(false);

  // Record visit
  useEffect(() => {
    if (visitRecorded.current) return;
    visitRecorded.current = true;
    
    let visitorId = localStorage.getItem("himsols_visitor_id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("himsols_visitor_id", visitorId);
    }
    supabase.rpc("record_visit", { p_visitor_id: visitorId, p_page_path: window.location.pathname }).then();
  }, []);

  // Fetch visitor count
  const { data: visitorCount } = useQuery({
    queryKey: ["visitor-count"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_visitor_count");
      if (error) throw error;
      return (data as number) || 0;
    },
    staleTime: 60000,
  });

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

          {/* Services Links (Dynamic only) */}
          {servicesLinks.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground text-sm md:text-base mb-3 md:mb-4">
                {language === "hi" ? "सेवाएं" : "Services"}
              </h3>
              <ul className="space-y-1.5 md:space-y-2">
                {servicesLinks.map((link) => (
                  <li key={link.id}>{renderLink(link)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Company Links (Dynamic only) */}
          {companyLinks.length > 0 && (
            <div className="hidden md:block">
              <h3 className="font-semibold text-foreground mb-4">
                {language === "hi" ? "कंपनी" : "Company"}
              </h3>
              <ul className="space-y-2">
                {companyLinks.map((link) => (
                  <li key={link.id}>{renderLink(link)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground text-sm md:text-base mb-3 md:mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-2 md:space-y-3">
              {settingsLoading ? (
                <>
                  <li className="h-4 w-32 bg-muted-foreground/10 rounded animate-pulse" />
                  <li className="h-4 w-28 bg-muted-foreground/10 rounded animate-pulse" />
                  <li className="h-4 w-24 bg-muted-foreground/10 rounded animate-pulse" />
                </>
              ) : (
                <>
                  {settings?.contact_email && (
                    <li className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
                      <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{settings.contact_email}</span>
                    </li>
                  )}
                  {settings?.contact_phone && (
                    <li className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
                      <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                      <span>{settings.contact_phone}</span>
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                    <span>Himachal Pradesh</span>
                  </li>
                </>
              )}
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

        <div className="border-t border-border mt-6 md:mt-8 pt-6 md:pt-8">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-3">
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-xs">
              Terms of Service
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-xs">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link to="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors text-xs">
              Refund Policy
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4">
            <p className="text-muted-foreground text-xs md:text-sm text-center">
              © {new Date().getFullYear()} Himsols. {t("footer.rights")}
            </p>
            {visitorCount !== undefined && visitorCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-background/60 px-2.5 py-1 rounded-full border border-border">
                <Eye className="h-3 w-3 text-primary" />
                <span className="font-medium text-foreground">{visitorCount.toLocaleString()}</span>
                {language === "hi" ? "विज़िटर" : "Visitors"}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
