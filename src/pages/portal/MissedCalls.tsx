import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhoneOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/portal/StatusBadge";

type MissedCall = { id: string; caller_phone: string | null; status: string | null; summary: string | null; created_at: string };

const MissedCalls = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<MissedCall[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("calls").select("id, caller_phone, status, summary, created_at").eq("user_id", user.id).eq("is_test", false).in("status", ["missed", "no-answer", "failed"]).order("created_at", { ascending: false });
      setCalls((data || []) as MissedCall[]);
    };
    void load();
    const channel = supabase.channel("missed-calls-realtime").on("postgres_changes", { event: "*", schema: "public", table: "calls", filter: `user_id=eq.${user.id}` }, load).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  return <div className="space-y-8">
    <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="flex items-center gap-3"><PhoneOff className="h-5 w-5 text-primary/60" /><h1 className="text-2xl md:text-3xl font-display font-bold">Missed Calls</h1></div><p className="text-silver text-sm font-mono mt-2">Unanswered production calls requiring follow-up.</p></motion.header>
    <section className="surface-card rounded-2xl overflow-hidden">
      {calls.length === 0 ? <div className="p-12 text-center text-sm text-silver">No missed calls yet.</div> : calls.map((call) => <div key={call.id} className="grid md:grid-cols-[1fr_1fr_2fr] gap-4 px-6 py-4 border-b border-border/30 last:border-0"><div><p className="text-sm font-mono">{call.caller_phone || "Unknown caller"}</p><p className="text-xs text-silver mt-1">{new Date(call.created_at).toLocaleString()}</p></div><div><StatusBadge status={call.status || "missed"} /></div><p className="text-sm text-silver">{call.summary || "No summary available."}</p></div>)}
    </section>
  </div>;
};

export default MissedCalls;
