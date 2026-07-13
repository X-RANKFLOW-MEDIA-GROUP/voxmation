import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, CalendarCheck, Clock, Phone, Target } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MetricCard from "@/components/portal/MetricCard";

type CallRow = {
  id: string;
  status: string | null;
  outcome: string | null;
  duration_seconds: number | null;
  summary: string | null;
  created_at: string;
};

type LeadRow = { status: string | null; created_at: string };
type BookingRow = { id: string; created_at: string };

const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#f59e0b", "#64748b"];

const Analytics = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const [callsResult, leadsResult, bookingsResult] = await Promise.all([
      supabase.from("calls").select("id, status, outcome, duration_seconds, summary, created_at").eq("user_id", user.id).eq("is_test", false).gte("created_at", monthStart).order("created_at", { ascending: false }),
      supabase.from("leads").select("status, created_at").eq("user_id", user.id).gte("created_at", monthStart),
      supabase.from("bookings").select("id, created_at").eq("user_id", user.id).gte("created_at", monthStart),
    ]);
    setCalls((callsResult.data || []) as CallRow[]);
    setLeads((leadsResult.data || []) as LeadRow[]);
    setBookings((bookingsResult.data || []) as BookingRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { void fetchAnalytics(); }, [fetchAnalytics]);

  const answeredCalls = calls.filter((call) => call.status === "completed");
  const qualifiedLeads = leads.filter((lead) => ["qualified", "booked"].includes(lead.status || ""));
  const averageDuration = answeredCalls.length
    ? Math.round(answeredCalls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0) / answeredCalls.length)
    : 0;
  const answeredRate = calls.length ? Math.round(answeredCalls.length / calls.length * 100) : 0;

  const weeklyData = useMemo(() => Array.from({ length: 5 }, (_, index) => ({ week: `W${index + 1}`, calls: 0, leads: 0, bookings: 0 }))
    .map((bucket, index) => {
      const inWeek = (iso: string) => Math.min(4, Math.floor((new Date(iso).getDate() - 1) / 7)) === index;
      return {
        ...bucket,
        calls: calls.filter((row) => inWeek(row.created_at)).length,
        leads: leads.filter((row) => inWeek(row.created_at)).length,
        bookings: bookings.filter((row) => inWeek(row.created_at)).length,
      };
    }), [calls, leads, bookings]);

  const outcomeData = useMemo(() => {
    const counts = new Map<string, number>();
    calls.forEach((call) => {
      const label = call.outcome || (call.status === "completed" ? "completed" : call.status || "unknown");
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts, ([name, value]) => ({ name, value }));
  }, [calls]);

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3"><Activity className="h-5 w-5 text-primary" /><h1 className="text-2xl md:text-3xl font-display font-bold">Analytics</h1></div>
        <p className="text-silver text-sm font-mono mt-2">Real production activity for the current month; onboarding tests are excluded.</p>
      </motion.header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Phone} label="Live calls" value={loading ? "—" : calls.length} delay={0} />
        <MetricCard icon={Target} label="Answered rate" value={loading ? "—" : `${answeredRate}%`} delay={0.05} />
        <MetricCard icon={Clock} label="Avg duration" value={loading ? "—" : `${Math.floor(averageDuration / 60)}m ${averageDuration % 60}s`} delay={0.1} />
        <MetricCard icon={CalendarCheck} label="Bookings" value={loading ? "—" : bookings.length} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="surface-card rounded-2xl p-6">
          <h2 className="font-mono font-bold text-sm mb-6">Monthly activity by week</h2>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="leads" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="bookings" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="surface-card rounded-2xl p-6">
          <h2 className="font-mono font-bold text-sm mb-6">Call outcomes</h2>
          {outcomeData.length ? <ResponsiveContainer width="100%" height={290}>
            <PieChart><Pie data={outcomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
              {outcomeData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
            </Pie><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} /></PieChart>
          </ResponsiveContainer> : <div className="h-[290px] grid place-items-center text-sm text-silver">No live call outcomes yet.</div>}
        </section>
      </div>

      <section className="surface-card rounded-2xl p-6">
        <h2 className="font-mono font-bold text-sm">Conversion funnel</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            ["Calls", calls.length], ["Leads", leads.length], ["Qualified", qualifiedLeads.length], ["Booked", bookings.length],
          ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-border p-4"><p className="text-xs text-silver uppercase font-mono">{label}</p><p className="text-2xl font-display font-bold mt-2">{value}</p></div>)}
        </div>
      </section>
    </div>
  );
};

export default Analytics;
