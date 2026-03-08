import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic, Send, ArrowUpRight } from "lucide-react";

/* ─── TYPES ─── */
interface ChatMessage {
  role: "bot" | "user";
  text: string;
}

/* ─── DATA ─── */
const industries = [
  { id: "hvac", icon: "❄️", label: "HVAC & AC" },
  { id: "plumbing", icon: "🔧", label: "Plumbing" },
  { id: "electrical", icon: "⚡", label: "Electrical" },
  { id: "roofing", icon: "🏠", label: "Roofing" },
  { id: "landscaping", icon: "🌿", label: "Landscaping" },
  { id: "cleaning", icon: "🧹", label: "Cleaning" },
];

const conversations: Record<string, ChatMessage[]> = {
  hvac: [
    { role: "bot", text: "Hi, thanks for calling Comfort Zone HVAC! This is Vox, your AI assistant. How can I help you today?" },
    { role: "user", text: "Hi, I need my AC fixed ASAP — it stopped working this morning." },
    { role: "bot", text: "I understand, I can help! We have a technician available today at 2PM or 4PM in your area. Which works better for you?" },
    { role: "user", text: "2PM works great." },
    { role: "bot", text: "Perfect! I've booked your appointment for today at 2PM. You'll receive a confirmation text shortly. Is there anything else?" },
    { role: "user", text: "No, that's all. Thanks!" },
    { role: "bot", text: "Great, have a wonderful day! We'll see you at 2PM. Goodbye!" },
  ],
  plumbing: [
    { role: "bot", text: "Hello! Thanks for calling Quick Fix Plumbing. I'm Vox, your AI assistant. What can I do for you?" },
    { role: "user", text: "I have a burst pipe in my kitchen — water everywhere!" },
    { role: "bot", text: "I'm sorry to hear that! Let me dispatch an emergency plumber right away. Can you confirm your address?" },
    { role: "user", text: "123 Oak Street, Houston." },
    { role: "bot", text: "Got it! A plumber is on the way and should arrive within 45 minutes. Please shut off the main water valve if you can. I'll send you a tracking link via text." },
    { role: "user", text: "Thank you so much!" },
    { role: "bot", text: "You're welcome! Stay safe, help is on the way. Goodbye!" },
  ],
  electrical: [
    { role: "bot", text: "Hi, you've reached Spark Electric! I'm Vox, your AI assistant. How can I assist you?" },
    { role: "user", text: "I need a panel upgrade for my house." },
    { role: "bot", text: "Sure! I can schedule an estimate visit. Is your home single or multi-story? And what's the current panel amperage?" },
    { role: "user", text: "Single story, 100 amp panel." },
    { role: "bot", text: "Perfect. I have an opening for an estimate this Thursday at 10AM. Would that work for you?" },
    { role: "user", text: "Yes, that works." },
    { role: "bot", text: "You're all set for Thursday at 10AM! I'll send a confirmation text now. Have a great day!" },
  ],
  roofing: [
    { role: "bot", text: "Thanks for calling Lone Star Roofing! I'm Vox. How can I help you today?" },
    { role: "user", text: "We had a storm last night and I think my roof is damaged." },
    { role: "bot", text: "I'm sorry about that. We're handling many storm damage calls today. I can schedule a free inspection. Are you available tomorrow morning?" },
    { role: "user", text: "Yes, anytime before noon." },
    { role: "bot", text: "I've booked your free roof inspection for tomorrow at 9AM. Our inspector will document everything for your insurance claim. I'll text you the details." },
    { role: "user", text: "Perfect, thanks." },
    { role: "bot", text: "You're welcome! We'll take care of it. Have a good evening!" },
  ],
  landscaping: [
    { role: "bot", text: "Hello! Green Valley Landscaping here. I'm Vox, your AI assistant. What can I do for you?" },
    { role: "user", text: "I need a quote for weekly lawn maintenance." },
    { role: "bot", text: "Happy to help! Can you tell me the approximate lot size and your address so I can pull up the property?" },
    { role: "user", text: "About half an acre, 456 Elm Drive, Austin." },
    { role: "bot", text: "Got it! Based on a half-acre lot, our weekly service starts at $65/week. I can schedule a site visit this Friday at 3PM to give you an exact quote. Would that work?" },
    { role: "user", text: "Yes, let's do it." },
    { role: "bot", text: "Booked! You'll get a confirmation text shortly. See you Friday!" },
  ],
  cleaning: [
    { role: "bot", text: "Hi! Thanks for calling Shine Bright Cleaning. I'm Vox. How can I help?" },
    { role: "user", text: "I need a deep cleaning for my apartment — I'm moving out next week." },
    { role: "bot", text: "We specialize in move-out cleanings! How many bedrooms and bathrooms?" },
    { role: "user", text: "2 bedrooms, 1 bathroom." },
    { role: "bot", text: "For a 2bed/1bath move-out deep clean, the price is $220. I can schedule the team for next Monday at 9AM. Does that work?" },
    { role: "user", text: "Monday works. Let's do it." },
    { role: "bot", text: "You're booked for Monday at 9AM! I'll send a checklist and confirmation via text. Have a great day!" },
  ],
};

