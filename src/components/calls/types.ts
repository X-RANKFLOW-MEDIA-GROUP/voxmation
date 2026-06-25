/**
 * Type definitions for Call History Component
 */

import { Call, CallRecording, CallTranscription, CallDirection, CallStatus } from '@/types/calls_and_voice.types';

/**
 * Extended call with related data
 */
export interface CallWithDetails extends Call {
  recording?: CallRecording | null;
  transcription?: CallTranscription | null;
}

/**
 * Call History Component Props
 */
export interface CallHistoryProps {
  calls: CallWithDetails[];
  isLoading?: boolean;
  onCallSelect?: (call: Call) => void;
}

/**
 * Filter state for calls
 */
export interface CallFilters {
  searchQuery: string;
  statuses: CallStatus[];
  directions: CallDirection[];
}

/**
 * Call statistics
 */
export interface CallStats {
  totalCalls: number;
  totalDuration: number;
  callsWithRecording: number;
  callsWithTranscription: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

/**
 * Audio player state
 */
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

/**
 * Transcription display mode
 */
export type TranscriptionMode = 'collapsed' | 'preview' | 'full';
