import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import JobApplicationForm from "@/components/jobs/JobApplicationForm";
import { jobListings } from "@/data/jobListings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ApplyJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const job = jobListings.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Job Not Found | Voxmation"
          description="The job position you're looking for could not be found."
          path="/jobs"
        />
        <Navbar />
        <main className="py-40 text-center">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl font-display font-bold text-silver-bright mb-4">
              Position Not Found
            </h1>
            <p className="text-silver mb-8">
              The job position you're looking for could not be found.
            </p>
            <Button
              onClick={() => navigate("/jobs")}
              variant="neon"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Apply: ${job.title} | Voxmation`}
        description={`Apply for the ${job.title} position at Voxmation. Remote sales opportunity with competitive compensation.`}
        path={`/jobs/${jobId}/apply`}
      />
      <Navbar />

      <main>
        {/* Header */}
        <section className="pt-40 pb-20 md:pt-48 md:pb-28 relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />
          <div className="container mx-auto px-6 relative z-10 max-w-4xl">
            <div className="mb-6">
              <Button
                variant="neon-outline"
                onClick={() => navigate("/jobs")}
                className="mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </div>

            <div>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                Apply Now
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
                {job.title}
              </h1>
              <p className="text-silver text-lg leading-relaxed max-w-2xl">
                Submit your application for the {job.title} position. We'll
                review your resume and answers, and get back to you within 3-5
                business days.
              </p>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-2xl">
            <JobApplicationForm
              jobId={job.id}
              jobTitle={job.title}
              onSubmitSuccess={() => {
                setTimeout(() => {
                  navigate("/jobs");
                }, 3000);
              }}
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-primary/10">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-display font-bold text-silver-bright mb-12">
              Application FAQ
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-display font-semibold text-silver-bright mb-2">
                  When will I hear back?
                </h3>
                <p className="text-silver">
                  We review applications on a rolling basis and aim to respond
                  within 3-5 business days. If we'd like to move forward, we'll
                  schedule a brief phone screening.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold text-silver-bright mb-2">
                  What format should my resume be in?
                </h3>
                <p className="text-silver">
                  We accept PDF or Word documents (.pdf, .doc, .docx). Please
                  keep your resume under 5MB and ensure contact information is
                  clearly visible.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold text-silver-bright mb-2">
                  Is this a fully remote position?
                </h3>
                <p className="text-silver">
                  Yes! This is a fully remote position. You can work from
                  anywhere with a reliable internet connection. All you need is
                  a computer, phone, and quiet space for calls.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold text-silver-bright mb-2">
                  What's the commission structure?
                </h3>
                <p className="text-silver">
                  You earn $50 for each 7-day trial you book and $100 for each
                  customer that fidelizes. There's no cap on commissions—the more
                  you sell, the more you earn. With 40-50 trials per month, most
                  reps earn $2,000-$5,000+ monthly.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold text-silver-bright mb-2">
                  Do you provide training?
                </h3>
                <p className="text-silver">
                  Absolutely! We provide comprehensive training on our product,
                  sales techniques, and objection handling. You'll have ongoing
                  support and coaching from experienced sales managers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
