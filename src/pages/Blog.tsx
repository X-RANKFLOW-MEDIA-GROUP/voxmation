import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  const posts = Object.values(blogPosts);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://voxmation.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://voxmation.com/blog" },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Voxmation Blog",
    description: "Insights, guides, and strategies for AI voice agents in home service businesses.",
    url: "https://voxmation.com/blog",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Blog | AI Voice Agents, Lead Generation, & Service Business Growth"
        description="Latest insights, guides, and strategies for using AI voice agents to grow home service businesses. HVAC, plumbing, electrical, and more."
        path="/blog"
        jsonLd={[breadcrumbSchema, collectionSchema]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 relative noise-overlay">
        <div className="absolute inset-0 gradient-radial-hero pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                Resources
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                AI Voice Agent Resources & Guides
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-silver text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
                Everything you need to know about AI voice agents, lead generation, and growing your home service business.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={0.08 * i} scale>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                  className="surface-card rounded-2xl overflow-hidden h-full relative overflow-hidden group hover:border-primary/15 transition-all duration-500 flex flex-col"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="p-8 relative z-10 flex-1 flex flex-col">
                    <div className="mb-4 flex items-center gap-2 text-xs text-primary/70">
                      <span className="font-mono tracking-wide uppercase">{post.category}</span>
                      <span>•</span>
                      <span className="text-silver">{post.readTime} min read</span>
                    </div>

                    <h3 className="text-lg font-display font-semibold text-foreground mb-3 tracking-tight leading-snug group-hover:text-primary/80 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-silver text-sm leading-relaxed mb-6 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-silver/70 mb-6 pt-4 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime} min</span>
                      </div>
                    </div>

                    <Button
                      variant="neon-outline"
                      size="sm"
                      asChild
                      className="w-full"
                    >
                      <Link to={`/blog/${post.slug}`} className="gap-2">
                        Read Article <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                Ready to transform your business?
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                Stop reading about AI voice agents. Start using them. Free 14-day trial. No credit card required.
              </p>
              <Button variant="neon" size="xl" asChild className="gap-2">
                <a href="https://cal.com/voxmation/meeting" target="_blank" rel="noopener noreferrer">
                  Start Free Trial <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Blog;
