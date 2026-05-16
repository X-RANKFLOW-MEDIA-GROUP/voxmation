import { supabase } from "@/integrations/supabase/client";

export type TrialPayload = {
  email: string;
  businessName: string;
  clientName: string;
  serviceArea: string;
  industry: string;
  phone?: string;
  voiceName?: string;
};

export const TRIAL_PAYLOAD_STORAGE_KEY = "voxmation_trial_payload";

export const industryServices: Record<string, string[]> = {
  hvac: ["Emergency AC repair", "Seasonal tune-up", "Indoor air quality estimate"],
  plumbing: ["Leak repair", "Water heater install", "Drain cleaning"],
  electrical: ["Panel upgrade", "Outlet repair", "EV charger estimate"],
  roofing: ["Storm damage inspection", "Roof repair", "Insurance documentation"],
  landscaping: ["Weekly maintenance", "Irrigation repair", "Landscape redesign"],
  cleaning: ["Deep cleaning", "Move-out cleaning", "Recurring service quote"],
  default: ["Service estimate", "Emergency appointment", "Maintenance plan"],
};

export const industryLabels: Record<string, string> = {
  hvac: "HVAC",
  plumbing: "Plumbing",
  electrical: "Electrical",
  roofing: "Roofing",
  landscaping: "Landscaping",
  cleaning: "Cleaning",
};

export type TrialScenario = {
  title: string;
  caller: string;
  need: string;
  aiAction: string;
  value: string;
};

export type IndustryDemoContent = {
  label: string;
  headline: string;
  primaryOutcome: string;
  metrics: { label: string; value: string }[];
  scenarios: TrialScenario[];
  openingLine: string;
};