/* ─── DEMO PAGE ─── */
const Demo = () => {
  useEffect(() => {
    document.title = "Voxmation — Voice AI Demo";
  }, []);

  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  // Step 2 state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timer, setTimer] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [convoIndex, setConvoIndex] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCall = useCallback(() => {
    if (!selectedIndustry) return;
    setStep(2);
    setMessages([]);
    setConvoIndex(0);
    setTimer(0);
    setCallActive(true);
  }, [selectedIndustry]);

  // Timer
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive]);

  // Auto-play conversation
  useEffect(() => {
    if (!callActive || !selectedIndustry) return;
    const convo = conversations[selectedIndustry];
    if (!convo || convoIndex >= convo.length) {
      // End call
      setTimeout(() => {
        setCallActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setStep(3);
      }, 2000);
      return;
    }

    const msg = convo[convoIndex];
    const delay = convoIndex === 0 ? 1500 : 2000 + Math.random() * 1500;

    const timeout = setTimeout(() => {
      if (msg.role === "bot") {
        setIsTyping(true);
        setLiveTranscript(msg.text);
        setTimeout(() => {
          setIsTyping(false);
          setAgentSpeaking(true);
          setMessages((prev) => [...prev, msg]);
          setTimeout(() => {
            setAgentSpeaking(false);
            setLiveTranscript("");
            setConvoIndex((i) => i + 1);
          }, 1500);
        }, 1200);
      } else {
        setLiveTranscript(msg.text);
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => {
          setLiveTranscript("");
          setConvoIndex((i) => i + 1);
        }, 1000);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [callActive, convoIndex, selectedIndustry]);

  // Scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleSendText = () => {
    if (!textInput.trim() || !callActive) return;
    setMessages((prev) => [...prev, { role: "user", text: textInput.trim() }]);
    setTextInput("");
  };

  const sentiment = messages.length > 4 ? "Positive" : messages.length > 2 ? "Neutral" : "—";
  const leadScore = messages.length > 4 ? "Hot 🔥" : messages.length > 2 ? "Warm" : "—";
  const intent = messages.length > 2 ? "Booking" : "—";

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--demo-accent)/0.07),transparent)]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-9 py-4 flex items-center justify-between bg-background/85 backdrop-blur-xl border-b border-border">
        <Link to="/" className="font-display font-extrabold text-lg text-foreground flex items-center gap-2.5">
          <span className="w-[7px] h-[7px] rounded-full bg-demo-accent shadow-[0_0_8px_hsl(var(--demo-accent))] animate-pulse" />
          Voxmation
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 min-h-screen pt-[88px] pb-12 px-5 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {/* ═══ STEP 1: SELECT INDUSTRY ═══ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[620px] text-center flex flex-col items-center"
            >
              <p className="font-mono text-[0.68rem] tracking-[0.18em] uppercase text-demo-accent mb-5 flex items-center gap-2.5">
                <span className="h-px w-6 bg-demo-accent/35" />
                Voice AI Demo
                <span className="h-px w-6 bg-demo-accent/35" />
              </p>

              <h1 className="font-display font-extrabold text-[clamp(2rem,5vw,3.2rem)] leading-[1.05] tracking-[-0.04em] text-foreground mb-3">
                Fale com seu{" "}
                <span className="text-demo-accent">AI Agent</span> agora.
              </h1>

              <p className="text-muted-foreground text-base mb-10 leading-relaxed max-w-md font-light">
                Escolha seu setor, clique no microfone e converse com o agente de voz — ele responde em voz alta, em inglês, em tempo real.
              </p>

              {/* Industry picker */}
              <p className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-muted-foreground mb-3 self-start w-full">
                1 — Tipo de negócio
              </p>
              <div className="grid grid-cols-3 gap-2.5 w-full mb-6">
                {industries.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 border transition-all duration-200 cursor-pointer ${
                      selectedIndustry === ind.id
                        ? "border-demo-accent bg-demo-accent/[0.07] shadow-[0_0_18px_hsl(var(--demo-accent)/0.1)]"
                        : "border-border bg-card hover:border-demo-accent/25 hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="text-2xl">{ind.icon}</span>
                    <span className="text-[0.78rem] font-semibold text-foreground text-center leading-tight">{ind.label}</span>
                  </button>
                ))}
              </div>

              {/* Name input */}
              <p className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-muted-foreground mb-2.5 self-start w-full">
                2 — Seu nome (você será o cliente)
              </p>
              <input
                type="text"
                placeholder="Ex: Carlos"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-card border border-border text-foreground rounded-[10px] px-4 py-3 text-sm outline-none focus:border-demo-accent/35 transition-colors mb-6 placeholder:text-muted-foreground"
              />

              <button
                onClick={startCall}
                disabled={!selectedIndustry}
                className="w-full bg-demo-accent text-background font-display font-bold rounded-xl py-4 px-7 text-base flex items-center justify-center gap-2.5 shadow-[0_0_36px_hsl(var(--demo-accent)/0.18)] hover:-translate-y-0.5 hover:shadow-[0_0_56px_hsl(var(--demo-accent)/0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                🎙️ Iniciar Chamada com Voz
              </button>
            </motion.div>
          )}

          {/* ═══ STEP 2: LIVE CALL ═══ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[720px] flex flex-col items-center"
            >
              {/* Call bar */}
              <div className="w-full bg-card border border-border border-b-0 rounded-t-[14px] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-demo-green/10 border border-demo-green/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-demo-green animate-pulse" />
                  <span className="font-mono text-[0.65rem] text-demo-green tracking-wider">LIVE CALL</span>
                </div>

                <span className="font-mono text-sm text-muted-foreground tracking-widest">
                  {formatTime(timer)}
                </span>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-demo-accent/20 to-demo-purple/20 border border-demo-accent/25 flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Vox Agent</p>
                    <p className="font-mono text-[0.62rem] text-demo-accent">Voxmation</p>
                  </div>
                </div>
              </div>

              {/* Orbs */}
              <div className="w-full bg-card/60 border-x border-border px-6 py-8 flex items-center justify-center gap-14 min-h-[180px]">
                {/* Agent orb */}
                <div className="flex flex-col items-center gap-3.5">
                  <div
                    className={`w-[88px] h-[88px] rounded-full flex items-center justify-center text-3xl border-2 transition-transform ${
                      agentSpeaking
                        ? "border-demo-accent/60 bg-[radial-gradient(circle,hsl(var(--demo-accent)/0.25),hsl(var(--demo-accent)/0.05))] shadow-[0_0_24px_hsl(var(--demo-accent)/0.2)] animate-pulse"
                        : "border-demo-accent/35 bg-[radial-gradient(circle,hsl(var(--demo-accent)/0.15),hsl(var(--demo-accent)/0.03))] shadow-[0_0_14px_hsl(var(--demo-accent)/0.1)]"
                    }`}
                  >
                    🤖
                  </div>
                  <span className="font-mono text-[0.65rem] tracking-widest uppercase text-demo-accent">VOX AGENT</span>
                  <span className="text-xs text-muted-foreground">
                    {agentSpeaking ? "Speaking..." : isTyping ? "Thinking..." : "Listening"}
                  </span>
                </div>

                <span className="font-display font-extrabold text-lg text-border tracking-wider">VS</span>

                {/* User orb */}
                <div className="flex flex-col items-center gap-3.5">
                  <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-3xl border-2 border-demo-purple/35 bg-[radial-gradient(circle,hsl(var(--demo-purple)/0.15),hsl(var(--demo-purple)/0.03))] shadow-[0_0_14px_hsl(var(--demo-purple)/0.1)]">
                    🎙️
                  </div>
                  <span className="font-mono text-[0.65rem] tracking-widest uppercase text-demo-purple">YOU</span>
                  <span className="text-xs text-muted-foreground">
                    {userName || "Customer"}
                  </span>
                </div>
              </div>

              {/* Live transcript */}
              <div className="w-full bg-background/50 border-x border-border px-5 py-2.5 min-h-[36px] flex items-center">
                <p className={`font-mono text-xs italic transition-colors ${liveTranscript ? "text-demo-accent" : "text-muted-foreground"}`}>
                  {liveTranscript ? `🎤 ${liveTranscript}` : "🎤 Live transcript will appear here..."}
                </p>
              </div>

              {/* Chat area */}
              <div
                ref={chatRef}
                className="w-full bg-card/60 border-x border-border px-5 py-5 max-h-[260px] overflow-y-auto flex flex-col gap-3 scroll-smooth"
                style={{ scrollbarWidth: "thin" }}
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-2 items-end ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-xs ${
                        msg.role === "bot"
                          ? "bg-gradient-to-br from-demo-accent/15 to-demo-purple/15 border border-demo-accent/20"
                          : "bg-foreground/5 border border-border font-display font-bold text-demo-purple text-[0.65rem]"
                      }`}
                    >
                      {msg.role === "bot" ? "🤖" : (userName?.[0]?.toUpperCase() || "U")}
                    </div>
                    <div
                      className={`max-w-[72%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                        msg.role === "bot"
                          ? "bg-card border border-border rounded-bl-sm"
                          : "bg-gradient-to-br from-demo-purple to-[hsl(var(--demo-purple)/0.8)] text-foreground rounded-br-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 items-end">
                    <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-demo-accent/15 to-demo-purple/15 border border-demo-accent/20 flex items-center justify-center text-xs">
                      🤖
                    </div>
                    <div className="bg-card border border-border px-3.5 py-3 rounded-xl rounded-bl-sm flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:180ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:360ms]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Text input */}
              <div className="w-full bg-card border border-border border-t-0 rounded-b-[14px] px-4 py-3 flex items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Type a message (or just watch the demo)..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                  disabled={!callActive}
                  className="flex-1 bg-card/80 border border-border text-foreground rounded-lg px-3.5 py-2 text-sm outline-none focus:border-demo-purple/40 transition-colors placeholder:text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendText}
                  disabled={!callActive || !textInput.trim()}
                  className="bg-demo-purple border-none rounded-lg px-4 py-2 text-foreground font-bold transition-opacity hover:opacity-80 disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics */}
              <div className="w-full grid grid-cols-4 gap-2 mt-3">
                {[
                  { label: "Sentiment", value: sentiment, color: "" },
                  { label: "Lead Score", value: leadScore, color: "text-demo-green" },
                  { label: "Intent", value: intent, color: "text-demo-accent" },
                  { label: "Mode", value: "Voice", color: "" },
                ].map((m) => (
                  <div key={m.label} className="bg-card border border-border rounded-[10px] px-3 py-2.5">
                    <p className="font-mono text-[0.6rem] text-muted-foreground uppercase tracking-widest mb-1">{m.label}</p>
                    <p className={`font-display font-bold text-sm ${m.color || "text-foreground"}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Hint */}
              <p className="text-xs text-muted-foreground mt-3 text-center">
                🤖 <span className="text-demo-accent">Agent is speaking...</span> watch the conversation unfold
              </p>
            </motion.div>
          )}

          {/* ═══ STEP 3: COMPLETED ═══ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[520px] text-center flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-[76px] h-[76px] rounded-full bg-demo-green/10 border border-demo-green/30 flex items-center justify-center text-3xl shadow-[0_0_40px_hsl(var(--demo-green)/0.12)] mb-6"
              >
                ✓
              </motion.div>

              <h2 className="font-display font-extrabold text-[2.1rem] tracking-[-0.04em] text-foreground mb-3">
                Chamada Concluída.
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-7 font-light">
                O agente conduziu a conversa por voz de forma autônoma — qualificou o lead, construiu rapport e agendou o serviço sem nenhum humano envolvido.
              </p>

              {/* Summary */}
              <div className="bg-card border border-border rounded-[13px] p-5 w-full mb-6 text-left">
                <p className="font-mono text-[0.62rem] tracking-[0.14em] text-demo-accent uppercase mb-3">
                  📋 Auto-logged to CRM
                </p>
                {[
                  { k: "Lead", v: userName || "Customer" },
                  { k: "Setor", v: industries.find((i) => i.id === selectedIndustry)?.label || "—" },
                  { k: "Mensagens", v: String(messages.length) },
                  { k: "Duração", v: formatTime(timer) },
                  { k: "Modo", v: "Voice + AI" },
                  { k: "Resultado", v: "✓ Demo Completed", highlight: true },
                ].map((r) => (
                  <div key={r.k} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
                    <span className="text-muted-foreground">{r.k}</span>
                    <span className={`font-medium ${r.highlight ? "text-demo-green" : "text-foreground"}`}>{r.v}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex gap-3 w-full">
                <a
                  href="https://cal.com/voxmation/meeting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-demo-accent text-background font-display font-bold rounded-[10px] py-3.5 px-5 text-sm text-center hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2"
                >
                  Quero meu AI Agent
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => {
                    setStep(1);
                    setMessages([]);
                    setTimer(0);
                    setSelectedIndustry(null);
                    setUserName("");
                    setConvoIndex(0);
                    setCallActive(false);
                  }}
                  className="flex-1 bg-transparent text-foreground border border-border font-display font-semibold rounded-[10px] py-3.5 px-5 text-sm hover:border-foreground/20 transition-colors"
                >
                  ↺ Tentar de novo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Demo;
