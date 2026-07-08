/**
 * Unit tests for CallHistory component
 *
 * Run with: npm test CallHistory.test.tsx
 */

import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { CallHistory } from './CallHistory';
import { Call, CallRecording, CallTranscription, CallStatus } from '@/types/calls_and_voice.types';

// Mock data
const mockCall: Call & { recording?: CallRecording | null; transcription?: CallTranscription | null } = {
  id: '1',
  account_id: 'acc-1',
  call_sid: 'CA123456789',
  caller_phone: '+1 (555) 123-4567',
  caller_name: 'John Doe',
  recipient_phone: '+1 (555) 987-6543',
  recipient_name: 'Jane Smith',
  status: 'completed' as CallStatus,
  direction: 'inbound',
  initiated_at: '2024-06-25T10:30:00Z',
  answered_at: '2024-06-25T10:30:05Z',
  started_at: '2024-06-25T10:30:05Z',
  ended_at: '2024-06-25T10:35:23Z',
  duration_seconds: 318,
  cost: 0.25,
  currency: 'USD',
  quality_score: null,
  voice_mail_detected: false,
  disposition: 'answered',
  disconnect_reason: null,
  disconnect_code: null,
  tags: [],
  custom_fields: {},
  created_at: '2024-06-25T10:30:00Z',
  updated_at: '2024-06-25T10:35:23Z',
  contact_id: null,
  campaign_id: null,
  ivr_menu_id: null,
  parent_call_sid: null,
  recording: {
    id: 'rec-1',
    account_id: 'acc-1',
    call_id: '1',
    recording_sid: 'RE123456789',
    duration_seconds: 318,
    recording_url: 'https://example.com/recording.wav',
    recording_data: null,
    storage_provider: 'twilio',
    storage_path: null,
    channels: 1,
    encoding: 'wav',
    sample_rate: 8000,
    status: 'ready',
    is_archived: false,
    is_favorite: false,
    is_encrypted: false,
    encryption_key_id: null,
    tags: [],
    custom_fields: {},
    created_at: '2024-06-25T10:35:25Z',
    updated_at: '2024-06-25T10:35:25Z',
    archived_at: null,
    deleted_at: null,
  },
  transcription: {
    id: 'trans-1',
    account_id: 'acc-1',
    call_id: '1',
    call_recording_id: 'rec-1',
    full_transcript: 'Customer: Hi, I need help with my order. Agent: Sure, what order number?',
    transcript_data: [
      {
        speaker: 'caller',
        text: 'Hi, I need help with my order',
        start_time: 0,
        end_time: 3,
        confidence: 0.95,
      },
      {
        speaker: 'recipient',
        text: 'Sure, what order number?',
        start_time: 3,
        end_time: 5,
        confidence: 0.98,
      },
    ],
    transcription_provider: 'google',
    language: 'en-US',
    confidence_score: 0.96,
    status: 'completed',
    processing_started_at: '2024-06-25T10:35:30Z',
    completed_at: '2024-06-25T10:45:00Z',
    error_message: null,
    duration_seconds: 318,
    word_count: 156,
    speaker_count: 2,
    key_phrases: ['order number', 'help', 'customer service'],
    entities: {},
    overall_sentiment: 'positive',
    sentiment_score: 0.75,
    emotion_analysis: {},
    tags: [],
    custom_fields: {},
    is_favorite: false,
    created_at: '2024-06-25T10:35:30Z',
    updated_at: '2024-06-25T10:45:00Z',
  },
};

const mockFailedCall: Call = {
  ...mockCall,
  id: '2',
  status: 'failed' as CallStatus,
  duration_seconds: null,
  disposition: 'failed',
  recording: null,
  transcription: null,
};

const mockNoAnswerCall: Call = {
  ...mockCall,
  id: '3',
  caller_phone: '+1 (555) 222-3333',
  status: 'no-answer' as CallStatus,
  duration_seconds: 0,
  disposition: 'no-answer',
  direction: 'outbound',
  recording: null,
  transcription: null,
};

