import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Send, ArrowUpRight, Volume2, Mic, Bot, User, Headphones, CircleUser, CheckCircle2, RotateCcw, Thermometer, Wrench, Zap, Home, TreePine, SprayCan } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import DemoHero from "@/components/demo/DemoHero";
import MissedCallDemo from "@/components/demo/MissedCallDemo";
import DashboardMockup from "@/components/demo/DashboardMockup";
import DemoBenefits from "@/components/demo/DemoBenefits";

/* ─── TYPES ─── */
interface ChatMessage {
  role: "bot" | "user";
  text: string;
}

/* ─── VOICE ID MAPPING ─── */
const voiceIdMap: Record<string, string> = {
  rachel: "EXAVITQu4vr4xnSDxMaL", // Sarah
  adam: "onwK4e9ZLuTAKqWW03F9",   // Daniel
  josh: "TX3LPaxmHKxFdv7VOQHJ",   // Liam
  bella: "XrExE9yKIg1WjnnlVkGX",  // Matilda
  elli: "pFZP5JQG7iQjIQuC4Bku",   // Lily
};

/* ─── DATA ─── */
const industries: { id: string; Icon: LucideIcon; label: string }[] = [
  { id: "hvac", Icon: Thermometer, label: "HVAC & AC" },
  { id: "plumbing", Icon: Wrench, label: "Plumbing" },
  { id: "electrical", Icon: Zap, label: "Electrical" },
  { id: "roofing", Icon: Home, label: "Roofing" },
  { id: "landscaping", Icon: TreePine, label: "Landscaping" },
  { id: "cleaning", Icon: SprayCan, label: "Cleaning" },
];

const voices: { id: string; Icon: LucideIcon; name: string; desc: string }[] = [
  { id: "rachel", Icon: CircleUser, name: "Rachel", desc: "Calm, professional" },
  { id: "adam", Icon: User, name: "Adam", desc: "Deep, authoritative" },
  { id: "josh", Icon: Headphones, name: "Josh", desc: "Friendly, young" },
  { id: "bella", Icon: CircleUser, name: "Bella", desc: "Warm, soft" },
  { id: "elli", Icon: Mic, name: "Elli", desc: "Energetic, bright" },
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
    { role: "bot", text: "Got it! A plumber is on the way and should arrive within 45 minutes. Please shut off the main water valve if you can." },
    { role: "user", text: "Thank you so much!" },
    { role: "bot", text: "You're welcome! Stay safe, help is on the way. Goodbye!" },
  ],
  electrical: [
    { role: "bot", text: "Hi, you've reached Spark Electric! I'm Vox, your AI assistant. How can I assist you?" },
    { role: "user", text: "I need a panel upgrade for my house." },
    { role: "bot", text: "Sure! I can schedule an estimate visit. Is your home single or multi-story? And what's the current panel amperage?" },
    { role: "user", text: "Single story, 100 amp panel." },
    { role: "bot", text: "Perfect. I have an opening this Thursday at 10AM. Would that work?" },
    { role: "user", text: "Yes, that works." },
    { role: "bot", text: "You're all set for Thursday at 10AM! Confirmation text on the way. Have a great day!" },
  ],
  roofing: [
    { role: "bot", text: "Thanks for calling Lone Star Roofing! I'm Vox. How can I help you today?" },
    { role: "user", text: "We had a storm last night and I think my roof is damaged." },
    { role: "bot", text: "I'm sorry about that. I can schedule a free inspection. Are you available tomorrow morning?" },
    { role: "user", text: "Yes, anytime before noon." },
    { role: "bot", text: "I've booked your free roof inspection for tomorrow at 9AM. Our inspector will document everything for your insurance claim." },
    { role: "user", text: "Perfect, thanks." },
    { role: "bot", text: "You're welcome! We'll take care of it. Have a good evening!" },
  ],
  landscaping: [
    { role: "bot", text: "Hello! Green Valley Landscaping here. I'm Vox. What can I do for you?" },
    { role: "user", text: "I need a quote for weekly lawn maintenance." },
    { role: "bot", text: "Happy to help! Can you tell me the lot size and your address?" },
    { role: "user", text: "About half an acre, 456 Elm Drive, Austin." },
    { role: "bot", text: "Our weekly service starts at $65/week. I can schedule a site visit this Friday at 3PM for an exact quote. Would that work?" },
    { role: "user", text: "Yes, let's do it." },
    { role: "bot", text: "Booked! Confirmation text on its way. See you Friday!" },
  ],
  cleaning: [
    { role: "bot", text: "Hi! Thanks for calling Shine Bright Cleaning. I'm Vox. How can I help?" },
    { role: "user", text: "I need a deep cleaning for my apartment — moving out next week." },
    { role: "bot", text: "We specialize in move-out cleanings! How many bedrooms and bathrooms?" },
    { role: "user", text: "2 bedrooms, 1 bathroom." },
    { role: "bot", text: "For a 2bed/1bath move-out deep clean, the price is $220. I can schedule Monday at 9AM. Does that work?" },
    { role: "user", text: "Monday works. Let's do it." },
    { role: "bot", text: "You're booked for Monday at 9AM! Checklist and confirmation coming via text. Have a great day!" },
  ],
};

