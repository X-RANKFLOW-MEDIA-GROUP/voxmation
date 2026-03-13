import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-16 px-4">
      {/* Subtle background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-accent/5 blur-3xl" />
        <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-brand-secondary/5 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-center relative">
        {/* Texto */}
        <div className="flex-1 space-y-5">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 rounded-full bg-bg-subtle px-3 py-1 text-xs font-medium text-brand-secondary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Voice AI para vendas e atendimento
          </motion.span>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-3xl font-semibold tracking-tight text-brand-primary md:text-4xl"
          >
            Automatize chamadas e leads
            <br />
            com agentes de voz que fecham negócios.
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="max-w-xl text-sm text-text-secondary md:text-base"
          >
            O Voxmation conecta sua stack de CRM, agenda e billing para
            rodar campanhas de voz, qualificação e follow-up sem time extra.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="https://cal.com/voxmation/meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-text-inverse shadow-sm hover:bg-action-primary-hover transition-colors"
            >
              Agendar demo gratuita
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-brand-secondary hover:underline"
            >
              Ver como funciona →
            </a>
          </motion.div>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="text-xs text-text-secondary/80"
          >
            Em média, equipes reduzem em 40% o tempo manual de follow-up.
          </motion.p>
        </div>

        {/* Lado direito: card de produto */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="flex-1"
        >
          <div className="rounded-2xl bg-bg-surface p-5 shadow-sm ring-1 ring-border-subtle">
            <p className="mb-3 text-xs font-semibold text-brand-secondary">
              Painel em tempo real
            </p>
            <div className="space-y-2 rounded-xl bg-bg-body p-4">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Chamadas hoje</span>
                <span className="font-semibold text-brand-primary">328</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Leads qualificados</span>
                <span className="font-semibold text-brand-accent">74</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Tempo médio</span>
                <span className="font-semibold text-brand-secondary">1m 42s</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
