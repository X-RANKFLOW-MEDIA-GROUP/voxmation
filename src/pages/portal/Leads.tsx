import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/portal/StatusBadge";
import { motion } from "framer-motion";
import { Users, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  service_requested: string | null;
  status: string | null;
  source: string | null;
  lead_score: number | null;
  created_at: string;
}

const demoLeads: Lead[] = [
  { id: "1", name: "Sarah Mitchell", phone: "(512) 555-0134", email: "sarah.m@email.com", city: "Austin", service_requested: "AC Repair", status: "booked", source: "ai_voice", lead_score: 92, created_at: new Date(Date.now() - 1200000).toISOString() },
  { id: "2", name: "James Wilson", phone: "(512) 555-0189", email: "jwilson@email.com", city: "Round Rock", service_requested: "Panel Upgrade", status: "qualified", source: "ai_voice", lead_score: 85, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "3", name: "Maria Gonzalez", phone: "(512) 555-0092", email: "maria.g@email.com", city: "Cedar Park", service_requested: "Plumbing Leak", status: "booked", source: "missed_call", lead_score: 88, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "4", name: "David Chen", phone: "(512) 555-0067", email: "dchen@email.com", city: "Pflugerville", service_requested: "Maintenance Plan", status: "contacted", source: "ai_voice", lead_score: 72, created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: "5", name: "Emily Rodriguez", phone: "(512) 555-0201", email: "emily.r@email.com", city: "Austin", service_requested: "Water Heater", status: "new", source: "website", lead_score: 65, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: "6", name: "Robert Johnson", phone: "(512) 555-0318", email: "rjohnson@email.com", city: "Georgetown", service_requested: "Electrical Wiring", status: "qualified", source: "ai_voice", lead_score: 78, created_at: new Date(Date.now() - 18000000).toISOString() },
  { id: "7", name: "Lisa Thompson", phone: "(512) 555-0445", email: "lisa.t@email.com", city: "Lakeway", service_requested: "AC Installation", status: "lost", source: "referral", lead_score: 45, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "8", name: "Michael Park", phone: "(512) 555-0109", email: "mpark@email.com", city: "Austin", service_requested: "Drain Cleaning", status: "booked", source: "missed_call", lead_score: 90, created_at: new Date(Date.now() - 90000000).toISOString() },
];

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchLeads = async () => {
      const { data } = await supabase.from("leads").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setLeads(data && data.length > 0 ? data : demoLeads);
    };
    fetchLeads();

    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${user.id}` }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filtered = leads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.service_requested?.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase())
  );

  const ScoreBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-warning" : "bg-destructive"}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-silver">{score}</span>
    </div>
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-1">
          <Users className="h-5 w-5 text-primary/60" />
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Leads</h1>
        </div>
        <p className="text-silver text-sm font-mono mb-8">All captured leads with status and scoring</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="pl-10 bg-background border-border font-mono text-sm"
        />
      </div>

      <div className="surface-card rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border/50 text-[10px] font-mono text-silver tracking-wider uppercase">
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">City</th>
              <th className="text-left px-4 py-3">Service</th>
              <th className="text-left px-4 py-3">Score</th>
              <th className="text-left px-4 py-3">Source</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead, i) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 last:border-0 hover:bg-primary/3 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-mono font-bold text-foreground">{lead.name}</p>
                  <p className="text-[10px] font-mono text-silver">{lead.email}</p>
                </td>
                <td className="px-4 py-4 text-xs font-mono text-silver">{lead.phone}</td>
                <td className="px-4 py-4 text-xs font-mono text-silver">{lead.city}</td>
                <td className="px-4 py-4 text-xs font-mono text-silver-bright">{lead.service_requested}</td>
                <td className="px-4 py-4"><ScoreBar score={lead.lead_score || 0} /></td>
                <td className="px-4 py-4"><StatusBadge status={lead.source || "unknown"} /></td>
                <td className="px-4 py-4"><StatusBadge status={lead.status || "new"} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leads;
