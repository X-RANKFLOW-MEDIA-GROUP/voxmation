import { useState } from 'react';
import { motion } from 'framer-motion';
import AudioPlayer from './audio/AudioPlayer';

interface VoiceSample {
  id: string;
  name: string;
  description: string;
  audioUrl: string;
  accent?: string;
}

interface VoiceDemonstrationProps {
  samples?: VoiceSample[];
  title?: string;
  subtitle?: string;
  showVisualizer?: boolean;
  className?: string;
}

const defaultSamples: VoiceSample[] = [
  {
    id: 'professional-male',
    name: 'Professional Male',
    description: 'Clear, authoritative voice perfect for business calls',
    audioUrl: 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream?text=Hello%20this%20is%20your%20AI%20voice%20agent%20speaking.%20How%20can%20I%20help%20you%20today',
    accent: 'American',
  },
  {
    id: 'professional-female',
    name: 'Professional Female',
    description: 'Warm and friendly voice for customer service',
    audioUrl: 'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream?text=Welcome%20to%20our%20service.%20I%27m%20here%20to%20assist%20you%20with%20any%20questions',
    accent: 'American',
  },
  {
    id: 'friendly-male',
    name: 'Friendly Male',
    description: 'Casual and approachable tone for lead qualification',
    audioUrl: 'https://api.elevenlabs.io/v1/text-to-speech/CWhw2mV3YN0tFh7gB3F1/stream?text=Thanks%20for%20calling.%20Let%20me%20get%20you%20set%20up%20with%20one%20of%20our%20specialists',
    accent: 'American',
  },
  {
    id: 'energetic-female',
    name: 'Energetic Female',
    description: 'Upbeat and enthusiastic for promotional calls',
    audioUrl: 'https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x/stream?text=Great%20news%20Your%20appointment%20has%20been%20confirmed.%20We%20look%20forward%20to%20seeing%20you%20soon',
    accent: 'American',
  },
];

export const VoiceDemonstration = ({
  samples = defaultSamples,
  title = 'Experience Our AI Voice',
  subtitle = 'Listen to different voice profiles your AI agent can use. Each voice is natural, clear, and professionally trained.',
  showVisualizer = true,
  className = '',
}: VoiceDemonstrationProps) => {
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(samples[0]?.id || '');

  const selectedSample = samples.find((s) => s.id === selectedVoiceId);

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* Voice Selection Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {samples.map((sample, idx) => (
          <motion.button
            key={sample.id}
            onClick={() => setSelectedVoiceId(sample.id)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
              selectedVoiceId === sample.id
                ? 'bg-primary/15 border-primary/50 shadow-lg shadow-primary/20'
                : 'bg-bg-surface border-border-subtle hover:border-primary/30 hover:bg-bg-body'
            }`}
          >
            {/* Selection indicator */}
            {selectedVoiceId === sample.id && (
              <motion.div
                layoutId="voiceIndicator"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
                transition={{ type: 'spring', damping: 30 }}
              />
            )}

            <div className="relative z-10">
              <h3 className="font-semibold text-foreground text-sm mb-1">{sample.name}</h3>
              <p className="text-xs text-text-secondary/70 line-clamp-2">
                {sample.description}
              </p>
              {sample.accent && (
                <span className="inline-block mt-2 text-xs bg-primary/10 text-primary/80 px-2 py-1 rounded">
                  {sample.accent}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Audio Player */}
      {selectedSample && (
        <motion.div
          key={selectedSample.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AudioPlayer
            audioUrl={selectedSample.audioUrl}
            title={selectedSample.name}
            subtitle={selectedSample.description}
            showVisualizer={showVisualizer}
            showTimeDisplay={true}
          />
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10"
      >
        <p className="text-sm text-text-secondary">
          <strong>💡 Tip:</strong> All voices support multiple languages and can be customized to match your brand tone. You can also combine different voices for multi-agent scenarios.
        </p>
      </motion.div>
    </div>
  );
};

export default VoiceDemonstration;
