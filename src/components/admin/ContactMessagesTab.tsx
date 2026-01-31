import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Search, Mail, Phone, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
}

export const ContactMessagesTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactMessage[];
    },
  });

  const filteredMessages = messages.filter((msg) =>
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubjectBadge = (subject: string) => {
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes("bulk") || lowerSubject.includes("gift")) {
      return <Badge variant="destructive">Bulk Gift Cards</Badge>;
    }
    if (lowerSubject.includes("corporate") || lowerSubject.includes("csr")) {
      return <Badge className="bg-blue-500">Corporate</Badge>;
    }
    if (lowerSubject.includes("tree") || lowerSubject.includes("plantation")) {
      return <Badge className="bg-green-500">Plantation</Badge>;
    }
    if (lowerSubject.includes("waste") || lowerSubject.includes("scrap")) {
      return <Badge className="bg-amber-500">Waste Mgmt</Badge>;
    }
    return <Badge variant="secondary">General</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Contact Messages ({messages.length})
        </h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(msg.created_at), "dd MMM yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), "hh:mm a")}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{msg.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1 text-primary hover:underline">
                          <Mail className="h-3 w-3" /> {msg.email}
                        </a>
                        <a href={`tel:${msg.phone}`} className="flex items-center gap-1 text-muted-foreground hover:underline">
                          <Phone className="h-3 w-3" /> {msg.phone}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>{getSubjectBadge(msg.subject)}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate">{msg.message.substring(0, 60)}...</p>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedMessage(msg)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedMessage.created_at), "dd MMM yyyy, hh:mm a")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                    {selectedMessage.phone}
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                {getSubjectBadge(selectedMessage.subject)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                    <Mail className="h-4 w-4 mr-2" /> Reply via Email
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`} target="_blank">
                    <Phone className="h-4 w-4 mr-2" /> WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
