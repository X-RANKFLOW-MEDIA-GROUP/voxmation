import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  jsonLd?: object[];
}

const BASE_URL = "https://voxmation.com";

const SEOHead = ({ title, description, path, type = "website", jsonLd = [] }: SEOHeadProps) => {
  const url = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Voxmation`;

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Voxmation",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.ico`,
    description: "AI Voice Agents & Automation for Home Service Businesses",
    contactPoint: { "@type": "ContactPoint", contactType: "sales", url: "https://cal.com/voxmation/meeting" },
    sameAs: ["https://x.com/voxmation", "https://instagram.com/voxmation", "https://facebook.com/voxmation"],
  };

  const localBizSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Voxmation",
    url: BASE_URL,
    description: "AI-powered voice agents for home service businesses. 24/7 call answering, lead qualification, and automated booking.",
    areaServed: { "@type": "Country", name: "United States" },
    priceRange: "$$",
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Voxmation" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(localBizSchema)}</script>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
