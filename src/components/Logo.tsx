import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Leaf } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  linkTo?: string | null;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export const Logo = ({ 
  size = "md", 
  showText = true, 
  className = "",
  linkTo = "/"
}: LogoProps) => {
  const { settings } = useSiteSettings();
  const logoUrl = settings?.logo_url;

  const LogoContent = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Himsols Logo" 
          className={`${sizeClasses[size]} object-contain`}
          loading="lazy"
        />
      ) : (
        <div className={`bg-gradient-to-br from-primary to-secondary rounded-full p-2 shadow-lg ${size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2"}`}>
          <Leaf className={`${size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5"} text-primary-foreground`} />
        </div>
      )}
      {showText && (
        <span className={`bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold ${textSizeClasses[size]}`}>
          Himsols
        </span>
      )}
    </div>
  );

  if (linkTo === null) {
    return <LogoContent />;
  }

  return (
    <Link 
      to={linkTo} 
      className="transition-all hover:scale-105"
    >
      <LogoContent />
    </Link>
  );
};
