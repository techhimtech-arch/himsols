import { Link } from "react-router-dom";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xl mb-4">
              <div className="bg-primary rounded-full p-2">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>Himsols</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t("nav.services")}
                </Link>
              </li>
              <li>
                <Link to="/tree-plantation" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t("nav.treePlantation")}
                </Link>
              </li>
              <li>
                <Link to="/track-request" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t("nav.trackRequest")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("services.title")}</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground text-sm">{t("services.treePlantation")}</li>
              <li className="text-muted-foreground text-sm">{t("services.wasteManagement")}</li>
              <li className="text-muted-foreground text-sm">{t("services.conservation")}</li>
              <li className="text-muted-foreground text-sm">{t("services.ecoEvents")}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@himsols.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Himachal Pradesh, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Himsols. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};
