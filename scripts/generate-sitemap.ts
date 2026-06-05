// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml combining static routes, programmatic SEO arrays,
// and live published rows from the database (PostgREST + anon key, public data only).

import { writeFileSync } from "fs";
import { resolve } from "path";
import { SUSTAINABILITY_DAYS } from "../src/lib/seo/sustainability-days";
import { HP_CITIES } from "../src/lib/seo/himachal-cities";
import { TREE_SPECIES } from "../src/lib/seo/tree-species";
import { USE_CASES } from "../src/lib/seo/use-cases";

const BASE_URL = "https://himsols.com";
const SUPABASE_URL = "https://jwozuiznphqhiyctiixm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3b3p1aXpucGhxaGl5Y3RpaXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzg1MjUsImV4cCI6MjA4MTg1NDUyNX0.qkNw21xVksAMDPjIqQ1CJ3Id_N5_MhDkGkeV56IRvME";

type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: Freq;
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/monsoon-plantation-himachal", changefreq: "weekly", priority: "0.95" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/tree-plantation", changefreq: "weekly", priority: "0.9" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/gift-cards", changefreq: "weekly", priority: "0.9" },
  { path: "/marketplace", changefreq: "daily", priority: "0.8" },
  { path: "/corporate", changefreq: "weekly", priority: "0.8" },
  { path: "/campaigns", changefreq: "weekly", priority: "0.8" },
  { path: "/plants", changefreq: "weekly", priority: "0.7" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/gallery", changefreq: "weekly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/waste-management", changefreq: "weekly", priority: "0.7" },
  { path: "/services", changefreq: "weekly", priority: "0.7" },
  { path: "/schools", changefreq: "weekly", priority: "0.7" },
  { path: "/bulk-plantation", changefreq: "weekly", priority: "0.8" },
  { path: "/climate-impact-pack", changefreq: "weekly", priority: "0.8" },
  { path: "/single-tree-pack", changefreq: "weekly", priority: "0.8" },
  { path: "/csr-carbon-offset", changefreq: "monthly", priority: "0.7" },
  { path: "/green-quiz", changefreq: "monthly", priority: "0.6" },
  { path: "/impact", changefreq: "weekly", priority: "0.7" },
  { path: "/partner-with-us", changefreq: "monthly", priority: "0.6" },
  { path: "/farmer-registration", changefreq: "monthly", priority: "0.6" },
  { path: "/terms", changefreq: "monthly", priority: "0.3" },
  { path: "/privacy", changefreq: "monthly", priority: "0.3" },
  { path: "/refund-policy", changefreq: "monthly", priority: "0.3" },
  { path: "/auth", changefreq: "monthly", priority: "0.4" },
  { path: "/days", changefreq: "monthly", priority: "0.8" },
];

const programmaticEntries: SitemapEntry[] = [
  ...SUSTAINABILITY_DAYS.map((d) => ({
    path: `/days/${d.slug}`,
    changefreq: "monthly" as Freq,
    priority: "0.85",
  })),
  ...HP_CITIES.map((c) => ({
    path: `/plant-trees-in/${c.slug}`,
    changefreq: "monthly" as Freq,
    priority: "0.75",
  })),
  ...TREE_SPECIES.map((s) => ({
    path: `/trees/${s.slug}`,
    changefreq: "monthly" as Freq,
    priority: "0.75",
  })),
  ...USE_CASES.map((u) => ({
    path: `/plant-trees-for/${u.slug}`,
    changefreq: "monthly" as Freq,
    priority: "0.8",
  })),
];

async function pgrest<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    console.warn(`[sitemap] fetch failed ${path}: ${res.status} ${await res.text()}`);
    return [];
  }
  return (await res.json()) as T[];
}

const isoDate = (s?: string) => (s ? s.slice(0, 10) : undefined);

async function fetchDynamic(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  try {
    const blogs = await pgrest<{ slug: string; updated_at: string }>(
      "blog_posts?select=slug,updated_at&is_published=eq.true"
    );
    blogs.forEach((b) => {
      if (b.slug)
        entries.push({
          path: `/blog/${b.slug}`,
          lastmod: isoDate(b.updated_at),
          changefreq: "monthly",
          priority: "0.6",
        });
    });

    const campaigns = await pgrest<{ id: string; updated_at: string }>(
      "campaigns?select=id,updated_at"
    );
    campaigns.forEach((c) =>
      entries.push({
        path: `/campaign/${c.id}`,
        lastmod: isoDate(c.updated_at),
        changefreq: "weekly",
        priority: "0.6",
      })
    );

    const products = await pgrest<{ id: string; updated_at: string }>(
      "marketplace_products?select=id,updated_at&is_active=eq.true"
    );
    products.forEach((p) =>
      entries.push({
        path: `/marketplace/${p.id}`,
        lastmod: isoDate(p.updated_at),
        changefreq: "weekly",
        priority: "0.55",
      })
    );

    const plants = await pgrest<{ id: string; updated_at: string }>(
      "plants?select=id,updated_at&is_active=eq.true"
    );
    plants.forEach((p) =>
      entries.push({
        path: `/plants/${p.id}`,
        lastmod: isoDate(p.updated_at),
        changefreq: "weekly",
        priority: "0.55",
      })
    );
  } catch (err) {
    console.warn("[sitemap] dynamic fetch error:", err);
  }
  return entries;
}

function render(entries: SitemapEntry[]): string {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    "",
  ].join("\n");
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const homepage = staticEntries.find((e) => e.path === "/");
  if (homepage) homepage.lastmod = today;

  const dynamic = await fetchDynamic();
  const all = [...staticEntries, ...programmaticEntries, ...dynamic];

  // Dedupe by path (last one wins → dynamic lastmod beats static)
  const map = new Map<string, SitemapEntry>();
  all.forEach((e) => map.set(e.path, { ...map.get(e.path), ...e }));
  const entries = Array.from(map.values());

  writeFileSync(resolve("public/sitemap.xml"), render(entries));
  console.log(
    `sitemap.xml written: ${entries.length} entries (static ${staticEntries.length}, programmatic ${programmaticEntries.length}, dynamic ${dynamic.length})`
  );
}

main().catch((err) => {
  console.error("[sitemap] fatal:", err);
  process.exit(1);
});
