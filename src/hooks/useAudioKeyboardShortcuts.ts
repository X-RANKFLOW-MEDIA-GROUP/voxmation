import { useEffect } from 'react';

interface KeyboardShortcuts {
  onPlayPause?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  enabled?: boolean;
}

export const useAudioKeyboardShortcuts = ({
  onPlayPause,
  onSeekForward,
  onSeekBackward,
  onVolumeUp,
  onVolumeDown,
  onMute,
  enabled = true,
}: KeyboardShortcuts) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlayPause?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSeekForward?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onSeekBackward?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onVolumeUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onVolumeDown?.();
          break;
        case 'KeyM':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onMute?.();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onSeekForward, onSeekBackward, onVolumeUp, onVolumeDown, onMute, enabled]);
};

export default useAudioKeyboardShortcuts;
