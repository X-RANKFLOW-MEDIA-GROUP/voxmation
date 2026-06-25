/**
 * TypeScript Type Definitions for Calls & Voice System
 * Auto-generated from: supabase/migrations/20260625_create_calls_and_voice_system.sql
 *
 * These types represent the database schema for the voice and call management system.
 */

// ============================================
// ENUMS & TYPES
// ============================================

export type PromptType = 'greeting' | 'menu_option' | 'hold_message' | 'error_message' | 'transfer_message' | 'disconnect_message' | 'custom';
export type VoiceType = 'male' | 'female' | 'custom';
export type Language = 'en-US' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE' | 'pt-BR' | 'it-IT' | 'ja-JP' | 'zh-CN' | 'other';
export type MenuStatus = 'draft' | 'active' | 'paused' | 'archived';

export type CallStatus = 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer' | 'busy' | 'cancelled';
export type CallDirection = 'inbound' | 'outbound';
export type CallDisposition = 'answered' | 'voicemail' | 'busy' | 'no-answer' | 'failed' | 'transferred' | 'disconnected' | null;

export type RecordingStatus = 'pending' | 'processing' | 'ready' | 'archived' | 'deleted';
export type StorageProvider = 'twilio' | 's3' | 'gcs' | 'local';
export type RecordingEncoding = 'ulaw' | 'wav' | 'mp3' | 'ogg';

export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'error';
export type TranscriptionProvider = 'twilio' | 'google' | 'aws' | 'assembly_ai' | 'custom';
export type Sentiment = 'positive' | 'negative' | 'neutral' | 'mixed' | null;

export type CallEventType = 'initiated' | 'ringing' | 'answered' | 'held' | 'transferred' | 'conference' | 'ivr_input' | 'recording_started' | 'recording_stopped' | 'voicemail' | 'disconnected' | 'failed';
export type CallNoteType = 'general' | 'follow_up' | 'issue' | 'feedback' | 'action_item';

export type RoutingStrategy = 'round_robin' | 'least_busy' | 'fifo' | 'priority' | 'skill_based';
export type QueueStatus = 'open' | 'paused' | 'closed';

// ============================================
// VOICE PROMPTS TABLE
// ============================================