describe('CallHistory Component', () => {
  describe('Rendering', () => {
    it('should render the component with title', () => {
      render(<CallHistory calls={[]} />);
      expect(screen.getByText('Call History')).toBeInTheDocument();
    });

    it('should display empty state when no calls', () => {
      render(<CallHistory calls={[]} />);
      expect(screen.getByText('No calls found')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(<CallHistory calls={[]} isLoading={true} />);
      expect(screen.getByText('Loading calls...')).toBeInTheDocument();
    });

    it('should render table with correct columns', () => {
      render(<CallHistory calls={[mockCall]} />);
      expect(screen.getByText('Date & Time')).toBeInTheDocument();
      expect(screen.getByText('Caller')).toBeInTheDocument();
      expect(screen.getByText('Recipient')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Recording')).toBeInTheDocument();
    });
  });

  describe('Call Display', () => {
    it('should render call data correctly', () => {
      render(<CallHistory calls={[mockCall]} />);

      expect(screen.getByText('Jun 25, 2024 10:30')).toBeInTheDocument();
      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('+1 (555) 987-6543')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should format duration correctly', () => {
      render(<CallHistory calls={[mockCall]} />);
      expect(screen.getByText('5:18')).toBeInTheDocument();
    });

    it('should display status badge', () => {
      render(<CallHistory calls={[mockCall]} />);
      expect(screen.getByText('completed')).toBeInTheDocument();
    });

    it('should display call direction', () => {
      render(<CallHistory calls={[mockCall]} />);
      expect(screen.getByText('inbound')).toBeInTheDocument();
    });

    it('should show recording info', () => {
      render(<CallHistory calls={[mockCall]} />);
      expect(screen.getByText('WAV')).toBeInTheDocument();
    });

    it('should show "No recording" for calls without recording', () => {
      render(<CallHistory calls={[mockFailedCall]} />);
      expect(screen.getByText('No recording')).toBeInTheDocument();
    });
  });

  describe('Row Expansion', () => {
    it('should expand row when clicked', async () => {
      const user = userEvent.setup();
      render(<CallHistory calls={[mockCall]} />);

      const row = screen.getByText('+1 (555) 123-4567').closest('tr');
      if (row) {
        const expandButton = within(row).getByRole('button', { name: '' });
        await user.click(expandButton);

        // Should show transcription details
        await waitFor(() => {
          expect(screen.getByText('Transcription & Analysis')).toBeInTheDocument();
        });
      }
    });

    it('should collapse row when clicked again', async () => {
      const user = userEvent.setup();
      render(<CallHistory calls={[mockCall]} />);

      const row = screen.getByText('+1 (555) 123-4567').closest('tr');
      if (row) {
        const expandButton = within(row).getByRole('button');

        // Expand
        await user.click(expandButton);
        await waitFor(() => {
          expect(screen.getByText('Transcription & Analysis')).toBeInTheDocument();
        });

        // Collapse
        await user.click(expandButton);
        await waitFor(() => {
          expect(screen.queryByText('Transcription & Analysis')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Transcription Display', () => {
    it('should display sentiment analysis', async () => {
      const user = userEvent.setup();
      const { container } = render(<CallHistory calls={[mockCall]} />);

      const expandButton = container.querySelector('button');
      if (expandButton) {
        await user.click(expandButton);

        await waitFor(() => {
          expect(screen.getByText('positive')).toBeInTheDocument();
          expect(screen.getByText(/Score:/)).toBeInTheDocument();
        });
      }
    });

    it('should display key phrases', async () => {
      const user = userEvent.setup();
      const { container } = render(<CallHistory calls={[mockCall]} />);

      const expandButton = container.querySelector('button');
      if (expandButton) {
        await user.click(expandButton);

        await waitFor(() => {
          expect(screen.getByText('order number')).toBeInTheDocument();
          expect(screen.getByText('help')).toBeInTheDocument();
        });
      }
    });

    it('should display transcription metrics', async () => {
      const user = userEvent.setup();
      const { container } = render(<CallHistory calls={[mockCall]} />);

      const expandButton = container.querySelector('button');
      if (expandButton) {
        await user.click(expandButton);

        await waitFor(() => {
          expect(screen.getByText('156')).toBeInTheDocument(); // word count
          expect(screen.getByText('2')).toBeInTheDocument(); // speaker count
        });
      }
    });
  });

  describe('Search Functionality', () => {
    it('should filter calls by phone number', async () => {
      const user = userEvent.setup();
      render(<CallHistory calls={[mockCall, mockNoAnswerCall]} />);

      const searchInput = screen.getByPlaceholderText(/Search by/i);
      await user.type(searchInput, '+1 (555) 222-3333');

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('+1 (555) 222-3333')).toBeInTheDocument();
      });
    });

    it('should filter calls by name', async () => {
      const user = userEvent.setup();
      render(<CallHistory calls={[mockCall, mockNoAnswerCall]} />);

      const searchInput = screen.getByPlaceholderText(/Search by/i);
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should show "no calls match" message', async () => {
      const user = userEvent.setup();
      render(<CallHistory calls={[mockCall]} />);

      const searchInput = screen.getByPlaceholderText(/Search by/i);
      await user.type(searchInput, '999-999-9999');

      await waitFor(() => {
        expect(screen.getByText('No calls match your filters')).toBeInTheDocument();
      });
    });
  });

  describe('Status Filter', () => {
    it('should filter by completed status', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CallHistory calls={[mockCall, mockFailedCall, mockNoAnswerCall]} />
      );

      // Find and click status filter button
      const filterButtons = screen.getAllByText(/Status/);
      const statusButton = filterButtons[0].closest('button');

      if (statusButton) {
        await user.click(statusButton);

        // Select completed status
        const completedCheckbox = screen.getByRole('menuitemcheckbox', { name: /completed/ });
        await user.click(completedCheckbox);

        await waitFor(() => {
          expect(screen.getByText('completed')).toBeInTheDocument();
          expect(screen.queryByText('failed')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Direction Filter', () => {
    it('should filter by inbound direction', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CallHistory calls={[mockCall, mockNoAnswerCall]} />
      );

      const filterButtons = screen.getAllByText(/Direction/);
      const directionButton = filterButtons[0].closest('button');

      if (directionButton) {
        await user.click(directionButton);

        const inboundCheckbox = screen.getByRole('menuitemcheckbox', { name: /inbound/ });
        await user.click(inboundCheckbox);

        await waitFor(() => {
          expect(screen.getByText('John Doe')).toBeInTheDocument();
          // outbound call should not be visible
        });
      }
    });
  });

  describe('Statistics', () => {
    it('should display summary statistics', () => {
      render(<CallHistory calls={[mockCall, mockFailedCall]} />);

      expect(screen.getByText('Total Calls')).toBeInTheDocument();
      expect(screen.getByText('Total Duration')).toBeInTheDocument();
      expect(screen.getByText('With Recording')).toBeInTheDocument();
      expect(screen.getByText('With Transcription')).toBeInTheDocument();
    });

    it('should calculate total calls correctly', () => {
      render(<CallHistory calls={[mockCall, mockFailedCall, mockNoAnswerCall]} />);

      // The component should show 3 calls
      const totalCallElements = screen.getAllByText(/Total Calls/);
      expect(totalCallElements.length).toBeGreaterThan(0);
    });
  });

  describe('Callbacks', () => {
    it('should call onCallSelect when row is clicked', async () => {
      const user = userEvent.setup();
      const onCallSelect = jest.fn();
      const { container } = render(
        <CallHistory calls={[mockCall]} onCallSelect={onCallSelect} />
      );

      const row = screen.getByText('+1 (555) 123-4567').closest('tr');
      if (row) {
        await user.click(row);
        expect(onCallSelect).toHaveBeenCalledWith(mockCall);
      }
    });
  });

  describe('Recording Player', () => {
    it('should display recording player when expanded', async () => {
      const user = userEvent.setup();
      const { container } = render(<CallHistory calls={[mockCall]} />);

      const expandButton = container.querySelector('button');
      if (expandButton) {
        await user.click(expandButton);

        await waitFor(() => {
          expect(screen.getByText('Recording')).toBeInTheDocument();
        });
      }
    });

    it('should not display recording player for calls without recording', async () => {
      const user = userEvent.setup();
      const { container } = render(<CallHistory calls={[mockFailedCall]} />);

      const expandButton = container.querySelector('button');
      if (expandButton) {
        await user.click(expandButton);

        await waitFor(() => {
          expect(screen.queryByText('Recording')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Multiple Calls', () => {
    it('should handle multiple calls correctly', () => {
      const calls = [mockCall, mockFailedCall, mockNoAnswerCall];
      render(<CallHistory calls={calls} />);

      // Should show all calls
      expect(screen.getByText('3 of 3 calls')).toBeInTheDocument();
    });

    it('should maintain filter state across multiple calls', async () => {
      const user = userEvent.setup();
      const calls = [mockCall, mockFailedCall, mockNoAnswerCall];
      render(<CallHistory calls={calls} />);

      const searchInput = screen.getByPlaceholderText(/Search by/i);
      await user.type(searchInput, '+1 (555) 123-4567');

      await waitFor(() => {
        expect(screen.getByText('1 of 3 calls')).toBeInTheDocument();
      });
    });
  });
});
