import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Languages } from "lucide-react";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 font-medium min-w-[100px] border-2 hover:border-primary/50 transition-colors"
    >
      <Languages className="h-4 w-4" />
      <span className="font-semibold">
        {language === "en" ? "हिंदी" : "EN"}
      </span>
    </Button>
  );
};
