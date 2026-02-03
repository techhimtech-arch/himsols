import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GiftCardPageContent {
  id: string;
  section_key: string;
  title_en: string | null;
  title_hi: string | null;
  description_en: string | null;
  description_hi: string | null;
  icon: string | null;
  link_url: string | null;
  link_text_en: string | null;
  link_text_hi: string | null;
  is_active: boolean;
  sort_order: number;
}

export const useGiftCardPageContent = () => {
  return useQuery({
    queryKey: ["gift-card-page-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gift_card_page_content")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as GiftCardPageContent[];
    },
  });
};
