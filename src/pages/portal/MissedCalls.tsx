import { motion } from "framer-motion";
import { PhoneOff, MessageSquare, CheckCircle2, Clock } from "lucide-react";
import MetricCard from "@/components/portal/MetricCard";
import StatusBadge from "@/components/portal/StatusBadge";

const demoMissedCalls = [
  { id: "1", phone: "(512) 555-0147", time: "9:47 PM", date: "Today", smsStatus: "delivered", smsText: "Hi! We missed your call. How can we help?", replied: true, replyText: "I need AC repair ASAP", converted: true },
  { id: "2", phone: "(512) 555-0203", time: "6:12 PM", date: "Today", smsStatus: "delivered", smsText: "Sorry we missed you! Want to schedule a service?", replied: true, replyText: "Yes, tomorrow morning works", converted: true },
  { id: "3", phone: "(512) 555-0089", time: "2:30 PM", date: "Today", smsStatus: "delivered", smsText: "Hi! We missed your call. How can we help?", replied: false, replyText: "", converted: false },
  { id: "4", phone: "(512) 555-0331", time: "11:45 AM", date: "Yesterday", smsStatus: "delivered", smsText: "Sorry we missed you! Want to schedule a service?", replied: true, replyText: "What are your prices for drain cleaning?", converted: true },
  { id: "5", phone: "(512) 555-0176", time: "8:20 PM", date: "Yesterday", smsStatus: "delivered", smsText: "Hi! We missed your call. How can we help?", replied: true, replyText: "Just checking if you service my area", converted: false },
  { id: "6", phone: "(512) 555-0442", time: "3:15 PM", date: "Yesterday", smsStatus: "delivered", smsText: "Sorry we missed you! Want to schedule a service?", replied: false, replyText: "", converted: false },
];

const MissedCalls = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-3 mb-1">
        <PhoneOff className="h-5 w-5 text-primary/60" />
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Missed Call Recovery</h1>
      </div>
      <p className="text-silver text-sm font-mono mb-8">Automated SMS follow-up on every missed call</p>
    </motion.div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard icon={PhoneOff} label="Missed Calls" value={23} change="This month" changeType="neutral" delay={0} />
      <MetricCard icon={MessageSquare} label="SMS Sent" value={23} change="100%" delay={0.05} />
      <MetricCard icon={CheckCircle2} label="Replied" value={16} change="70%" delay={0.1} />
      <MetricCard icon={Clock} label="Converted" value={11} change="48%" delay={0.15} />
    </div>

    <div className="surface-card rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/50 text-[10px] font-mono text-silver tracking-wider uppercase">
        <span className="col-span-2">Phone</span>
        <span className="col-span-1">Time</span>
        <span className="col-span-3">SMS Sent</span>
        <span className="col-span-3">Reply</span>
        <span className="col-span-1">Status</span>
        <span className="col-span-2">Outcome</span>
      </div>

      {demoMissedCalls.map((call, i) => (
        <motion.div
          key={call.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border/30 last:border-0 hover:bg-primary/3 transition-colors items-center"
        >
          <span className="col-span-2 text-xs font-mono text-foreground">{call.phone}</span>
          <span className="col-span-1 text-[11px] font-mono text-silver">{call.time}<br /><span className="text-silver/50">{call.date}</span></span>
          <span className="col-span-3 text-xs font-mono text-silver truncate">{call.smsText}</span>
          <span className="col-span-3 text-xs font-mono text-silver-bright truncate">{call.replied ? call.replyText : "—"}</span>
          <span className="col-span-1"><StatusBadge status={call.replied ? "recovered" : "missed"} /></span>
          <span className="col-span-2"><StatusBadge status={call.converted ? "booked" : call.replied ? "contacted" : "new"} /></span>
        </motion.div>
      ))}
    </div>
  </div>
);

export default MissedCalls;
