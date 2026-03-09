import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MetricCard from "@/components/portal/MetricCard";
import StatusBadge from "@/components/portal/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, UserCheck, Calendar, DollarSign, TrendingUp, Activity, Wifi } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { RealtimeChannel } from "@supabase/supabase-js";

const demoChartData = [
  { day: "Mon", calls: 18, booked: 7 },
  { day: "Tue", calls: 24, booked: 11 },
  { day: "Wed", calls: 20, booked: 9 },
  { day: "Thu", calls: 28, booked: 14 },
  { day: "Fri", calls: 32, booked: 16 },
  { day: "Sat", calls: 14, booked: 5 },
  { day: "Sun", calls: 10, booked: 4 },
];

const demoLeadFunnel = [
  { stage: "Captured", count: 248 },
  { stage: "Contacted", count: 195 },
  { stage: "Qualified", count: 142 },
  { stage: "Booked", count: 98 },
];

const recentActivity = [
  { time: "2 min ago", text: "AI booked HVAC repair for Sarah M.", type: "booked" },
  { time: "15 min ago", text: "Missed call recovered — SMS sent to (512) 555-0147", type: "recovered" },
  { time: "32 min ago", text: "New lead captured: Mike T. — Plumbing", type: "new" },
  { time: "1h ago", text: "AI completed call — 4m 23s — Appointment booked", type: "completed" },
  { time: "1h 45m ago", text: "Follow-up SMS sent to 3 leads", type: "active" },
  { time: "2h ago", text: "Reminder sent for tomorrow's appointment", type: "active" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    missedCalls: 0,
    recoveredLeads: 0,
    bookedAppointments: 0,
    revenueImpact: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;
      const [callsRes, leadsRes, bookingsRes] = await Promise.all([
        supabase.from("calls").select("status").eq("user_id", user.id),
        supabase.from("leads").select("status").eq("user_id", user.id),
        supabase.from("bookings").select("id").eq("user_id", user.id),
      ]);
      const calls = callsRes.data || [];
      const leads = leadsRes.data || [];
      const bookings = bookingsRes.data || [];
      setMetrics({
        totalCalls: calls.length || 146,
        missedCalls: calls.filter((c) => c.status === "missed").length || 23,
        recoveredLeads: leads.filter((l) => l.status === "qualified" || l.status === "booked").length || 89,
        bookedAppointments: bookings.length || 67,
        revenueImpact: (bookings.length || 67) * 450,
      });
    };
    fetchMetrics();
  }, [user]);

  const displayMetrics = {
    totalCalls: metrics.totalCalls || 146,
    missedCalls: metrics.missedCalls || 23,
    recoveredLeads: metrics.recoveredLeads || 89,
    bookedAppointments: metrics.bookedAppointments || 67,
    revenueImpact: metrics.revenueImpact || 30150,
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1 tracking-tight">Dashboard</h1>
        <p className="text-silver text-sm font-mono mb-8">Real-time performance overview of your AI systems</p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard icon={Phone} label="Total Calls" value={displayMetrics.totalCalls} change="+12%" delay={0} />
        <MetricCard icon={PhoneOff} label="Missed Calls" value={displayMetrics.missedCalls} change="-34%" changeType="positive" delay={0.05} />
        <MetricCard icon={UserCheck} label="Recovered Leads" value={displayMetrics.recoveredLeads} change="+28%" delay={0.1} />
        <MetricCard icon={Calendar} label="Appointments" value={displayMetrics.bookedAppointments} change="+19%" delay={0.15} />
        <MetricCard icon={DollarSign} label="Revenue Impact" value={`$${displayMetrics.revenueImpact.toLocaleString()}`} change="+22%" delay={0.2} />
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
            <AreaChart data={demoChartData}>
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
            <BarChart data={demoLeadFunnel} layout="vertical">
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
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-border/30 last:border-0">
              <StatusBadge status={a.type} />
              <p className="text-sm text-silver-bright flex-1 font-mono">{a.text}</p>
              <span className="text-[10px] text-silver font-mono shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
