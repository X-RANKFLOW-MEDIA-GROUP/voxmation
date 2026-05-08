import { FormEvent, useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEOHead from "@/components/SEOHead";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VOXMATION_DEMO_URL, VOXMATION_PHONE, VOXMATION_PHONE_TEL, VOXMATION_SUPPORT_EMAIL, VOXMATION_SUPPORT_MAILTO } from "@/lib/contact";
import { CalendarDays, Mail, MessageCircle, Phone, Send } from "lucide-react";

const Contact = () => {
  const [status, setStatus] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const message = String(formData.get("message") || "");
    const subject = encodeURIComponent(`Voxmation website inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`);

    window.location.href = `${VOXMATION_SUPPORT_MAILTO}?subject=${subject}&body=${body}`;
    setStatus("Opening your email app. You can also call us 24/7 at 844-687-7999.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact Voxmation — Sales & 24/7 Support"
        description="Contact Voxmation for AI voice agent sales, support, demos, and onboarding. Call 844-687-7999 or email support@voxmation.com."
        path="/contact"
      />
      <Navbar />
      <main>
        <section className="pt-40 pb-20 md:pt-48 md:pb-28 relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-40" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <Reveal>
                <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
                  Contact Voxmation
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-silver-bright mb-5 tracking-[-0.02em]">
                  Talk to a Voice Automation Specialist
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="text-silver text-lg leading-relaxed">
                  Questions about pricing, integrations, onboarding, or support? Call us 24/7 or send a message and we will help you choose the right setup.
                </p>
              </Reveal>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              <Reveal scale>
                <a href={VOXMATION_PHONE_TEL} className="surface-card rounded-2xl p-8 text-center group hover:border-primary/25 transition-colors block">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-display font-bold text-foreground mb-3">Call Us</h2>
                  <span className="block text-3xl font-mono font-bold text-primary mb-3 group-hover:underline">{VOXMATION_PHONE}</span>
                  <p className="text-sm text-silver">Available 24/7 for sales and support.</p>
                </a>
              </Reveal>
              <Reveal scale delay={0.1}>
                <a href={`mailto:${VOXMATION_SUPPORT_EMAIL}`} className="surface-card rounded-2xl p-8 text-center group hover:border-primary/25 transition-colors block">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-display font-bold text-foreground mb-3">Email</h2>
                  <span className="block text-sm md:text-base font-mono font-bold text-primary mb-3 group-hover:underline">{VOXMATION_SUPPORT_EMAIL}</span>
                  <p className="text-sm text-silver">Send details and we will follow up quickly.</p>
                </a>
              </Reveal>
              <Reveal scale delay={0.2}>
                <a href={VOXMATION_DEMO_URL} target="_blank" rel="noopener noreferrer" className="surface-card rounded-2xl p-8 text-center group hover:border-primary/25 transition-colors block">
                  <CalendarDays className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-display font-bold text-foreground mb-3">Book Demo</h2>
                  <span className="block text-base font-mono font-bold text-primary mb-3 group-hover:underline">Choose a Time</span>
                  <p className="text-sm text-silver">See Voxmation in action for your business.</p>
                </a>
              </Reveal>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 max-w-5xl mx-auto">
              <Reveal>
                <div className="surface-card rounded-2xl p-8 h-full">
                  <MessageCircle className="h-8 w-8 text-primary mb-4" />
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">Live Chat</h2>
                  <p className="text-silver text-sm leading-relaxed mb-6">
                    Live chat is available during business hours. For immediate help outside business hours, call {VOXMATION_PHONE} any time.
                  </p>
                  <Button variant="neon-outline" asChild>
                    <a href={VOXMATION_PHONE_TEL} className="gap-2">
                      <Phone className="h-4 w-4" />
                      Call {VOXMATION_PHONE}
                    </a>
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="surface-card rounded-2xl p-8">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">Send us a Message</h2>
                  <p className="text-silver text-sm mb-6">This opens your email app with the message prefilled.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input name="name" placeholder="Your Name" required className="bg-background/60" />
                    <Input name="email" type="email" placeholder="Your Email" required className="bg-background/60" />
                    <Input name="phone" type="tel" placeholder="Your Phone" required className="bg-background/60" />
                    <Textarea name="message" placeholder="Your Message" rows={5} required className="bg-background/60" />
                    <Button type="submit" variant="neon" size="lg" className="w-full gap-2">
                      Send Message
                      <Send className="h-4 w-4" />
                    </Button>
                    {status && <p className="text-xs text-primary text-center font-mono">{status}</p>}
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default Contact;
