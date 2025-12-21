import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  contact_phone: string;
  contact_email: string;
  whatsapp_number: string;
  whatsapp_enabled: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
}

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (error) throw error;

      const settingsMap: Partial<SiteSettings> = {};
      data?.forEach((item) => {
        settingsMap[item.key as keyof SiteSettings] = item.value || "";
      });

      return settingsMap as SiteSettings;
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });

  return {
    settings,
    isLoading,
    updateSetting,
  };
};
