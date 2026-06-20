import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

const SEOBreadcrumbs = ({ items, showHome = true }: SEOBreadcrumbsProps) => {
  const location = useLocation();
  const baseUrl = "https://voxmation.com";

  // Generate breadcrumb schema for SEO
  const breadcrumbItems = [
    ...(showHome ? [{ name: "Home", path: "/" }] : []),
    ...items,
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };

  return (
    <>
      <nav className="py-4 px-6 bg-background/50 border-b border-border/50" aria-label="Breadcrumb">
        <div className="container mx-auto">
          <ol className="flex items-center gap-2 text-xs md:text-sm font-mono">
            {breadcrumbItems.map((item, index) => (
              <li key={item.path} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-border" />}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-foreground font-semibold">{item.name}</span>
                ) : (
                  <Link
                    to={item.path}
                    className="text-silver hover:text-primary transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Breadcrumb Schema for SEO (dangerouslySetInnerHTML so JSON-LD isn't HTML-escaped during SSR) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
};

export default SEOBreadcrumbs;
