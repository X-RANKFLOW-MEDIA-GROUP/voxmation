interface BreadcrumbItem {
  name: string;
  item: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.item
    }))
  };
}

export function generateFaqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Voxmation",
    url: "https://voxmation.com",
    logo: "https://voxmation.com/logo.png",
    description: "AI voice agents for home service contractors. Answer every call, qualify leads, and book appointments 24/7.",
    foundingDate: "2023",
    sameAs: [
      "https://www.linkedin.com/company/voxmation",
      "https://twitter.com/voxmation",
      "https://www.facebook.com/voxmation"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      telephone: "844-687-7999",
      email: "support@voxmation.com",
      availableLanguage: ["English"]
    }
  };
}

export function generateSoftwareApplicationSchema(industry: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Voxmation - AI for ${industry} Contractors`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://voxmation.com",
    description: `AI voice agents for ${industry.toLowerCase()} contractors. Answer every call 24/7, qualify leads, and book appointments automatically.`,
    offers: {
      "@type": "Offer",
      price: "297",
      priceCurrency: "USD"
    }
  };
}

export function generateLocalBusinessSchema(state: string, stateCode: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Voxmation - ${state}`,
    areaServed: {
      "@type": "State",
      name: state
    },
    description: `AI voice agent services for home service contractors in ${state}.`,
    url: "https://voxmation.com",
    serviceType: "AI Phone Answering"
  };
}
