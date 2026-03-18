import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Phone, Bot, Calendar, BarChart3, ArrowRight, CheckCircle2,
  Zap, Shield, Clock, TrendingUp, Star, Users, PhoneCall,
  MessageSquare, Target, Sparkles, ChevronRight, Play, LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import voxmationLogo from "@/assets/voxmation-logo.png";
import mascotMale from "@/assets/mascot-male.png";
import mascotFemale from "@/assets/mascot-female.png";
import SEOHead from "@/components/SEOHead";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const HomeTest = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSource, setDialogSource] = useState("navbar");

  const openLead = (source: string) => {
    setDialogSource(source);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg-body text-text-primary overflow-hidden">
      <SEOHead
        title="AI Voice Agents & Automation for Home Service Businesses"
        description="Voxmation's AI answers every call, follows up with every lead, and books appointments 24/7."
        path="/home-test"
      />

      {/* ─── Navbar ─── */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-bg-surface/80 backdrop-blur-xl border-b border-brand-primary/5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <img src={voxmationLogo} alt="Voxmation" className="h-9 w-9 rounded-lg" />
            <span className="font-bold text-lg tracking-tight text-brand-primary">
              VOX<span className="text-brand-accent">mation</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["How It Works", "Services", "Pricing", "Demo"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="text-sm font-medium text-text-secondary hover:text-brand-accent transition-colors">
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/portal")}
              className="text-text-secondary hover:text-brand-primary hover:bg-brand-primary/5"
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              Portal
            </Button>
            <Button
              size="sm"
              className="bg-brand-primary text-text-inverse hover:bg-brand-secondary shadow-lg shadow-brand-primary/20"
              onClick={() => openLead("navbar")}
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-accent/5 blur-3xl" />
          <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-brand-secondary/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-semibold tracking-wide mb-8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Voice & Automation Platform
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              Never miss a call.
              <br />
              <span className="text-brand-accent">Never lose a lead.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl mb-10"
            >
              AI voice agents that answer every call, book appointments, and follow up with leads — 24/7. Built for home service businesses.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex flex-wrap items-center gap-4"
            >
              <Button
                size="lg"
                className="bg-action-primary text-text-inverse hover:bg-action-primary-hover shadow-xl shadow-brand-accent/25 text-base px-8 h-13"
                onClick={() => openLead("hero")}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/demo")}
                className="border-brand-primary/15 text-brand-primary hover:bg-brand-primary/5 text-base px-8 h-13"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="mt-12 flex items-center gap-6 text-sm text-text-secondary/60"
            >
              {["No contracts", "Setup in 24h", "Cancel anytime"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-accent" />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block absolute -top-8 right-0 w-[400px]"
          >
            <img
              src={mascotMale}
              alt="Voxmation AI Assistant"
              className="w-full h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── Logos / Trust ─── */}
      <section className="py-16 border-y border-brand-primary/5 bg-bg-surface">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-text-secondary/50 uppercase mb-8">Trusted by 200+ service businesses</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-text-secondary/30">
            {["HVAC Pro", "ElectriFix", "PlumbRight", "CleanAir Co", "SparkWorks", "AquaFlow"].map(name => (
              <span key={name} className="text-lg font-bold tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <span className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-5 text-brand-primary">Three steps to zero missed leads</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">Our AI handles the entire pipeline from first ring to booked appointment.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Phone, title: "AI Answers Every Call", desc: "Your AI voice agent picks up instantly, 24/7. It greets callers naturally, understands intent, and qualifies leads in real-time." },
              { step: "02", icon: Bot, title: "Smart Follow-Up", desc: "Missed a call? The AI sends a personalized SMS, starts a follow-up sequence, and recovers the lead automatically." },
              { step: "03", icon: Calendar, title: "Books Appointments", desc: "Qualified leads are booked directly into your calendar. No back-and-forth. No dropped leads." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative p-8 rounded-3xl bg-bg-surface border border-brand-primary/6 hover:border-brand-accent/25 hover:shadow-lg transition-all group"
              >
                <span className="text-6xl font-bold text-brand-primary/[0.03] absolute top-4 right-6 font-mono">{s.step}</span>
                <div className="w-14 h-14 rounded-2xl bg-brand-accent/8 flex items-center justify-center mb-6 group-hover:bg-brand-accent/15 transition-colors">
                  <s.icon className="h-7 w-7 text-brand-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-brand-primary">{s.title}</h3>
                <p className="text-text-secondary leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section id="services" className="py-24 px-6 bg-brand-primary">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <span className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">Services</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-5 text-text-inverse">Everything you need to grow</h2>
            <p className="text-text-inverse/50 text-lg max-w-2xl mx-auto">A complete AI automation stack built for service businesses.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: PhoneCall, title: "AI Voice Agent", desc: "Handles inbound calls with natural conversation, qualifies leads, and routes emergencies." },
              { icon: MessageSquare, title: "Missed Call Text-Back", desc: "Automatically texts back missed callers with a booking link within 60 seconds." },
              { icon: Target, title: "Lead Recovery", desc: "Multi-step SMS and email sequences to re-engage cold leads and boost conversions." },
              { icon: Calendar, title: "Smart Scheduling", desc: "Syncs with your calendar and books appointments based on real-time availability." },
              { icon: BarChart3, title: "Performance Analytics", desc: "Track calls, conversions, revenue impact, and ROI through your client portal." },
              { icon: Zap, title: "CRM Integrations", desc: "Connects with GoHighLevel, Zoho, Stripe, Zapier, and 5,000+ tools." },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-7 rounded-2xl bg-text-inverse/[0.04] border border-text-inverse/[0.08] hover:border-brand-accent/30 hover:bg-text-inverse/[0.06] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-5 group-hover:bg-brand-accent/20 transition-colors">
                  <s.icon className="h-6 w-6 text-brand-accent" />
                </div>
                <h3 className="text-lg font-bold text-text-inverse mb-2">{s.title}</h3>
                <p className="text-text-inverse/45 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "Call Answer Rate" },
              { value: "3x", label: "More Booked Jobs" },
              { value: "24/7", label: "Availability" },
              { value: "60s", label: "Avg Response Time" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-brand-accent mb-2">{s.value}</p>
                <p className="text-sm text-text-secondary/70 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-6 bg-bg-surface">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <span className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 text-brand-primary">Trusted by businesses like yours</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "We went from missing 40% of calls to answering 100%. Revenue jumped 35% in the first month.", name: "Mike R.", role: "HVAC Business Owner", stars: 5 },
              { quote: "The AI books appointments for us even at 2 AM. It's like having a receptionist that never sleeps.", name: "Sarah T.", role: "Plumbing Company", stars: 5 },
              { quote: "Setup was painless. Within 48 hours, the AI was handling calls like a seasoned pro.", name: "David L.", role: "Electrical Contractor", stars: 5 },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-bg-surface rounded-2xl p-8 border border-brand-primary/6 shadow-sm"
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-brand-accent text-brand-accent" />
                  ))}
                </div>
                <p className="text-text-secondary leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-brand-primary">{t.name}</p>
                  <p className="text-xs text-text-secondary/60">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Teaser ─── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold tracking-[0.2em] text-brand-accent uppercase">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-5 text-brand-primary">Simple, transparent pricing</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-12">No hidden fees. No contracts. Start with a free audit and only pay when you're ready.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$497", period: "/mo", features: ["AI Voice Agent", "Missed Call Text-Back", "Up to 200 calls/mo", "Basic Analytics"], popular: false },
              { name: "Growth", price: "$997", period: "/mo", features: ["Everything in Starter", "Up to 500 calls/mo", "CRM Integrations", "Priority Support", "Multi-location"], popular: true },
              { name: "Scale", price: "Custom", period: "", features: ["Everything in Growth", "Unlimited calls", "Custom AI training", "White-glove onboarding", "Dedicated account manager"], popular: false },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl border ${p.popular ? 'border-brand-accent bg-brand-accent/[0.02]' : 'border-brand-primary/6 bg-bg-surface'}`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-accent text-text-inverse text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <p className="text-lg font-semibold text-brand-primary mb-2">{p.name}</p>
                <p className="text-4xl font-bold text-brand-primary mb-6">{p.price}<span className="text-lg text-text-secondary/60">{p.period}</span></p>
                <ul className="space-y-3 mb-8 text-left">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-text-secondary">
                      <CheckCircle2 className="h-5 w-5 text-brand-accent shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className={`w-full ${p.popular ? 'bg-action-primary text-text-inverse hover:bg-action-primary-hover' : 'bg-brand-primary text-text-inverse hover:bg-brand-secondary'}`}
                  onClick={() => openLead("pricing_" + p.name.toLowerCase())}
                >
                  Get Started
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6 bg-brand-accent">
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block absolute -bottom-24 left-0 w-[280px]"
          >
            <img
              src={mascotFemale}
              alt="Voxmation AI Assistant"
              className="w-full h-auto drop-shadow-2xl"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold text-brand-primary mb-6">Ready to stop missing calls?</h2>
            <p className="text-brand-primary/60 text-lg max-w-xl mx-auto mb-10">Join hundreds of service businesses turning missed calls into booked jobs with AI.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-brand-primary text-text-inverse hover:bg-brand-secondary text-base px-10 h-14"
                onClick={() => openLead("cta_bottom")}
              >
                Book Free Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/demo")}
                className="border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 text-base px-10 h-14"
              >
                Try Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-16 px-6 bg-brand-primary border-t border-text-inverse/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={voxmationLogo} alt="Voxmation" className="h-9 w-9 rounded-lg" />
                <span className="font-bold text-lg text-text-inverse">
                  VOX<span className="text-brand-accent">mation</span>
                </span>
              </div>
              <p className="text-text-inverse/50 text-sm leading-relaxed">AI voice agents and automation for home service businesses. Never miss a call again.</p>
            </div>
            <div>
              <p className="font-semibold text-text-inverse mb-4">Product</p>
              <ul className="space-y-3 text-sm text-text-inverse/50">
                <li><a href="#how-it-works" className="hover:text-brand-accent transition-colors">How It Works</a></li>
                <li><a href="#services" className="hover:text-brand-accent transition-colors">Services</a></li>
                <li><a href="#pricing" className="hover:text-brand-accent transition-colors">Pricing</a></li>
                <li><a href="/demo" className="hover:text-brand-accent transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-text-inverse mb-4">Industries</p>
              <ul className="space-y-3 text-sm text-text-inverse/50">
                <li><span className="hover:text-brand-accent transition-colors cursor-pointer">HVAC</span></li>
                <li><span className="hover:text-brand-accent transition-colors cursor-pointer">Plumbing</span></li>
                <li><span className="hover:text-brand-accent transition-colors cursor-pointer">Electrical</span></li>
                <li><span className="hover:text-brand-accent transition-colors cursor-pointer">Cleaning</span></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-text-inverse mb-4">Company</p>
              <ul className="space-y-3 text-sm text-text-inverse/50">
                <li><a href="mailto:hello@voxmation.ai" className="hover:text-brand-accent transition-colors">Contact</a></li>
                <li><a href="/portal" className="hover:text-brand-accent transition-colors">Client Portal</a></li>
                <li><a href="/auth" className="hover:text-brand-accent transition-colors">Login</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-text-inverse/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-inverse/40">© 2026 Voxmation. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-text-inverse/40">
              <span className="hover:text-brand-accent transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-brand-accent transition-colors cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </footer>

      <LeadCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} pageSource={dialogSource} />
    </div>
  );
};

export default HomeTest;
