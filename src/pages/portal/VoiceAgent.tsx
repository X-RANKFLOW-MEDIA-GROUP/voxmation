import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/portal/StatusBadge";
import { motion } from "framer-motion";
import { Headphones, Play, Clock, PhoneOff, ChevronDown, ChevronUp } from "lucide-react";
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
    if (!user) return;
    const fetchCalls = async () => {
      const { data } = await supabase.from("calls").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setCalls(data || []);
    };
    fetchCalls();

    const channel = supabase
      .channel('calls-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calls', filter: `user_id=eq.${user.id}` }, () => {
        fetchCalls();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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

      {calls.length === 0 ? (
        <div className="surface-card rounded-2xl p-10 text-center">
          <PhoneOff className="h-9 w-9 text-silver mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl">No real calls yet</h2>
          <p className="text-sm text-silver mt-2">Test calls and live calls will appear here after your phone is connected.</p>
        </div>
      ) : <div className="space-y-3">
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
      </div>}
    </div>
  );
};

export default VoiceAgent;
