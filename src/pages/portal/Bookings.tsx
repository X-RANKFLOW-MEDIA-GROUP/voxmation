import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/portal/StatusBadge";
import MetricCard from "@/components/portal/MetricCard";
import { motion } from "framer-motion";
import { Calendar, CalendarCheck, CalendarX, Clock } from "lucide-react";

interface Booking {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  status: string | null;
  service_type: string | null;
  created_at: string;
}

const demoBookings: Booking[] = [
  { id: "1", title: "AC Repair — Sarah Mitchell", description: "Emergency AC unit not cooling", scheduled_at: new Date(Date.now() + 3600000).toISOString(), duration_minutes: 60, status: "confirmed", service_type: "HVAC", created_at: new Date().toISOString() },
  { id: "2", title: "Panel Upgrade Estimate — James Wilson", description: "200A panel upgrade, residential", scheduled_at: new Date(Date.now() + 86400000).toISOString(), duration_minutes: 90, status: "confirmed", service_type: "Electrical", created_at: new Date().toISOString() },
  { id: "3", title: "Plumbing Repair — Maria Gonzalez", description: "Kitchen sink leak", scheduled_at: new Date(Date.now() + 172800000).toISOString(), duration_minutes: 60, status: "confirmed", service_type: "Plumbing", created_at: new Date().toISOString() },
  { id: "4", title: "Maintenance Check — David Chen", description: "Annual HVAC maintenance", scheduled_at: new Date(Date.now() + 259200000).toISOString(), duration_minutes: 45, status: "confirmed", service_type: "HVAC", created_at: new Date().toISOString() },
  { id: "5", title: "Water Heater Install — Emily Rodriguez", description: "50gal tank replacement", scheduled_at: new Date(Date.now() - 86400000).toISOString(), duration_minutes: 120, status: "completed", service_type: "Plumbing", created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: "6", title: "Drain Cleaning — Michael Park", description: "Kitchen drain clog", scheduled_at: new Date(Date.now() - 172800000).toISOString(), duration_minutes: 60, status: "completed", service_type: "Plumbing", created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: "7", title: "AC Tune-Up — Robert K.", description: "Seasonal maintenance", scheduled_at: new Date(Date.now() - 43200000).toISOString(), duration_minutes: 45, status: "no_show", service_type: "HVAC", created_at: new Date(Date.now() - 86400000).toISOString() },
];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString([], { weekday: "short" }),
    date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase.from("bookings").select("*").eq("user_id", user.id).order("scheduled_at", { ascending: true });
      setBookings(data && data.length > 0 ? data : demoBookings);
    };
    fetchBookings();

    const channel = supabase
      .channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const upcoming = bookings.filter((b) => new Date(b.scheduled_at) >= new Date() && b.status !== "cancelled");
  const past = bookings.filter((b) => new Date(b.scheduled_at) < new Date() || b.status === "cancelled");

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-1">
          <Calendar className="h-5 w-5 text-primary/60" />
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Bookings</h1>
        </div>
        <p className="text-silver text-sm font-mono mb-8">All appointments booked by your AI system</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={CalendarCheck} label="This Week" value={upcoming.length} change="+3 vs last" delay={0} />
        <MetricCard icon={Calendar} label="Total Booked" value={bookings.length} change="+19%" delay={0.05} />
        <MetricCard icon={CalendarX} label="No-Shows" value={1} change="-89%" delay={0.1} />
        <MetricCard icon={Clock} label="Avg Duration" value="62 min" delay={0.15} />
      </div>

      {/* Upcoming */}
      <h2 className="text-sm font-mono font-bold text-foreground tracking-wide mb-4">Upcoming</h2>
      <div className="space-y-3 mb-10">
        {upcoming.map((b, i) => {
          const f = formatDate(b.scheduled_at);
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="surface-card rounded-2xl px-6 py-4 flex items-center gap-5 hover:border-primary/15 transition-all"
            >
              <div className="text-center shrink-0 w-14">
                <p className="text-[10px] font-mono text-silver uppercase">{f.day}</p>
                <p className="text-lg font-mono font-bold text-foreground">{f.date.split(" ")[1]}</p>
                <p className="text-[10px] font-mono text-silver">{f.date.split(" ")[0]}</p>
              </div>
              <div className="h-12 w-px bg-border/50" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono font-bold text-foreground truncate">{b.title}</p>
                <p className="text-[11px] font-mono text-silver">{f.time} · {b.duration_minutes}min · {b.service_type}</p>
              </div>
              <StatusBadge status={b.status || "confirmed"} />
            </motion.div>
          );
        })}
      </div>

      {/* Past */}
      <h2 className="text-sm font-mono font-bold text-foreground tracking-wide mb-4">Past</h2>
      <div className="space-y-2">
        {past.map((b, i) => {
          const f = formatDate(b.scheduled_at);
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="surface-card rounded-xl px-6 py-3 flex items-center gap-5 opacity-60"
            >
              <div className="text-center shrink-0 w-14">
                <p className="text-xs font-mono text-silver">{f.date}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-silver truncate">{b.title}</p>
              </div>
              <StatusBadge status={b.status || "completed"} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Bookings;
