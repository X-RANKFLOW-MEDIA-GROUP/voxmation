import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ProblemSection from "@/components/ProblemSection";
import ServicesSection from "@/components/ServicesSection";
import IndustrySection from "@/components/IndustrySection";
import BenefitsSection from "@/components/BenefitsSection";
import SocialProofSection from "@/components/SocialProofSection";
import ComparisonSection from "@/components/ComparisonSection";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";
import FloatingCTA from "@/components/FloatingCTA";
import IntegrationLogos from "@/components/IntegrationLogos";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Voice Agents & Automation for Home Service Businesses"
        description="Voxmation's AI answers every call, follows up with every lead, and books appointments 24/7. Built for HVAC, plumbing, electrical, spa, and law firms. No contracts. Setup in 24h."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Voxmation",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://voxmation.com",
            description: "AI-powered voice agents for home service businesses. 24/7 call answering, lead qualification, and automated appointment booking.",
            offers: {
              "@type": "Offer",
              price: "297",
              priceCurrency: "USD",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "87",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "How long does setup take?", acceptedAnswer: { "@type": "Answer", text: "Most businesses are live within 7–14 days." } },
              { "@type": "Question", name: "Is there a long-term contract?", acceptedAnswer: { "@type": "Answer", text: "No. Month-to-month. Cancel anytime." } },
              { "@type": "Question", name: "What industries does Voxmation support?", acceptedAnswer: { "@type": "Answer", text: "HVAC, plumbing, electrical, roofing, landscaping, cleaning, spa & salon, and law offices." } },
              { "@type": "Question", name: "Does the AI integrate with my CRM?", acceptedAnswer: { "@type": "Answer", text: "Yes. Voxmation integrates with ServiceTitan, Jobber, Housecall Pro, GoHighLevel, HubSpot, Zoho, and more." } },
            ],
          },
        ]}
      />
      <Navbar />
      <FloatingCTA />
      <main>
        <HeroSection />
        <IntegrationLogos />
        <ProblemSection />
        <HowItWorksSection />
        <ServicesSection />
        <IndustrySection />
        <BenefitsSection />
        <ComparisonSection />
        <SocialProofSection />
        <FAQSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
