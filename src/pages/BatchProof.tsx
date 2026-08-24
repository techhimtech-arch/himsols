import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButtons } from "@/components/ShareButtons";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, TreePine, Calendar, Leaf, ArrowLeft, Camera } from "lucide-react";

const CO2_PER_TREE_PER_YEAR = 22;

const BatchProof = () => {
  const { code = "" } = useParams();

  const { data: batch, isLoading } = useQuery({
    queryKey: ["public-batch", code],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_public_batch", { p_batch_id: code });
      if (error) throw error;
      return (data as any[])?.[0] ?? null;
    },
    enabled: !!code,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["public-batch-photos", code],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_public_batch_photos", {
        p_batch_id: code,
      });
      if (error) throw error;
      return (data as any[]) || [];
    },
    enabled: !!batch,
  });

  const co2 = batch ? ((batch.tree_count * CO2_PER_TREE_PER_YEAR) / 1000).toFixed(2) : "0";
  const geoCount = photos.filter((p: any) => p.latitude && p.longitude).length;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Plantation batch ${code} — Himsols proof`}
        description={`Photos, location and survival status for Himsols plantation batch ${code} in Himachal Pradesh.`}
        url={`https://himsols.online/batch/${code}`}
      />
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/gallery" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to gallery
          </Link>

          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !batch ? (
            <Card>
              <CardContent className="p-10 text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Batch not found</h1>
                <p className="text-muted-foreground mb-6">
                  This batch either does not exist or has not been planted yet. Proof pages go live
                  once plantation is done.
                </p>
                <Link to="/track-request">
                  <Button>Track your request</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <span className="text-xs font-bold tracking-[0.18em] uppercase text-primary">
                Plantation proof
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                Batch {batch.batch_id}
              </h1>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <TreePine className="h-4 w-4 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Trees planted</p>
                    <p className="text-lg font-bold">{batch.tree_count}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <Leaf className="h-4 w-4 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Species</p>
                    <p className="text-lg font-bold">{batch.species}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <Calendar className="h-4 w-4 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Plantation date</p>
                    <p className="text-lg font-bold">
                      {new Date(batch.plantation_date).toLocaleDateString("en-IN")}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <MapPin className="h-4 w-4 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-lg font-bold">
                      {batch.village ? `${batch.village}, ` : ""}
                      {batch.district || "Himachal Pradesh"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-8">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="font-semibold text-foreground">{batch.status}</span>
                    {batch.trees_alive != null && (
                      <>
                        {" · "}Survival check: {batch.trees_alive}/{batch.tree_count} alive
                        {batch.review_date
                          ? ` (reviewed ${new Date(batch.review_date).toLocaleDateString("en-IN")})`
                          : ""}
                      </>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Estimated CO₂ sequestration: ~{co2} tonnes per year at maturity — an estimate
                    based on {CO2_PER_TREE_PER_YEAR}kg per tree per year, not a verified credit.
                  </p>
                </CardContent>
              </Card>

              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Photos ({photos.length})
              </h2>
              {photos.length > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  {geoCount} of {photos.length} photos carry GPS coordinates you can open on a map.
                </p>
              )}
              {photos.length === 0 ? (
                <p className="text-muted-foreground mb-8">
                  Photos for this batch are being uploaded — check back shortly.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {photos.map((p: any, i: number) => (
                    <figure key={i} className="rounded-xl overflow-hidden border border-border">
                      <img
                        src={p.photo_url}
                        alt={p.caption || `Plantation photo from batch ${batch.batch_id}`}
                        loading="lazy"
                        className="w-full h-48 object-cover"
                      />
                      <figcaption className="p-3 text-xs text-muted-foreground space-y-1">
                        <p>{p.caption || "Plantation photo"}</p>
                        {p.taken_at && (
                          <p>Taken {new Date(p.taken_at).toLocaleString("en-IN")}</p>
                        )}
                        {p.latitude && p.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary underline"
                          >
                            <MapPin className="h-3 w-3" />
                            {Number(p.latitude).toFixed(5)}, {Number(p.longitude).toFixed(5)}
                            {p.gps_source === "exif" ? " · from camera" : ""}
                          </a>
                        ) : (
                          <p className="italic">No GPS metadata on this photo.</p>
                        )}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}

              <ShareButtons
                title={`Himsols plantation batch ${batch.batch_id}`}
                description={`${batch.tree_count} native trees planted in ${batch.district || "Himachal Pradesh"}.`}
                url={`/batch/${batch.batch_id}`}
                variant="full"
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BatchProof;
