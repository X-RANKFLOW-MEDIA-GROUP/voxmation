import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Headphones,
  Loader2,
  Mail,
  MessageSquareText,
  PhoneCall,
  Play,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  TRIAL_PAYLOAD_STORAGE_KEY,
  buildTrialPrompt,
  getIndustryDemoContent,
  parseTrialPayload,
  provisionTrialAccount,
  type TrialPayload,
  type TrialScenario,
} from "@/lib/trialProvisioning";

const getStoredPayload = (): TrialPayload | null => {
  try {
    const raw = localStorage.getItem(TRIAL_PAYLOAD_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrialPayload) : null;
  } catch {
    localStorage.removeItem(TRIAL_PAYLOAD_STORAGE_KEY);
    return null;
  }
};

const personalizationSteps = [
  "Read business profile",
  "Build niche-specific call flow",
  "Connect Twilio + ElevenLabs demo",
  "Generate portal workspace",
];

const buildConversationPreview = (payload: TrialPayload, scenario: TrialScenario) => {
  const firstName = payload.clientName.split(" ")[0] || "there";
  const content = getIndustryDemoContent(payload.industry);

  return [
    {
      role: "ai" as const,
      text: content.openingLine.replace("{business}", payload.businessName),
    },
    {
      role: "caller" as const,
      text: `Hi, I am in ${payload.serviceArea} and need help with ${scenario.need.toLowerCase()}.`,
    },
    {
      role: "ai" as const,
      text: `${scenario.aiAction}. I can reserve the next available appointment and text the confirmation to you now.`,
    },
    {
      role: "system" as const,
      text: `Twilio SMS queued • Lead assigned to ${firstName} • ${scenario.value}`,
    },
  ];
};

