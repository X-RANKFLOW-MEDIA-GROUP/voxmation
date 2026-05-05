import { Phone, Clock, CalendarCheck, UserCheck, Workflow, Lightbulb, MessageSquare, BarChart3, Link2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface UseCase {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  subheadline: string;
  icon: LucideIcon;
  overview: string;
  benefits: Array<{ title: string; description: string }>;
  features: string[];
  scenarios: Array<{ title: string; description: string }>;
  faqs: Array<{ q: string; a: string }>;
  stats: Array<{ label: string; value: string }>;
  cta: string;
}

export const useCasesData: Record<string, UseCase> = {
  "ai-phone-answering": {
    slug: "ai-phone-answering",
    title: "AI Phone Answering | 24/7 Call Handling",
    metaDescription: "AI phone answering service for businesses. Answer every call 24/7, qualify leads, and book appointments automatically. Never miss a call again.",
    h1: "AI Phone Answering That Never Misses a Call",
    subheadline: "Your AI receptionist answers every call 24/7 — qualified leads, professional greetings, and zero missed calls.",
    icon: Phone,
    overview: "Your business takes calls during business hours. But what about nights, weekends, and holidays? With Voxmation's AI phone answering, every call gets answered — professionally, instantly, and with full lead qualification built in. No more voicemail. No more lost leads.",
    benefits: [
      { title: "24/7 Coverage", description: "Your AI never sleeps. Every call is answered within 1 second, anytime, anywhere." },
      { title: "Instant Lead Qualification", description: "AI gathers essential info (name, issue, urgency) and qualifies hot leads vs. tire kickers." },
      { title: "Automatic Booking", description: "Leads are booked into your calendar automatically with confirmations sent instantly." },
      { title: "Zero Lost Revenue", description: "Every missed call is an opportunity. With AI answering, that opportunity becomes a lead." },
    ],
    features: [
      "Multi-language support (English, Spanish, Portuguese)",
      "Custom voice personality training",
      "Advanced call routing and queuing",
      "Real-time transcription and recording",
      "Intelligent escalation to human agents",
      "CRM integration and auto-logging",
      "Missed call SMS follow-up",
      "Call analytics and reporting",
    ],
    scenarios: [
      {
        title: "After-Hours Call Volume",
        description: "A plumber's phone rings at 11 PM. Without AI, voicemail. With Voxmation, your AI answers, confirms emergency availability, and books a next-morning job.",
      },
      {
        title: "Peak Season Surge",
        description: "HVAC company during storm season. Calls are flooding in. Your team is overwhelmed. AI answers every call, qualifies emergencies vs. routine, and routes appropriately.",
      },
      {
        title: "Small Team, Big Ambition",
        description: "Solo consultant juggling calls while trying to do actual work. AI answers calls, collects info, and schedules consultations — zero interruptions.",
      },
    ],
    faqs: [
      {
        q: "Will my customers think they're talking to a robot?",
        a: "Not at all. Our AI voice is natural and conversational. Most callers don't realize they're speaking with AI. The experience feels like talking to a professional receptionist.",
      },
      {
        q: "Can the AI handle complex or technical questions?",
        a: "Yes, up to a point. We train the AI on your common questions, objections, and procedures. When something's beyond scope, it smoothly escalates to your team with full context.",
      },
      {
        q: "What languages does it support?",
        a: "English and Spanish out of the box. Portuguese available upon request. Multilingual support is critical for many service businesses.",
      },
      {
        q: "How do I handle escalations to my team?",
        a: "Smart escalation is built in. Calls can transfer to your team, voicemail, SMS, or email based on your rules. Full context is always passed along.",
      },
    ],
    stats: [
      { label: "Average Setup", value: "7-14 days" },
      { label: "Answer Rate", value: "100%" },
      { label: "Avg Response Time", value: "< 1s" },
    ],
    cta: "Stop losing calls. Start your free 14-day trial today.",
  },
  "missed-call-recovery": {
    slug: "missed-call-recovery",
    title: "Missed Call Recovery | AI SMS & Callback",
    metaDescription: "Missed call recovery system using AI. Instant SMS follow-up, automatic callback attempts, and lead tracking. Convert missed calls into booked appointments.",
    h1: "Recover Every Missed Call with Instant AI Follow-Up",
    subheadline: "Every missed call triggers an instant SMS and callback attempt within seconds. Revenue recovery at scale.",
    icon: Clock,
    overview: "Missed calls are lost revenue. But you don't have to lose them. Voxmation's missed call recovery system instantly follows up with AI-powered texts and callbacks — turning missed calls into booked appointments and qualified leads.",
    benefits: [
      { title: "Instant SMS Follow-Up", description: "Missed calls trigger an instant text within 2-5 seconds. Keep the lead warm." },
      { title: "Automatic Callback Queue", description: "AI attempts callback automatically. If customer answers, booking/qualification happens instantly." },
      { title: "Conversion Tracking", description: "See exactly which missed calls became bookings. Measure ROI precisely." },
      { title: "Zero Manual Work", description: "Completely automated. Fire and forget. Your team focuses on booked jobs." },
    ],
    features: [
      "Instant SMS detection and triggering",
      "Customizable SMS messaging templates",
      "Automatic callback attempts (configurable intervals)",
      "Lead scoring and prioritization",
      "CRM sync and logging",
      "Conversion tracking and attribution",
      "Time-zone intelligent scheduling",
      "Do-not-call compliance",
    ],
    scenarios: [
      {
        title: "Plumber on a Job",
        description: "Mid-job, your phone rings. You're elbow-deep and can't answer. Missed call. But 3 seconds later, your AI texts the customer with your callback number and availability. Customer books online. Problem solved.",
      },
      {
        title: "Salon During Peak Hours",
        description: "Saturday afternoon. Phone rings during a busy appointment. It goes unanswered. AI sends instant SMS offering online booking. Customer books. No lost revenue.",
      },
    ],
    faqs: [
      {
        q: "How fast does the SMS go out?",
        a: "Within 2-5 seconds of the missed call. The faster the follow-up, the higher the conversion. We're built for speed.",
      },
      {
        q: "What if the customer doesn't want to be contacted?",
        a: "We include opt-out language in every SMS. Full compliance with TCPA and other regulations. You're covered.",
      },
      {
        q: "Can I customize the SMS message?",
        a: "Yes. You control the message, the callback window, and the booking link. Fully customizable.",
      },
    ],
    stats: [
      { label: "Avg SMS Response", value: "35%" },
      { label: "Avg Conversion Rate", value: "15-20%" },
      { label: "Setup Time", value: "< 1 hour" },
    ],
    cta: "Recover lost revenue. Start your free trial now.",
  },
  "appointment-scheduling": {
    slug: "appointment-scheduling",
    title: "AI Appointment Scheduling | 89% Fewer No-Shows",
    metaDescription: "AI appointment scheduling and booking system. 89% fewer no-shows with automated reminders. Integrates with your calendar and CRM.",
    h1: "Book More Appointments — and Actually Have Clients Show Up",
    subheadline: "AI-powered booking that works with your calendar, reduces no-shows by 89%, and sends automated reminders.",
    icon: CalendarCheck,
    overview: "Booking appointments is one thing. Having clients actually show up is another. Voxmation's AI scheduling system books appointments, sends confirmations, triggers reminders, and reduces no-shows dramatically.",
    benefits: [
      { title: "89% Fewer No-Shows", description: "Automated SMS confirmations and reminders eliminate forgotten appointments." },
      { title: "24/7 Booking", description: "Clients book anytime — evenings, weekends, holidays. Your office is never closed." },
      { title: "Smart Availability", description: "AI only books available slots. No double-bookings. No scheduling errors." },
      { title: "Instant Confirmation", description: "Clients receive confirmation immediately. Peace of mind for them, revenue certainty for you." },
    ],
    features: [
      "Calendar integration (Google, Outlook, Calendly)",
      "Multi-provider scheduling",
      "Service duration configuration",
      "Buffer time management",
      "Automated SMS confirmations (24h before)",
      "Day-of reminder texts",
      "Rescheduling and cancellation handling",
      "Waitlist management",
    ],
    scenarios: [
      {
        title: "Spa Booking After Hours",
        description: "Client wants a facial at 10 PM. Your office is closed. With AI, they book instantly online. Confirmation sent. Reminder sent 24h before. Client shows up.",
      },
    ],
    faqs: [
      {
        q: "How much does no-show reduction save?",
        a: "For a typical salon, 89% reduction in no-shows means 15-20 more clients per week showing up. That's real money.",
      },
    ],
    stats: [
      { label: "No-Show Reduction", value: "89%" },
      { label: "Avg Booking Accuracy", value: "99.2%" },
      { label: "Customer Satisfaction", value: "4.8★" },
    ],
    cta: "Reduce no-shows. Increase revenue. Start free.",
  },
  "lead-qualification": {
    slug: "lead-qualification",
    title: "AI Lead Qualification | Auto-Score & Route Leads",
    metaDescription: "AI lead qualification system. Automatically score leads, route to best rep, sync to CRM. 95%+ accuracy qualification.",
    h1: "Qualify Leads Faster Than Your Sales Team",
    subheadline: "AI analyzes every call to qualify leads, score them, and route to the best sales rep instantly.",
    icon: UserCheck,
    overview: "Not all leads are created equal. Some are hot, ready to buy. Others are tire kickers wasting time. Voxmation's AI qualification instantly scores leads, identifies high-value opportunities, and routes them to your best closer.",
    benefits: [
      { title: "95%+ Accuracy", description: "AI learns your ideal customer profile. Qualification accuracy rivals your experienced reps." },
      { title: "Real-Time Scoring", description: "Leads scored instantly. Hot leads get premium attention. Time wasters don't." },
      { title: "Intelligent Routing", description: "Route leads to the rep most likely to close them. Maximize conversion rates." },
      { title: "Zero Queue Time", description: "No waiting for qualification. Every minute counts. AI qualifies in parallel with answering." },
    ],
    features: [
      "Custom lead scoring algorithms",
      "Qualification scripts and workflows",
      "Dynamic routing rules",
      "Rep load balancing",
      "Real-time qualification analytics",
      "CRM auto-sync with scoring",
      "Lead history tracking",
      "A/B testing of qualification questions",
    ],
    scenarios: [
      {
        title: "Law Firm Case Qualification",
        description: "Personal injury hotline. 100 calls/day. 80% are low-value. AI asks 3 questions, scores urgency/value, and routes only hot cases to attorneys. Saves 12+ hours/week of attorney time.",
      },
    ],
    faqs: [
      {
        q: "Can you train the AI on my specific criteria?",
        a: "Absolutely. We work with your sales team to define what makes a qualified lead. AI learns your playbook.",
      },
    ],
    stats: [
      { label: "Qualification Accuracy", value: "95%+" },
      { label: "Time to Score", value: "< 5s" },
      { label: "Rep Time Saved", value: "12+ hrs/week" },
    ],
    cta: "Stop wasting time on unqualified leads.",
  },
};
