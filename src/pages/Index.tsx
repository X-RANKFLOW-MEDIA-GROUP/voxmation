import { Helmet } from "react-helmet-async";
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Voxmation — AI Voice Agents & Automation for Home Service Businesses</title>
        <meta name="description" content="Voxmation deploys AI Voice Agents that answer every call, follow up with every lead, and book appointments 24/7 for HVAC, plumbing, electrical, and home service businesses." />
        <link rel="canonical" href="https://voxmation.com" />
      </Helmet>
      <Navbar />
      <FloatingCTA />
      <main>
        <HeroSection />
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
