import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, Loader2, LockKeyhole, Mail, PhoneCall, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { clientTrialApi, type TrialInvite } from "@/lib/clientTrialApi";

const TrialStart = () => {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("invite") || "", []);
  const [invite, setInvite] = useState<TrialInvite | null>(null);
  const [email, setEmail] = useState("");
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [sending, setSending] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const claimedRef = useRef(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("This onboarding link is missing its secure invite token.");
      setLoadingInvite(false);
      return;
    }
    clientTrialApi.getInvite(token)
      .then(setInvite)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Invite could not be opened"))
      .finally(() => setLoadingInvite(false));
  }, [token]);

  useEffect(() => {
    if (authLoading || !user || !invite || claimedRef.current) return;
    claimedRef.current = true;
    setClaiming(true);
    clientTrialApi.claimInvite(token)
      .then(() => navigate("/portal/onboarding", { replace: true }))
      .catch((reason) => {
        claimedRef.current = false;
        setError(reason instanceof Error ? reason.message : "Invite could not be claimed");
      })
      .finally(() => setClaiming(false));
  }, [authLoading, invite, navigate, token, user]);

  const sendMagicLink = async () => {
    if (!email) return;
    setSending(true);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: window.location.href,
        data: { trial_invite: true },
      },
    });
    setSending(false);
    if (signInError) return toast.error(signInError.message);
    toast.success("Secure sign-in link sent. Check your email.");
  };

  if (loadingInvite || authLoading || claiming) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <SEOHead title="Trial invite unavailable — VOXmation" description="Secure VOXmation trial onboarding." path="/trial/start" noindex />
        <div className="surface-card max-w-lg rounded-3xl border border-border p-8 text-center">
          <LockKeyhole className="h-10 w-10 text-primary mx-auto mb-5" />
          <h1 className="text-2xl font-display font-bold mb-3">This invite needs attention</h1>
          <p className="text-silver mb-6">{error || "Ask your VOXmation specialist to send a new onboarding link."}</p>
          <Button asChild variant="outline"><Link to="/contact">Contact support</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      <SEOHead title={`${invite.businessName} onboarding — VOXmation`} description="Secure VOXmation AI receptionist onboarding." path="/trial/start" noindex />
      <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
      <main className="relative z-10 max-w-6xl mx-auto py-6 md:py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-silver hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to VOXmation
        </Link>

        <div className="grid lg:grid-cols-[1.12fr_0.88fr] gap-6 items-stretch">
          <section className="surface-card rounded-[2rem] border border-border p-7 md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-xs font-mono text-primary mb-7">
              <ShieldCheck className="h-4 w-4" /> Private onboarding invitation
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">
              Let’s make {invite.businessName}’s AI receptionist ready for real calls.
            </h1>
            <p className="text-lg text-silver mt-5 leading-relaxed max-w-3xl">
              Hi {invite.contactName}. We’ll collect your call rules, configure the voice agent, connect the phone line, and run a test call before anything goes live.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mt-9">
              {[
                [Clock3, "15-minute intake", "Save and continue anytime"],
                [PhoneCall, "Real test call", "You approve the experience"],
                [CheckCircle2, "Full 7 days", "Starts only after go-live"],
              ].map(([Icon, title, text]) => {
                const ItemIcon = Icon as typeof Clock3;
                return (
                  <div key={String(title)} className="rounded-2xl border border-border bg-background/50 p-5">
                    <ItemIcon className="h-5 w-5 text-primary mb-3" />
                    <p className="font-display font-bold">{String(title)}</p>
                    <p className="text-xs text-silver mt-1">{String(text)}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="surface-card rounded-[2rem] border border-border p-7 md:p-9 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Open your secure workspace</h2>
              <p className="text-sm text-silver mt-3 mb-7">
                Sign in with the invited address ({invite.emailHint}). No password is needed.
              </p>
              <div className="space-y-2">
                <Label htmlFor="email">Invited email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="h-12" />
              </div>
              <Button onClick={sendMagicLink} disabled={!email || sending} className="w-full h-12 mt-4 gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Send secure access link
              </Button>
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-background/45 p-5 text-sm text-silver">
              <p className="font-display font-bold text-foreground mb-2">Your trial has not started yet.</p>
              The seven-day timer begins only after the agent and phone pass testing and you approve go-live.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default TrialStart;
