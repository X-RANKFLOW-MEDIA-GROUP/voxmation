import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bot, Check, Copy, ExternalLink, Link2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buildTrialPrompt, encodeTrialPayload, industryLabels, type TrialPayload } from "@/lib/trialProvisioning";

const defaultPayload: TrialPayload = {
  email: "",
  businessName: "",
  clientName: "",
  serviceArea: "",
  industry: "hvac",
  phone: "",
  voiceName: "Rachel",
};

const TrialBuilder = () => {
  const [payload, setPayload] = useState(defaultPayload);
  const [copied, setCopied] = useState(false);

  const trialLink = useMemo(() => {
    const query = encodeTrialPayload(payload);
    return `${window.location.origin}/trial/start?${query}`;
  }, [payload]);

  const aiPrompt = useMemo(() => buildTrialPrompt(payload), [payload]);

  const canGenerate = payload.email && payload.businessName && payload.clientName && payload.serviceArea;

  const updateField = (field: keyof TrialPayload, value: string) => {
    setPayload((current) => ({ ...current, [field]: value }));
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!canGenerate) {
      toast.error("Add the email, business name, client name, and service area first.");
      return;
    }

    await navigator.clipboard.writeText(trialLink);
    setCopied(true);
    toast.success("Trial link copied. Send it to the client.");
  };

  return (
    <div className="min-h-screen bg-background p-6 relative overflow-hidden">
      <SEOHead title="Trial Builder — Voxmation" description="Generate live Voxmation client trial links." path="/trial-builder" noindex />
      <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />

      <main className="max-w-6xl mx-auto relative z-10 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-silver hover:text-silver-bright transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
          <section className="surface-card rounded-3xl p-6 md:p-8 border border-border">
            <div className="flex items-start gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Wand2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">Client trial generator</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">Create a live demo account link</h1>
                <p className="text-silver mt-3 max-w-2xl">Enter the client details once. Voxmation packages the trial with their business name, service area, Twilio workflows, and ElevenLabs voice settings.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-xs font-mono uppercase tracking-wider text-silver">Client name</Label>
                <Input id="clientName" value={payload.clientName} onChange={(event) => updateField("clientName", event.target.value)} placeholder="John Smith" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-silver">Client email</Label>
                <Input id="email" type="email" value={payload.email} onChange={(event) => updateField("email", event.target.value)} placeholder="john@company.com" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-xs font-mono uppercase tracking-wider text-silver">Business name</Label>
                <Input id="businessName" value={payload.businessName} onChange={(event) => updateField("businessName", event.target.value)} placeholder="Smith HVAC" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceArea" className="text-xs font-mono uppercase tracking-wider text-silver">Service area</Label>
                <Input id="serviceArea" value={payload.serviceArea} onChange={(event) => updateField("serviceArea", event.target.value)} placeholder="Austin, TX" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-silver">Industry</Label>
                <Select value={payload.industry} onValueChange={(value) => updateField("industry", value)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Choose industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(industryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-silver">ElevenLabs voice</Label>
                <Select value={payload.voiceName} onValueChange={(value) => updateField("voiceName", value)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Choose voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Rachel", "Adam", "Josh", "Bella", "Elli"].map((voice) => <SelectItem key={voice} value={voice}>{voice}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="phone" className="text-xs font-mono uppercase tracking-wider text-silver">Client phone / Twilio test number</Label>
                <Input id="phone" value={payload.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+1 (555) 123-4567" className="bg-background border-border" />
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-background/60 border border-border p-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-mono text-silver-bright">
                <Link2 className="h-4 w-4 text-primary" />
                Shareable trial link
              </div>
              <div className="flex gap-3">
                <Input readOnly value={canGenerate ? trialLink : "Complete required fields to generate the link"} className="bg-card border-border font-mono text-xs" />
                <Button type="button" onClick={handleCopy} disabled={!canGenerate} className="gap-2 shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="surface-card rounded-3xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">AI trial brief</p>
                  <h2 className="font-display font-bold text-xl text-foreground">Generated live setup</h2>
                </div>
              </div>
              <Textarea readOnly value={aiPrompt} className="min-h-[220px] bg-background border-border text-sm leading-relaxed" />
              <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
                <div className="rounded-xl border border-border bg-background/50 p-3">
                  <p className="text-xs font-mono text-silver uppercase mb-1">Voice</p>
                  <p className="font-display font-bold text-foreground">{payload.voiceName}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/50 p-3">
                  <p className="text-xs font-mono text-silver uppercase mb-1">SMS</p>
                  <p className="font-display font-bold text-foreground">Twilio ready</p>
                </div>
              </div>
            </div>

            <Button asChild disabled={!canGenerate} className="w-full h-12 gap-2">
              <a href={canGenerate ? trialLink : undefined} target="_blank" rel="noreferrer">
                Preview client link
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default TrialBuilder;
