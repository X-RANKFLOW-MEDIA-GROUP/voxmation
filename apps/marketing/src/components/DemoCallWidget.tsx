"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Phone, PhoneIncoming, Mic, MicOff, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// Persona used for the public homepage demo (see lib/demo-data.ts).
const HOME_SLUG = "home";
// If the agent doesn't connect within this window, fall back to the sample.
const CONNECT_TIMEOUT_MS = 12000;

const CALL_STEPS = [
  { id: 0, label: "Incoming Call", sub: "From: (214) 555-0192", icon: PhoneIncoming, duration: 1800 },
  { id: 1, label: "AI Answers in 1.8s", sub: '"Thank you for calling! How can I help?"', icon: Mic, duration: 2200 },
  { id: 2, label: "Lead Qualified", sub: "Service: HVAC Repair · Urgency: High", icon: CheckCircle2, duration: 2000 },
  { id: 3, label: "Appointment Booked", sub: "Tomorrow 9AM · Notification sent to team", icon: CheckCircle2, duration: 2000 },
];

function SoundWave({ active, speaking }: { active: boolean; speaking?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ height: "100%", transformOrigin: "center", background: speaking === false ? "#1E4B8F" : "#FF8A1F" }}
          animate={active ? {
            scaleY: speaking === false ? [0.2, 0.45, 0.25, 0.5, 0.2] : [0.3, 1, 0.4, 0.9, 0.3],
            opacity: [0.6, 1, 0.7, 1, 0.6],
          } : { scaleY: 0.2, opacity: 0.3 }}
          transition={active ? {
            duration: speaking === false ? 1.3 : 1,
            repeat: Infinity,
            delay: i * 0.07,
            ease: "easeInOut",
          } : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}

type MicStatus = "idle" | "connecting" | "active" | "error";

