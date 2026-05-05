import { verticalsData, statesData, comparisonsData, resourcesData } from "@/data/seoData";

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

export function generateSitemapUrls(): SitemapUrl[] {
  const baseUrl = "https://voxmation.com";
  const today = new Date().toISOString().split("T")[0];
  const urls: SitemapUrl[] = [];

  // Core pages
  urls.push(
    { loc: baseUrl, lastmod: today, changefreq: "weekly", priority: 1.0 },
    { loc: `${baseUrl}/demo`, lastmod: today, changefreq: "monthly", priority: 0.9 },
    { loc: `${baseUrl}/pricing`, lastmod: today, changefreq: "monthly", priority: 0.9 },
    { loc: `${baseUrl}/case-studies`, lastmod: today, changefreq: "monthly", priority: 0.8 },
    { loc: `${baseUrl}/blog`, lastmod: today, changefreq: "daily", priority: 0.8 }
  );

  // Vertical pillar pages
  Object.values(verticalsData).forEach(vertical => {
    urls.push({
      loc: `${baseUrl}/${vertical.slug}`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.9
    });
  });

  // State pages for each vertical
  Object.values(verticalsData).forEach(vertical => {
    statesData.forEach(state => {
      urls.push({
        loc: `${baseUrl}/${vertical.slug}/${state.slug}`,
        lastmod: today,
        changefreq: "monthly",
        priority: 0.7
      });
    });
  });

  // Comparison pages
  Object.values(comparisonsData).forEach(comparison => {
    urls.push({
      loc: `${baseUrl}/${comparison.slug}`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.7
    });
  });

  // Resource pages
  Object.values(resourcesData).forEach(resource => {
    urls.push({
      loc: `${baseUrl}/resources/${resource.slug}`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.7
    });
  });

  return urls;
}

export function generateSitemapXml(): string {
  const urls = generateSitemapUrls();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return xml;
}

export const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /portal/
Disallow: /auth

# Crawl delay
Crawl-delay: 1

# Specific sitemaps
Sitemap: https://voxmation.com/sitemap.xml
`;
