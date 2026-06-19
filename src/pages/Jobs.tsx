import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import { jobListings } from "@/data/jobListings";
import JobCard from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Jobs() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const filteredJobs = selectedJob
    ? jobListings.filter((job) => job.id === selectedJob)
    : jobListings;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Jobs at Voxmation | Join Our Sales & Product Team"
        description="Join Voxmation team. Explore career opportunities in sales and more. Competitive compensation, unlimited earning potential, and remote work."
        path="/jobs"
      />
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 md:pt-48 md:pb-28 relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />
          <div className="container mx-auto px-6 relative z-10 max-w-4xl">
            <div className="text-center mb-14">
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                Join Our Team
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
                Build Your Sales Career at Voxmation
              </h1>
              <p className="text-silver text-lg leading-relaxed max-w-2xl mx-auto">
                Help businesses close more deals with AI-powered voice agents.
                Unlimited earning potential, remote work, and real growth opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Filter */}
        <section className="py-8 border-t border-primary/10">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={selectedJob === null ? "neon" : "neon-outline"}
                onClick={() => setSelectedJob(null)}
              >
                All Positions
              </Button>
              {jobListings.map((job) => (
                <Button
                  key={job.id}
                  variant={selectedJob === job.id ? "neon" : "neon-outline"}
                  onClick={() => setSelectedJob(job.id)}
                >
                  {job.title}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Jobs Listing */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-silver text-lg">No jobs found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-primary/10">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <h2 className="text-3xl font-display font-bold text-silver-bright mb-4">
              Don't see the right position?
            </h2>
            <p className="text-silver text-lg leading-relaxed mb-8">
              We're always looking for talented people. Send us your resume and
              let's talk about how you can grow with Voxmation.
            </p>
            <Button
              size="lg"
              variant="neon"
              asChild
            >
              <a href="mailto:careers@voxmation.com">
                Email Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
