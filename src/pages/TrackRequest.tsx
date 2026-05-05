import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckCircle, Clock, Truck, MapPin, Calendar, Package, TreePine } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface RequestData {
  tracking_id: string;
  status: string;
  location: string;
  quantity: number;
  tree_type: string;
  created_at: string;
}

interface ScrapRequestData {
  tracking_id: string;
  status: string;
  address: string;
  waste_type: string;
  pickup_date: string;
  created_at: string;
}

const TrackRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackingId: trackingIdParam } = useParams();
  const [trackingId, setTrackingId] = useState("");
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [scrapRequestData, setScrapRequestData] = useState<ScrapRequestData | null>(null);
  const [userRequests, setUserRequests] = useState<RequestData[]>([]);
  const [userScrapRequests, setUserScrapRequests] = useState<ScrapRequestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState<"tree" | "scrap" | null>(null);

  useEffect(() => {
    if (user) {
      loadUserRequests();
    }
  }, [user]);

  useEffect(() => {
    if (trackingIdParam) {
      setTrackingId(trackingIdParam);
      // auto-submit
      handleTrack({ preventDefault: () => {} } as React.FormEvent, trackingIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingIdParam]);

  const loadUserRequests = async () => {
    if (!user) return;

    // Load tree plantation requests
    const { data: treeData } = await supabase
      .from('tree_plantation_requests')
      .select('tracking_id, status, location, quantity, tree_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (treeData) setUserRequests(treeData);

    // Load scrap collection requests
    const { data: scrapData } = await supabase
      .from('waste_management_requests')
      .select('tracking_id, status, address, waste_type, pickup_date, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (scrapData) setUserScrapRequests(scrapData);
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRequestData(null);
    setScrapRequestData(null);
    setRequestType(null);

    try {
      const trimmedId = trackingId.trim();
      
      // Check if it's a tree plantation request (HMS-) or scrap request (WMS-)
      if (trimmedId.startsWith('HMS-')) {
        const { data, error } = await supabase
          .from('tree_plantation_requests')
          .select('tracking_id, status, location, quantity, tree_type, created_at')
          .eq('tracking_id', trimmedId)
          .single();

        if (error) {
          toast({
            title: "Not Found",
            description: "No request found with this tracking ID.",
            variant: "destructive",
          });
          return;
        }

        setRequestData(data);
        setRequestType("tree");
      } else if (trimmedId.startsWith('WMS-')) {
        const { data, error } = await supabase
          .from('waste_management_requests')
          .select('tracking_id, status, address, waste_type, pickup_date, created_at')
          .eq('tracking_id', trimmedId)
          .single();

        if (error) {
          toast({
            title: "Not Found",
            description: "No request found with this tracking ID.",
            variant: "destructive",
          });
          return;
        }

        setScrapRequestData(data);
        setRequestType("scrap");
      } else {
        toast({
          title: "Invalid ID",
          description: "Please enter a valid tracking ID (HMS-XXXX or WMS-XXXX).",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error tracking request:', error);
      toast({
        title: "Error",
        description: "Failed to track request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const allStatuses = [
      {
        status: 'pending',
        title: 'Request Received',
        description: 'Your tree plantation request has been received',
        icon: <CheckCircle className="h-6 w-6" />,
      },
      {
        status: 'site_verified',
        title: 'Site Verification',
        description: 'Our team has verified the plantation site',
        icon: <MapPin className="h-6 w-6" />,
      },
      {
        status: 'saplings_arranged',
        title: 'Saplings Arranged',
        description: 'Native tree saplings are prepared for plantation',
        icon: <Truck className="h-6 w-6" />,
      },
      {
        status: 'scheduled',
        title: 'Plantation Scheduled',
        description: 'Plantation drive has been scheduled',
        icon: <Calendar className="h-6 w-6" />,
      },
      {
        status: 'completed',
        title: 'Completed',
        description: 'Tree plantation successfully completed',
        icon: <CheckCircle className="h-6 w-6" />,
      },
    ];

    const currentIndex = allStatuses.findIndex(s => s.status === currentStatus);
    
    return allStatuses.map((step, index) => ({
      ...step,
      state: index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'pending',
    }));
  };

  const getScrapStatusSteps = (currentStatus: string) => {
    const allStatuses = [
      {
        status: 'pending',
        title: 'Request Received',
        description: 'Your scrap collection request has been received',
        icon: <CheckCircle className="h-6 w-6" />,
      },
      {
        status: 'site_verified',
        title: 'Details Verified',
        description: 'Our team has verified your request details',
        icon: <MapPin className="h-6 w-6" />,
      },
      {
        status: 'scheduled',
        title: 'Pickup Scheduled',
        description: 'Your scrap collection has been scheduled',
        icon: <Calendar className="h-6 w-6" />,
      },
      {
        status: 'in_progress',
        title: 'Collection In Progress',
        description: 'Our team is on the way to collect your scrap',
        icon: <Truck className="h-6 w-6" />,
      },
      {
        status: 'completed',
        title: 'Completed',
        description: 'Scrap collection successfully completed',
        icon: <CheckCircle className="h-6 w-6" />,
      },
    ];

    const currentIndex = allStatuses.findIndex(s => s.status === currentStatus);
    
    return allStatuses.map((step, index) => ({
      ...step,
      state: index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'pending',
    }));
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <Search className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-6">Track Your Request</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Enter your tracking ID to monitor the status of your plantation or scrap collection request
          </p>
        </div>
      </section>

      {/* User's Requests Section */}
      {user && (userRequests.length > 0 || userScrapRequests.length > 0) && (
        <section className="py-8 px-4 bg-muted">
          <div className="container mx-auto max-w-4xl">
            <Tabs defaultValue="tree" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="tree" className="flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Plantation ({userRequests.length})
                </TabsTrigger>
                <TabsTrigger value="scrap" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Scrap ({userScrapRequests.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tree">
                <div className="grid gap-4">
                  {userRequests.map((request) => (
                    <Card key={request.tracking_id} className="hover:shadow-hover transition-all">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{request.tracking_id}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.quantity} {request.tree_type} trees • {request.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                              {request.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {userRequests.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No plantation requests yet</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="scrap">
                <div className="grid gap-4">
                  {userScrapRequests.map((request) => (
                    <Card key={request.tracking_id} className="hover:shadow-hover transition-all">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{request.tracking_id}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.waste_type} • {request.address.substring(0, 40)}...
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-500 text-white">
                              {request.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              Pickup: {new Date(request.pickup_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {userScrapRequests.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No scrap collection requests yet</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      )}

      {/* Tracking Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleTrack} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="trackingId">Tracking ID</Label>
                  <Input
                    id="trackingId"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Enter your tracking ID (HMS-XXXX or WMS-XXXX)"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    HMS = Tree Plantation | WMS = Scrap Collection
                  </p>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Tracking..." : "Track Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tracking Results - Tree */}
      {requestData && requestType === "tree" && (
        <section className="py-16 px-4 bg-muted">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              <TreePine className="inline h-8 w-8 mr-2 text-primary" />
              Tree Plantation: {requestData.tracking_id}
            </h2>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {getStatusSteps(requestData.status).map((step, index, arr) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`rounded-full p-3 ${
                            step.state === 'completed'
                              ? 'bg-primary text-white'
                              : step.state === 'active'
                              ? 'bg-secondary text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {step.icon}
                        </div>
                        {index < arr.length - 1 && (
                          <div
                            className={`w-0.5 h-16 mt-2 ${
                              step.state === 'completed' ? 'bg-primary' : 'bg-border'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-accent rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Location:</strong> {requestData.location}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Trees to be planted: {requestData.quantity} {requestData.tree_type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Request Date: {new Date(requestData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Tracking Results - Scrap */}
      {scrapRequestData && requestType === "scrap" && (
        <section className="py-16 px-4 bg-muted">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              <Package className="inline h-8 w-8 mr-2 text-amber-500" />
              Scrap Collection: {scrapRequestData.tracking_id}
            </h2>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {getScrapStatusSteps(scrapRequestData.status).map((step, index, arr) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`rounded-full p-3 ${
                            step.state === 'completed'
                              ? 'bg-amber-500 text-white'
                              : step.state === 'active'
                              ? 'bg-amber-400 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {step.icon}
                        </div>
                        {index < arr.length - 1 && (
                          <div
                            className={`w-0.5 h-16 mt-2 ${
                              step.state === 'completed' ? 'bg-amber-500' : 'bg-border'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Pickup Address:</strong> {scrapRequestData.address}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Scrap Type: {scrapRequestData.waste_type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Scheduled Pickup: {new Date(scrapRequestData.pickup_date).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Help Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            If you don't have a tracking ID or facing any issues, please contact our support team
          </p>
          <Button variant="outline" size="lg" onClick={() => window.location.href = '/contact'}>
            Contact Support
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrackRequest;
