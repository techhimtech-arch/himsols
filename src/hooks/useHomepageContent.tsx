import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HomepageSection {
  id: string;
  section_key: string;
  title_en: string | null;
  title_hi: string | null;
  subtitle_en: string | null;
  subtitle_hi: string | null;
  content_en: string | null;
  content_hi: string | null;
  cta_text_en: string | null;
  cta_text_hi: string | null;
  cta_link: string | null;
  background_image: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface HomepageItem {
  id: string;
  section_key: string;
  title_en: string;
  title_hi: string | null;
  description_en: string | null;
  description_hi: string | null;
  icon: string | null;
  image_url: string | null;
  link: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface ImpactCounters {
  total_trees_planted: number;
  villages_covered: number;
  people_involved: number;
  scrap_recycled_tonnes: number;
}

// Helper function to get text based on language with proper typing
export const getLocalizedText = (
  item: HomepageSection | HomepageItem | undefined | null,
  field: "title" | "subtitle" | "content" | "description" | "cta_text",
  language: string
): string => {
  if (!item) return "";
  
  const hiKey = `${field}_hi` as keyof typeof item;
  const enKey = `${field}_en` as keyof typeof item;
  
  if (language === "hi") {
    return (item[hiKey] as string) || (item[enKey] as string) || "";
  }
  return (item[enKey] as string) || (item[hiKey] as string) || "";
};

export const useHomepageContent = () => {
  // Fetch all homepage sections
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as HomepageSection[];
    },
  });

  // Fetch all homepage items
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["homepage-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as HomepageItem[];
    },
  });

  // Fetch impact counters from site_settings
  const { data: counters, isLoading: countersLoading } = useQuery({
    queryKey: ["impact-counters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["total_trees_planted", "villages_covered", "people_involved", "scrap_recycled_tonnes"]);

      if (error) throw error;

      const countersMap: ImpactCounters = {
        total_trees_planted: 450,
        villages_covered: 5,
        people_involved: 120,
        scrap_recycled_tonnes: 2,
      };

      data?.forEach((item) => {
        if (item.key in countersMap) {
          countersMap[item.key as keyof ImpactCounters] = parseInt(item.value || "0", 10);
        }
      });

      return countersMap;
    },
  });

  // Helper function to get section by key
  const getSection = (key: string): HomepageSection | undefined => {
    return sections?.find((s) => s.section_key === key);
  };

  // Helper function to get items by section key
  const getItems = (sectionKey: string): HomepageItem[] => {
    return items?.filter((i) => i.section_key === sectionKey) || [];
  };

  return {
    sections,
    items,
    counters,
    isLoading: sectionsLoading || itemsLoading || countersLoading,
    getSection,
    getItems,
  };
};
