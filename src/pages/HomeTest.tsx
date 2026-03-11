import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Phone, Bot, Calendar, BarChart3, ArrowRight, CheckCircle2,
  Zap, Shield, Clock, TrendingUp, Star, Users, PhoneCall,
  MessageSquare, Target, Sparkles, ChevronRight, Play, LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import voxmationLogo from "@/assets/voxmation-logo.png";
import SEOHead from "@/components/SEOHead";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const HomeTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-[#0a1628] overflow-hidden">
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
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#0a1628]/5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <img src={voxmationLogo} alt="Voxmation" className="h-9 w-9 rounded-lg" />
            <span className="font-bold text-lg tracking-tight text-[#0a1628]">
              VOX<span className="text-[#c47a3a]">mation</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["How It Works", "Services", "Pricing", "Demo"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="text-sm font-medium text-[#0a1628]/60 hover:text-[#c47a3a] transition-colors">
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/portal")}
              className="text-[#0a1628]/60 hover:text-[#0a1628] hover:bg-[#0a1628]/5"
            >
              <LogIn className="h-4 w-4 mr-1.5" />
              Portal
            </Button>
            <Button
              size="sm"
              className="bg-[#0a1628] text-white hover:bg-[#162d50] shadow-lg shadow-[#0a1628]/20"
              asChild
            >
              <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                Book a Demo
              </a>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Subtle background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#c47a3a]/5 blur-3xl" />
          <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-[#162d50]/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c47a3a]/10 text-[#c47a3a] text-xs font-semibold tracking-wide mb-8"
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
              <span className="text-[#c47a3a]">Never lose a lead.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-lg md:text-xl text-[#0a1628]/55 leading-relaxed max-w-xl mb-10"
            >
              AI voice agents that answer every call, book appointments, and follow up with leads — 24/7. Built for home service businesses.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex flex-wrap items-center gap-4"
            >
              <Button
                size="lg"
                className="bg-[#c47a3a] text-white hover:bg-[#a8632e] shadow-xl shadow-[#c47a3a]/25 text-base px-8 h-13"
                asChild
              >
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/demo")}
                className="border-[#0a1628]/15 text-[#0a1628] hover:bg-[#0a1628]/5 text-base px-8 h-13"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust line */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="mt-12 flex items-center gap-6 text-sm text-[#0a1628]/40"
            >
              {["No contracts", "Setup in 24h", "Cancel anytime"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#c47a3a]" />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Hero visual — Stats cards */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block absolute top-16 right-0 w-[420px]"
          >
            <div className="space-y-4">
              {[
                { icon: PhoneCall, label: "Calls Answered", value: "2,847", sub: "+34% this month", color: "#162d50" },
                { icon: Target, label: "Leads Recovered", value: "412", sub: "From missed calls", color: "#c47a3a" },
                { icon: Calendar, label: "Appointments Booked", value: "189", sub: "This week", color: "#162d50" },
                { icon: TrendingUp, label: "Revenue Impact", value: "$127K", sub: "+89% vs manual", color: "#c47a3a" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
                  className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-[#0a1628]/8 shadow-sm hover:shadow-md hover:border-[#c47a3a]/20 transition-all group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${s.color}10` }}
                  >
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#0a1628]/45 font-medium">{s.label}</p>
                    <p className="text-xl font-bold text-[#0a1628]">{s.value}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#c47a3a] bg-[#c47a3a]/8 px-2.5 py-1 rounded-full">{s.sub}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Logos / Trust ─── */}
      <section className="py-16 border-y border-[#0a1628]/5 bg-[#f8f7f5]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#0a1628]/30 uppercase mb-8">Trusted by 200+ service businesses</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-[#0a1628]/20">
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
            <span className="text-xs font-semibold tracking-[0.2em] text-[#c47a3a] uppercase">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-5 text-[#0a1628]">Three steps to zero missed leads</h2>
            <p className="text-[#0a1628]/50 text-lg max-w-2xl mx-auto">Our AI handles the entire pipeline from first ring to booked appointment.</p>
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
                className="relative p-8 rounded-3xl bg-white border border-[#0a1628]/6 hover:border-[#c47a3a]/25 hover:shadow-lg transition-all group"
              >
                <span className="text-6xl font-bold text-[#0a1628]/[0.03] absolute top-4 right-6 font-mono">{s.step}</span>
                <div className="w-14 h-14 rounded-2xl bg-[#c47a3a]/8 flex items-center justify-center mb-6 group-hover:bg-[#c47a3a]/15 transition-colors">
                  <s.icon className="h-7 w-7 text-[#c47a3a]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#0a1628]">{s.title}</h3>
                <p className="text-[#0a1628]/50 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section id="services" className="py-24 px-6 bg-[#0a1628]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <span className="text-xs font-semibold tracking-[0.2em] text-[#c47a3a] uppercase">Services</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-5 text-white">Everything you need to grow</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">A complete AI automation stack built for service businesses.</p>
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
                className="p-7 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#c47a3a]/30 hover:bg-white/[0.06] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#c47a3a]/10 flex items-center justify-center mb-5 group-hover:bg-[#c47a3a]/20 transition-colors">
                  <s.icon className="h-6 w-6 text-[#c47a3a]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
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
                <p className="text-4xl md:text-5xl font-bold text-[#c47a3a] mb-2">{s.value}</p>
                <p className="text-sm text-[#0a1628]/45 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-6 bg-[#f8f7f5]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <span className="text-xs font-semibold tracking-[0.2em] text-[#c47a3a] uppercase">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 text-[#0a1628]">Trusted by businesses like yours</h2>
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
                className="bg-white rounded-2xl p-8 border border-[#0a1628]/6 shadow-sm"
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#c47a3a] text-[#c47a3a]" />
                  ))}
                </div>
                <p className="text-[#0a1628]/70 leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-[#0a1628]">{t.name}</p>
                  <p className="text-xs text-[#0a1628]/40">{t.role}</p>
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
            <span className="text-xs font-semibold tracking-[0.2em] text-[#c47a3a] uppercase">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-5 text-[#0a1628]">Simple, transparent pricing</h2>
            <p className="text-[#0a1628]/50 text-lg max-w-2xl mx-auto mb-12">No hidden fees. No contracts. Start with a free audit and only pay when you're ready.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$497", period: "/mo", features: ["AI Voice Agent", "Missed Call Text-Back", "Up to 200 calls/mo", "Basic Analytics"], popular: false },
              { name: "Growth", price: "$997", period: "/mo", features: ["Everything in Starter", "Lead Recovery Sequences", "Unlimited calls", "CRM Integration", "Priority Support"], popular: true },
              { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Growth", "Multi-location", "Custom AI Training", "Dedicated Account Mgr", "White-label Options"], popular: false },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative rounded-2xl p-8 border ${
                  p.popular
                    ? "bg-[#0a1628] text-white border-[#c47a3a]/30 shadow-xl shadow-[#0a1628]/20"
                    : "bg-white border-[#0a1628]/8"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wider uppercase bg-[#c47a3a] text-white px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-lg font-bold mb-1 ${p.popular ? "text-white" : "text-[#0a1628]"}`}>{p.name}</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${p.popular ? "text-[#c47a3a]" : "text-[#0a1628]"}`}>{p.price}</span>
                  <span className={`text-sm ${p.popular ? "text-white/50" : "text-[#0a1628]/40"}`}>{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${p.popular ? "text-white/70" : "text-[#0a1628]/55"}`}>
                      <CheckCircle2 className="h-4 w-4 text-[#c47a3a] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    p.popular
                      ? "bg-[#c47a3a] text-white hover:bg-[#a8632e]"
                      : "bg-[#0a1628] text-white hover:bg-[#162d50]"
                  }`}
                  asChild
                >
                  <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                    {p.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6 bg-[#0a1628]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to stop losing leads?
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
              Get a free audit of your missed calls and see exactly how much revenue you're leaving on the table.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#c47a3a] text-white hover:bg-[#a8632e] shadow-xl shadow-[#c47a3a]/30 text-base px-10 h-14"
                asChild
              >
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                  Book Your Free Audit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <p className="text-white/30 text-xs mt-6">No credit card required · Setup in 24 hours · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-16 px-6 bg-[#060e1a] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={voxmationLogo} alt="Voxmation" className="h-8 w-8 rounded-lg" />
                <span className="font-bold text-white">VOX<span className="text-[#c47a3a]">mation</span></span>
              </div>
              <p className="text-white/35 text-sm leading-relaxed">Voice, Automation & Prompts for home service businesses.</p>
            </div>
            {[
              { title: "Product", links: ["AI Voice Agent", "Missed Call Recovery", "Lead Management", "Integrations"] },
              { title: "Company", links: ["About", "Pricing", "Demo", "Blog"] },
              { title: "Support", links: ["Help Center", "Contact Us", "Client Portal", "Status"] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white/60 tracking-wider uppercase mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm text-white/30 hover:text-[#c47a3a] transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">© {new Date().getFullYear()} Voxmation. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {["Privacy Policy", "Terms of Service"].map(l => (
                <a key={l} href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeTest;
