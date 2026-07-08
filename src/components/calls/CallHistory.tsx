'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, Filter, Phone, Clock, AlertCircle, CheckCircle, Play, Pause, Volume2 } from 'lucide-react';
import { Call, CallRecording, CallTranscription, CallDirection, CallStatus } from '@/types/calls_and_voice.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Expandable row component
interface CallRowExpandedProps {
  call: Call & {
    recording?: CallRecording | null;
    transcription?: CallTranscription | null;
  };
  isExpanded: boolean;
}

const CallRowExpanded: React.FC<CallRowExpandedProps> = ({ call, isExpanded }) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  if (!isExpanded) return null;

  return (
    <TableRow className="bg-muted/50">
      <TableCell colSpan={6} className="p-6">
        <div className="space-y-6">
          {/* Recording Player */}
          {call.recording && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Recording
              </h4>
              <div className="bg-card p-4 rounded-lg border border-border flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAudioPlaying(!audioPlaying)}
                    className="w-10 h-10 p-0"
                  >
                    {audioPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {call.recording.duration_seconds
                      ? `${Math.floor(call.recording.duration_seconds / 60)}:${String(
                          call.recording.duration_seconds % 60
                        ).padStart(2, '0')}`
                      : 'N/A'}
                  </span>
                </div>
                <audio
                  src={call.recording.recording_url}
                  controls
                  className="hidden"
                  autoPlay={audioPlaying}
                  onPlay={() => setAudioPlaying(true)}
                  onPause={() => setAudioPlaying(false)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="ml-2"
                >
                  <a
                    href={call.recording.recording_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Format: {call.recording.encoding.toUpperCase()}</p>
                <p>Storage: {call.recording.storage_provider}</p>
              </div>
            </div>
          )}

          {/* Transcription & Sentiment Analysis */}
          {call.transcription && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Transcription & Analysis
              </h4>

              {/* Sentiment Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sentiment:</span>
                <Badge
                  variant={
                    call.transcription.overall_sentiment === 'positive'
                      ? 'default'
                      : call.transcription.overall_sentiment === 'negative'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {call.transcription.overall_sentiment || 'unknown'}
                </Badge>
                {call.transcription.sentiment_score !== null && (
                  <span className="text-xs text-muted-foreground">
                    Score: {(call.transcription.sentiment_score * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-muted p-3 rounded border border-border">
                  <p className="text-xs text-muted-foreground">Words</p>
                  <p className="font-semibold">{call.transcription.word_count || 0}</p>
                </div>
                <div className="bg-muted p-3 rounded border border-border">
                  <p className="text-xs text-muted-foreground">Speakers</p>
                  <p className="font-semibold">{call.transcription.speaker_count || 0}</p>
                </div>
                <div className="bg-muted p-3 rounded border border-border">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-semibold">
                    {call.transcription.confidence_score
                      ? `${call.transcription.confidence_score.toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-muted p-3 rounded border border-border">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className="text-xs">
                    {call.transcription.status}
                  </Badge>
                </div>
              </div>

              {/* Key Phrases */}
              {call.transcription.key_phrases && call.transcription.key_phrases.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Phrases:</p>
                  <div className="flex flex-wrap gap-2">
                    {call.transcription.key_phrases.slice(0, 8).map((phrase, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {phrase}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcript */}
              {call.transcription.full_transcript && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                    className="text-sm font-medium"
                  >
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 mr-2 transition-transform',
                        transcriptExpanded && 'rotate-180'
                      )}
                    />
                    {transcriptExpanded ? 'Hide' : 'Show'} Full Transcript
                  </Button>
                  {transcriptExpanded && (
                    <div className="bg-muted p-4 rounded border border-border max-h-96 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {call.transcription.full_transcript}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Speaker Turns */}
              {call.transcription.transcript_data && call.transcription.transcript_data.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Speaker Turns:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {call.transcription.transcript_data.slice(0, 5).map((turn, idx) => (
                      <div key={idx} className="bg-muted p-3 rounded border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold capitalize text-primary">
                            {turn.speaker}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {turn.start_time}s - {turn.end_time}s
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{turn.text}</p>
                        {turn.confidence && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Confidence: {(turn.confidence * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    ))}
                    {call.transcription.transcript_data.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        +{call.transcription.transcript_data.length - 5} more turns
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Recording/Transcription */}
          {!call.recording && !call.transcription && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recording or transcription available for this call.</p>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

// Main Component Props
interface CallHistoryProps {
  calls: (Call & {
    recording?: CallRecording | null;
    transcription?: CallTranscription | null;
  })[];
  isLoading?: boolean;
  onCallSelect?: (call: Call) => void;
}

/**
 * CallHistory Component
 *
 * Displays a table of calls with:
 * - Data, Caller, Duration, Status, Recording columns
 * - Filters by status and direction
 * - Search functionality
 * - Expandable rows with transcript and sentiment analysis
 * - Audio player for recordings
 * - Key phrase and sentiment insights
 */
export const CallHistory: React.FC<CallHistoryProps> = ({
  calls,
  isLoading = false,
  onCallSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<CallStatus[]>([]);
  const [selectedDirections, setSelectedDirections] = useState<CallDirection[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Toggle expanded row
  const toggleExpanded = useCallback((callId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(callId)) {
        next.delete(callId);
      } else {
        next.add(callId);
      }
      return next;
    });
  }, []);

  // Filter and search logic
  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        call.caller_phone.toLowerCase().includes(searchLower) ||
        call.recipient_phone.toLowerCase().includes(searchLower) ||
        call.caller_name?.toLowerCase().includes(searchLower) ||
        call.recipient_name?.toLowerCase().includes(searchLower) ||
        call.call_sid.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(call.status)) {
        return false;
      }

      // Direction filter
      if (selectedDirections.length > 0 && !selectedDirections.includes(call.direction)) {
        return false;
      }

      return true;
    });
  }, [calls, searchQuery, selectedStatuses, selectedDirections]);

  // Status options
  const statusOptions: CallStatus[] = [
    'initiated',
    'ringing',
    'in-progress',
    'completed',
    'failed',
    'no-answer',
    'busy',
    'cancelled',
  ];

  // Direction options
  const directionOptions: CallDirection[] = ['inbound', 'outbound'];

  // Get status badge color
  const getStatusColor = (status: CallStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'failed':
      case 'no-answer':
      case 'busy':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Format duration
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Call History</span>
            <span className="text-sm font-normal text-muted-foreground">
              {filteredCalls.length} of {calls.length} calls
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <Input
              placeholder="Search by phone number, name, or call ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            {/* Filter Controls */}
            <div className="flex gap-2 flex-wrap">
              {/* Status Filter */}
              <DropdownMenu>
                <Button variant="outline" size="sm" asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Filter className="w-4 h-4" />
                    Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </Button>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {statusOptions.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={(checked) => {
                        setSelectedStatuses((prev) =>
                          checked
                            ? [...prev, status]
                            : prev.filter((s) => s !== status)
                        );
                      }}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Direction Filter */}
              <DropdownMenu>
                <Button variant="outline" size="sm" asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Filter className="w-4 h-4" />
                    Direction {selectedDirections.length > 0 && `(${selectedDirections.length})`}
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </Button>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Filter by Direction</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {directionOptions.map((direction) => (
                    <DropdownMenuCheckboxItem
                      key={direction}
                      checked={selectedDirections.includes(direction)}
                      onCheckedChange={(checked) => {
                        setSelectedDirections((prev) =>
                          checked
                            ? [...prev, direction]
                            : prev.filter((d) => d !== direction)
                        );
                      }}
                    >
                      {direction}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters */}
              {(selectedStatuses.length > 0 || selectedDirections.length > 0 || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatuses([]);
                    setSelectedDirections([]);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Recording</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading calls...
                    </TableCell>
                  </TableRow>
                ) : filteredCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {calls.length === 0 ? 'No calls found' : 'No calls match your filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalls.map((call) => {
                    const isExpanded = expandedRows.has(call.id);
                    return (
                      <React.Fragment key={call.id}>
                        <TableRow
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            toggleExpanded(call.id);
                            onCallSelect?.(call);
                          }}
                        >
                          {/* Expand Icon */}
                          <TableCell className="w-12">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(call.id);
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  'w-4 h-4 transition-transform',
                                  isExpanded && 'rotate-180'
                                )}
                              />
                            </Button>
                          </TableCell>

                          {/* Date & Time */}
                          <TableCell className="text-sm">
                            {formatDate(call.initiated_at)}
                          </TableCell>

                          {/* Caller */}
                          <TableCell className="text-sm">
                            <div>
                              <p className="font-medium">{call.caller_phone}</p>
                              {call.caller_name && (
                                <p className="text-xs text-muted-foreground">{call.caller_name}</p>
                              )}
                            </div>
                          </TableCell>

                          {/* Recipient */}
                          <TableCell className="text-sm">
                            <div>
                              <p className="font-medium">{call.recipient_phone}</p>
                              {call.recipient_name && (
                                <p className="text-xs text-muted-foreground">{call.recipient_name}</p>
                              )}
                            </div>
                          </TableCell>

                          {/* Duration */}
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {formatDuration(call.duration_seconds)}
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {call.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : call.status === 'failed' ||
                                call.status === 'no-answer' ||
                                call.status === 'cancelled' ? (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              ) : null}
                              <Badge variant={getStatusColor(call.status)}>
                                {call.status}
                              </Badge>
                              {call.direction && (
                                <Badge variant="outline" className="text-xs">
                                  {call.direction}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Recording */}
                          <TableCell className="text-right">
                            {call.recording ? (
                              <div className="flex items-center justify-end gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {call.recording.encoding.toUpperCase()}
                                </Badge>
                                {call.recording.duration_seconds && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDuration(call.recording.duration_seconds)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No recording</span>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row */}
                        <CallRowExpanded call={call} isExpanded={isExpanded} />
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          {filteredCalls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Total Calls</p>
                <p className="text-xl font-semibold">{filteredCalls.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Duration</p>
                <p className="text-xl font-semibold">
                  {formatDuration(
                    filteredCalls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">With Recording</p>
                <p className="text-xl font-semibold">
                  {filteredCalls.filter((c) => c.recording).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">With Transcription</p>
                <p className="text-xl font-semibold">
                  {filteredCalls.filter((c) => c.transcription).length}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallHistory;
