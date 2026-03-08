import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CalendarCheck, Clock, ShieldCheck, TrendingUp, ArrowUpRight } from "lucide-react";

const benefits = [
  {
    icon: CalendarCheck,
    title: "More Booked Jobs",
    stat: "3.2x",
    desc: "Mais agendamentos com follow-up automático e booking 24/7 — sem depender de secretária.",
  },
  {
    icon: Clock,
    title: "Faster Response Time",
    stat: "<30s",
    desc: "Resposta em menos de 30 segundos para cada chamada perdida ou lead novo via SMS.",
  },
  {
    icon: ShieldCheck,
    title: "Fewer Lost Leads",
    stat: "98%",
    desc: "Capture rate de 98% — nenhum lead fica sem resposta, mesmo fora do horário comercial.",
  },
  {
    icon: TrendingUp,
    title: "Higher ROI",
    stat: "847%",
    desc: "Retorno médio de 847% no primeiro trimestre. O sistema se paga no primeiro mês.",
  },
];

const DemoBenefits = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 sm:py-32 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-muted-foreground mb-4">
            Why Voxmation
          </p>
          <h2 className="font-display font-extrabold text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-[-0.04em] text-foreground mb-3">
            Resultados que falam por si.
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto font-light leading-relaxed">
            Cada dólar investido volta multiplicado. Cada chamada vira oportunidade.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className="group surface-card rounded-2xl p-7 relative overflow-hidden hover:border-foreground/10 transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl border border-border bg-foreground/[0.03] flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-foreground/60" />
                </div>
                <span className="font-display font-extrabold text-2xl text-foreground tracking-tight">{b.stat}</span>
              </div>

              <h3 className="font-display font-bold text-foreground text-base mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-[0.85rem] leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="surface-card rounded-2xl p-10 sm:p-14 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(0_0%_100%/0.02),transparent)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

            <div className="relative z-10">
              <h3 className="font-display font-extrabold text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.08] tracking-[-0.04em] text-foreground mb-4">
                Pronto para colocar seu telefone no piloto automático?
              </h3>
              <p className="text-muted-foreground text-[0.95rem] leading-relaxed mb-8 max-w-md mx-auto font-light">
                Agende uma demo personalizada e veja como a Voxmation pode transformar chamadas perdidas em receita — em menos de 5 minutos.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://cal.com/voxmation/meeting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-foreground text-background font-display font-bold rounded-xl py-4 px-8 text-sm flex items-center justify-center gap-2.5 shadow-[0_0_40px_hsl(0_0%_100%/0.08)] hover:-translate-y-0.5 hover:shadow-[0_0_60px_hsl(0_0%_100%/0.12)] transition-all"
                >
                  Agendar Demo Gratuita
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="#voice-demo"
                  className="border border-border text-foreground/70 font-display font-semibold rounded-xl py-4 px-8 text-sm flex items-center justify-center gap-2 hover:border-foreground/15 hover:text-foreground transition-all"
                >
                  🎙️ Ouvir o AI Agent primeiro
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoBenefits;
