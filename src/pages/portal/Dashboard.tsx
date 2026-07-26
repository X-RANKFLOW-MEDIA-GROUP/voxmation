import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MetricCard from "@/components/portal/MetricCard";
import StatusBadge from "@/components/portal/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, UserCheck, Calendar, Clock3, TrendingUp, Activity, Wifi } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type ActivityType = "booked" | "recovered" | "new" | "completed" | "active";

type ActivityItem = {
  time: string;
  text: string;
  type: ActivityType;
};

const getPayloadRecord = <T extends object>(payload: RealtimePostgresChangesPayload<T>) =>
  (payload.new ?? {}) as Partial<T>;

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    missedCalls: 0,
    recoveredLeads: 0,
    bookedAppointments: 0,
    callMinutes: 0,
  });
  const [chartData, setChartData] = useState<Array<{ day: string; calls: number; booked: number }>>([]);
  const [leadFunnel, setLeadFunnel] = useState<Array<{ stage: string; count: number }>>([]);
  const [liveActivity, setLiveActivity] = useState<ActivityItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const fetchMetrics = useCallback(async () => {
    if (!user) return;
    const [callsRes, leadsRes, bookingsRes] = await Promise.all([
      supabase.from("calls").select("status, outcome, duration_seconds, created_at").eq("user_id", user.id).eq("is_test", false),
      supabase.from("leads").select("status, created_at").eq("user_id", user.id),
      supabase.from("bookings").select("id, created_at").eq("user_id", user.id),
    ]);
    const calls = callsRes.data || [];
    const leads = leadsRes.data || [];
    const bookings = bookingsRes.data || [];
    setMetrics({
      totalCalls: calls.length,
      missedCalls: calls.filter((c) => c.status === "missed").length,
      recoveredLeads: leads.filter((l) => l.status === "qualified" || l.status === "booked").length,
      bookedAppointments: bookings.length,
      callMinutes: Math.round(calls.reduce((total, call) => total + (call.duration_seconds || 0), 0) / 60),
    });
    const days = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - offset));
      const next = new Date(date.getTime() + 86400000);
      return {
        day: date.toLocaleDateString([], { weekday: "short" }),
        calls: calls.filter((call) => new Date(call.created_at) >= date && new Date(call.created_at) < next).length,
        booked: bookings.filter((booking) => new Date(booking.created_at) >= date && new Date(booking.created_at) < next).length,
      };
    });
    setChartData(days);
    setLeadFunnel([
      { stage: "Captured", count: leads.length },
      { stage: "Contacted", count: leads.filter((lead) => lead.status !== "new").length },
      { stage: "Qualified", count: leads.filter((lead) => ["qualified", "booked"].includes(lead.status || "")).length },
      { stage: "Booked", count: leads.filter((lead) => lead.status === "booked").length },
    ]);
  }, [user]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel('dashboard-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'calls', filter: `user_id=eq.${user.id}` },
          (payload: RealtimePostgresChangesPayload<Database["public"]["Tables"]["calls"]["Row"]>) => {
            console.log('Call update:', payload);
            fetchMetrics();
            const call = getPayloadRecord(payload);
            const newActivity: ActivityItem = {
              time: "Just now",
              text: payload.eventType === 'INSERT' 
                ? `New call received from ${call.caller_name || "Unknown"}`
                : `Call status updated`,
              type: call.status === "missed" ? "recovered" : "completed",
            };
            setLiveActivity(prev => [newActivity, ...prev.slice(0, 5)]);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${user.id}` },
          (payload: RealtimePostgresChangesPayload<Database["public"]["Tables"]["leads"]["Row"]>) => {
            console.log('Lead update:', payload);
            fetchMetrics();
            const lead = getPayloadRecord(payload);
            const newActivity: ActivityItem = {
              time: "Just now",
              text: payload.eventType === 'INSERT'
                ? `New lead captured: ${lead.name || "Unknown"}`
                : `Lead ${lead.name || ""} status updated to ${lead.status || "unknown"}`,
              type: "new",
            };
            setLiveActivity(prev => [newActivity, ...prev.slice(0, 5)]);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` },
          (payload: RealtimePostgresChangesPayload<Database["public"]["Tables"]["bookings"]["Row"]>) => {
            console.log('Booking update:', payload);
            fetchMetrics();
            const booking = getPayloadRecord(payload);
            const newActivity: ActivityItem = {
              time: "Just now",
              text: payload.eventType === 'INSERT'
                ? `New appointment booked: ${booking.title || "Service"}`
                : `Booking updated`,
              type: "booked",
            };
            setLiveActivity(prev => [newActivity, ...prev.slice(0, 5)]);
          }
        )
        .subscribe((status) => {
          console.log('Realtime status:', status);
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, fetchMetrics]);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Dashboard</h1>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono ${
            isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-silver'
          }`}>
            <Wifi className={`h-3 w-3 ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'Live' : 'Connecting...'}
          </div>
        </div>
        <p className="text-silver text-sm font-mono mb-8">Real-time performance overview of your AI systems</p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard icon={Phone} label="Total Calls" value={metrics.totalCalls} delay={0} />
        <MetricCard icon={PhoneOff} label="Missed Calls" value={metrics.missedCalls} delay={0.05} />
        <MetricCard icon={UserCheck} label="Qualified Leads" value={metrics.recoveredLeads} delay={0.1} />
        <MetricCard icon={Calendar} label="Appointments" value={metrics.bookedAppointments} delay={0.15} />
        <MetricCard icon={Clock3} label="Call Minutes" value={metrics.callMinutes} delay={0.2} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="surface-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-4 w-4 text-primary/60" />
            <h3 className="text-sm font-mono font-bold text-foreground tracking-wide">Call Volume (This Week)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              />
              <Area type="monotone" dataKey="calls" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#callGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="surface-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-primary/60" />
            <h3 className="text-sm font-mono font-bold text-foreground tracking-wide">Lead Funnel</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leadFunnel} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="surface-card rounded-2xl p-6"
      >
        <h3 className="text-sm font-mono font-bold text-foreground tracking-wide mb-5">Recent Activity</h3>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {liveActivity.length === 0 ? <p className="text-sm text-silver py-4">Real call, lead, and booking events will appear here.</p> : liveActivity.map((a, i) => (
              <motion.div
                key={`${a.time}-${a.text}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 py-2 border-b border-border/30 last:border-0"
              >
                <StatusBadge status={a.type} />
                <p className="text-sm text-silver-bright flex-1 font-mono">{a.text}</p>
                <span className="text-[10px] text-silver font-mono shrink-0">{a.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
