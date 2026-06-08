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
import VoiceDemonstration from "@/components/VoiceDemonstration";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Voice Agents & Automation for Home Service Businesses"
        description="Voxmation's AI answers every call, follows up with every lead, and books appointments 24/7. Built for HVAC, plumbing, electrical, roofing contractors. No contracts. Setup in 24 hours."
        path="/"
        keywords="AI Voice Agent, Home Service Automation, HVAC AI, Plumbing AI, Electrical AI, Roofing AI, Missed Call Text Back, 24/7 Answering Service, AI Receptionist, Lead Qualification, Appointment Booking"
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
              "@type": "AggregateOffer",
              lowPrice: "297",
              highPrice: "497",
              priceCurrency: "USD",
              offerCount: "3",
            },
            featureList: [
              "24/7 AI Call Answering",
              "Missed Call Text-Back",
              "Lead Qualification & Scoring",
              "CRM Integration",
              "Automated Appointment Booking",
              "Multi-Channel Follow-Up",
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "How long does Voxmation setup take?", acceptedAnswer: { "@type": "Answer", text: "Most businesses are live within 7–14 days. Setup includes CRM integration, AI training on your scripts, and testing with your team." } },
              { "@type": "Question", name: "Is there a long-term contract required?", acceptedAnswer: { "@type": "Answer", text: "No. All Voxmation plans are month-to-month. Cancel anytime with no penalties or hidden fees." } },
              { "@type": "Question", name: "What industries does Voxmation support?", acceptedAnswer: { "@type": "Answer", text: "Voxmation is built for home service businesses including HVAC, plumbing, electrical, roofing, landscaping, cleaning, spa & salon, and law offices." } },
              { "@type": "Question", name: "Does the AI integrate with my CRM?", acceptedAnswer: { "@type": "Answer", text: "Yes. Voxmation integrates with 50+ platforms including ServiceTitan, Jobber, Housecall Pro, GoHighLevel, HubSpot, and Zoho CRM." } },
              { "@type": "Question", name: "How much does Voxmation cost?", acceptedAnswer: { "@type": "Answer", text: "Voxmation plans start at $297/month for the Starter plan. Growth plan is $497/month. Enterprise pricing is custom. All plans include a 14-day free trial." } },
              { "@type": "Question", name: "Can the AI handle emergency calls after hours?", acceptedAnswer: { "@type": "Answer", text: "Yes. Voxmation's AI operates 24/7/365 and is specifically trained to handle emergency calls, qualify urgency levels, and book same-day appointments." } },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Voxmation AI Voice Agent",
            description: "AI-powered voice agents that answer calls, qualify leads, and book appointments 24/7 for home service businesses.",
            brand: {
              "@type": "Brand",
              name: "Voxmation",
            },
            offers: {
              "@type": "Offer",
              url: "https://voxmation.com/pricing",
              priceCurrency: "USD",
              price: "297",
              priceValidUntil: "2027-12-31",
              availability: "https://schema.org/InStock",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: "Voxmation AI Voice Agent Demo",
            description: "Hear Voxmation's AI voice agent in action. Experience ultra-realistic voice technology answering calls for home service businesses.",
            thumbnailUrl: "https://voxmation.com/og-image.png",
            uploadDate: "2026-01-15",
            contentUrl: "https://voxmation.com/demo",
            embedUrl: "https://voxmation.com/demo#voice-demo",
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
        <section className="border-t border-border py-24 md:py-32">
          <div className="container mx-auto px-6">
            <VoiceDemonstration
              title="Hear Your AI Agent In Action"
              subtitle="Experience our ultra-realistic voice technology powered by ElevenLabs. Each voice is customizable and supports multiple languages for global reach."
              showVisualizer={true}
            />
          </div>
        </section>
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
