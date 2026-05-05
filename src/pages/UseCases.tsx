import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Phone, Workflow, Link2, MessageSquare, UserCheck, CalendarCheck, Lightbulb, BarChart3, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const useCases = [
  {
    slug: "ai-phone-answering",
    icon: Phone,
    title: "AI Phone Answering",
    description: "Your AI receptionist answers every call 24/7 — qualified leads, professional greetings, and zero missed calls.",
    benefits: ["24/7 call coverage", "Instant lead qualification", "Automatic appointment booking"],
  },
  {
    slug: "missed-call-recovery",
    icon: Clock,
    title: "Missed Call Recovery",
    description: "Every missed call triggers an instant SMS and callback attempt within seconds. Revenue recovery at scale.",
    benefits: ["Instant SMS follow-up", "Automatic callback queue", "Conversion tracking"],
  },
  {
    slug: "appointment-scheduling",
    icon: CalendarCheck,
    title: "Appointment Scheduling",
    description: "AI-powered booking that works with your calendar, reduces no-shows, and sends automated reminders.",
    benefits: ["89% fewer no-shows", "Automated confirmations", "SMS reminders"],
  },
  {
    slug: "lead-qualification",
    icon: UserCheck,
    title: "Lead Qualification",
    description: "AI analyzes every call to qualify leads, score them, and route to the best sales rep instantly.",
    benefits: ["Score accuracy 95%+", "Real-time routing", "CRM auto-sync"],
  },
  {
    slug: "crm-automation",
    icon: Workflow,
    title: "CRM Automation",
    description: "End-to-end automation connecting your phone, web, and CRM. Leads logged automatically, zero manual entry.",
    benefits: ["No duplicate data entry", "Instant lead sync", "Custom workflows"],
  },
  {
    slug: "after-hours-calls",
    icon: Lightbulb,
    title: "After-Hours Calls",
    description: "Your AI never sleeps. Capture every after-hours call, qualify it, and book appointments before dawn.",
    benefits: ["24/7 coverage", "Emergency detection", "On-call routing"],
  },
  {
    slug: "lead-follow-up",
    icon: MessageSquare,
    title: "Lead Follow-Up",
    description: "Automated multi-touch campaigns via SMS, email, and voice. No lead falls through the cracks.",
    benefits: ["SMS sequences", "Email drip campaigns", "Voice follow-ups"],
  },
  {
    slug: "customer-analytics",
    icon: BarChart3,
    title: "Customer Analytics",
    description: "Real-time dashboards showing call volume, conversion rates, missed opportunities, and revenue impact.",
    benefits: ["Real-time reporting", "Conversion tracking", "Revenue attribution"],
  },
  {
    slug: "integration-setup",
    icon: Link2,
    title: "CRM Integration",
    description: "Seamless setup with ServiceTitan, Jobber, HubSpot, GoHighLevel, Zoho, and 20+ other platforms.",
    benefits: ["One-click setup", "Custom field mapping", "Two-way sync"],
  },
];

const UseCases = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://voxmation.com/" },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://voxmation.com/use-cases" },
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Voice Agent Use Cases for Businesses",
    description: "Explore how AI voice agents solve specific business problems from appointment booking to lead qualification.",
    url: "https://voxmation.com/use-cases",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: useCases.map((uc, i) => ({
        "@type": "Thing",
        position: i + 1,
        name: uc.title,
        description: uc.description,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="AI Voice Agent Use Cases | Phone Answering, Scheduling, Lead Qualification"
        description="Discover 9 powerful use cases for AI voice agents: appointment booking, lead qualification, missed call recovery, CRM automation, and more. Solve specific business problems."
        path="/use-cases"
        jsonLd={[breadcrumbSchema, organizationSchema]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                Use Cases
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                AI Voice Solutions for Every Business Challenge
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                From appointment booking to lead qualification, AI voice agents solve the problems that cost your business the most revenue.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {useCases.map((useCase, i) => (
              <Reveal key={useCase.slug} delay={0.08 * i} scale>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                  className="surface-card rounded-2xl p-8 h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500 flex flex-col"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 group-hover:border-primary/40 transition-all duration-500">
                      <useCase.icon className="h-5 w-5 text-primary/80 group-hover:text-primary/100 transition-colors duration-500" />
                    </div>
                  </div>

                  <h3 className="text-lg font-display font-semibold text-foreground mb-3 tracking-tight relative z-10">
                    {useCase.title}
                  </h3>
                  <p className="text-silver text-sm leading-relaxed mb-6 relative z-10 flex-1">
                    {useCase.description}
                  </p>

                  <ul className="space-y-2 mb-6 relative z-10">
                    {useCase.benefits.map((benefit) => (
                      <li key={benefit} className="text-xs text-silver/80 flex items-start gap-2">
                        <span className="text-primary/60 mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="neon"
                    size="sm"
                    asChild
                    className="relative z-10 w-full"
                  >
                    <Link to={`/use-cases/${useCase.slug}`} className="gap-2">
                      Learn More <ArrowUpRight className="h-3.5 w-3.5" />
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
                Ready to eliminate missed calls?
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Start your free 14-day trial today. No credit card required. See exactly how much revenue you can recover.
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

export default UseCases;
