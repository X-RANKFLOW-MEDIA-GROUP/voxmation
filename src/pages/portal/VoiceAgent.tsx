import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/portal/StatusBadge";
import { motion } from "framer-motion";
import { Headphones, Play, Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Call {
  id: string;
  caller_name: string | null;
  caller_phone: string | null;
  status: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  summary: string | null;
  outcome: string | null;
  sentiment: string | null;
  created_at: string;
}

const demoCalls: Call[] = [
  { id: "1", caller_name: "Sarah Mitchell", caller_phone: "(512) 555-0134", status: "completed", duration_seconds: 263, transcript: "AI: Thank you for calling Comfort Zone HVAC...\nCaller: Hi, my AC stopped working...\nAI: I understand. Let me get you scheduled for an emergency repair...", summary: "Emergency AC repair needed. Customer's unit stopped cooling. Booked same-day appointment.", outcome: "booked", sentiment: "positive", created_at: new Date(Date.now() - 1200000).toISOString() },
  { id: "2", caller_name: "James Wilson", caller_phone: "(512) 555-0189", status: "completed", duration_seconds: 187, transcript: "AI: Thank you for calling...\nCaller: I need a quote for a panel upgrade...\nAI: I'd be happy to help schedule an estimate...", summary: "Panel upgrade estimate request. Residential property. Scheduled estimate appointment.", outcome: "booked", sentiment: "positive", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "3", caller_name: "Unknown Caller", caller_phone: "(512) 555-0211", status: "completed", duration_seconds: 45, transcript: "AI: Thank you for calling...\nCaller: Wrong number, sorry.\nAI: No problem at all...", summary: "Wrong number call. No action needed.", outcome: "no_action", sentiment: "neutral", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "4", caller_name: "Maria Gonzalez", caller_phone: "(512) 555-0092", status: "completed", duration_seconds: 341, transcript: "AI: Thank you for calling...\nCaller: I have a leak under my kitchen sink...\nAI: Let me book a plumber for you right away...", summary: "Kitchen sink leak. Urgent plumbing repair. Booked next available morning slot.", outcome: "booked", sentiment: "positive", created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: "5", caller_name: "David Chen", caller_phone: "(512) 555-0067", status: "completed", duration_seconds: 156, transcript: "AI: Thank you for calling...\nCaller: What are your rates for AC maintenance?...\nAI: Great question. Our maintenance plans start at...", summary: "Inquiry about maintenance plans. Interested in annual plan. Follow-up scheduled.", outcome: "follow_up", sentiment: "positive", created_at: new Date(Date.now() - 14400000).toISOString() },
];

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · " + d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const VoiceAgent = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<Call[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await supabase.from("calls").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setCalls(data && data.length > 0 ? data : demoCalls);
    };
    fetch();
  }, [user]);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-1">
          <Headphones className="h-5 w-5 text-primary/60" />
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">AI Voice Agent</h1>
        </div>
        <p className="text-silver text-sm font-mono mb-8">Call recordings, transcripts, and AI summaries</p>
      </motion.div>

      <div className="space-y-3">
        {calls.map((call, i) => (
          <motion.div
            key={call.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="surface-card rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === call.id ? null : call.id)}
              className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-primary/3 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                <Play className="h-4 w-4 text-primary/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-bold text-foreground truncate">{call.caller_name || "Unknown"}</p>
                <p className="text-[11px] font-mono text-silver">{call.caller_phone}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                {call.outcome && <StatusBadge status={call.outcome} />}
                {call.sentiment && <StatusBadge status={call.sentiment} />}
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 text-silver">
                  <Clock className="h-3 w-3" />
                  <span className="text-[11px] font-mono">{formatDuration(call.duration_seconds || 0)}</span>
                </div>
                <p className="text-[10px] font-mono text-silver/60 mt-0.5">{formatTime(call.created_at)}</p>
              </div>
              {expanded === call.id ? <ChevronUp className="h-4 w-4 text-silver" /> : <ChevronDown className="h-4 w-4 text-silver" />}
            </button>

            {expanded === call.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border/50 px-6 py-5 space-y-4"
              >
                {call.summary && (
                  <div>
                    <p className="text-[10px] font-mono text-primary tracking-wider uppercase mb-2">AI Summary</p>
                    <p className="text-sm text-silver-bright font-mono leading-relaxed">{call.summary}</p>
                  </div>
                )}
                {call.transcript && (
                  <div>
                    <p className="text-[10px] font-mono text-primary tracking-wider uppercase mb-2">Transcript</p>
                    <pre className="text-xs text-silver font-mono leading-relaxed whitespace-pre-wrap bg-background/50 rounded-xl p-4 border border-border/50 max-h-48 overflow-y-auto">
                      {call.transcript}
                    </pre>
                  </div>
                )}
                <div className="flex items-center gap-4 sm:hidden">
                  {call.outcome && <StatusBadge status={call.outcome} />}
                  {call.sentiment && <StatusBadge status={call.sentiment} />}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VoiceAgent;
