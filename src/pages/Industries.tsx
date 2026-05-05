import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Droplets, Zap, Sparkles, Scale, Flame, Wrench, Users, Stethoscope, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const industries = [
  { slug: "ai-voice-agent-for-plumbers", icon: Droplets, name: "Plumbing", color: "from-blue-500/20 to-blue-600/10" },
  { slug: "ai-receptionist-electricians", icon: Zap, name: "Electrical", color: "from-yellow-500/20 to-yellow-600/10" },
  { slug: "ai-booking-agent-spa-salon", icon: Sparkles, name: "Spa & Salon", color: "from-purple-500/20 to-purple-600/10" },
  { slug: "ai-intake-agent-law-office", icon: Scale, name: "Law", color: "from-slate-500/20 to-slate-600/10" },
  { slug: "ai-voice-agent-hvac", icon: Flame, name: "HVAC", color: "from-orange-500/20 to-orange-600/10" },
  { slug: "roofing", icon: Wrench, name: "Roofing", color: "from-stone-500/20 to-stone-600/10" },
  { slug: "dental-practices", icon: Stethoscope, name: "Dental", color: "from-green-500/20 to-green-600/10" },
  { slug: "medical-offices", icon: Stethoscope, name: "Medical", color: "from-red-500/20 to-red-600/10" },
  { slug: "consulting-agencies", icon: Briefcase, name: "Consulting", color: "from-indigo-500/20 to-indigo-600/10" },
  { slug: "real-estate-agencies", icon: Users, name: "Real Estate", color: "from-cyan-500/20 to-cyan-600/10" },
  { slug: "automotive-services", icon: Wrench, name: "Automotive", color: "from-gray-500/20 to-gray-600/10" },
  { slug: "cleaning-services", icon: Sparkles, name: "Cleaning", color: "from-teal-500/20 to-teal-600/10" },
  { slug: "landscaping-services", icon: Flame, name: "Landscaping", color: "from-lime-500/20 to-lime-600/10" },
  { slug: "general-contractors", icon: Wrench, name: "Contracting", color: "from-amber-500/20 to-amber-600/10" },
];

const Industries = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://voxmation.com/" },
      { "@type": "ListItem", position: 2, name: "Industries", item: "https://voxmation.com/industries" },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Voice Agents by Industry",
    description: "AI voice agent solutions for 14+ industries. From plumbing to dental practices to law firms.",
    url: "https://voxmation.com/industries",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Voice Agents by Industry | HVAC, Plumbing, Dental, Legal & More"
        description="Industry-specific AI voice agent solutions for service businesses. Plumbing, electrical, HVAC, dental, law firms, and 10+ other industries. 24/7 call answering & automation."
        path="/industries"
        jsonLd={[breadcrumbSchema, collectionSchema]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                Industries
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                AI Voice Agents Built for Your Industry
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                From HVAC to law firms, Voxmation understands your industry's unique challenges and delivers solutions that work.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {industries.map((industry, i) => (
              <Reveal key={industry.slug} delay={0.06 * i} scale>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                  className="surface-card rounded-2xl p-6 relative overflow-hidden group hover:border-primary/15 transition-all duration-500 flex flex-col items-center text-center"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${industry.color} border border-primary/20 flex items-center justify-center mb-4 group-hover:border-primary/40 transition-all duration-500 relative z-10`}>
                    <industry.icon className="h-6 w-6 text-primary/80 group-hover:text-primary/100 transition-colors duration-500" />
                  </div>

                  <h3 className="text-base font-display font-semibold text-foreground mb-3 tracking-tight relative z-10">
                    {industry.name}
                  </h3>

                  <p className="text-xs text-silver leading-relaxed mb-4 relative z-10 flex-1">
                    AI voice agents designed specifically for {industry.name} businesses.
                  </p>

                  <Button
                    variant="neon-outline"
                    size="sm"
                    asChild
                    className="relative z-10 w-full"
                  >
                    <Link to={`/${industry.slug}`} className="gap-1">
                      Learn More <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                Don't see your industry? We support any business that takes calls.
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                From emergency services to e-commerce, if inbound calls matter to your business, we've got you covered.
              </p>
              <Button variant="neon" size="xl" asChild className="gap-2">
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                  Start Free Trial <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Industries;
