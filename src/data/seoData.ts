// Vertical industries data for SEO
import type { ComponentType } from "react";

export interface Vertical {
  slug: string;
  name: string;
  title: string;
  h1: string;
  metaDescription: string;
  subheadline: string;
  problemTitle: string;
  problemDescription: string;
  useCases: string[];
  benefits: { title: string; description: string }[];
  complianceNote: string;
  faqItems: { q: string; a: string }[];
  icon?: ComponentType<{ className?: string }>;
}

export interface StateData {
  slug: string;
  name: string;
  code: string;
}

export interface ComparisonData {
  slug: string;
  competitor: string;
  title: string;
  h1: string;
  metaDescription: string;
  about: string;
  bestFor: string;
  whyVoxmation: string[];
}

// Vertical pillar data
export const verticalsData: Record<string, Vertical> = {
  hvac: {
    slug: "hvac-ai-voice-agents",
    name: "HVAC",
    title: "AI Voice Agents for HVAC Contractors | Voxmation",
    h1: "AI Voice Agents for HVAC Contractors. Answer Every Call. 24/7.",
    metaDescription: "AI voice agents for HVAC businesses. Answer every call, qualify leads, schedule appointments 24/7. Stop losing HVAC jobs to missed calls.",
    subheadline: "HVAC contractors lose $10K+ per missed call. Voxmation's AI receptionist answers every call, qualifies leads, and books jobs—even while your team is on the road.",
    problemTitle: "The HVAC Call Problem",
    problemDescription: "HVAC emergency calls don't wait for business hours. When your team is busy or after-hours, missed calls mean lost jobs and lost revenue. A missed emergency call isn't just a lost customer—it's a lost $3K-$8K job.",
    useCases: ["Emergency call coverage", "After-hours booking", "Lead qualification", "Appointment confirmation", "Service reminders"],
    benefits: [
      { title: "Never Miss an Emergency Call", description: "Your AI answers every HVAC emergency 24/7—even at 2am on a Sunday." },
      { title: "Instant Lead Qualification", description: "AI qualifies by urgency (emergency vs. maintenance) and prioritizes hot leads." },
      { title: "Direct Booking Integration", description: "Leads booked into your system automatically with customer confirmations sent instantly." },
      { title: "Seasonal Scale", description: "Handle 10x call volume during summer/winter peaks without hiring staff." },
    ],
    complianceNote: "All HVAC contractors in the US can use Voxmation. No licensing restrictions on AI call handling for HVAC services.",
    faqItems: [
      { q: "Can the AI handle HVAC-specific questions?", a: "Yes. It can discuss common HVAC issues, emergency signs, pricing ranges, and schedule appointments based on your business rules." },
      { q: "What if a customer has a technical HVAC question?", a: "The AI escalates complex questions to your team via SMS or transfers the call to a team member." },
      { q: "Does it work with my scheduling software?", a: "Yes. Voxmation integrates with 50+ scheduling platforms including ServiceTitan, Jobber, HouseCall Pro, and Housecall." },
    ],
  },
  plumbing: {
    slug: "plumbing-phone-automation",
    name: "Plumbing",
    title: "Phone Automation for Plumbers | Voxmation",
    h1: "Phone Automation for Plumbers. Answer. Qualify. Book. 24/7.",
    metaDescription: "AI phone automation for plumbers. Answer every call 24/7, qualify emergencies, book appointments instantly. Recover lost plumbing jobs.",
    subheadline: "A burst pipe at midnight doesn't care if your office is closed. Voxmation's AI answers your plumbing emergency calls, qualifies by urgency, and books jobs instantly.",
    problemTitle: "The Plumber's Call Problem",
    problemDescription: "Plumbing emergencies happen when you're not in the office. Missed emergency calls cost plumbers $2K-$5K per call. Without after-hours coverage, you're leaving money on the table.",
    useCases: ["Burst pipe emergencies", "After-hours lead capture", "Service appointment booking", "Drain cleaning scheduling", "Routine maintenance calls"],
    benefits: [
      { title: "24/7 Emergency Coverage", description: "No more missed midnight burst-pipe calls. Your AI handles every plumbing emergency." },
      { title: "Smart Lead Qualification", description: "AI identifies emergency plumbing calls vs. routine maintenance and prioritizes urgently." },
      { title: "Instant Appointment Booking", description: "Customers book directly into your calendar with SMS confirmations sent automatically." },
      { title: "Multi-Service Routing", description: "Different AI responses for drain cleaning, water heater, emergency, and maintenance calls." },
    ],
    complianceNote: "All US plumbers can use Voxmation. No licensing needed for AI phone handling.",
    faqItems: [
      { q: "Can the AI describe symptoms and diagnose plumbing issues?", a: "Yes. It can ask about water color, smell, location, and urgency to pre-qualify calls before routing to your team." },
      { q: "How does it handle after-hours emergency bookings?", a: "Customers confirm an emergency booking time. Your team reviews and confirms or adjusts within 1 hour." },
      { q: "Does it integrate with my plumbing software?", a: "Yes. Voxmation works with ServiceTitan, Jobber, Housecall Pro, and 50+ other platforms." },
    ],
  },
  electrical: {
    slug: "electrical-call-booking",
    name: "Electrical",
    title: "Call Booking System for Electricians | Voxmation",
    h1: "AI Call Booking for Electricians. Every Call. Every Time.",
    metaDescription: "AI call booking system for electrical contractors. Answer every call, qualify electrical jobs, book appointments 24/7. No missed calls.",
    subheadline: "Electrical contractors often work on-site, far from the office. Voxmation's AI answers your calls, qualifies electrical jobs, and books appointments in real-time.",
    problemTitle: "The Electrician's Booking Problem",
    problemDescription: "Your electricians are on-site. Calls go to voicemail. Callers choose a competitor who answers. That lost call is a $500-$3K lost job.",
    useCases: ["Residential electrical calls", "Commercial electrical bookings", "Emergency electrical service", "Maintenance call scheduling", "Follow-up calls"],
    benefits: [
      { title: "Always Available", description: "Whether your team is on a job or after-hours, every electrical call is answered professionally." },
      { title: "Service-Specific Routing", description: "AI qualifies residential vs. commercial, emergency vs. maintenance, and routes accordingly." },
      { title: "Instant Calendar Integration", description: "Appointments go straight into your system. No double-booking. No manual data entry." },
      { title: "Reduce Response Time", description: "Prospects get instant booking confirmation instead of waiting for a callback." },
    ],
    complianceNote: "All US electricians can use Voxmation. No licensing restrictions apply.",
    faqItems: [
      { q: "Can the AI qualify electrical jobs by complexity?", a: "Yes. It asks about the scope (outlet replacement, panel upgrade, troubleshooting) to pre-qualify before your team calls back." },
      { q: "Does it handle license plate or electrical code questions?", a: "It can provide general info, but complex technical questions are escalated to your team via a callback." },
      { q: "Will it integrate with my electrical scheduling system?", a: "Yes. Voxmation integrates with ServiceTitan, Jobber, and 50+ electrical industry platforms." },
    ],
  },
  roofing: {
    slug: "roofing-lead-follow-up",
    name: "Roofing",
    title: "Lead Follow-Up for Roofers | Voxmation",
    h1: "AI Lead Follow-Up for Roofers. Convert More Roof Leads.",
    metaDescription: "AI lead follow-up system for roofing contractors. Automated appointment reminders, follow-up calls, and instant booking. Convert more roof jobs.",
    subheadline: "Roofing leads are hot for 48 hours. After that, they shop competitors. Voxmation's AI follows up instantly, books appointments, and converts more roofing jobs.",
    problemTitle: "The Roofing Follow-Up Problem",
    problemDescription: "Roofing leads don't wait. They call 3-5 contractors. The fastest response wins the job. Your team's delays mean lost estimates and lost revenue.",
    useCases: ["Same-day appointment booking", "Multi-contractor lead follow-up", "Hail damage follow-up calls", "Insurance claim assistance", "Estimate scheduling"],
    benefits: [
      { title: "Instant Response", description: "AI responds to roof inquiries within seconds—before competitors even wake up." },
      { title: "Hail Event Automation", description: "AI auto-follows up on nearby hail events and books emergency roof inspections." },
      { title: "Insurance Claim Assistance", description: "AI can gather insurance details and help document damage for faster claim processing." },
      { title: "Same-Day Booking", description: "Roof estimates are booked the same day, increasing conversion and reducing lead decay." },
    ],
    complianceNote: "All US roofers can use Voxmation. Be aware: Some states have weather-related lead restrictions post-disaster—consult local regulations.",
    faqItems: [
      { q: "Can the AI gather insurance information for roof claims?", a: "Yes. It collects policy info, damage photos locations, and deductibles to prepare your team." },
      { q: "How does hail event automation work?", a: "Voxmation monitors local weather. After hail events, it auto-calls nearby customers to offer inspections." },
      { q: "Does it handle multi-quote comparisons?", a: "No. The AI focuses on booking inspections and estimates. Your team handles quote comparisons and sales." },
    ],
  },
};