export interface VoicePrompt {
  id: string; // UUID
  account_id: string; // UUID
  created_by: string | null; // UUID
  name: string;
  description: string | null;
  prompt_text: string;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  language: Language;
  voice_type: VoiceType;
  voice_speed: number; // 0.5 - 2.0
  voice_pitch: number; // 0.5 - 2.0
  prompt_type: PromptType;
  is_active: boolean;
  usage_count: number;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export type VoicePromptInsert = Omit<VoicePrompt, 'id' | 'created_at' | 'updated_at'>;
export type VoicePromptUpdate = Partial<Omit<VoicePrompt, 'id' | 'account_id' | 'created_at' | 'updated_at'>>;

// ============================================
// IVR MENUS TABLE
// ============================================

export interface MenuOption {
  key: string;
  label: string;
  action: 'transfer' | 'hangup' | 'repeat' | 'goto' | 'ivr' | 'voicemail' | 'custom';
  value?: string;
  next_menu_id?: string;
  description?: string;
}

export interface IVRMenu {
  id: string; // UUID
  account_id: string; // UUID
  created_by: string | null; // UUID
  name: string;
  description: string | null;
  greeting_prompt_id: string | null; // UUID
  menu_structure: MenuOption[];
  timeout_seconds: number;
  max_retries: number;
  invalid_option_message: string | null;
  timeout_message: string | null;
  record_calls: boolean;
  record_caller_input: boolean;
  is_active: boolean;
  status: MenuStatus;
  total_calls_handled: number;
  total_transfers: number;
  average_duration_seconds: number;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export type IVRMenuInsert = Omit<IVRMenu, 'id' | 'created_at' | 'updated_at'>;
export type IVRMenuUpdate = Partial<Omit<IVRMenu, 'id' | 'account_id' | 'created_at' | 'updated_at'>>;

// ============================================
// CALLS TABLE
// ============================================

export interface Call {
  id: string; // UUID
  account_id: string; // UUID
  contact_id: string | null; // UUID
  campaign_id: string | null; // UUID
  ivr_menu_id: string | null; // UUID
  call_sid: string; // Twilio SID - UNIQUE
  parent_call_sid: string | null;
  caller_phone: string;
  caller_name: string | null;
  recipient_phone: string;
  recipient_name: string | null;
  status: CallStatus;
  direction: CallDirection;
  initiated_at: string; // ISO 8601 timestamp
  answered_at: string | null; // ISO 8601 timestamp
  started_at: string | null; // ISO 8601 timestamp
  ended_at: string | null; // ISO 8601 timestamp
  duration_seconds: number | null; // Auto-calculated
  cost: number | null;
  currency: string;
  quality_score: number | null; // 0-100
  voice_mail_detected: boolean;
  disposition: CallDisposition;
  disconnect_reason: string | null;
  disconnect_code: number | null;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export type CallInsert = Omit<Call, 'id' | 'duration_seconds' | 'created_at' | 'updated_at'>;
export type CallUpdate = Partial<Omit<Call, 'id' | 'account_id' | 'call_sid' | 'created_at' | 'updated_at'>>;

// ============================================
// CALL RECORDINGS TABLE
// ============================================

export interface CallRecording {
  id: string; // UUID
  account_id: string; // UUID
  call_id: string; // UUID
  recording_sid: string; // Twilio SID - UNIQUE
  duration_seconds: number | null;
  recording_url: string;
  recording_data: Buffer | null; // Binary data
  storage_provider: StorageProvider;
  storage_path: string | null;
  channels: number; // 1 or 2
  encoding: RecordingEncoding;
  sample_rate: number; // Hz
  status: RecordingStatus;
  is_archived: boolean;
  is_favorite: boolean;
  is_encrypted: boolean;
  encryption_key_id: string | null;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  archived_at: string | null; // ISO 8601 timestamp
  deleted_at: string | null; // ISO 8601 timestamp (soft delete)
}

export type CallRecordingInsert = Omit<CallRecording, 'id' | 'created_at' | 'updated_at' | 'archived_at' | 'deleted_at'>;
export type CallRecordingUpdate = Partial<Omit<CallRecording, 'id' | 'account_id' | 'call_id' | 'recording_sid' | 'created_at' | 'updated_at'>>;

// ============================================
// CALL TRANSCRIPTIONS TABLE
// ============================================

export interface TranscriptionSpeakerTurn {
  speaker: 'caller' | 'recipient' | 'agent' | 'system';
  text: string;
  start_time: number; // seconds
  end_time: number; // seconds
  confidence: number; // 0-1
}

export interface CallTranscription {
  id: string; // UUID
  account_id: string; // UUID
  call_id: string; // UUID
  call_recording_id: string | null; // UUID
  full_transcript: string | null;
  transcript_data: TranscriptionSpeakerTurn[];
  transcription_provider: TranscriptionProvider;
  language: string; // ISO language code
  confidence_score: number | null; // 0-100
  status: TranscriptionStatus;
  processing_started_at: string | null; // ISO 8601
  completed_at: string | null; // ISO 8601
  error_message: string | null;
  duration_seconds: number | null;
  word_count: number | null; // Auto-calculated
  speaker_count: number | null;
  key_phrases: string[];
  entities: Record<string, any>; // NER results
  overall_sentiment: Sentiment;
  sentiment_score: number | null; // -1.0 to 1.0
  emotion_analysis: Record<string, Record<string, number>>; // emotion scores per turn
  tags: string[];
  custom_fields: Record<string, any>;
  is_favorite: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export type CallTranscriptionInsert = Omit<CallTranscription, 'id' | 'word_count' | 'created_at' | 'updated_at'>;
export type CallTranscriptionUpdate = Partial<Omit<CallTranscription, 'id' | 'account_id' | 'call_id' | 'created_at' | 'updated_at'>>;

// ============================================
// CALL LOGS TABLE
// ============================================

export interface CallLog {
  id: string; // UUID
  account_id: string; // UUID
  call_id: string; // UUID
  event_type: CallEventType;
  event_data: Record<string, any>;
  logged_at: string; // ISO 8601 timestamp
  details: string | null;
  tags: string[];
}

export type CallLogInsert = Omit<CallLog, 'id'>;

// ============================================
// CALL NOTES TABLE
// ============================================

export interface CallNote {
  id: string; // UUID
  account_id: string; // UUID
  call_id: string; // UUID
  created_by: string; // UUID
  note_text: string;
  note_type: CallNoteType;
  tags: string[];
  is_pinned: boolean;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export type CallNoteInsert = Omit<CallNote, 'id' | 'created_at' | 'updated_at'>;
export type CallNoteUpdate = Partial<Omit<CallNote, 'id' | 'account_id' | 'call_id' | 'created_by' | 'created_at' | 'updated_at'>>;

// ============================================
// CALL QUEUES TABLE
// ============================================

export interface CallQueue {
  id: string; // UUID
  account_id: string; // UUID
  created_by: string | null; // UUID
  name: string;
  description: string | null;
  max_queue_size: number | null;
  priority_level: number;
  is_active: boolean;
  status: QueueStatus;
  routing_strategy: RoutingStrategy;
  average_wait_time_seconds: number | null;
  answer_rate: number | null;
  current_queue_length: number;
  total_calls_handled: number;
  total_calls_missed: number;
  average_handle_time_seconds: number | null;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export type CallQueueInsert = Omit<CallQueue, 'id' | 'created_at' | 'updated_at'>;
export type CallQueueUpdate = Partial<Omit<CallQueue, 'id' | 'account_id' | 'created_at' | 'updated_at'>>;

// ============================================
// QUERY RESPONSE TYPES
// ============================================

export interface CallWithDetails extends Call {
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
  campaign?: {
    id: string;
    name: string;
  } | null;
  ivr_menu?: IVRMenu | null;
  recording?: CallRecording | null;
  transcription?: CallTranscription | null;
  notes?: CallNote[];
  logs?: CallLog[];
}

export interface TranscriptionWithAnalysis extends CallTranscription {
  sentiment_breakdown?: {
    positive_count: number;
    negative_count: number;
    neutral_count: number;
  };
  key_insights?: {
    topics: string[];
    action_items: string[];
    issues: string[];
  };
}

// ============================================
// BATCH OPERATIONS
// ============================================

export interface CallBatchInsert {
  calls: CallInsert[];
  logs?: CallLogInsert[];
  notes?: CallNoteInsert[];
}

export interface TranscriptionBatchUpdate {
  transcriptionId: string;
  updates: CallTranscriptionUpdate;
  logs?: CallLogInsert[];
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface CallAnalytics {
  total_calls: number;
  total_duration_seconds: number;
  average_duration_seconds: number;
  total_cost: number;
  calls_by_status: Record<CallStatus, number>;
  calls_by_direction: Record<CallDirection, number>;
  calls_by_disposition: Record<string, number>;
  top_callers: Array<{ phone: string; count: number }>;
  top_recipients: Array<{ phone: string; count: number }>;
}

export interface TranscriptionAnalytics {
  total_transcriptions: number;
  completed_count: number;
  failed_count: number;
  average_word_count: number;
  sentiment_distribution: Record<Sentiment, number>;
  average_sentiment_score: number;
  top_key_phrases: Array<{ phrase: string; count: number }>;
}

export interface IVRAnalytics {
  total_calls: number;
  total_transfers: number;
  average_menu_time_seconds: number;
  option_selection_rates: Record<string, number>;
  timeout_rate: number;
}

// ============================================
// DATABASE SCHEMA TYPE (for Supabase client)
// ============================================

export interface Database {
  public: {
    Tables: {
      voice_prompts: {
        Row: VoicePrompt;
        Insert: VoicePromptInsert;
        Update: VoicePromptUpdate;
      };
      ivr_menus: {
        Row: IVRMenu;
        Insert: IVRMenuInsert;
        Update: IVRMenuUpdate;
      };
      calls: {
        Row: Call;
        Insert: CallInsert;
        Update: CallUpdate;
      };
      call_recordings: {
        Row: CallRecording;
        Insert: CallRecordingInsert;
        Update: CallRecordingUpdate;
      };
      call_transcriptions: {
        Row: CallTranscription;
        Insert: CallTranscriptionInsert;
        Update: CallTranscriptionUpdate;
      };
      call_logs: {
        Row: CallLog;
        Insert: CallLogInsert;
        Update: never;
      };
      call_notes: {
        Row: CallNote;
        Insert: CallNoteInsert;
        Update: CallNoteUpdate;
      };
      call_queues: {
        Row: CallQueue;
        Insert: CallQueueInsert;
        Update: CallQueueUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
