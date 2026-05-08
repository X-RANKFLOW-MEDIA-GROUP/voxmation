import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type AudioContextConstructor = typeof AudioContext;

interface WebKitAudioWindow extends Window {
  webkitAudioContext?: AudioContextConstructor;
}

interface VisualizerWaveProps {
  isPlaying: boolean;
  audioElement?: HTMLAudioElement;
  barCount?: number;
  height?: number;
  className?: string;
}

export const VisualizerWave = ({
  isPlaying,
  audioElement,
  barCount = 40,
  height = 32,
  className = '',
}: VisualizerWaveProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();

  useEffect(() => {
    if (!audioElement || !isPlaying) return;

    try {
      // Create audio context and analyser
      const AudioContextConstructor =
        window.AudioContext || (window as WebKitAudioWindow).webkitAudioContext;

      if (!AudioContextConstructor) return;

      const audioContext = new AudioContextConstructor();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;

      // Connect audio element to analyser
      const source = audioContext.createMediaElementAudioSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / barCount;
        const centerY = canvas.height / 2;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
          const value = dataArrayRef.current[dataIndex] / 255;
          const barHeight = value * (canvas.height / 2);

          // Top bar (gradient)
          const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.4)');
          ctx.fillStyle = gradient;
          ctx.fillRect(i * barWidth + 1, centerY - barHeight, barWidth - 2, barHeight);

          // Bottom bar (mirrored)
          ctx.fillRect(i * barWidth + 1, centerY, barWidth - 2, barHeight);
        }

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } catch (error) {
      console.error('Visualizer error:', error);
    }
  }, [audioElement, isPlaying, barCount]);

  return (
    <motion.canvas
      ref={canvasRef}
      width={400}
      height={height}
      className={`w-full rounded-lg ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};

export default VisualizerWave;