// Vertical pillar pages are keyed by short name above, but their public URL is
// the `.slug` field (e.g. "hvac-ai-voice-agents"). Look up by URL slug.
export const verticalBySlug: Record<string, Vertical> = Object.fromEntries(
  Object.values(verticalsData).map((v) => [v.slug, v])
);

// State data
export const statesData: StateData[] = [
  { slug: "texas", name: "Texas", code: "TX" },
  { slug: "california", name: "California", code: "CA" },
  { slug: "florida", name: "Florida", code: "FL" },
  { slug: "new-york", name: "New York", code: "NY" },
  { slug: "pennsylvania", name: "Pennsylvania", code: "PA" },
  { slug: "illinois", name: "Illinois", code: "IL" },
  { slug: "ohio", name: "Ohio", code: "OH" },
  { slug: "michigan", name: "Michigan", code: "MI" },
  { slug: "north-carolina", name: "North Carolina", code: "NC" },
  { slug: "georgia", name: "Georgia", code: "GA" },
];

// Comparison data
// Note: the Smith.ai comparison lives at /compare/voxmation-vs-smith-ai
// (ComparePage) to avoid two competing pages for the same query.
export const comparisonsData: Record<string, ComparisonData> = {
  "synthflow": {
    slug: "vs-synthflow",
    competitor: "SynthFlow",
    title: "Voxmation vs SynthFlow | AI Voice Agents",
    h1: "Voxmation vs SynthFlow: Better AI for Contractors?",
    metaDescription: "Compare Voxmation and SynthFlow for home service businesses. Pricing, features, and which platform works best for HVAC, plumbing, electrical contractors.",
    about: "SynthFlow is a conversational AI platform that lets businesses build custom AI agents for various use cases.",
    bestFor: "SynthFlow is better for enterprises building custom AI workflows. It requires significant setup and technical expertise.",
    whyVoxmation: [
      "Pre-built for home service contractors—no configuration required",
      "Turns on in 24 hours, not 30 days",
      "Industry-specific knowledge built-in (HVAC parts, plumbing codes, electrical standards)",
      "Dedicated support from contractors who understand your business",
      "Fixed pricing—no hidden setup or customization costs",
    ],
  },
  "dialora": {
    slug: "vs-dialora",
    competitor: "Dialora",
    title: "Voxmation vs Dialora | Home Service AI Comparison",
    h1: "Voxmation vs Dialora: AI Voice Agents Compared",
    metaDescription: "Voxmation vs Dialora for HVAC, plumbing, electrical contractors. Compare features, pricing, and support for AI call handling and booking.",
    about: "Dialora is an AI voice agent platform offering call answering and lead qualification for service businesses.",
    bestFor: "Dialora focuses on basic call answering with limited industry specialization.",
    whyVoxmation: [
      "Industry-specific AI training for HVAC, plumbing, electrical, roofing, and more",
      "Smarter lead qualification—understands emergency vs. routine calls",
      "Better integration with contractor tools (ServiceTitan, Jobber, HouseCall Pro)",
      "More transparent pricing with no surprise fees",
      "Faster deployment—24 hour setup vs. weeks of configuration",
    ],
  },
  "aloware": {
    slug: "vs-aloware",
    competitor: "Aloware",
    title: "Voxmation vs Aloware | Voice Agents for Contractors",
    h1: "Voxmation vs Aloware: Which AI Wins for Home Services?",
    metaDescription: "Compare Voxmation and Aloware for home service contractors. Features, pricing, and best for HVAC, plumbing, electrical businesses.",
    about: "Aloware offers AI calling and SMS automation for sales teams and service businesses.",
    bestFor: "Aloware is better for outbound calling and sales automation. Less focused on 24/7 inbound call handling.",
    whyVoxmation: [
      "Purpose-built for 24/7 inbound call answering—not outbound sales",
      "Contractor-first design with HVAC, plumbing, electrical workflows built-in",
      "Better emergency call handling and escalation",
      "Simpler pricing model—no complex per-minute billing",
      "Direct integration with scheduling software contractors already use",
    ],
  },
  "retell-ai": {
    slug: "vs-retell-ai",
    competitor: "Retell AI",
    title: "Voxmation vs Retell AI | Voice Agent Comparison",
    h1: "Voxmation vs Retell AI: Who Wins for Contractors?",
    metaDescription: "Voxmation vs Retell AI for HVAC, plumbing, electrical contractors. Compare pricing, features, and which platform is right for your business.",
    about: "Retell AI is a flexible voice AI platform that lets businesses build custom voice agents for various applications.",
    bestFor: "Retell AI works for technical teams building custom voice solutions. Requires developer expertise.",
    whyVoxmation: [
      "No developer needed—set up in 24 hours without coding",
      "Pre-built for contractor use cases (HVAC, plumbing, electrical, roofing)",
      "Better at understanding contractor-specific terminology and processes",
      "Includes industry-standard integrations out-of-the-box",
      "Dedicated contractor support—not generic technical support",
    ],
  },
};