/* ─── TTS FUNCTION ─── */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function speakText(text: string, voiceId: string): Promise<HTMLAudioElement | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      console.error("TTS failed:", response.status);
      return null;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
    return audio;
  } catch (err) {
    console.error("TTS error:", err);
    return null;
  }
}

/* ─── AUDIO VISUALIZER BARS ─── */
const VisualizerBars = ({ active, color = "bg-foreground/20" }: { active: boolean; color?: string }) => (
  <div className="flex items-center gap-[2px] h-8">
    {Array.from({ length: 32 }).map((_, i) => (
      <motion.div
        key={i}
        className={`w-[2px] rounded-full ${color}`}
        animate={active ? {
          height: [3, Math.sin(i * 0.4) * 18 + Math.random() * 12 + 6, 3],
        } : { height: 3 }}
        transition={active ? {
          duration: 0.6 + Math.random() * 0.4,
          repeat: Infinity,
          delay: i * 0.03,
          ease: "easeInOut",
        } : { duration: 0.3 }}
      />
    ))}
  </div>
);

/* ─── MAIN DEMO PAGE ─── */
const Demo = () => {
  useEffect(() => {
    document.title = "Voxmation — Voice AI Demo";
  }, []);

  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("rachel");
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
  const [ttsError, setTtsError] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const getElevenLabsVoiceId = useCallback(() => {
    return voiceIdMap[selectedVoice] || voiceIdMap.rachel;
  }, [selectedVoice]);

  const startCall = useCallback(() => {
    if (!selectedIndustry) return;
    setStep(2);
    setMessages([]);
    setConvoIndex(0);
    setTimer(0);
    setCallActive(true);
    setTtsError(false);
  }, [selectedIndustry]);

  // Timer
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callActive]);

  // Auto-play conversation with real TTS
  useEffect(() => {
    if (!callActive || !selectedIndustry) return;
    const convo = conversations[selectedIndustry];
    if (!convo || convoIndex >= convo.length) {
      setTimeout(() => {
        setCallActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setStep(3);
      }, 2000);
      return;
    }
    const msg = convo[convoIndex];
    const delay = convoIndex === 0 ? 1500 : 2200 + Math.random() * 1000;

    const timeout = setTimeout(async () => {
      if (msg.role === "bot") {
        // Show typing
        setIsTyping(true);
        setLiveTranscript(msg.text);

        // Start TTS fetch while "typing"
        const voiceId = getElevenLabsVoiceId();

        setTimeout(async () => {
          setIsTyping(false);
          setAgentSpeaking(true);
          setMessages((prev) => [...prev, msg]);

          // Play real TTS audio
          const audio = await speakText(msg.text, voiceId);
          if (audio) {
            currentAudioRef.current = audio;
            audio.onended = () => {
              setAgentSpeaking(false);
              setLiveTranscript("");
              currentAudioRef.current = null;
              setConvoIndex((i) => i + 1);
            };
            audio.onerror = () => {
              setAgentSpeaking(false);
              setLiveTranscript("");
              setTtsError(true);
              currentAudioRef.current = null;
              // Fallback: continue after timeout
              setTimeout(() => setConvoIndex((i) => i + 1), 1500);
            };
          } else {
            // TTS failed — fallback to timed simulation
            setTtsError(true);
            setTimeout(() => {
              setAgentSpeaking(false);
              setLiveTranscript("");
              setConvoIndex((i) => i + 1);
            }, 2000);
          }
        }, 1200);
      } else {
        setLiveTranscript(msg.text);
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => {
          setLiveTranscript("");
          setConvoIndex((i) => i + 1);
        }, 1200);
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [callActive, convoIndex, selectedIndustry, getElevenLabsVoiceId]);

  // Scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleSendText = () => {
    if (!textInput.trim() || !callActive) return;
    setMessages((prev) => [...prev, { role: "user", text: textInput.trim() }]);
    setTextInput("");
  };

  const sentiment = messages.length > 4 ? "Positive" : messages.length > 2 ? "Neutral" : "—";
  const leadScore = messages.length > 4 ? "Hot 🔥" : messages.length > 2 ? "Warm" : "—";
  const intent = messages.length > 2 ? "Booking" : "—";

  const resetAll = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setStep(1);
    setMessages([]);
    setTimer(0);
    setSelectedIndustry(null);
    setUserName("");
    setConvoIndex(0);
    setCallActive(false);
    setLiveTranscript("");
    setAgentSpeaking(false);
    setIsTyping(false);
    setTtsError(false);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient radial glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,hsl(0_0%_100%/0.03),transparent)]" />
      </div>

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-9 py-4 flex items-center justify-between bg-background/90 backdrop-blur-2xl border-b border-border">
        <Link to="/" className="font-display font-extrabold text-lg tracking-tight text-foreground flex items-center gap-2.5">
          <span className="w-[7px] h-[7px] rounded-full bg-foreground shadow-[0_0_10px_hsl(0_0%_100%/0.4)] animate-pulse" />
          Voxmation
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/40">
            <Volume2 className="w-3 h-3 text-muted-foreground" />
            <span className="font-mono text-[0.62rem] tracking-wider text-muted-foreground uppercase">ElevenLabs TTS</span>
          </div>
          <Link to="/" className="text-xs font-mono tracking-wider text-muted-foreground hover:text-foreground transition-colors uppercase">
            ← Back
          </Link>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <div className="pt-16">
        <DemoHero />
      </div>

      {/* ─── VOICE AI DEMO ─── */}
      <div id="voice-demo" className="relative z-10 border-t border-border py-12 px-5 flex flex-col items-center">
        <AnimatePresence mode="wait">

          {/* ═══════════════ STEP 1: CONFIGURE ═══════════════ */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[640px] flex flex-col items-center text-center"
            >
              {/* Eyebrow */}
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-6 flex items-center gap-3">
                <span className="h-px w-6 bg-foreground/15" />
                Voice AI Demo
                <span className="h-px w-6 bg-foreground/15" />
              </p>

              <h1 className="font-display font-extrabold text-[clamp(2rem,5vw,3.4rem)] leading-[1.02] tracking-[-0.04em] text-foreground mb-3">
                Hear your{" "}
                <span className="bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                  AI Agent
                </span>{" "}
                speak.
              </h1>

              <p className="text-muted-foreground text-[0.95rem] mb-10 leading-relaxed max-w-md font-light">
                Ultra-realistic voice powered by ElevenLabs. Pick a voice, choose your industry, and listen to your agent in action.
              </p>

              {/* ── Voice Picker ── */}
              <div className="w-full surface-card rounded-2xl p-6 mb-6 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                <p className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-4 flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5" />
                  Select Agent Voice — ElevenLabs
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {voices.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border transition-all duration-200 ${
                        selectedVoice === v.id
                          ? "border-foreground/25 bg-foreground/[0.05] shadow-[0_0_20px_hsl(0_0%_100%/0.04)]"
                          : "border-border bg-background/40 hover:border-foreground/10"
                      }`}
                    >
                      <v.Icon className="w-5 h-5 text-foreground/60" />
                      <span className="text-[0.72rem] font-semibold text-foreground">{v.name}</span>
                      <span className="text-[0.6rem] text-muted-foreground text-center leading-tight">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Industry Picker ── */}
              <p className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-3 self-start w-full">
                Business Type
              </p>
              <div className="grid grid-cols-3 gap-2.5 w-full mb-6">
                {industries.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 border transition-all duration-200 ${
                      selectedIndustry === ind.id
                        ? "border-foreground/25 bg-foreground/[0.05] shadow-[0_0_20px_hsl(0_0%_100%/0.04)]"
                        : "border-border bg-card hover:border-foreground/10 hover:-translate-y-0.5"
                    }`}
                  >
                    <ind.Icon className="w-6 h-6 text-foreground/50" />
                    <span className="text-[0.75rem] font-semibold text-foreground text-center leading-tight">{ind.label}</span>
                  </button>
                ))}
              </div>

              {/* ── Name Input ── */}
              <p className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-2.5 self-start w-full">
                Your Name (you'll play the customer)
              </p>
              <input
                type="text"
                placeholder="e.g. John"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-card border border-border text-foreground rounded-xl px-4 py-3 text-sm outline-none focus:border-foreground/20 transition-colors mb-6 placeholder:text-muted-foreground font-mono"
              />

              {/* ── Start Button ── */}
              <button
                onClick={startCall}
                disabled={!selectedIndustry}
                className="w-full bg-foreground text-background font-display font-bold rounded-xl py-4 px-7 text-base flex items-center justify-center gap-2.5 shadow-[0_0_40px_hsl(0_0%_100%/0.08)] hover:-translate-y-0.5 hover:shadow-[0_0_60px_hsl(0_0%_100%/0.12)] transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                <Mic className="w-5 h-5" />
                Start Voice Call
              </button>
            </motion.div>
          )}

          {/* ═══════════════ STEP 2: LIVE CALL ═══════════════ */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[720px] flex flex-col items-center"
            >
              {/* Call Bar */}
              <div className="w-full bg-card border border-border border-b-0 rounded-t-2xl px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-foreground/5 border border-foreground/10 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                  <span className="font-mono text-[0.62rem] text-foreground/60 tracking-widest uppercase">Live Call</span>
                </div>
                <span className="font-mono text-sm text-muted-foreground tracking-[0.15em]">{formatTime(timer)}</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/15 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-foreground/50" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Vox Agent</p>
                    <p className="font-mono text-[0.58rem] text-muted-foreground">ElevenLabs</p>
                  </div>
                </div>
              </div>

              {/* ── Orbs Area ── */}
              <div className="w-full bg-card/30 border-x border-border px-6 py-10 flex items-center justify-center gap-14 min-h-[200px]">
                {/* Agent Orb */}
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={agentSpeaking ? {
                      boxShadow: [
                        "0 0 20px hsl(0 0% 100% / 0.06), 0 0 0 0px hsl(0 0% 100% / 0.1)",
                        "0 0 50px hsl(0 0% 100% / 0.15), 0 0 0 20px hsl(0 0% 100% / 0)",
                        "0 0 20px hsl(0 0% 100% / 0.06), 0 0 0 0px hsl(0 0% 100% / 0.1)",
                      ],
                      scale: [1, 1.06, 1],
                    } : {}}
                    transition={agentSpeaking ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
                    className="w-[92px] h-[92px] rounded-full flex items-center justify-center border border-foreground/15 bg-[radial-gradient(circle,hsl(0_0%_100%/0.08),hsl(0_0%_100%/0.02))] shadow-[0_0_30px_hsl(0_0%_100%/0.04)]"
                  >
                    <Bot className="w-8 h-8 text-foreground/40" />
                  </motion.div>
                  <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-foreground/50">Vox Agent</span>
                  <span className="text-[0.72rem] text-muted-foreground min-h-[18px]">
                    {agentSpeaking ? "Speaking..." : isTyping ? "Thinking..." : "Listening"}
                  </span>
                </div>

                <span className="font-display font-extrabold text-lg text-foreground/10 tracking-wider select-none">VS</span>

                {/* User Orb */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-[92px] h-[92px] rounded-full flex items-center justify-center border border-foreground/10 bg-[radial-gradient(circle,hsl(0_0%_100%/0.04),transparent)] shadow-[0_0_20px_hsl(0_0%_100%/0.02)]">
                    <Mic className="w-8 h-8 text-foreground/30" />
                  </div>
                  <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-foreground/50">You</span>
                  <span className="text-[0.72rem] text-muted-foreground">{userName || "Customer"}</span>
                </div>
              </div>

              {/* ── Audio Visualizer ── */}
              <div className="w-full bg-background/60 border-x border-border px-5 py-3 flex items-center gap-4">
                <span className="font-mono text-[0.58rem] text-muted-foreground tracking-wider uppercase shrink-0 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" />
                  {agentSpeaking ? "ELEVENLABS" : "IDLE"}
                </span>
                <div className="flex-1">
                  <VisualizerBars active={agentSpeaking} color="bg-foreground/15" />
                </div>
              </div>

              {/* ── Live Transcript ── */}
              <div className="w-full bg-background/40 border-x border-border px-5 py-2.5 min-h-[34px] flex items-center">
                <p className={`font-mono text-[0.7rem] italic transition-colors duration-300 ${liveTranscript ? "text-foreground/60" : "text-muted-foreground/60"}`}>
                  {liveTranscript ? liveTranscript : "Live transcript will appear here..."}
                </p>
              </div>

              {/* ── TTS Error Banner ── */}
              {ttsError && (
                <div className="w-full border-x border-border px-5 py-2">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-[0.78rem] text-destructive">
                    ⚠️ TTS unavailable — falling back to text-only mode
                  </div>
                </div>
              )}

              {/* ── Chat ── */}
              <div
                ref={chatRef}
                className="w-full bg-card/30 border-x border-border px-5 py-5 max-h-[260px] overflow-y-auto flex flex-col gap-3"
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
                    <div className={`w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-xs ${
                      msg.role === "bot"
                        ? "bg-gradient-to-br from-foreground/8 to-foreground/3 border border-foreground/10"
                        : "bg-foreground/5 border border-border font-display font-bold text-foreground/40 text-[0.6rem]"
                    }`}>
                      {msg.role === "bot" ? <Bot className="w-3 h-3 text-foreground/40" /> : (userName?.[0]?.toUpperCase() || "U")}
                    </div>
                    <div className={`max-w-[72%] px-3.5 py-2.5 rounded-xl text-[0.85rem] leading-relaxed ${
                      msg.role === "bot"
                        ? "bg-card border border-border rounded-bl-sm text-foreground/80"
                        : "bg-foreground text-background rounded-br-sm font-medium"
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 items-end">
                    <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-foreground/8 to-foreground/3 border border-foreground/10 flex items-center justify-center"><Bot className="w-3 h-3 text-foreground/40" /></div>
                    <div className="bg-card border border-border px-3.5 py-3 rounded-xl rounded-bl-sm flex gap-1.5 items-center">
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
                          animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.18 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Text Input ── */}
              <div className="w-full bg-card border border-border border-t-0 rounded-b-2xl px-4 py-3 flex items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Type a message (or just watch)..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                  disabled={!callActive}
                  className="flex-1 bg-background/60 border border-border text-foreground rounded-lg px-3.5 py-2 text-sm outline-none focus:border-foreground/15 transition-colors placeholder:text-muted-foreground font-mono disabled:opacity-30 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendText}
                  disabled={!callActive || !textInput.trim()}
                  className="bg-foreground text-background rounded-lg px-4 py-2 transition-opacity hover:opacity-80 disabled:opacity-15 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* ── Metrics ── */}
              <div className="w-full grid grid-cols-4 gap-2 mt-3">
                {[
                  { label: "Sentiment", value: sentiment },
                  { label: "Lead Score", value: leadScore },
                  { label: "Intent", value: intent },
                  { label: "TTS", value: ttsError ? "Fallback" : "ElevenLabs" },
                ].map((m) => (
                  <div key={m.label} className="surface-card rounded-xl px-3 py-3">
                    <p className="font-mono text-[0.55rem] text-muted-foreground uppercase tracking-[0.12em] mb-1">{m.label}</p>
                    <p className="font-display font-bold text-sm text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Hint */}
              <p className="text-[0.72rem] text-muted-foreground mt-3 text-center font-mono">
                🔊 Agent is speaking with ElevenLabs voice — listen!
              </p>
            </motion.div>
          )}

          {/* ═══════════════ STEP 3: COMPLETED ═══════════════ */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[520px] text-center flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
                className="w-[80px] h-[80px] rounded-full bg-foreground/5 border border-foreground/15 flex items-center justify-center shadow-[0_0_50px_hsl(0_0%_100%/0.06)] mb-7"
              >
                <CheckCircle2 className="w-8 h-8 text-foreground/60" />
              </motion.div>

              <h2 className="font-display font-extrabold text-[2.2rem] tracking-[-0.04em] text-foreground mb-3">
                Call Completed.
              </h2>
              <p className="text-muted-foreground text-[0.93rem] leading-relaxed mb-8 font-light max-w-md">
                The agent conducted the entire conversation with realistic ElevenLabs voice — qualified the lead, built rapport, and booked the service with zero human involvement.
              </p>

              {/* Summary Card */}
              <div className="surface-card rounded-2xl p-6 w-full mb-6 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                <p className="font-mono text-[0.58rem] tracking-[0.16em] text-muted-foreground uppercase mb-4">
                  📋 Call Summary
                </p>
                {[
                  { k: "Lead", v: userName || "Customer" },
                  { k: "Setor", v: industries.find((i) => i.id === selectedIndustry)?.label || "—" },
                  { k: "Mensagens", v: String(messages.length) },
                  { k: "Duração", v: formatTime(timer) },
                  { k: "Voz", v: voices.find(v => v.id === selectedVoice)?.name || "—" },
                  { k: "TTS", v: "ElevenLabs" },
                  { k: "Resultado", v: "✓ Demo Completed", highlight: true },
                ].map((r) => (
                  <div key={r.k} className="flex justify-between py-2.5 border-b border-border last:border-0 text-[0.84rem]">
                    <span className="text-muted-foreground">{r.k}</span>
                    <span className={`font-medium ${r.highlight ? "text-foreground" : "text-foreground/80"}`}>{r.v}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex gap-3 w-full">
                <a
                  href="https://cal.com/voxmation/meeting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-foreground text-background font-display font-bold rounded-xl py-3.5 px-5 text-sm text-center hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_hsl(0_0%_100%/0.06)]"
                >
                  Quero meu AI Agent
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <button
                  onClick={resetAll}
                  className="flex-1 bg-transparent text-foreground/70 border border-border font-display font-semibold rounded-xl py-3.5 px-5 text-sm hover:border-foreground/15 hover:text-foreground transition-all"
                >
                  ↺ Tentar de novo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── ADDITIONAL SECTIONS ─── */}
      <div className="relative z-10 border-t border-border">
        <MissedCallDemo />
      </div>

      <div className="relative z-10 border-t border-border bg-card/20">
        <DashboardMockup />
      </div>

      <div className="relative z-10 border-t border-border">
        <DemoBenefits />
      </div>
    </div>
  );
};

export default Demo;
