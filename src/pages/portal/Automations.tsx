import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Workflow } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/portal/StatusBadge";

type Automation = { id: string; name: string; description: string | null; type: string; status: string | null; trigger_count: number | null; last_triggered_at: string | null };

const Automations = () => {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("automations").select("id, name, description, type, status, trigger_count, last_triggered_at").eq("user_id", user.id).order("created_at").then(({ data }) => setAutomations((data || []) as Automation[]));
  }, [user]);
  return <div className="space-y-8"><motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="flex items-center gap-3"><Workflow className="h-5 w-5 text-primary/60" /><h1 className="text-2xl md:text-3xl font-display font-bold">Automations</h1></div><p className="text-silver text-sm font-mono mt-2">Configured workflows and verified trigger counts.</p></motion.header><div className="grid md:grid-cols-2 gap-4">{automations.length === 0 ? <div className="surface-card rounded-2xl p-10 text-sm text-silver md:col-span-2 text-center">No automations configured.</div> : automations.map((automation) => <article key={automation.id} className="surface-card rounded-2xl p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-mono font-bold">{automation.name}</h2><p className="text-xs text-silver mt-1">{automation.type.replaceAll("_", " ")}</p></div><StatusBadge status={automation.status || "draft"} /></div><p className="text-sm text-silver mt-4">{automation.description || "No description."}</p><div className="border-t border-border mt-5 pt-4 flex justify-between text-xs text-silver"><span>{automation.trigger_count || 0} triggers</span><span>{automation.last_triggered_at ? new Date(automation.last_triggered_at).toLocaleString() : "Never triggered"}</span></div></article>)}</div></div>;
};

export default Automations;
