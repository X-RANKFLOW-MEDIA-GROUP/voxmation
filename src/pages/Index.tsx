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

const Index = () => {
  useEffect(() => {
    document.title = "Voxmation — AI Voice Agents & Automation for Home Service Businesses";
  }, []);

  return (
    <div className="min-h-screen bg-background">
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