// Resource pages
export const resourcesData = {
  "hvac-roi-calculator": {
    slug: "hvac-roi-calculator",
    title: "HVAC ROI Calculator | Voxmation",
    h1: "Calculate Your HVAC AI ROI in 30 Seconds",
    metaDescription: "Estimate how much money Voxmation's AI can help your HVAC business recover by answering missed calls, reducing no-shows, and improving lead follow-up.",
    description: "See how much revenue your HVAC business could recover by implementing AI call handling and automated follow-up.",
  },
  "ai-voice-agent-compliance-home-service": {
    slug: "ai-voice-agent-compliance-home-service",
    title: "AI Voice Agent Compliance for Home Service Contractors",
    h1: "AI Voice Agent Compliance: What Contractors Need to Know",
    metaDescription: "Understand TCPA, state licensing, and compliance requirements for AI voice agents in HVAC, plumbing, electrical, and roofing businesses.",
    description: "A comprehensive guide to compliance requirements, TCPA regulations, and legal considerations for using AI voice agents in home service businesses.",
  },
  "missed-call-recovery-strategy": {
    slug: "missed-call-recovery-strategy",
    title: "Missed Call Recovery Strategy for Home Service Businesses",
    h1: "Missed Call Recovery: Stop Losing Revenue to Voicemail",
    metaDescription: "Learn how to recover revenue lost to missed calls. Strategy guide for home service contractors using AI and automation.",
    description: "A proven framework for capturing missed call leads, prioritizing them by urgency, and converting them into booked jobs.",
  },
};

