import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/portal/StatusBadge";
import { motion } from "framer-motion";
import { LifeBuoy, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Ticket = { id: string; subject: string; priority: string | null; status: string | null; category: string | null; created_at: string | null; updated_at: string | null };

const Support = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const loadTickets = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("support_tickets").select("id, subject, priority, status, category, created_at, updated_at").eq("user_id", user.id).order("created_at", { ascending: false });
    setTickets((data || []) as Ticket[]);
  }, [user]);
  useEffect(() => { void loadTickets(); }, [loadTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      category,
    });

    if (error) {
      toast.error("Failed to create ticket");
    } else {
      toast.success("Support ticket created");
      setShowForm(false);
      setSubject("");
      setDescription("");
      await loadTickets();
    }
    setSubmitting(false);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <LifeBuoy className="h-5 w-5 text-primary/60" />
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Support</h1>
            </div>
            <p className="text-silver text-sm font-mono">Get help from the Voxmation team</p>
          </div>
          <Button variant="neon" size="sm" className="gap-2" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "New Ticket"}
          </Button>
        </div>
      </motion.div>

      {/* New Ticket Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="surface-card rounded-2xl p-6 mb-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-silver tracking-wider uppercase mb-2 block">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Describe your issue" required className="bg-background border-border font-mono text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-silver tracking-wider uppercase mb-2 block">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm font-mono text-foreground">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-silver tracking-wider uppercase mb-2 block">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm font-mono text-foreground">
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="feature_request">Feature Request</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-silver tracking-wider uppercase mb-2 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details..." rows={4} className="bg-background border-border font-mono text-sm" />
          </div>
          <Button type="submit" variant="neon" size="sm" className="gap-2" disabled={submitting}>
            <Send className="h-3.5 w-3.5" />
            Submit Ticket
          </Button>
        </motion.form>
      )}

      {/* Tickets */}
      <div className="surface-card rounded-2xl overflow-hidden">
        <div className="px-6 py-3 border-b border-border/50">
          <p className="text-[10px] font-mono text-silver tracking-wider uppercase">Your Tickets</p>
        </div>
        {tickets.length === 0 && <div className="px-6 py-12 text-center text-sm text-silver">No support tickets.</div>}
        {tickets.map((ticket, i) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="px-6 py-4 border-b border-border/30 last:border-0 hover:bg-primary/3 transition-colors flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-bold text-foreground truncate">{ticket.subject}</p>
              <p className="text-[10px] font-mono text-silver">Created {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "—"} · Updated {ticket.updated_at ? new Date(ticket.updated_at).toLocaleString() : "—"}</p>
            </div>
            <StatusBadge status={(ticket.category || "general").replace("_", " ")} />
            <StatusBadge status={ticket.priority || "medium"} />
            <StatusBadge status={ticket.status || "open"} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Support;
