import { useState } from 'react';
import { motion } from 'framer-motion';
import AudioPlayer from './audio/AudioPlayer';

interface VoiceWidgetProps {
  text: string;
  voiceId?: string;
  variant?: 'compact' | 'full';
  showLabel?: boolean;
  className?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

const voiceIdMap: Record<string, string> = {
  'professional-male': '21m00Tcm4TlvDq8ikWAM',
  'professional-female': 'EXAVITQu4vr4xnSDxMaL',
  'friendly-male': 'CWhw2mV3YN0tFh7gB3F1',
  'energetic-female': '9BWtsMINqrJLrRacOk9x',
};

export const VoiceWidget = ({
  text,
  voiceId = 'professional-female',
  variant = 'compact',
  showLabel = true,
  className = '',
  onPlayStart,
  onPlayEnd,
}: VoiceWidgetProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Generate audio URL using ElevenLabs API
  const generateAudio = async () => {
    try {
      setIsGenerating(true);
      const voiceID = voiceIdMap[voiceId] || voiceId;
      
      // Using ElevenLabs public streaming endpoint
      const encodedText = encodeURIComponent(text);
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}/stream?text=${encodedText}`;
      
      setAudioUrl(url);
    } catch (error) {
      console.error('Failed to generate audio:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`inline-flex items-center gap-2 ${className}`}
      >
        {showLabel && <span className="text-xs font-medium text-text-secondary">Listen:</span>}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateAudio}
          disabled={isGenerating || !!audioUrl}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/20 text-primary text-sm font-medium transition-all disabled:opacity-60"
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <div className="h-3 w-3 rounded-full border border-primary/50 border-t-primary" />
            </motion.div>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 5.343a1 1 0 00-1.414 1.414L15.586 9l-2.343 2.343a1 1 0 101.414 1.414L17 10.414l2.343 2.343a1 1 0 101.414-1.414L18.414 10l2.343-2.343a1 1 0 00-1.414-1.414L17 8.586l-2.343-2.343z" />
            </svg>
          )}
          {isGenerating ? 'Generating...' : audioUrl ? 'Playing' : 'Listen'}
        </motion.button>
      </motion.div>
    );
  }

  // Full variant
  if (!audioUrl && !isGenerating) {
    return (
      <motion.button
        onClick={generateAudio}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full px-6 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 text-primary font-medium transition-all ${className}`}
      >
        {isGenerating ? 'Generating voice...' : 'Listen to Voice Demo'}
      </motion.button>
    );
  }

  if (audioUrl) {
    return (
      <AudioPlayer
        audioUrl={audioUrl}
        title="AI Voice Demo"
        subtitle={text.substring(0, 60) + (text.length > 60 ? '...' : '')}
        showVisualizer={true}
        showTimeDisplay={true}
        onPlayStart={onPlayStart}
        onPlayEnd={onPlayEnd}
        className={className}
      />
    );
  }

  return null;
};

export default VoiceWidget;
