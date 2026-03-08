import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";
import { INDIAN_STATES, getDistrictsForState, IndianState } from "@/lib/constants";
import { MobileCard, MobileCardRow } from "./MobileCard";

interface Profile {
  id: string; full_name: string; email: string; phone: string | null; created_at: string;
}
interface UserRole {
  user_id: string; role: string; state: string | null; district: string | null;
}
interface UserWallet {
  user_id: string; balance: number;
}

export const UsersTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const { data: userWallets = [] } = useQuery({
    queryKey: ["admin-wallets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("wallets").select("user_id, balance");
      if (error) throw error;
      return data as UserWallet[];
    },
  });

  const getUserRole = (userId: string) => userRoles.find(r => r.user_id === userId)?.role || 'user';
  const getUserState = (userId: string) => userRoles.find(r => r.user_id === userId)?.state || null;
  const getUserDistrict = (userId: string) => userRoles.find(r => r.user_id === userId)?.district || null;
  const getWalletBalance = (userId: string) => userWallets.find(w => w.user_id === userId)?.balance || 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });

  const updateUserRole = async (userId: string, newRole: string, newDistrict?: string | null) => {
    try {
      const existing = userRoles.find(r => r.user_id === userId);
      const districtToSet = newDistrict !== undefined ? newDistrict : existing?.district || null;
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any, district: districtToSet });
      if (error) throw error;
      toast({ title: "Success", description: "User role updated." });
      invalidate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateUserState = async (userId: string, newState: string | null) => {
    try {
      const currentRole = getUserRole(userId);
      const currentDistrict = getUserDistrict(userId);
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: currentRole as any, state: newState, district: currentDistrict });
      if (error) throw error;
      toast({ title: "Success", description: "User state updated." });
      invalidate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateUserDistrict = async (userId: string, newDistrict: string | null) => {
    try {
      const currentRole = getUserRole(userId);
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: currentRole as any, district: newDistrict });
      if (error) throw error;
      toast({ title: "Success", description: "User district updated." });
      invalidate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (profilesLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">User Management ({profiles.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {profiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            profiles.map((profile) => (
              <MobileCard key={profile.id}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm">{profile.full_name}</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUserRole(profile.id) === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{getUserRole(profile.id)}</span>
                </div>
                <MobileCardRow label="Email" value={<span className="text-xs break-all">{profile.email}</span>} />
                <MobileCardRow label="Phone" value={profile.phone || '-'} />
                <MobileCardRow label="Wallet" value={<span className="inline-flex items-center gap-1 text-primary font-medium"><Wallet className="h-3 w-3" />₹{getWalletBalance(profile.id).toLocaleString('en-IN')}</span>} />
                <MobileCardRow label="Joined" value={new Date(profile.created_at).toLocaleDateString()} />
                <div className="pt-3 border-t border-border space-y-2">
                  <Select value={getUserRole(profile.id)} onValueChange={(v) => updateUserRole(profile.id, v)}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select Role" /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50"><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="land_partner">Land Partner</SelectItem></SelectContent>
                  </Select>
                  <Select value={getUserState(profile.id) || "himachal"} onValueChange={(v) => updateUserState(profile.id, v === "himachal" ? "Himachal Pradesh" : v)}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      {INDIAN_STATES.map((s) => <SelectItem key={s} value={s === "Himachal Pradesh" ? "himachal" : s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={getUserDistrict(profile.id) || "all"} onValueChange={(v) => updateUserDistrict(profile.id, v === "all" ? null : v)}>
                    <SelectTrigger className="w-full bg-background"><SelectValue placeholder="All Districts" /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="all">All Districts</SelectItem>
                      {getDistrictsForState((getUserState(profile.id) as IndianState) || "Himachal Pradesh").map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </MobileCard>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Wallet</TableHead><TableHead>Role</TableHead><TableHead>State</TableHead><TableHead>District</TableHead><TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.phone || '-'}</TableCell>
                  <TableCell><span className="inline-flex items-center gap-1 text-primary font-medium"><Wallet className="h-4 w-4" />₹{getWalletBalance(profile.id).toLocaleString('en-IN')}</span></TableCell>
                  <TableCell>
                    <Select value={getUserRole(profile.id)} onValueChange={(v) => updateUserRole(profile.id, v)}>
                      <SelectTrigger className="w-[120px] bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50"><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="land_partner">Land Partner</SelectItem></SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={getUserState(profile.id) || "himachal"} onValueChange={(v) => updateUserState(profile.id, v === "himachal" ? "Himachal Pradesh" : v)}>
                      <SelectTrigger className="w-[130px] bg-background"><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        {INDIAN_STATES.map((s) => <SelectItem key={s} value={s === "Himachal Pradesh" ? "himachal" : s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={getUserDistrict(profile.id) || "all"} onValueChange={(v) => updateUserDistrict(profile.id, v === "all" ? null : v)}>
                      <SelectTrigger className="w-[130px] bg-background"><SelectValue placeholder="All Districts" /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="all">All Districts</SelectItem>
                        {getDistrictsForState((getUserState(profile.id) as IndianState) || "Himachal Pradesh").map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
