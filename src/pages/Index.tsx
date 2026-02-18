import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import MethodologySection from "@/components/MethodologySection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import PricingSection from "@/components/PricingSection";
import SocialProofSection from "@/components/SocialProofSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <MethodologySection />
        <CaseStudiesSection />
        <PricingSection />
        <SocialProofSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
