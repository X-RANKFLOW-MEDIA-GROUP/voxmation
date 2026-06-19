import { JobListing } from "@/data/jobListings";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";

interface JobCardProps {
  job: JobListing;
}

export default function JobCard({ job }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Reveal scale>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
        className="surface-card rounded-2xl overflow-hidden relative group hover:border-primary/15 transition-all duration-500"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="p-8 relative z-10">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
              <h3 className="text-2xl font-display font-bold text-silver-bright tracking-tight">
                {job.title}
              </h3>
              <span className="text-xs font-mono tracking-widest uppercase text-primary/70 w-fit">
                {job.department}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-silver/80">
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.type}</span>
            </div>
          </div>

          {/* Compensation Highlight */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-xs font-mono tracking-widest uppercase text-primary/70 mb-3">
              Compensation Structure
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-silver/70 font-medium mb-1">Trial Bonus</p>
                <p className="text-lg font-display font-bold text-primary">
                  {job.compensation.trialBonus}
                </p>
              </div>
              <div>
                <p className="text-xs text-silver/70 font-medium mb-1">Retention Bonus</p>
                <p className="text-lg font-display font-bold text-primary">
                  {job.compensation.retentionBonus}
                </p>
              </div>
              <div>
                <p className="text-xs text-silver/70 font-medium mb-1">Monthly Potential</p>
                <p className="text-lg font-display font-bold text-primary">
                  {job.compensation.potential}
                </p>
              </div>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-silver leading-relaxed mb-6">{job.description}</p>

          {/* Expandable Content */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6 pt-6 border-t border-border">
              {/* Responsibilities */}
              <div>
                <h4 className="text-sm font-mono tracking-widest uppercase text-primary/70 mb-3">
                  What You'll Do
                </h4>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex gap-3 text-silver text-sm">
                      <span className="text-primary font-bold flex-shrink-0">→</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-sm font-mono tracking-widest uppercase text-primary/70 mb-4">
                  What We're Looking For
                </h4>
                <div className="space-y-4">
                  {job.requirements.map((req, idx) => (
                    <div key={idx}>
                      <h5 className="text-sm font-medium text-silver-bright mb-2">
                        {req.category}
                      </h5>
                      <ul className="space-y-1 ml-4">
                        {req.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex gap-2 text-xs text-silver">
                            <span className="text-primary">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-sm font-mono tracking-widest uppercase text-primary/70 mb-4">
                  Benefits
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, idx) => (
                    <div key={idx} className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
                      <p className="text-lg mb-1">{benefit.icon}</p>
                      <p className="text-sm font-medium text-silver-bright">
                        {benefit.title}
                      </p>
                      <p className="text-xs text-silver/70 mt-1">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Join Us */}
              <div>
                <h4 className="text-sm font-mono tracking-widest uppercase text-primary/70 mb-3">
                  Why Join Voxmation?
                </h4>
                <ul className="space-y-2">
                  {job.whyJoinUs.map((reason, idx) => (
                    <li key={idx} className="flex gap-3 text-silver text-sm">
                      <span className="text-primary font-bold flex-shrink-0">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Toggle & Apply Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border mt-6">
            <Button
              variant="neon-outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1"
            >
              {isExpanded ? "Show Less" : "Show More Details"}
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
            <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
              <a href={job.applyUrl}>Apply Now</a>
            </Button>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}
