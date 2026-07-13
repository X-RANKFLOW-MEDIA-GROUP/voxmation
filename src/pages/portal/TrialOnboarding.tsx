import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bot, Check, CheckCircle2, Circle, Clock3, Loader2, PhoneCall, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientTrialApi, type ClientTrial } from "@/lib/clientTrialApi";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const callGoalOptions = ["Answer common questions", "Capture qualified leads", "Book appointments", "Transfer urgent calls", "Take messages", "Send SMS follow-up"];
const callerFieldOptions = ["Caller full name", "Callback phone number", "Email address", "Service address", "Reason for calling", "Preferred appointment time"];

const defaultIntake = {
  website: "",
  companyDescription: "",
  servicesText: "",
  serviceArea: "",
  businessHours: Object.fromEntries(weekdays.map((day) => [day, day === "Saturday" || day === "Sunday" ? "Closed" : "9:00 AM – 5:00 PM"])),
  holidays: "",
  greeting: "",
  agentName: "Vox",
  languages: ["en"],
  callGoals: ["Capture qualified leads", "Take messages"],
  callerFields: ["Caller full name", "Callback phone number", "Reason for calling"],
  pricingPolicy: "",
  bookingPolicy: "",
  afterHoursPolicy: "",
  emergencyPolicy: "",
  prohibitedTopics: "",
  escalationPhone: "",
  fallbackMessage: "",
  disclosureMessage: "",
  phoneMode: "call_forwarding",
  businessPhone: "",
  forwardingPhone: "",
  termsAccepted: false,
  recordingConsentAcknowledged: false,
};

const readinessLabels: Record<string, string> = {
  business_profile: "Business profile",
  hours: "Hours configured",
  services: "Services approved",
  call_rules: "Call rules and escalation",
  agent: "AI agent configured",
  phone: "Phone number connected",
  test_call: "Test call passed",
  terms: "Trial terms accepted",
  recording_compliance: "Recording compliance acknowledged",
  client_approval: "Go-live approved",
};

