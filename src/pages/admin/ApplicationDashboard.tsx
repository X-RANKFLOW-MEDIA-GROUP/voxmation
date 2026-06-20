import { useState, useEffect } from "react";
import { JobApplication } from "@/types/jobApplication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  reviewed: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  shortlisted: "bg-green-500/10 text-green-400 border-green-500/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  hired: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

const statusIcons = {
  new: Clock,
  reviewed: Eye,
  shortlisted: CheckCircle2,
  rejected: XCircle,
  hired: CheckCircle2,
};

export default function ApplicationDashboard() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await fetch("/api/jobs/applications");
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || app.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === appId ? { ...app, status: newStatus as any } : app
          )
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-silver">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-silver-bright mb-2">
            Job Applications
          </h1>
          <p className="text-silver">
            Review and manage all incoming job applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {["new", "reviewed", "shortlisted", "rejected", "hired"].map(
            (status) => {
              const count = applications.filter(
                (app) => app.status === status
              ).length;
              const Icon = statusIcons[status as keyof typeof statusIcons];
              return (
                <motion.div
                  key={status}
                  whileHover={{ y: -2 }}
                  className="surface-card p-4 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-xs uppercase font-mono text-primary/70">
                      {status}
                    </span>
                  </div>
                  <p className="text-2xl font-display font-bold text-silver-bright">
                    {count}
                  </p>
                </motion.div>
              );
            }
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-silver/50" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-primary/5 border-primary/20"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg text-silver-bright"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>

        {/* Applications Table */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-silver">No applications found</p>
            </div>
          ) : (
            filteredApplications.map((app) => {
              const StatusIcon = statusIcons[app.status];
              return (
                <motion.div
                  key={app.id}
                  whileHover={{ y: -2 }}
                  className="surface-card p-6 rounded-lg cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="grid md:grid-cols-12 gap-4 items-center">
                    {/* Status */}
                    <div className="md:col-span-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusColors[app.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        <span className="text-xs uppercase font-mono">
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="md:col-span-3">
                      <p className="font-medium text-silver-bright">
                        {app.fullName}
                      </p>
                      <p className="text-xs text-silver/70">{app.jobTitle}</p>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-3">
                      <p className="text-sm text-silver/80">{app.email}</p>
                      <p className="text-xs text-silver/70">{app.phone}</p>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-2">
                      <p className="text-sm text-silver/80">
                        {new Date(app.appliedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex gap-2 justify-end">
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded hover:bg-primary/10 transition-colors"
                          title="Download Resume"
                        >
                          <Download className="h-4 w-4 text-primary" />
                        </a>
                      )}
                      <a
                        href={`mailto:${app.email}`}
                        className="p-2 rounded hover:bg-primary/10 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4 text-primary" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail Modal */}
        {selectedApp && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              className="surface-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-silver-bright">
                      {selectedApp.fullName}
                    </h2>
                    <p className="text-sm text-silver/70 mt-1">
                      Applied for: {selectedApp.jobTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-silver/70 hover:text-silver"
                  >
                    ✕
                  </button>
                </div>

                {/* Status Update */}
                <div className="mb-6 pb-6 border-b border-border">
                  <label className="block text-sm font-medium text-silver-bright mb-3">
                    Update Status
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["new", "reviewed", "shortlisted", "rejected", "hired"].map(
                      (status) => (
                        <Button
                          key={status}
                          variant={
                            selectedApp.status === status
                              ? "neon"
                              : "neon-outline"
                          }
                          size="sm"
                          onClick={() => {
                            updateStatus(selectedApp.id, status);
                            setSelectedApp({
                              ...selectedApp,
                              status: status as any,
                            });
                          }}
                        >
                          {status}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-6 pb-6 border-b border-border">
                  <h3 className="text-sm font-mono uppercase text-primary/70 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-silver">
                      <span className="text-silver/70">Email:</span>{" "}
                      <a
                        href={`mailto:${selectedApp.email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedApp.email}
                      </a>
                    </p>
                    <p className="text-silver">
                      <span className="text-silver/70">Phone:</span>{" "}
                      <a
                        href={`tel:${selectedApp.phone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedApp.phone}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Answers */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-mono uppercase text-primary/70 mb-2">
                      Years of Sales Experience
                    </h4>
                    <p className="text-silver">
                      {selectedApp.answers.yearsExperience}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-mono uppercase text-primary/70 mb-2">
                      Greatest Achievement
                    </h4>
                    <p className="text-silver whitespace-pre-wrap">
                      {selectedApp.answers.greatestAchievement}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-mono uppercase text-primary/70 mb-2">
                      Why Interested
                    </h4>
                    <p className="text-silver whitespace-pre-wrap">
                      {selectedApp.answers.whyInterested}
                    </p>
                  </div>

                  {selectedApp.answers.additionalInfo && (
                    <div>
                      <h4 className="text-sm font-mono uppercase text-primary/70 mb-2">
                        Additional Information
                      </h4>
                      <p className="text-silver whitespace-pre-wrap">
                        {selectedApp.answers.additionalInfo}
                      </p>
                    </div>
                  )}

                  {selectedApp.resumeUrl && (
                    <div>
                      <a
                        href={selectedApp.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        Download Resume
                      </a>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="mt-8 pt-6 border-t border-border text-xs text-silver/70">
                  <p>
                    Applied:{" "}
                    {new Date(selectedApp.appliedAt).toLocaleString("en-US")}
                  </p>
                  <p>Application ID: {selectedApp.id}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
