import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import SEOBreadcrumbs from "@/components/SEOBreadcrumbs";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calendar, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import { blogPosts } from "@/data/blogPosts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPosts[slug] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Article Not Found</h1>
          <Link to="/blog" className="text-primary underline font-mono text-sm">Back to Blog</Link>
        </div>
      </div>
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://voxmation.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://voxmation.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://voxmation.com/blog/${post.slug}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedDate,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    image: post.image || "https://voxmation.com/og-image.png",
    keywords: post.keywords.join(", "),
  };

  const faqSchema =
    post.faqs && post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.title}
        description={post.metaDescription}
        path={`/blog/${post.slug}`}
        type="article"
        jsonLd={faqSchema ? [breadcrumbSchema, articleSchema, faqSchema] : [breadcrumbSchema, articleSchema]}
      />
      <Navbar />

      <SEOBreadcrumbs
        items={[
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="inline-block">
                <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-6 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 w-fit">
                  {post.category}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em] leading-[1.1]">
                {post.title}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center gap-6 text-sm text-silver/80">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal delay={0.2}>
            <article className="max-w-3xl mx-auto prose prose-invert max-w-none">
              <div className="surface-card rounded-2xl p-8 md:p-12 space-y-6 text-silver leading-relaxed">
                {post.content.split("\n\n").map((paragraph, i) => {
                  if (paragraph.startsWith("#")) {
                    const level = paragraph.match(/^#+/)[0].length;
                    const text = paragraph.replace(/^#+\s/, "");
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={level === 1 ? "text-3xl font-bold text-foreground mt-8 mb-4" : "text-2xl font-semibold text-foreground mt-6 mb-3"}
                      >
                        {text}
                      </motion.div>
                    );
                  }
                  if (paragraph.startsWith("- ")) {
                    return (
                      <ul key={i} className="list-disc list-inside space-y-2">
                        {paragraph.split("\n").map((item, idx) => (
                          <li key={idx} className="text-silver">{item.replace("- ", "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="text-base leading-relaxed"
                    >
                      {paragraph}
                    </motion.p>
                  );
                })}
              </div>
            </article>
          </Reveal>

          {/* Keywords */}
          <Reveal delay={0.25}>
            <div className="max-w-3xl mx-auto mt-12 pt-12 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-silver/60 mb-4">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {post.keywords.map((keyword) => (
                  <span key={keyword} className="inline-block bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs text-primary/80">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ Section */}
      {post.faqs && post.faqs.length > 0 && (
        <section className="pb-8 md:pb-12">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-silver-bright mb-6 tracking-[-0.02em]">
                  Frequently Asked Questions
                </h2>
              </Reveal>
              <div className="space-y-4">
                {post.faqs.map((f, i) => (
                  <Reveal key={f.q} delay={0.05 * i}>
                    <div className="surface-card rounded-2xl p-6">
                      <h3 className="text-base font-display font-semibold text-foreground mb-2">{f.q}</h3>
                      <p className="text-silver text-sm leading-relaxed">{f.a}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-6 relative z-10">
          <Reveal scale>
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 tracking-[-0.02em]">
                Enough reading. Time to act.
              </h2>
              <p className="text-silver text-lg mb-8 max-w-2xl mx-auto">
                See firsthand how AI voice agents transform home service businesses. Start your free 14-day trial today.
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

      {/* Related Posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-silver-bright text-center mb-12 tracking-[-0.02em]">
                Related Articles
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {post.relatedPosts.map((slug, i) => {
                const relatedPost = blogPosts[slug];
                if (!relatedPost) return null;
                return (
                  <Reveal key={slug} delay={0.08 * i} scale>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="surface-card rounded-2xl p-6 group hover:border-primary/15 transition-all duration-500 h-full flex flex-col"
                    >
                      <p className="text-xs text-primary/70 font-mono uppercase mb-2">{relatedPost.category}</p>
                      <h3 className="text-base font-display font-semibold text-foreground mb-3 flex-1">{relatedPost.title}</h3>
                      <Button variant="neon-outline" size="sm" asChild className="w-full">
                        <Link to={`/blog/${relatedPost.slug}`}>Read More</Link>
                      </Button>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <FooterSection />
    </div>
  );
};

export default BlogPost;