const TrialOnboarding = () => {
  const [trial, setTrial] = useState<ClientTrial | null>(null);
  const [form, setForm] = useState(defaultIntake);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testNumber, setTestNumber] = useState("");
  const [testNotes, setTestNotes] = useState("");
  const [action, setAction] = useState("");
  const hydrated = useRef(false);

  const loadTrial = async () => {
    try {
      const data = await clientTrialApi.getMine();
      setTrial(data);
      const intake = data.intake || {};
      setForm((current) => ({
        ...current,
        ...intake,
        servicesText: Array.isArray(intake.services) ? intake.services.join("\n") : current.servicesText,
        businessHours: { ...current.businessHours, ...(intake.businessHours || {}) },
        serviceArea: intake.serviceArea || data.service_area || "",
        escalationPhone: intake.escalationPhone || "",
        businessPhone: intake.businessPhone || data.phone || "",
        termsAccepted: Boolean(data.terms_accepted_at),
        recordingConsentAcknowledged: Boolean(data.recording_consent_acknowledged_at),
      }));
      setTestNumber(data.phone || "");
      hydrated.current = true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your trial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrial(); }, []);

  const payload = useMemo(() => ({
    ...form,
    services: form.servicesText.split("\n").map((service) => service.trim()).filter(Boolean),
    servicesText: undefined,
  }), [form]);

  const setField = (field: keyof typeof form, value: any) => setForm((current) => ({ ...current, [field]: value }));
  const toggleList = (field: "callGoals" | "callerFields", value: string) => {
    setForm((current) => {
      const values = current[field];
      return { ...current, [field]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] };
    });
  };

  const save = async (quiet = false) => {
    setSaving(true);
    try {
      const updated = await clientTrialApi.saveIntake(payload);
      setTrial(updated);
      if (!quiet) toast.success(updated.intake_completed_at ? "Intake complete. VOXmation can configure your agent." : "Progress saved.");
    } catch (error) {
      if (!quiet) toast.error(error instanceof Error ? error.message : "Could not save progress");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (name: string, operation: () => Promise<unknown>, success: string) => {
    setAction(name);
    try {
      await operation();
      toast.success(success);
      await loadTrial();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setAction("");
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!trial) return <div className="surface-card rounded-2xl p-8"><h1 className="text-2xl font-display font-bold">No active trial found</h1><p className="text-silver mt-2">Open the secure invitation sent by your VOXmation specialist.</p></div>;

  const isLive = trial.status === "live";
  const isClosed = ["expired", "cancelled", "converted"].includes(trial.status);
  const canTest = Boolean(trial.elevenlabs_agent_id && trial.elevenlabs_phone_number_id);
  const canApprove = Object.entries(trial.readiness || {}).every(([key, value]) => key === "client_approval" || value);
  const daysRemaining = trial.trial_ends_at ? Math.max(0, Math.ceil((new Date(trial.trial_ends_at).getTime() - Date.now()) / 86400000)) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-2">7-day AI receptionist trial</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Launch {trial.business_name}</h1>
          <p className="text-silver mt-2">Complete intake, test the receptionist, then approve go-live.</p>
        </div>
        <div className={`rounded-2xl border px-5 py-3 ${isLive ? "border-emerald-500/30 bg-emerald-500/10" : "border-primary/25 bg-primary/8"}`}>
          <p className="text-xs font-mono uppercase text-silver">Trial clock</p>
          <p className="font-display font-bold mt-1">{isLive ? `${daysRemaining} days remaining` : "Not started"}</p>
        </div>
      </header>

      {trial.last_error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div><p className="font-bold">Setup needs attention</p><p className="text-sm text-silver mt-1">{trial.last_error}</p></div>
        </div>
      )}

      <section className="surface-card rounded-3xl border border-border p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div><h2 className="text-xl font-display font-bold">Launch readiness</h2><p className="text-sm text-silver mt-1">Next action: {trial.next_action || "Complete the checklist"}</p></div>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-mono uppercase text-primary">{trial.status.replaceAll("_", " ")}</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(readinessLabels).map(([key, label]) => {
            const ready = Boolean(trial.readiness?.[key]);
            return <div key={key} className={`rounded-xl border p-3 flex items-center gap-3 ${ready ? "border-emerald-500/20 bg-emerald-500/8" : "border-border bg-background/40"}`}>
              {ready ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-silver" />}
              <span className="text-sm">{label}</span>
            </div>;
          })}
        </div>
      </section>

      {!isLive && !isClosed && (
        <>
          <section className="surface-card rounded-3xl border border-border p-6 md:p-8 space-y-7">
            <div><p className="text-xs font-mono uppercase tracking-wider text-primary">Step 1</p><h2 className="text-2xl font-display font-bold mt-1">Business profile</h2></div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-2"><Label>What does your business do?</Label><Textarea rows={4} value={form.companyDescription} onChange={(e) => setField("companyDescription", e.target.value)} placeholder="Describe who you serve, what you provide, and what makes a caller a good lead." /></div>
              <div className="space-y-2"><Label>Website</Label><Input value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://..." /></div>
              <div className="space-y-2"><Label>Service area</Label><Input value={form.serviceArea} onChange={(e) => setField("serviceArea", e.target.value)} placeholder="Dallas–Fort Worth" /></div>
              <div className="md:col-span-2 space-y-2"><Label>Approved services — one per line</Label><Textarea rows={5} value={form.servicesText} onChange={(e) => setField("servicesText", e.target.value)} placeholder={"Emergency AC repair\nSeasonal tune-up\nSystem replacement estimate"} /></div>
            </div>
          </section>

          <section className="surface-card rounded-3xl border border-border p-6 md:p-8 space-y-7">
            <div><p className="text-xs font-mono uppercase tracking-wider text-primary">Step 2</p><h2 className="text-2xl font-display font-bold mt-1">Hours and greeting</h2></div>
            <div className="grid md:grid-cols-2 gap-3">
              {weekdays.map((day) => <div key={day} className="grid grid-cols-[100px_1fr] items-center gap-3"><Label>{day}</Label><Input value={form.businessHours[day]} onChange={(e) => setField("businessHours", { ...form.businessHours, [day]: e.target.value })} /></div>)}
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2"><Label>Receptionist name</Label><Input value={form.agentName} onChange={(e) => setField("agentName", e.target.value)} /></div>
              <div className="space-y-2"><Label>Holidays or exceptions</Label><Input value={form.holidays} onChange={(e) => setField("holidays", e.target.value)} placeholder="Closed July 4" /></div>
              <div className="md:col-span-2 space-y-2"><Label>Exact greeting</Label><Textarea value={form.greeting} onChange={(e) => setField("greeting", e.target.value)} placeholder={`Thank you for calling ${trial.business_name}. This is Vox. How can I help you today?`} /></div>
            </div>
          </section>

          <section className="surface-card rounded-3xl border border-border p-6 md:p-8 space-y-7">
            <div><p className="text-xs font-mono uppercase tracking-wider text-primary">Step 3</p><h2 className="text-2xl font-display font-bold mt-1">Call handling rules</h2></div>
            <div className="grid lg:grid-cols-2 gap-7">
              <div><Label className="mb-3 block">What should the agent do?</Label><div className="space-y-2">{callGoalOptions.map((goal) => <button type="button" key={goal} onClick={() => toggleList("callGoals", goal)} className={`w-full rounded-xl border p-3 text-left text-sm flex items-center gap-3 ${form.callGoals.includes(goal) ? "border-primary/35 bg-primary/8" : "border-border"}`}>{form.callGoals.includes(goal) ? <Check className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}{goal}</button>)}</div></div>
              <div><Label className="mb-3 block">What must every caller provide?</Label><div className="space-y-2">{callerFieldOptions.map((field) => <button type="button" key={field} onClick={() => toggleList("callerFields", field)} className={`w-full rounded-xl border p-3 text-left text-sm flex items-center gap-3 ${form.callerFields.includes(field) ? "border-primary/35 bg-primary/8" : "border-border"}`}>{form.callerFields.includes(field) ? <Check className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}{field}</button>)}</div></div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2"><Label>Pricing rule</Label><Textarea value={form.pricingPolicy} onChange={(e) => setField("pricingPolicy", e.target.value)} placeholder="What may the agent quote?" /></div>
              <div className="space-y-2"><Label>Booking rule</Label><Textarea value={form.bookingPolicy} onChange={(e) => setField("bookingPolicy", e.target.value)} placeholder="When can an appointment be confirmed?" /></div>
              <div className="space-y-2"><Label>After-hours rule</Label><Textarea value={form.afterHoursPolicy} onChange={(e) => setField("afterHoursPolicy", e.target.value)} /></div>
              <div className="space-y-2"><Label>Urgency / emergency rule</Label><Textarea value={form.emergencyPolicy} onChange={(e) => setField("emergencyPolicy", e.target.value)} /></div>
              <div className="space-y-2"><Label>Human escalation phone (E.164)</Label><Input value={form.escalationPhone} onChange={(e) => setField("escalationPhone", e.target.value)} placeholder="+19725551234" /></div>
              <div className="space-y-2"><Label>Topics the agent must not handle</Label><Input value={form.prohibitedTopics} onChange={(e) => setField("prohibitedTopics", e.target.value)} /></div>
            </div>
          </section>

          <section className="surface-card rounded-3xl border border-border p-6 md:p-8 space-y-7">
            <div><p className="text-xs font-mono uppercase tracking-wider text-primary">Step 4</p><h2 className="text-2xl font-display font-bold mt-1">Phone connection and approval</h2></div>
            <div className="grid md:grid-cols-3 gap-3">{[
              ["call_forwarding", "Forward existing number", "Fastest and reversible"],
              ["new_number", "New VOXmation number", "Use a dedicated line"],
              ["port_existing", "Port existing number", "Requires carrier processing"],
            ].map(([value, title, description]) => <button type="button" key={value} onClick={() => setField("phoneMode", value)} className={`rounded-2xl border p-4 text-left ${form.phoneMode === value ? "border-primary/40 bg-primary/8" : "border-border"}`}><p className="font-bold">{title}</p><p className="text-xs text-silver mt-1">{description}</p></button>)}</div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2"><Label>Current business phone</Label><Input value={form.businessPhone} onChange={(e) => setField("businessPhone", e.target.value)} placeholder="+19725551234" /></div>
              <div className="space-y-2"><Label>Fallback / forwarding phone</Label><Input value={form.forwardingPhone} onChange={(e) => setField("forwardingPhone", e.target.value)} placeholder="+19725551234" /></div>
            </div>
            <div className="space-y-3">
              <label className="flex gap-3 items-start text-sm"><input type="checkbox" checked={form.termsAccepted} onChange={(e) => setField("termsAccepted", e.target.checked)} className="mt-1" /><span>I authorize VOXmation to configure this trial using the information above and understand no paid subscription starts without my approval.</span></label>
              <label className="flex gap-3 items-start text-sm"><input type="checkbox" checked={form.recordingConsentAcknowledged} onChange={(e) => setField("recordingConsentAcknowledged", e.target.checked)} className="mt-1" /><span>I understand call recording/disclosure rules depend on the caller’s location and my business is responsible for using the approved disclosure and obtaining required consent.</span></label>
            </div>
            <Button onClick={() => save()} disabled={saving || !form.termsAccepted || !form.recordingConsentAcknowledged} className="h-12 gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save onboarding
            </Button>
          </section>

          <section className="surface-card rounded-3xl border border-border p-6 md:p-8">
            <div className="flex items-start gap-4"><div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center"><Bot className="h-5 w-5 text-primary" /></div><div><h2 className="text-xl font-display font-bold">Agent setup and test</h2><p className="text-sm text-silver mt-1">VOXmation configures the agent and phone after the intake is complete.</p></div></div>
            <div className="grid lg:grid-cols-[1fr_auto] gap-3 mt-6"><Input value={testNumber} onChange={(e) => setTestNumber(e.target.value)} placeholder="Test phone in E.164 format" /><Button disabled={!canTest || action === "test"} onClick={() => runAction("test", () => clientTrialApi.testCall(testNumber), "Test call started.")} className="gap-2">{action === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />} Call me for testing</Button></div>
            {!canTest && <p className="text-xs text-silver mt-2">This button unlocks after the agent and number are connected.</p>}
            {canTest && <div className="mt-5 space-y-3"><Textarea value={testNotes} onChange={(e) => setTestNotes(e.target.value)} placeholder="What needs correction? Leave blank if the test passed." /><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => runAction("failed", () => clientTrialApi.submitTestResult(false, testNotes), "Issue sent to VOXmation.")}>Test needs changes</Button><Button onClick={() => runAction("passed", () => clientTrialApi.submitTestResult(true, testNotes), "Test approved.")} className="gap-2"><CheckCircle2 className="h-4 w-4" /> Test passed</Button></div></div>}
          </section>

          <section className="rounded-3xl border border-primary/30 bg-primary/8 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div><div className="flex items-center gap-2 text-primary"><ShieldCheck className="h-5 w-5" /><p className="font-display font-bold">Final go-live approval</p></div><p className="text-sm text-silver mt-2 max-w-2xl">Your seven full days begin at the exact moment you approve. No billing starts here.</p></div>
            <Button disabled={!canApprove || action === "live"} onClick={() => runAction("live", () => clientTrialApi.goLive(), "Your VOXmation trial is live.")} className="h-12 px-7 gap-2">{action === "live" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />} Approve and start 7 days</Button>
          </section>
        </>
      )}

      {isLive && (
        <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold">Your AI receptionist is live</h2>
          <p className="text-silver mt-3">Calls are handled at {trial.twilio_phone_number}. Trial ends {new Date(trial.trial_ends_at!).toLocaleString()}.</p>
        </section>
      )}

      {trial.status === "expired" && (
        <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <Clock3 className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold">Your trial is paused</h2>
          <p className="text-silver mt-3">Your agent configuration and history are preserved. Open Billing to select a plan and reactivate without rebuilding.</p>
          <Button asChild className="mt-6"><a href="/portal/billing">View plans</a></Button>
        </section>
      )}
    </div>
  );
};

export default TrialOnboarding;
