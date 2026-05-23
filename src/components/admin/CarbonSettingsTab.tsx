import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const FIELDS = [
  { key: "tree_absorption_rate_kg", label: "CO₂ Absorption Rate (kg/tree/year)", type: "number" },
  { key: "target_trees", label: "Target Trees (goal)", type: "number" },
  { key: "survival_rate_percent", label: "Survival Rate Override (%) — leave blank to use field data", type: "number" },
];

const CarbonSettingsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { isLoading } = useQuery({
    queryKey: ["carbon-settings-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("carbon_settings").select("*");
      const map: Record<string, string> = {};
      data?.forEach((s: any) => { map[s.key] = s.value || ""; });
      setValues(map);
      setPlantationData(map["plantation_data"] || "[]");
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const allValues = { ...values, plantation_data: plantationData };
      for (const [key, value] of Object.entries(allValues)) {
        await supabase.from("carbon_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carbon-settings"] });
      toast({ title: "Saved!", description: "Carbon settings updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  if (isLoading) return <p className="text-muted-foreground p-4">Loading...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Carbon Dashboard Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Live numbers (verified trees, partners, sites, growth chart) are auto-computed from orders, allocations and partner records — no manual entry required. The fields below only control the carbon formula inputs and the target goal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map(f => (
              <div key={f.key} className="space-y-2">
                <Label>{f.label}</Label>
                <Input type={f.type} value={values[f.key] || ""} onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>


          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" /> {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarbonSettingsTab;
