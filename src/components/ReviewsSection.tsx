import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";

const reviews = [
  { name: "Daniel Kim", role: "Operations Lead at Flowbyte", quote: "Truly impressive. The AI assistant is fast, accurate, and blends into our daily ops without friction." },
  { name: "Priya Mehra", role: "CTO at Brightstack Labs", quote: "Game-changer. Automation flows run flawlessly. Our team now focuses only on what really matters." },
  { name: "Elena Rodriguez", role: "Product Manager at Nexora", quote: "Smooth setup. Their system replaced three tools. We saw improvements in just the first week." },
  { name: "Marcus Thompson", role: "Marketing Director at OrbitShift", quote: "Surprisingly simple. The AI adapts quickly. Our campaigns are now running 2x more efficiently." },
  { name: "Sarah Wong", role: "Analytics Manager at Corelink", quote: "Huge time-saver. Data is better organized. The insights we get now are actionable and fast." },
  { name: "Ravi Shah", role: "COO at PixelNest Solutions", quote: "Very intuitive. No fluff, just performance. Our internal processes finally feel under control." },
];

const ReviewsSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <Reveal>
          <span className="text-xs tracking-[0.2em] uppercase text-silver block mb-4 text-center">
            Reviews
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-foreground mb-4 text-center">
            Trusted by Visionaries
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver mb-16 max-w-lg mx-auto text-center">
            Hear from real users who achieved success with our automation
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={0.05 * i}>
              <div className="surface-card rounded-2xl p-7 h-full flex flex-col group hover:bg-accent/50 transition-all duration-500">
                <p className="text-foreground text-sm leading-relaxed mb-6 flex-1">
                  "{r.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-xs font-medium text-silver-bright">
                      {r.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-silver">{r.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Logo ticker */}
        <div className="relative mt-20 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex animate-ticker">
            {[...Array(3)].flatMap((_, setIdx) =>
              ["Slack", "HubSpot", "Notion", "Zapier", "Stripe"].map((logo, i) => (
                <div
                  key={`${setIdx}-${i}`}
                  className="shrink-0 mx-10 flex items-center justify-center h-12"
                >
                  <span className="text-lg font-display text-muted-foreground/30 tracking-wider whitespace-nowrap">
                    {logo}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