export default function DemoCallWidget() {
  // --- Real ElevenLabs browser-mic session (signed-URL method, same as /demo/[slug]) ---
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const conversationRef = useRef<{ endSession: () => Promise<void> } | null>(null);
  const connectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Simulated sample call (fallback / "watch a sample") ---
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const startSimulation = useCallback(() => {
    setStep(0);
    setRunning(true);
    setDone(false);
  }, []);

  useEffect(() => {
    if (!running || step < 0) return;
    if (step >= CALL_STEPS.length) {
      setRunning(false);
      setDone(true);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), CALL_STEPS[step].duration);
    return () => clearTimeout(timer);
  }, [step, running]);

  const resetSimulation = () => { setStep(-1); setRunning(false); setDone(false); };

  const clearConnectTimer = () => {
    if (connectTimer.current) {
      clearTimeout(connectTimer.current);
      connectTimer.current = null;
    }
  };

  const stopVoiceDemo = useCallback(async () => {
    clearConnectTimer();
    try {
      await conversationRef.current?.endSession();
    } finally {
      conversationRef.current = null;
      setMicStatus("idle");
      setAgentSpeaking(false);
    }
  }, []);

  const startVoiceDemo = useCallback(async () => {
    setVoiceError(null);
    setMicStatus("connecting");

    // Safety net: never let the widget hang on "connecting" — fall back to the
    // sample so the section is always usable.
    clearConnectTimer();
    connectTimer.current = setTimeout(() => {
      void conversationRef.current?.endSession().catch(() => {});
      conversationRef.current = null;
      setMicStatus("error");
      setVoiceError("The live agent didn't answer");
      startSimulation();
    }, CONNECT_TIMEOUT_MS);

    try {
      const tokenRes = await fetch("/api/demo/conversation-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: HOME_SLUG }),
      });
      if (!tokenRes.ok) {
        const { error } = await tokenRes.json().catch(() => ({ error: "" }));
        throw new Error(error || "Could not start the live demo.");
      }
      const { signed_url, dynamicVariables } = await tokenRes.json();

      const { Conversation } = await import("@elevenlabs/client");
      const conversation = await Conversation.startSession({
        signedUrl: signed_url,
        dynamicVariables,
        onModeChange: ({ mode }: { mode: string }) => setAgentSpeaking(mode === "speaking"),
        onStatusChange: ({ status }: { status: string }) => {
          if (status === "connected") {
            clearConnectTimer();
            setMicStatus("active");
          }
          if (status === "disconnected") {
            clearConnectTimer();
            setMicStatus("idle");
            setAgentSpeaking(false);
            conversationRef.current = null;
          }
        },
        onError: (message: string) => {
          clearConnectTimer();
          setVoiceError(typeof message === "string" ? message : "Connection error");
          setMicStatus("error");
          startSimulation();
        },
      });
      conversationRef.current = conversation;
    } catch (err) {
      clearConnectTimer();
      setVoiceError(err instanceof Error ? err.message : "Microphone unavailable");
      setMicStatus("error");
      startSimulation();
    }
  }, [startSimulation]);

  useEffect(() => () => clearConnectTimer(), []);

  const isLive = micStatus === "active";
  const isConnecting = micStatus === "connecting";
  const phoneActive = running || isLive || isConnecting;

  return (
    <section className="relative py-28 bg-[#060A10] overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(255,138,31,0.07)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-[#FF8A1F] bg-[rgba(255,138,31,0.1)] border border-[rgba(255,138,31,0.2)] uppercase tracking-widest mb-6 font-body">
              Live Demo
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#F7F5F0] leading-tight mb-6">
              Talk to the AI<br />
              <span className="text-orange">Right Now</span>
            </h2>
            <p className="text-lg text-[#8A99B3] font-body mb-8 leading-relaxed">
              Tap the mic and have a real conversation with VOXmatiON — it answers,
              qualifies the job, and books the appointment, just like it would for
              your customers. No phone call, no signup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#FF8A1F] text-[#0D0D0D] font-bold font-body text-sm hover:bg-[#FFB347] transition-colors glow-orange-sm"
              >
                <Phone className="w-4 h-4" />
                Book Real Demo
              </Link>
            </div>
          </motion.div>

          {/* Right: interactive phone widget */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-sm glass rounded-3xl border-subtle p-6 relative overflow-hidden">
              {/* Phone top notch */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${phoneActive ? "bg-green-400" : "bg-[rgba(255,255,255,0.2)]"}`} />
                  <span className="text-xs text-[#8A99B3] font-body">VOXmatiON AI</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.1)]" />
                  <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.1)]" />
                  <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.1)]" />
                </div>
              </div>

              {/* ===== LIVE conversation view ===== */}
              {(isLive || isConnecting) ? (
                <div className="flex flex-col items-center justify-center py-10 min-h-[280px]">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isLive ? "bg-[rgba(255,138,31,0.12)] border border-[rgba(255,138,31,0.35)] glow-orange-sm" : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]"}`}>
                    {isConnecting ? (
                      <Loader2 className="w-8 h-8 text-[#FF8A1F] animate-spin" />
                    ) : (
                      <SoundWave active speaking={agentSpeaking} />
                    )}
                  </div>
                  <p className="text-sm text-[#8A99B3] font-body text-center mb-6">
                    {isConnecting ? "Connecting to the agent…" : agentSpeaking ? "AI is speaking…" : "Listening — go ahead."}
                  </p>
                  <button
                    onClick={stopVoiceDemo}
                    className="w-full py-3 rounded-xl border border-[rgba(255,138,31,0.3)] text-[#FF8A1F] font-bold text-sm font-body hover:bg-[rgba(255,138,31,0.08)] transition-colors flex items-center justify-center gap-2"
                  >
                    <MicOff className="w-4 h-4" /> {isConnecting ? "Cancel" : "End conversation"}
                  </button>
                </div>
              ) : (
                <>
                  {/* Sound wave or idle state (simulation) */}
                  <div className="flex justify-center mb-6">
                    {running && step === 1 ? (
                      <SoundWave active />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[rgba(255,138,31,0.1)] border border-[rgba(255,138,31,0.2)] flex items-center justify-center">
                        <Phone className={`w-6 h-6 transition-colors ${running ? "text-[#FF8A1F]" : "text-[rgba(255,138,31,0.5)]"}`} />
                      </div>
                    )}
                  </div>

                  {/* Steps */}
                  <div className="space-y-3 mb-6">
                    {CALL_STEPS.map((s, i) => {
                      const active = step === i;
                      const complete = step > i;
                      return (
                        <motion.div
                          key={s.id}
                          animate={{ opacity: complete ? 1 : active ? 1 : 0.3, scale: active ? 1.02 : 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            active ? "bg-[rgba(255,138,31,0.1)] border border-[rgba(255,138,31,0.2)]" :
                            complete ? "bg-[rgba(255,255,255,0.03)]" : ""
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            complete ? "bg-green-500/20" : active ? "bg-[rgba(255,138,31,0.2)]" : "bg-[rgba(255,255,255,0.05)]"
                          }`}>
                            <s.icon className={`w-3.5 h-3.5 ${
                              complete ? "text-green-400" : active ? "text-[#FF8A1F]" : "text-[#8A99B3]"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#F7F5F0] font-body truncate">{s.label}</p>
                            <p className="text-[10px] text-[#8A99B3] font-body truncate">{s.sub}</p>
                          </div>
                          {active && (
                            <motion.div className="w-2 h-2 rounded-full bg-[#FF8A1F]" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                          )}
                          {complete && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* CTA area */}
                  {running ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-[#8A99B3] font-body">AI handling sample call…</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <button
                        onClick={startVoiceDemo}
                        className="w-full py-3 rounded-xl bg-[#FF8A1F] text-[#0D0D0D] font-bold text-sm font-body hover:bg-[#FFB347] transition-colors glow-orange-sm flex items-center justify-center gap-2"
                      >
                        <Mic className="w-4 h-4" />
                        {voiceError ? "Try the live AI again" : "Talk to our AI"}
                      </button>
                      <button
                        onClick={startSimulation}
                        className="w-full py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-[#8A99B3] text-xs font-semibold font-body hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      >
                        {done ? "Replay sample call" : "Or watch a sample call"}
                      </button>
                      {voiceError && (
                        <p className="text-[11px] text-[#8A99B3] font-body text-center pt-1">
                          {voiceError} — showing a sample instead.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
