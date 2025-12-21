import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const WhatsAppButton = () => {
  const { settings, isLoading } = useSiteSettings();

  if (isLoading) return null;
  
  const isEnabled = settings?.whatsapp_enabled === "true";
  const whatsappNumber = settings?.whatsapp_number;

  if (!isEnabled || !whatsappNumber) return null;

  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-bounce-subtle"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
    </a>
  );
};
