import { useEffect, useState } from "react";
import { Bot, CheckCircle2, Copy, Link2, Loader2, Phone, RefreshCw, UserPlus } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientTrialApi, type ClientTrial } from "@/lib/clientTrialApi";

const initialForm = {
  email: "", businessName: "", contactName: "", phone: "", industry: "hvac",
  serviceArea: "", timezone: "America/Chicago", source: "sales", internalOwner: "",
};

const TrialBuilder = () => {
  const [form, setForm] = useState(initialForm);
  const [inviteUrl, setInviteUrl] = useState("");
  const [trials, setTrials] = useState<ClientTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [action, setAction] = useState("");
  const [numbers, setNumbers] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try { setTrials(await clientTrialApi.listTrials()); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not load trials"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createInvite = async () => {
    setCreating(true);
    try {
      const result = await clientTrialApi.createInvite(form);
      setInviteUrl(result.inviteUrl);
      toast.success(result.emailSent ? "Secure invite created and emailed." : "Invite created. Email delivery failed—copy and send the link manually.");
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create invite"); }
    finally { setCreating(false); }
  };

  const run = async (key: string, operation: () => Promise<unknown>, message: string) => {
    setAction(key);
    try { await operation(); toast.success(message); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Action failed"); }
    finally { setAction(""); }
  };

  const copy = async () => { await navigator.clipboard.writeText(inviteUrl); toast.success("Invite link copied."); };

  return (
    <div className="min-h-screen bg-background p-5 md:p-8">
      <SEOHead title="Trial Operations — VOXmation" description="Manage VOXmation trial onboarding." path="/trial-builder" noindex />
      <main className="max-w-7xl mx-auto py-6 space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-mono uppercase tracking-wider text-primary">Staff operations</p><h1 className="text-4xl font-display font-bold mt-2">7-day trial launch queue</h1><p className="text-silver mt-2">Accepted → intake → agent → number → testing → live.</p></div>
          <Button variant="outline" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </header>

        <section className="surface-card rounded-3xl border border-border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6"><UserPlus className="h-5 w-5 text-primary" /><h2 className="text-xl font-display font-bold">Create secure onboarding invite</h2></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["email", "Client email", "owner@company.com"], ["businessName", "Business name", "Comfort Air LLC"],
              ["contactName", "Contact name", "Alex Johnson"], ["phone", "Client phone (E.164)", "+19725551234"],
              ["serviceArea", "Service area", "Dallas–Fort Worth"], ["internalOwner", "VOXmation owner", "Marcus"],
            ].map(([key, label, placeholder]) => <div key={key} className="space-y-2"><Label>{label}</Label><Input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} placeholder={placeholder} /></div>)}
            <div className="space-y-2"><Label>Industry</Label><Select value={form.industry} onValueChange={(value) => setForm((current) => ({ ...current, industry: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["hvac", "plumbing", "electrical", "roofing", "cleaning", "landscaping", "other"].map((value) => <SelectItem key={value} value={value}>{value.toUpperCase()}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-end"><Button onClick={createInvite} disabled={creating || !form.email || !form.businessName || !form.contactName} className="w-full gap-2">{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />} Create & send invite</Button></div>
          </div>
          {inviteUrl && <div className="mt-5 rounded-2xl border border-primary/25 bg-primary/8 p-4 flex flex-col md:flex-row gap-3"><Input readOnly value={inviteUrl} className="font-mono text-xs" /><Button onClick={copy} className="gap-2 shrink-0"><Copy className="h-4 w-4" /> Copy secure link</Button></div>}
          <p className="text-xs text-silver mt-3">The link contains only a random token. Client identity and business data are no longer exposed in the URL.</p>
        </section>

        <section className="surface-card rounded-3xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border"><h2 className="text-xl font-display font-bold">Active launch queue</h2></div>
          {loading ? <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : trials.length === 0 ? <p className="p-8 text-silver">No trials yet.</p> : <div className="divide-y divide-border">{trials.map((trial) => {
            const readyCount = Object.values(trial.readiness || {}).filter(Boolean).length;
            const readinessTotal = Object.keys(trial.readiness || {}).length || 10;
            const configureKey = `configure-${trial.id}`;
            const connectKey = `connect-${trial.id}`;
            return <article key={trial.id} className="p-5 md:p-6 grid xl:grid-cols-[1.2fr_.8fr_1.4fr] gap-5 items-center">
              <div><div className="flex items-center gap-2"><h3 className="font-display font-bold text-lg">{trial.business_name}</h3><span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono uppercase text-primary">{trial.status.replaceAll("_", " ")}</span></div><p className="text-sm text-silver mt-1">{trial.contact_name} · {trial.invite_email}</p><p className="text-xs text-silver mt-2">Next: {trial.next_action || "Review trial"}</p></div>
              <div><div className="flex justify-between text-xs mb-2"><span>Readiness</span><span>{readyCount}/{readinessTotal}</span></div><div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${readyCount / readinessTotal * 100}%` }} /></div>{trial.last_error && <p className="text-xs text-destructive mt-2">{trial.last_error}</p>}</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" disabled={!trial.intake_completed_at || Boolean(trial.elevenlabs_agent_id) || action === configureKey} onClick={() => run(configureKey, () => clientTrialApi.configureAgent(trial.id), "Agent configured.")} className="gap-2">{action === configureKey ? <Loader2 className="h-4 w-4 animate-spin" /> : trial.elevenlabs_agent_id ? <CheckCircle2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />} {trial.elevenlabs_agent_id ? "Agent ready" : "Configure agent"}</Button>
                <Input value={numbers[trial.id] || ""} onChange={(e) => setNumbers((current) => ({ ...current, [trial.id]: e.target.value }))} placeholder="Existing Twilio number" className="min-w-[170px]" />
                <Button disabled={!trial.elevenlabs_agent_id || Boolean(trial.elevenlabs_phone_number_id) || !numbers[trial.id] || action === connectKey} onClick={() => run(connectKey, () => clientTrialApi.connectNumber(trial.id, numbers[trial.id]), "Phone connected.")} className="gap-2">{action === connectKey ? <Loader2 className="h-4 w-4 animate-spin" /> : trial.elevenlabs_phone_number_id ? <CheckCircle2 className="h-4 w-4" /> : <Phone className="h-4 w-4" />} {trial.elevenlabs_phone_number_id ? "Phone ready" : "Connect"}</Button>
              </div>
            </article>;
          })}</div>}
        </section>
      </main>
    </div>
  );
};

export default TrialBuilder;
