import { motion } from 'framer-motion';
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';

interface AudioControlsProps {
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const AudioControls = ({
  isPlaying,
  volume,
  playbackRate,
  onPlayPause,
  onVolumeChange,
  onPlaybackRateChange,
  isLoading = false,
  disabled = false,
}: AudioControlsProps) => {
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-6 w-full">
      {/* Play/Pause Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPlayPause}
        disabled={disabled || isLoading}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center hover:from-primary/30 hover:to-primary/15 hover:border-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary" />
          </motion.div>
        ) : isPlaying ? (
          <Pause className="h-5 w-5 text-primary fill-primary" />
        ) : (
          <Play className="h-5 w-5 text-primary fill-primary" />
        )}
      </motion.button>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary/60">{getVolumeIcon()}</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-12 h-1 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-primary/20 to-primary/10 accent-primary"
          aria-label="Volume control"
        />
      </div>

      {/* Playback Speed Control */}
      <div className="flex items-center gap-1">
        {[0.75, 1, 1.25, 1.5].map((rate) => (
          <motion.button
            key={rate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPlaybackRateChange(rate)}
            disabled={disabled}
            className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
              playbackRate === rate
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-bg-surface text-text-secondary/60 border border-border-subtle hover:border-primary/20'
            }`}
            aria-label={`Set playback speed to ${rate}x`}
          >
            {rate}x
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AudioControls;
