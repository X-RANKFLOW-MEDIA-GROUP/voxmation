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
  modifiedDate?: string;
  keywords?: string;
  locale?: string;
  alternateLocales?: string[];
}

const BASE_URL = "https://voxmation.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = "Voxmation";
const TWITTER_HANDLE = "@voxmation";

const SEOHead = ({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd = [],
  author = "Voxmation Team",
  publishedDate,
  modifiedDate,
  keywords,
  locale = "en_US",
  alternateLocales = [],
}: SEOHeadProps) => {
  const url = `${BASE_URL}${path}`;
  const fullTitle = title.includes("Voxmation") ? title : `${title} | Voxmation`;
  
  // Truncate description to 160 characters for optimal SEO
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + "..." 
    : description;

  // Organization schema - consistent across all pages
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: SITE_NAME,
    legalName: "Voxmation LLC",
    alternateName: ["VOXmatiON", "Voxmation AI", "Voxmation AI Receptionist"],
    url: BASE_URL,
    logo: `${BASE_URL}/Logo.PNG`,
    description: "AI Voice Agents & Automation for Home Service Businesses",
    disambiguatingDescription:
      "Voxmation (voxmation.com) is a US-based AI phone answering and missed-call recovery platform for home service contractors. It is not affiliated with Voxme inventory software, Voxmotion Agency, or VoxMachine.",
    foundingDate: "2023",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: "+1-844-687-7999",
        email: "sales@voxmation.com",
        url: "https://cal.com/voxmation/meeting",
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: "+1-844-687-7999",
        email: "support@voxmation.com",
        availableLanguage: ["English"],
      },
    ],
    sameAs: [
      "https://x.com/voxmation",
      "https://instagram.com/voxmation",
      "https://facebook.com/voxmation",
      "https://linkedin.com/company/voxmation",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
  };

  // Breadcrumb schema for navigation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      ...(path !== "/" ? [{
        "@type": "ListItem",
        position: 2,
        name: title.split("|")[0].trim(),
        item: url,
      }] : []),
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={truncatedDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <meta name="publisher" content={SITE_NAME} />
      <link rel="canonical" href={url} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${title} — ${SITE_NAME}`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={locale} />
      {alternateLocales.map((altLocale) => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={`${title} — ${SITE_NAME}`} />

      {/* Article-specific metadata */}
      {type === "article" && publishedDate && (
        <>
          <meta property="article:published_time" content={publishedDate} />
          {modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}
          <meta property="article:author" content={author} />
          <meta property="article:publisher" content={BASE_URL} />
        </>
      )}

      {/* Additional SEO tags */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="theme-color" content="#0a0a0a" />

      {/* Preload hints for critical resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
