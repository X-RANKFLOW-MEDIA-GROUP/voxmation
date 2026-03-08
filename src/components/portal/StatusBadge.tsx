const statusStyles: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  paused: "text-warning bg-warning/10 border-warning/20",
  completed: "text-primary bg-primary/10 border-primary/20",
  confirmed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelled: "text-destructive bg-destructive/10 border-destructive/20",
  missed: "text-destructive bg-destructive/10 border-destructive/20",
  recovered: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  new: "text-primary bg-primary/10 border-primary/20",
  contacted: "text-warning bg-warning/10 border-warning/20",
  qualified: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  booked: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  lost: "text-destructive bg-destructive/10 border-destructive/20",
  connected: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  disconnected: "text-silver bg-muted border-border",
  error: "text-destructive bg-destructive/10 border-destructive/20",
  open: "text-primary bg-primary/10 border-primary/20",
  in_progress: "text-warning bg-warning/10 border-warning/20",
  resolved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  closed: "text-silver bg-muted border-border",
  draft: "text-silver bg-muted border-border",
  no_show: "text-destructive bg-destructive/10 border-destructive/20",
  positive: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  neutral: "text-warning bg-warning/10 border-warning/20",
  negative: "text-destructive bg-destructive/10 border-destructive/20",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider border ${
      statusStyles[status] || "text-silver bg-muted border-border"
    }`}
  >
    {status.replace(/_/g, " ")}
  </span>
);

export default StatusBadge;
