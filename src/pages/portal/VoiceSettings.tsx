import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Plus,
  Trash2,
  Copy,
  Download,
  Settings,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MessageCircle,
  KeyboardIcon,
  PhoneOff,
  ArrowRight,
  Code,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface IVRNode {
  id: string;
  type: "say" | "gather" | "redirect" | "hangup";
  label: string;
  config: SayConfig | GatherConfig | RedirectConfig | HangupConfig;
  nextNode?: string; // For linear flows
  connections?: { [key: string]: string }; // For conditional routing
}

interface SayConfig {
  text: string;
  voice?: "elevenlabs" | "twilio";
  language?: string;
  speed?: number;
  pause_after?: number;
}

interface GatherConfig {
  timeout?: number;
  num_digits?: number;
  finish_on_key?: string;
  hints?: string;
  speech_timeout?: number;
}

interface RedirectConfig {
  url: string;
  method?: "GET" | "POST";
}

interface HangupConfig {
  reason?: string;
}

type NodeConfig = SayConfig | GatherConfig | RedirectConfig | HangupConfig;

// Node Components
const SayNodeEditor: React.FC<{
  config: SayConfig;
  onChange: (config: SayConfig) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-3">
    <div>
      <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
        Message Text
      </label>
      <textarea
        value={config.text}
        onChange={(e) => onChange({ ...config, text: e.target.value })}
        placeholder="Enter the message to be spoken..."
        className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        rows={3}
      />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
          Voice Service
        </label>
        <select
          value={config.voice || "elevenlabs"}
          onChange={(e) =>
            onChange({ ...config, voice: e.target.value as "elevenlabs" | "twilio" })
          }
          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="elevenlabs">ElevenLabs</option>
          <option value="twilio">Twilio</option>
        </select>
      </div>

      <div>
        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
          Language
        </label>
        <select
          value={config.language || "en-US"}
          onChange={(e) => onChange({ ...config, language: e.target.value })}
          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
          <option value="pt-BR">Portuguese (BR)</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
          Speed ({(config.speed || 1).toFixed(1)}x)
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={config.speed || 1}
          onChange={(e) =>
            onChange({ ...config, speed: parseFloat(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
          Pause After (ms)
        </label>
        <input
          type="number"
          min="0"
          max="5000"
          step="100"
          value={config.pause_after || 0}
          onChange={(e) =>
            onChange({ ...config, pause_after: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </div>
  </div>
);

const GatherNodeEditor: React.FC<{
  config: GatherConfig;
  onChange: (config: GatherConfig) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
          Timeout (seconds)
        </label>
        <input
          type="number"
          min="1"
          max="30"
          value={config.timeout || 5}
          onChange={(e) =>
            onChange({ ...config, timeout: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
          Num Digits
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={config.num_digits || 1}
          onChange={(e) =>
            onChange({ ...config, num_digits: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
          Finish On Key
        </label>
        <input
          type="text"
          placeholder="#"
          maxLength={1}
          value={config.finish_on_key || "#"}
          onChange={(e) =>
            onChange({ ...config, finish_on_key: e.target.value })
          }
          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
          Speech Timeout (ms)
        </label>
        <input
          type="number"
          min="100"
          max="10000"
          step="100"
          value={config.speech_timeout || 3000}
          onChange={(e) =>
            onChange({ ...config, speech_timeout: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </div>

    <div>
      <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
        Hints (comma-separated)
      </label>
      <input
        type="text"
        placeholder="sales, support, billing"
        value={config.hints || ""}
        onChange={(e) => onChange({ ...config, hints: e.target.value })}
        className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  </div>
);

const RedirectNodeEditor: React.FC<{
  config: RedirectConfig;
  onChange: (config: RedirectConfig) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-3">
    <div>
      <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
        Webhook URL
      </label>
      <input
        type="text"
        placeholder="https://example.com/webhook"
        value={config.url}
        onChange={(e) => onChange({ ...config, url: e.target.value })}
        className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>

    <div>
      <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
        HTTP Method
      </label>
      <select
        value={config.method || "POST"}
        onChange={(e) =>
          onChange({ ...config, method: e.target.value as "GET" | "POST" })
        }
        className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="POST">POST</option>
        <option value="GET">GET</option>
      </select>
    </div>
  </div>
);

const HangupNodeEditor: React.FC<{
  config: HangupConfig;
  onChange: (config: HangupConfig) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-3">
    <div>
      <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
        Hangup Reason (optional)
      </label>
      <input
        type="text"
        placeholder="Call completed successfully"
        value={config.reason || ""}
        onChange={(e) => onChange({ ...config, reason: e.target.value })}
        className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  </div>
);

const NodeTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case "say":
      return <MessageCircle className="h-4 w-4" />;
    case "gather":
      return <KeyboardIcon className="h-4 w-4" />;
    case "redirect":
      return <ArrowRight className="h-4 w-4" />;
    case "hangup":
      return <PhoneOff className="h-4 w-4" />;
    default:
      return <Phone className="h-4 w-4" />;
  }
};

// Main Component
const VoiceSettings: React.FC = () => {
  const [nodes, setNodes] = useState<IVRNode[]>([
    {
      id: "1",
      type: "say",
      label: "Welcome Message",
      config: { text: "Thank you for calling. How can we help you today?" },
      nextNode: "2",
    },
    {
      id: "2",
      type: "gather",
      label: "Main Menu",
      config: { timeout: 5, num_digits: 1, hints: "sales, support" },
      nextNode: "3",
    },
    {
      id: "3",
      type: "hangup",
      label: "End Call",
      config: { reason: "Call completed" },
    },
  ]);

  const [expandedNode, setExpandedNode] = useState<string>("1");
  const [showTwiML, setShowTwiML] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const updateNode = useCallback((id: string, updates: Partial<IVRNode>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, ...updates } : node))
    );
  }, []);

  const addNode = useCallback(() => {
    const newId = String(Math.max(...nodes.map((n) => parseInt(n.id)), 0) + 1);
    const newNode: IVRNode = {
      id: newId,
      type: "say",
      label: "New Node",
      config: { text: "" },
    };
    setNodes((prev) => [...prev, newNode]);
    setExpandedNode(newId);
  }, [nodes]);

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setExpandedNode("");
  }, []);

  const generateTwiML = useCallback((): string => {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';

    nodes.forEach((node) => {
      switch (node.type) {
        case "say": {
          const config = node.config as SayConfig;
          const attrs = [
            'voice="alice"',
            config.voice === "elevenlabs" ? 'engine="elevenlabs"' : "",
            config.speed && config.speed !== 1 ? `rate="${config.speed}"` : "",
            config.pause_after ? `postCallbackWaitMillis="${config.pause_after}"` : "",
          ]
            .filter(Boolean)
            .join(" ");
          twiml += `  <Say ${attrs}>${escapeXml(config.text)}</Say>\n`;
          break;
        }
        case "gather": {
          const config = node.config as GatherConfig;
          const attrs = [
            config.timeout ? `timeout="${config.timeout}"` : "",
            config.num_digits ? `numDigits="${config.num_digits}"` : "",
            config.finish_on_key ? `finishOnKey="${config.finish_on_key}"` : "",
            config.speech_timeout ? `speechTimeout="${(config.speech_timeout / 1000).toFixed(1)}"` : "",
          ]
            .filter(Boolean)
            .join(" ");
          twiml += `  <Gather ${attrs}>\n`;
          twiml += `    <Say>Press a digit or speak your choice.</Say>\n`;
          twiml += `  </Gather>\n`;
          break;
        }
        case "redirect": {
          const config = node.config as RedirectConfig;
          twiml += `  <Redirect method="${config.method || "POST"}">${escapeXml(config.url)}</Redirect>\n`;
          break;
        }
        case "hangup":
          twiml += `  <Hangup/>\n`;
          break;
      }
    });

    twiml += "</Response>";
    return twiml;
  }, [nodes]);

  const copyTwiML = useCallback(() => {
    const twiml = generateTwiML();
    navigator.clipboard.writeText(twiml);
    toast.success("TwiML copied to clipboard");
  }, [generateTwiML]);

  const downloadTwiML = useCallback(() => {
    const twiml = generateTwiML();
    const blob = new Blob([twiml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ivr-flow.xml";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("TwiML downloaded");
  }, [generateTwiML]);

  const saveFlow = useCallback(() => {
    const flowJson = JSON.stringify(nodes, null, 2);
    const blob = new Blob([flowJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ivr-flow.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Flow saved as JSON");
  }, [nodes]);

  const nodeTypeLabel: { [key: string]: string } = {
    say: "Speak Message",
    gather: "Collect Input",
    redirect: "Forward Call",
    hangup: "End Call",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-1">
          <Phone className="h-5 w-5 text-primary/60" />
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
            IVR Menu Builder
          </h1>
        </div>
        <p className="text-silver text-sm font-mono mb-6">
          Visual IVR flow builder with automatic TwiML generation for Twilio
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary/60" />
              <h2 className="font-mono text-sm font-bold text-foreground">
                IVR Nodes ({nodes.length})
              </h2>
            </div>
            <Button
              onClick={addNode}
              size="sm"
              className="bg-primary/10 border border-primary/20 hover:bg-primary/15 text-primary"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Node
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="surface-card rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedNode(expandedNode === node.id ? "" : node.id)
                  }
                  className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-primary/3 transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-silver/40 shrink-0" />

                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <NodeTypeIcon type={node.type} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-bold text-foreground">
                      {node.label}
                    </p>
                    <p className="text-[11px] font-mono text-silver">
                      {nodeTypeLabel[node.type]}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {index < nodes.length - 1 && (
                      <div className="text-[10px] font-mono text-silver/60">
                        Step {index + 1}
                      </div>
                    )}
                  </div>

                  {expandedNode === node.id ? (
                    <ChevronUp className="h-4 w-4 text-silver shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-silver shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedNode === node.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/50 px-6 py-5 space-y-5"
                    >
                      {/* Node Label */}
                      <div>
                        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
                          Node Label
                        </label>
                        <input
                          type="text"
                          value={node.label}
                          onChange={(e) =>
                            updateNode(node.id, { label: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>

                      {/* Node Type Selector */}
                      <div>
                        <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
                          Node Type
                        </label>
                        <select
                          value={node.type}
                          onChange={(e) => {
                            const newType = e.target.value as IVRNode["type"];
                            let newConfig: NodeConfig = {};
                            switch (newType) {
                              case "say":
                                newConfig = { text: "" };
                                break;
                              case "gather":
                                newConfig = { timeout: 5, num_digits: 1 };
                                break;
                              case "redirect":
                                newConfig = { url: "", method: "POST" };
                                break;
                              case "hangup":
                                newConfig = { reason: "" };
                                break;
                            }
                            updateNode(node.id, {
                              type: newType,
                              config: newConfig,
                            });
                          }}
                          className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="say">Say (Speak Message)</option>
                          <option value="gather">Gather (Collect Input)</option>
                          <option value="redirect">Redirect (Forward Call)</option>
                          <option value="hangup">Hangup (End Call)</option>
                        </select>
                      </div>

                      {/* Node Config Editor */}
                      {node.type === "say" && (
                        <SayNodeEditor
                          config={node.config as SayConfig}
                          onChange={(config) =>
                            updateNode(node.id, { config })
                          }
                        />
                      )}
                      {node.type === "gather" && (
                        <GatherNodeEditor
                          config={node.config as GatherConfig}
                          onChange={(config) =>
                            updateNode(node.id, { config })
                          }
                        />
                      )}
                      {node.type === "redirect" && (
                        <RedirectNodeEditor
                          config={node.config as RedirectConfig}
                          onChange={(config) =>
                            updateNode(node.id, { config })
                          }
                        />
                      )}
                      {node.type === "hangup" && (
                        <HangupNodeEditor
                          config={node.config as HangupConfig}
                          onChange={(config) =>
                            updateNode(node.id, { config })
                          }
                        />
                      )}

                      {/* Next Node Selector */}
                      {node.type !== "hangup" && index < nodes.length - 1 && (
                        <div>
                          <label className="text-[11px] font-mono text-primary tracking-wider uppercase mb-1.5 block">
                            Next Node
                          </label>
                          <select
                            value={node.nextNode || ""}
                            onChange={(e) =>
                              updateNode(node.id, { nextNode: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">-- Select Next Node --</option>
                            {nodes
                              .filter((n) => n.id !== node.id)
                              .map((n) => (
                                <option key={n.id} value={n.id}>
                                  {n.label}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}

                      {/* Delete Button */}
                      {nodes.length > 1 && (
                        <Button
                          onClick={() => deleteNode(node.id)}
                          size="sm"
                          variant="outline"
                          className="w-full border-red-500/20 text-red-500 hover:bg-red-500/5"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Delete Node
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right Panel - TwiML & Export */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="surface-card rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-mono font-bold text-foreground">
              Actions
            </h3>

            <Button
              onClick={() => setShowTwiML(!showTwiML)}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              {showTwiML ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showTwiML ? "Hide TwiML" : "View TwiML"}
            </Button>

            <Button
              onClick={copyTwiML}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy TwiML
            </Button>

            <Button
              onClick={downloadTwiML}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Download XML
            </Button>

            <Button
              onClick={saveFlow}
              size="sm"
              className="w-full justify-start bg-primary/10 border border-primary/20 hover:bg-primary/15 text-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as JSON
            </Button>
          </div>

          {/* Info Box */}
          <div className="surface-card rounded-2xl p-4 border border-blue-500/20 bg-blue-500/3">
            <div className="flex gap-3">
              <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-mono text-blue-500 font-bold mb-1">
                  TwiML Generation
                </p>
                <p className="text-[10px] font-mono text-silver leading-relaxed">
                  The IVR flow automatically generates TwiML compatible with Twilio.
                  Use the generated XML with your Twilio phone number webhook.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="surface-card rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-mono font-bold text-foreground">
              Flow Stats
            </h3>
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-silver">Total Nodes</span>
                <span className="text-primary font-bold">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver">Say Nodes</span>
                <span className="text-primary font-bold">
                  {nodes.filter((n) => n.type === "say").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver">Gather Nodes</span>
                <span className="text-primary font-bold">
                  {nodes.filter((n) => n.type === "gather").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver">Redirect Nodes</span>
                <span className="text-primary font-bold">
                  {nodes.filter((n) => n.type === "redirect").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TwiML Preview */}
      <AnimatePresence>
        {showTwiML && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="surface-card rounded-2xl p-6 border border-code"
          >
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-4 w-4 text-primary/60" />
              <h3 className="font-mono text-sm font-bold text-foreground">
                Generated TwiML
              </h3>
            </div>

            <pre className="bg-background/50 rounded-xl p-4 overflow-x-auto border border-border/50">
              <code className="font-mono text-[10px] text-silver leading-relaxed whitespace-pre-wrap break-all">
                {generateTwiML()}
              </code>
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to escape XML
function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default VoiceSettings;
