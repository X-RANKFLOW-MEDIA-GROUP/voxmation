import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import useAudioKeyboardShortcuts from '@/hooks/useAudioKeyboardShortcuts';
import AudioControls from './AudioControls';
import VisualizerWave from './VisualizerWave';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  subtitle?: string;
  showVisualizer?: boolean;
  showTimeDisplay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  className?: string;
}

export const AudioPlayer = ({
  audioUrl,
  title = 'AI Voice Sample',
  subtitle,
  showVisualizer = true,
  showTimeDisplay = true,
  onPlayStart,
  onPlayEnd,
  className = '',
}: AudioPlayerProps) => {
  const {
    state,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    setPlaybackRate,
    formatTime,
  } = useAudioPlayback(audioUrl);

  // Get audio element for visualizer
  const getAudioElement = () => {
    // Create a temporary audio element for the visualizer
    const audio = new Audio(audioUrl);
    return audio;
  };

  useEffect(() => {
    if (state.isPlaying && onPlayStart) {
      onPlayStart();
    }
  }, [state.isPlaying, onPlayStart]);

  useEffect(() => {
    if (!state.isPlaying && state.currentTime > 0 && state.currentTime === state.duration && onPlayEnd) {
      onPlayEnd();
    }
  }, [state.isPlaying, state.currentTime, state.duration, onPlayEnd]);

  // Setup keyboard shortcuts
  useAudioKeyboardShortcuts({
    onPlayPause: togglePlayPause,
    onSeekForward: () => seek(state.currentTime + 5),
    onSeekBackward: () => seek(state.currentTime - 5),
    onVolumeUp: () => setVolume(Math.min(1, state.volume + 0.1)),
    onVolumeDown: () => setVolume(Math.max(0, state.volume - 0.1)),
    enabled: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full rounded-2xl bg-gradient-to-br from-bg-surface to-bg-body border border-border-subtle p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>

      {/* Visualizer */}
      {showVisualizer && state.isPlaying && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 overflow-hidden"
        >
          <VisualizerWave isPlaying={state.isPlaying} barCount={50} height={40} />
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className="mb-6 space-y-2">
        <input
          type="range"
          min="0"
          max={state.duration || 0}
          value={state.currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          disabled={!state.duration}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-primary/20 to-primary/10 accent-primary"
          aria-label="Seek audio"
        />
        {showTimeDisplay && (
          <div className="flex justify-between text-xs text-text-secondary">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm"
        >
          {state.error}
        </motion.div>
      )}

      {/* Controls */}
      <AudioControls
        isPlaying={state.isPlaying}
        volume={state.volume}
        playbackRate={state.playbackRate}
        onPlayPause={togglePlayPause}
        onVolumeChange={setVolume}
        onPlaybackRateChange={setPlaybackRate}
        isLoading={state.isLoading}
        disabled={!!state.error}
      />

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        className="mt-4 text-xs text-text-secondary/50 text-center"
      >
        Space to play/pause • ← / → to seek • ↑ / ↓ to adjust volume
      </motion.div>
    </motion.div>
  );
};

export default AudioPlayer;