export const industryDemoContent: Record<string, IndustryDemoContent> = {
  hvac: {
    label: "HVAC",
    headline: "Emergency AC calls, tune-ups, and estimates handled 24/7",
    primaryOutcome: "Book urgent repair jobs before competitors answer the phone.",
    metrics: [
      { label: "Avg. saved call", value: "$425" },
      { label: "Booking intent", value: "High" },
      { label: "Follow-up", value: "30 sec" },
    ],
    scenarios: [
      { title: "No-cool emergency", caller: "Homeowner", need: "AC stopped cooling today", aiAction: "Qualifies urgency and books same-day slot", value: "High-ticket repair captured" },
      { title: "Maintenance plan", caller: "Returning customer", need: "Seasonal tune-up", aiAction: "Offers plan details and schedules service", value: "Recurring revenue" },
      { title: "After-hours lead", caller: "New lead", need: "Quote for new system", aiAction: "Collects details and sends SMS confirmation", value: "Lead recovered overnight" },
    ],
    openingLine: "Thanks for calling {business}. This is Vox, your AI receptionist. Are you calling about an urgent heating or cooling issue today?",
  },
  plumbing: {
    label: "Plumbing",
    headline: "Leaks, water heaters, drain calls, and emergency dispatch",
    primaryOutcome: "Turn urgent plumbing calls into booked jobs with instant SMS confirmation.",
    metrics: [
      { label: "Emergency speed", value: "Instant" },
      { label: "Lead score", value: "92/100" },
      { label: "Text-back", value: "On" },
    ],
    scenarios: [
      { title: "Burst pipe", caller: "Homeowner", need: "Water leak emergency", aiAction: "Captures address and dispatches emergency slot", value: "Critical job booked" },
      { title: "Water heater", caller: "Property owner", need: "No hot water", aiAction: "Qualifies unit type and schedules estimate", value: "Replacement opportunity" },
      { title: "Drain cleaning", caller: "Tenant", need: "Slow drain", aiAction: "Books next available appointment", value: "Fast conversion" },
    ],
    openingLine: "Thanks for calling {business}. This is Vox. If this is an active leak, I can help prioritize an emergency plumber right now.",
  },
  electrical: {
    label: "Electrical",
    headline: "Panel upgrades, inspections, EV chargers, and safety calls",
    primaryOutcome: "Qualify electrical jobs safely and route urgent issues immediately.",
    metrics: [
      { label: "Safety routing", value: "Active" },
      { label: "Quote capture", value: "+38%" },
      { label: "Calendar", value: "Synced" },
    ],
    scenarios: [
      { title: "Panel upgrade", caller: "Homeowner", need: "100 amp panel upgrade", aiAction: "Collects property details and schedules estimate", value: "Qualified estimate" },
      { title: "Outlet issue", caller: "New customer", need: "Sparking outlet", aiAction: "Escalates safety instructions and urgent booking", value: "Risk handled" },
      { title: "EV charger", caller: "Tesla owner", need: "Garage charger install", aiAction: "Captures panel/location details", value: "Premium install lead" },
    ],
    openingLine: "Thanks for calling {business}. This is Vox. Tell me what electrical issue you are having, and I can help schedule the right technician.",
  },
  roofing: {
    label: "Roofing",
    headline: "Storm damage, inspections, insurance-ready documentation",
    primaryOutcome: "Capture storm leads while urgency is highest and book inspections fast.",
    metrics: [
      { label: "Inspection slots", value: "Ready" },
      { label: "Storm leads", value: "Prioritized" },
      { label: "SMS proof", value: "Sent" },
    ],
    scenarios: [
      { title: "Storm damage", caller: "Homeowner", need: "Possible hail damage", aiAction: "Books inspection and notes insurance context", value: "Inspection booked" },
      { title: "Leak report", caller: "Returning customer", need: "Ceiling stain after rain", aiAction: "Captures photos request and urgent visit", value: "Repair lead saved" },
      { title: "Replacement quote", caller: "Buyer", need: "New roof estimate", aiAction: "Qualifies timeline and roof type", value: "Sales opportunity" },
    ],
    openingLine: "Thanks for calling {business}. This is Vox. Are you calling about storm damage, a leak, or a roof estimate today?",
  },
  landscaping: {
    label: "Landscaping",
    headline: "Recurring maintenance, estimates, irrigation, and seasonal jobs",
    primaryOutcome: "Turn quote requests into site visits and recurring maintenance customers.",
    metrics: [
      { label: "Quote capture", value: "+44%" },
      { label: "Recurring fit", value: "Detected" },
      { label: "Site visit", value: "Booked" },
    ],
    scenarios: [
      { title: "Weekly lawn care", caller: "Homeowner", need: "Recurring maintenance", aiAction: "Qualifies lot size and books site visit", value: "Recurring client" },
      { title: "Irrigation repair", caller: "Property manager", need: "Broken sprinkler zone", aiAction: "Captures system details and urgency", value: "Service job booked" },
      { title: "Design project", caller: "New lead", need: "Backyard redesign", aiAction: "Collects budget/timeline", value: "High-value estimate" },
    ],
    openingLine: "Thanks for calling {business}. This is Vox. Are you looking for recurring maintenance, irrigation help, or a landscape estimate?",
  },
  cleaning: {
    label: "Cleaning",
    headline: "Deep cleans, move-out jobs, recurring service, and instant quotes",
    primaryOutcome: "Book high-intent cleaning jobs without waiting for office hours.",
    metrics: [
      { label: "Quote speed", value: "Instant" },
      { label: "No-shows", value: "Reduced" },
      { label: "Recurring", value: "Upsell" },
    ],
    scenarios: [
      { title: "Move-out clean", caller: "Renter", need: "Apartment cleaning next week", aiAction: "Qualifies bedrooms/baths and books slot", value: "Job confirmed" },
      { title: "Recurring home", caller: "Busy family", need: "Biweekly cleaning", aiAction: "Captures home size and preferred day", value: "Recurring revenue" },
      { title: "Office cleaning", caller: "Business owner", need: "After-hours office clean", aiAction: "Collects square footage and frequency", value: "Commercial lead" },
    ],
    openingLine: "Thanks for calling {business}. This is Vox. Are you looking for a one-time deep clean or recurring cleaning service?",
  },
};

