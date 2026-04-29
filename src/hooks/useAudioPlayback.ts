import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
}

export const useAudioPlayback = (audioUrl: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isLoading: false,
    error: null,
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Set audio source
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      setState(prev => ({ ...prev, error: null }));
    }
  }, [audioUrl]);

  // Time update handler
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setState(prev => ({
        ...prev,
        currentTime: audioRef.current!.currentTime,
      }));
    }
  }, []);

  // Metadata loaded handler
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setState(prev => ({
        ...prev,
        duration: audioRef.current!.duration,
      }));
    }
  }, []);

  // Play handler
  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  // Pause handler
  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Error handler
  const handleError = useCallback((e: Event) => {
    setState(prev => ({
      ...prev,
      error: 'Failed to load audio',
      isPlaying: false,
    }));
  }, []);

  // Loading handler
  const handleLoadStart = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  // Attach event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handlePlay, handlePause, handleError, handleLoadStart, handleCanPlay]);

  // Play method
  const play = useCallback(async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to play audio',
        isPlaying: false,
      }));
    }
  }, []);

  // Pause method
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  // Seek method
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
      setState(prev => ({ ...prev, currentTime: audioRef.current!.currentTime }));
    }
  }, [state.duration]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const vol = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setState(prev => ({ ...prev, volume: vol }));
    }
  }, []);

  // Set playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    const validRate = Math.max(0.5, Math.min(2, rate));
    if (audioRef.current) {
      audioRef.current.playbackRate = validRate;
      setState(prev => ({ ...prev, playbackRate: validRate }));
    }
  }, []);

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    state,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    setPlaybackRate,
    formatTime,
  };
};