const TrialStart = () => {
  const parsedPayload = useMemo(() => parseTrialPayload(window.location.search), []);
  const [payload, setPayload] = useState<TrialPayload | null>(() => parsedPayload || getStoredPayload());
  const [email, setEmail] = useState(parsedPayload?.email || "");
  const [sendingLink, setSendingLink] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [provisioned, setProvisioned] = useState(false);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!parsedPayload) return;
    localStorage.setItem(TRIAL_PAYLOAD_STORAGE_KEY, JSON.stringify(parsedPayload));
    setPayload(parsedPayload);
    setEmail(parsedPayload.email);
  }, [parsedPayload]);

  useEffect(() => {
    if (loading || !user || !payload || provisioned || provisioning) return;

    const storageKey = `${TRIAL_PAYLOAD_STORAGE_KEY}:${user.id}:${payload.businessName}`;
    if (localStorage.getItem(storageKey)) {
      setProvisioned(true);
      return;
    }

    const runProvisioning = async () => {
      setProvisioning(true);
      try {
        await provisionTrialAccount(user.id, { ...payload, email: user.email || payload.email });
        localStorage.setItem(storageKey, "true");
        setProvisioned(true);
        toast.success("Your personalized live demo is ready.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to generate the trial workspace.";
        toast.error(message);
      } finally {
        setProvisioning(false);
      }
    };

    runProvisioning();
  }, [loading, payload, provisioned, provisioning, user]);

  const handleSendMagicLink = async () => {
    if (!payload) {
      toast.error("This trial link is missing setup details. Ask for a new link.");
      return;
    }

    setSendingLink(true);
    localStorage.setItem(TRIAL_PAYLOAD_STORAGE_KEY, JSON.stringify({ ...payload, email }));

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.href,
        data: {
          full_name: payload.clientName,
          company_name: payload.businessName,
          trial_source: "voxmation_trial_link",
        },
      },
    });

    setSendingLink(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Check your email for the secure access link.");
  };

  if (!payload) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <SEOHead title="Trial Link Missing — Voxmation" description="This Voxmation trial link is missing details." path="/trial/start" noindex />
        <div className="surface-card max-w-lg rounded-3xl border border-border p-8 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">Trial link needs setup details</h1>
          <p className="text-silver mb-6">Ask Voxmation for a new personalized trial link with your email, business name, client name, and service area.</p>
          <Button asChild><Link to="/demo">View public demo instead</Link></Button>
        </div>
      </div>
    );
  }

  const content = getIndustryDemoContent(payload.industry);
  const activeScenario = content.scenarios[activeScenarioIndex] || content.scenarios[0];
  const aiPrompt = buildTrialPrompt(payload);
  const conversationPreview = buildConversationPreview(payload, activeScenario);
  const readyState = user && (provisioned || !provisioning);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 relative overflow-hidden">
      <SEOHead title={`${payload.businessName} Live Demo — Voxmation`} description="Start your personalized Voxmation live demo workspace." path="/trial/start" noindex />
      <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
      <div className="absolute -top-28 right-[-12%] h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-18%] left-[-12%] h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <main className="max-w-7xl mx-auto relative z-10 py-6 md:py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-silver hover:text-silver-bright transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-xs font-mono text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Personalized for {content.label}
          </div>
        </div>

        <section className="grid lg:grid-cols-[1.08fr_0.92fr] gap-6 items-stretch mb-6">
          <div className="surface-card rounded-[2rem] border border-border p-6 md:p-10 overflow-hidden relative">
            <div className="absolute top-6 right-6 hidden md:flex h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs font-mono uppercase tracking-[0.24em] text-primary mb-4">Private live demo</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight max-w-4xl">
              {payload.businessName}'s AI receptionist is ready.
            </h1>
            <p className="text-lg text-silver mt-5 max-w-3xl leading-relaxed">
              Hi {payload.clientName}, this demo is tailored for {content.label.toLowerCase()} calls in {payload.serviceArea}. {content.headline}.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              {content.metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-border bg-background/55 p-4">
                  <p className="text-[0.65rem] font-mono uppercase tracking-[0.16em] text-silver mb-2">{metric.label}</p>
                  <p className="font-display font-bold text-2xl text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/8 p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div>
                <p className="text-sm font-display font-bold text-foreground">Primary outcome</p>
                <p className="text-sm text-silver mt-1">{content.primaryOutcome}</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-primary shrink-0">
                <Clock3 className="h-4 w-4" />
                Setup in under 60 seconds
              </div>
            </div>
          </div>

          <aside className="surface-card rounded-[2rem] border border-border p-6 md:p-8 flex flex-col justify-between">
            {!user ? (
              <div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-3">Open your live demo securely</h2>
                <p className="text-silver text-sm mb-6">Use the email attached to this invite. No password required — we send a secure magic link and then build your portal automatically.</p>

                <div className="space-y-2 mb-5">
                  <Label htmlFor="trialEmail" className="text-xs font-mono uppercase tracking-wider text-silver">Email address</Label>
                  <Input id="trialEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="bg-background border-border h-12" />
                </div>

                <Button onClick={handleSendMagicLink} disabled={sendingLink || !email} className="w-full h-12 gap-2">
                  {sendingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Send secure access link
                </Button>
              </div>
            ) : (
              <div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  {provisioning ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-3">{provisioning ? "Generating your demo" : "Your demo workspace is ready"}</h2>
                <p className="text-silver text-sm mb-6">{provisioning ? "Creating personalized calls, leads, bookings, Twilio workflows, and ElevenLabs settings." : "Review your tailored calls, leads, bookings, and automations inside the portal."}</p>
                <Button onClick={() => navigate("/portal")} disabled={provisioning} className="w-full h-12 gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Open client portal
                </Button>
              </div>
            )}

            <div className="mt-8 space-y-3">
              {personalizationSteps.map((step, index) => {
                const complete = readyState || index < (user ? 3 : 2);
                const active = user && provisioning && index === 3;
                return (
                  <div key={step} className="flex items-center gap-3 text-sm">
                    <div className={`h-7 w-7 rounded-full border flex items-center justify-center ${complete ? "bg-primary text-background border-primary" : active ? "border-primary text-primary" : "border-border text-silver"}`}>
                      {active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                    </div>
                    <span className={complete || active ? "text-foreground" : "text-silver"}>{step}</span>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>

        <section className="grid xl:grid-cols-[0.82fr_1.18fr] gap-6 mb-6">
          <div className="surface-card rounded-[2rem] border border-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">Interactive call paths</p>
                <h2 className="text-2xl font-display font-bold text-foreground">Choose a real {content.label} scenario</h2>
              </div>
            </div>

            <div className="space-y-3">
              {content.scenarios.map((scenario, index) => (
                <button
                  key={scenario.title}
                  type="button"
                  onClick={() => setActiveScenarioIndex(index)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${activeScenarioIndex === index ? "border-primary/50 bg-primary/10" : "border-border bg-background/45 hover:border-primary/25 hover:bg-primary/5"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display font-bold text-foreground">{scenario.title}</p>
                      <p className="text-sm text-silver mt-1">{scenario.need}</p>
                    </div>
                    <span className="text-[0.65rem] font-mono uppercase tracking-[0.14em] text-primary rounded-full bg-primary/10 px-2.5 py-1">{scenario.caller}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] border border-border p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">Live preview</p>
                <h2 className="text-2xl font-display font-bold text-foreground">How Vox handles: {activeScenario.title}</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-xs font-mono text-silver-bright">
                <Headphones className="h-3.5 w-3.5 text-primary" />
                ElevenLabs {payload.voiceName || "Rachel"}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background/45 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2 text-xs font-mono text-silver-bright">
                  <PhoneCall className="h-4 w-4 text-primary" />
                  Incoming call • {payload.serviceArea}
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  Live AI routing
                </div>
              </div>

              <div className="p-5 space-y-4">
                {conversationPreview.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "caller" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${message.role === "ai" ? "bg-primary/12 border border-primary/25" : message.role === "system" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-card border border-border"}`}>
                      {message.role === "ai" ? <Bot className="h-4 w-4 text-primary" /> : message.role === "system" ? <MessageSquareText className="h-4 w-4 text-emerald-400" /> : <UserRound className="h-4 w-4 text-silver" />}
                    </div>
                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "caller" ? "bg-foreground text-background" : message.role === "system" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-100" : "bg-card border border-border text-foreground/85"}`}>
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="surface-card rounded-[2rem] border border-border p-6">
            <PhoneCall className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Twilio voice + SMS</h3>
            <p className="text-sm text-silver leading-relaxed">Inbound call handling, missed-call text-back, and booking confirmations are staged for {payload.businessName}.</p>
          </div>
          <div className="surface-card rounded-[2rem] border border-border p-6">
            <Bot className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Niche-trained prompt</h3>
            <p className="text-sm text-silver leading-relaxed line-clamp-4">{aiPrompt}</p>
          </div>
          <div className="surface-card rounded-[2rem] border border-border p-6">
            <CalendarCheck className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Portal generated live</h3>
            <p className="text-sm text-silver leading-relaxed">Calls, leads, bookings, automations, and integration rows are created when the client signs in.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TrialStart;