export const getIndustryDemoContent = (industry: string): IndustryDemoContent =>
  industryDemoContent[industry] || {
    label: industryLabels[industry] || "Home Service",
    headline: "Calls, leads, bookings, and follow-ups built for your business",
    primaryOutcome: "Capture more qualified leads from every inbound call.",
    metrics: [
      { label: "Lead capture", value: "24/7" },
      { label: "SMS", value: "Ready" },
      { label: "Voice", value: "AI" },
    ],
    scenarios: [
      { title: "New service request", caller: "New lead", need: "Needs an estimate", aiAction: "Qualifies details and books appointment", value: "Lead captured" },
      { title: "Missed call", caller: "After-hours caller", need: "Could not reach office", aiAction: "Sends instant Twilio SMS", value: "Lead recovered" },
      { title: "Follow-up", caller: "Warm prospect", need: "Pricing question", aiAction: "Answers and schedules next step", value: "Pipeline moved" },
    ],
    openingLine: "Thanks for calling {business}. This is Vox, your AI receptionist. How can I help today?",
  };

export const normalizeTrialPayload = (payload: TrialPayload): TrialPayload => ({
  ...payload,
  email: payload.email.trim().toLowerCase(),
  businessName: payload.businessName.trim(),
  clientName: payload.clientName.trim(),
  serviceArea: payload.serviceArea.trim(),
  industry: payload.industry || "default",
  phone: payload.phone?.trim(),
  voiceName: payload.voiceName || "Rachel",
});

export const encodeTrialPayload = (payload: TrialPayload) => {
  const normalized = normalizeTrialPayload(payload);
  return new URLSearchParams({
    email: normalized.email,
    business: normalized.businessName,
    client: normalized.clientName,
    area: normalized.serviceArea,
    industry: normalized.industry,
    phone: normalized.phone || "",
    voice: normalized.voiceName || "Rachel",
  }).toString();
};

export const parseTrialPayload = (search: string): TrialPayload | null => {
  const params = new URLSearchParams(search);
  const email = params.get("email") || "";
  const businessName = params.get("business") || "";
  const clientName = params.get("client") || "";
  const serviceArea = params.get("area") || "";
  const industry = params.get("industry") || "default";

  if (!email || !businessName || !clientName || !serviceArea) {
    return null;
  }

  return normalizeTrialPayload({
    email,
    businessName,
    clientName,
    serviceArea,
    industry,
    phone: params.get("phone") || undefined,
    voiceName: params.get("voice") || "Rachel",
  });
};

export const buildTrialPrompt = (payload: TrialPayload) => {
  const services = industryServices[payload.industry] || industryServices.default;
  const content = getIndustryDemoContent(payload.industry);

  return `You are Vox, the AI receptionist for ${payload.businessName}, a ${content.label.toLowerCase()} company serving ${payload.serviceArea}. ${content.primaryOutcome} Greet callers warmly, qualify the job, capture name/phone/address, offer the next appointment, and send a Twilio SMS confirmation. Use the ${payload.voiceName || "Rachel"} ElevenLabs voice profile. Priority services: ${services.join(", ")}. Opening line: "${content.openingLine.replace("{business}", payload.businessName)}"`;
};

