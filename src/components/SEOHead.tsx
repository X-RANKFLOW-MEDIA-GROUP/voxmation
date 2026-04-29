import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "product";
  image?: string;
  noindex?: boolean;
  jsonLd?: object[];
  author?: string;
  publishedDate?: string;
  keywords?: string;
}

const BASE_URL = "https://voxmation.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

const SEOHead = ({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd = [],
  author,
  publishedDate,
  keywords,
}: SEOHeadProps) => {
  const url = `${BASE_URL}${path}`;
  const fullTitle = title.includes("Voxmation") ? title : `${title} | Voxmation`;

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Voxmation",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.ico`,
    description: "AI Voice Agents & Automation for Home Service Businesses",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: "https://cal.com/voxmation/meeting",
    },
    sameAs: [
      "https://x.com/voxmation",
      "https://instagram.com/voxmation",
      "https://facebook.com/voxmation",
    ],
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Voxmation" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${fullTitle} — Voxmation`} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@voxmation" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article Metadata */}
      {type === "article" && publishedDate && <meta property="article:published_time" content={publishedDate} />}
      {type === "article" && author && <meta name="author" content={author} />}

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