// State-specific copy blocks
export const stateIntros: Record<string, string> = {
  texas: "Texas contractors know the challenge: in the summer heat, emergency HVAC calls come in constantly. Missing even one call during peak season can cost thousands. Voxmation ensures no HVAC call goes unanswered, whether your team is on a job or after-hours.",
  california: "California's competitive contractor market means fast response wins. Whether it's a burst pipe in San Francisco or an electrical issue in San Diego, Voxmation answers instantly and books jobs in real-time.",
  florida: "Florida's humid climate means constant air conditioning emergencies. When a customer's AC fails in 95-degree heat, waiting for a callback isn't an option. Voxmation answers instantly.",
  "new-york": "New York contractors work in a fast-paced market where response time matters. Voxmation ensures every call is answered professionally—in the middle of Manhattan or upstate.",
  pennsylvania: "Pennsylvania winters mean urgent heating emergencies. Cold calls at 3am don't wait for business hours. Voxmation's AI answers every emergency call instantly.",
  illinois: "Chicago and Illinois contractors deal with seasonal peaks in both heating and cooling. Voxmation scales your call capacity during peak season without hiring temporary staff.",
  ohio: "Ohio contractors face intense competition and seasonal demand spikes. Voxmation ensures you capture every lead and respond faster than competitors.",
  michigan: "Michigan winters are harsh. Heating emergencies don't wait. Voxmation answers every emergency call 24/7, even during the harshest weather.",
  "north-carolina": "North Carolina's growing contractor market is competitive. Voxmation helps you respond faster, book more appointments, and outcompete local rivals.",
  georgia: "Atlanta and Georgia contractors operate in a high-growth market with rising competition. Voxmation ensures you never lose a lead to slow response times.",
};

export const complianceNotes: Record<string, string> = {
  california: "California contractors: TCPA compliance is strict here. Voxmation is fully TCPA compliant. Always get written customer consent before follow-up calls.",
  texas: "Texas contractors: No state-specific licensing required for AI call handling. TCPA rules apply nationally.",
  florida: "Florida contractors: No special state regulations for AI call handling. Standard TCPA compliance applies.",
  "new-york": "New York contractors: NYC has consumer protection laws. Voxmation complies with all NY consumer protection regulations.",
  pennsylvania: "Pennsylvania contractors: No special AI licensing requirements. TCPA federal rules apply.",
};