export const provisionTrialAccount = async (userId: string, payload: TrialPayload) => {
  const normalized = normalizeTrialPayload(payload);
  const services = industryServices[normalized.industry] || industryServices.default;
  const now = Date.now();
  const primaryLead = `${normalized.clientName.split(" ")[0] || "New"} Trial Caller`;

  await supabase.from("profiles").upsert({
    id: userId,
    email: normalized.email,
    full_name: normalized.clientName,
    company_name: normalized.businessName,
    phone: normalized.phone || null,
    plan: "trial",
    updated_at: new Date().toISOString(),
  });

  const { data: leadRows, error: leadError } = await supabase
    .from("leads")
    .insert([
      {
        user_id: userId,
        name: primaryLead,
        phone: normalized.phone || "+1 (555) 240-0198",
        email: normalized.email,
        city: normalized.serviceArea,
        service_requested: services[0],
        status: "qualified",
        source: "trial_ai_voice",
        lead_score: 94,
        notes: `AI-generated trial lead for ${normalized.businessName}. Ready for Twilio SMS follow-up.`,
        created_at: new Date(now - 1000 * 60 * 18).toISOString(),
      },
      {
        user_id: userId,
        name: "Jordan Lee",
        phone: "+1 (555) 348-8842",
        email: "jordan@example.com",
        city: normalized.serviceArea,
        service_requested: services[1],
        status: "contacted",
        source: "missed_call_textback",
        lead_score: 78,
        notes: "Missed call recovered by AI text-back automation.",
        created_at: new Date(now - 1000 * 60 * 74).toISOString(),
      },
    ])
    .select("id");

  if (leadError) throw leadError;

  const firstLeadId = leadRows?.[0]?.id ?? null;

  const { error: callsError } = await supabase.from("calls").insert([
    {
      user_id: userId,
      caller_name: primaryLead,
      caller_phone: normalized.phone || "+1 (555) 240-0198",
      call_type: "inbound",
      status: "completed",
      duration_seconds: 214,
      transcript: `AI: Thanks for calling ${normalized.businessName}, this is Vox. How can I help today?\nCaller: I need help with ${services[0].toLowerCase()} in ${normalized.serviceArea}.\nAI: I can help with that. I have your details and can book the next available appointment. You will receive a Twilio confirmation text shortly.`,
      summary: `${services[0]} request in ${normalized.serviceArea}. AI qualified the lead, captured contact details, and prepared SMS confirmation.`,
      outcome: "booked",
      sentiment: "positive",
      created_at: new Date(now - 1000 * 60 * 15).toISOString(),
    },
    {
      user_id: userId,
      caller_name: "Jordan Lee",
      caller_phone: "+1 (555) 348-8842",
      call_type: "missed_call",
      status: "completed",
      duration_seconds: 0,
      transcript: `Missed inbound call. Voxmation triggered Twilio SMS: Hi, this is ${normalized.businessName}. Sorry we missed you — can we help with ${services[1].toLowerCase()} today?`,
      summary: "Missed call recovered with automated SMS follow-up.",
      outcome: "recovered",
      sentiment: "neutral",
      created_at: new Date(now - 1000 * 60 * 65).toISOString(),
    },
  ]);

  if (callsError) throw callsError;

  const { error: bookingsError } = await supabase.from("bookings").insert([
    {
      user_id: userId,
      lead_id: firstLeadId,
      title: `${services[0]} — ${primaryLead}`,
      description: `Trial booking generated for ${normalized.businessName} in ${normalized.serviceArea}.`,
      scheduled_at: new Date(now + 1000 * 60 * 60 * 25).toISOString(),
      duration_minutes: 60,
      service_type: services[0],
      status: "confirmed",
      created_at: new Date(now - 1000 * 60 * 14).toISOString(),
    },
  ]);

  if (bookingsError) throw bookingsError;

  const { error: automationsError } = await supabase.from("automations").insert([
    {
      user_id: userId,
      name: "Trial AI Call Answering",
      type: "twilio_voice_agent",
      description: `Answers calls for ${normalized.businessName}, speaks with ElevenLabs ${normalized.voiceName || "Rachel"}, and logs qualified leads live.`,
      status: "active",
      trigger_count: 2,
      last_triggered_at: new Date(now - 1000 * 60 * 15).toISOString(),
      config: { prompt: buildTrialPrompt(normalized), serviceArea: normalized.serviceArea },
    },
    {
      user_id: userId,
      name: "Missed Call Text-Back",
      type: "twilio_sms_recovery",
      description: "Sends a branded SMS within 30 seconds when a call is missed.",
      status: "active",
      trigger_count: 1,
      last_triggered_at: new Date(now - 1000 * 60 * 65).toISOString(),
      config: { channel: "twilio", businessName: normalized.businessName },
    },
  ]);

  if (automationsError) throw automationsError;

  const { error: integrationsError } = await supabase.from("integrations").insert([
    {
      user_id: userId,
      provider: "twilio",
      status: "connected",
      connected_at: new Date().toISOString(),
      config: { mode: "trial", smsEnabled: true, voiceEnabled: true },
    },
    {
      user_id: userId,
      provider: "elevenlabs",
      status: "connected",
      connected_at: new Date().toISOString(),
      config: { mode: "trial", voiceName: normalized.voiceName || "Rachel" },
    },
  ]);

  if (integrationsError) throw integrationsError;

  return { services, prompt: buildTrialPrompt(normalized) };
};
