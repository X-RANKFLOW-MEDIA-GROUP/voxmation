/**
 * Twilio Integration Examples
 *
 * This file contains practical examples for using the Twilio integration
 * in your voxmation application. You can use these as templates for
 * building features like:
 * - Outbound call campaigns
 * - SMS notifications
 * - Call recording management
 * - Message tracking
 */

import {
  makeCall,
  sendSMS,
  getCallStatus,
  listCalls,
  getRecording,
  getCallRecordings,
  getRecordingUrl,
  listMessages,
  getMessageStatus,
  initTwilio,
} from "./twilio";

// =============================================================================
// OUTBOUND CALL EXAMPLES
// =============================================================================

/**
 * Example: Make a simple greeting call
 *
 * The TwiML URL should return an XML response with voice commands
 * For example, using a service like AWS Lambda or Twilio Studio
 */
export async function exampleMakeGreetingCall(phoneNumber: string) {
  try {
    const call = await makeCall({
      to: phoneNumber,
      // URL to your TwiML application (handles voice logic)
      url: "https://your-api.example.com/api/voice/greeting",
      method: "POST",
      // Status updates about the call
      statusCallback: "https://your-api.example.com/api/webhooks/twilio",
      statusCallbackEvent: ["ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
      // Enable automatic recording
      record: true,
      recordingChannels: "mono",
      recordingStatusCallback: "https://your-api.example.com/api/webhooks/twilio",
      // 60 second timeout if not answered
      timeout: 60,
    });

    console.log(`Greeting call started: ${call.sid}`);
    return call;
  } catch (error) {
    console.error("Failed to make greeting call:", error);
    throw error;
  }
}

/**
 * Example: Make a survey call with IVR menu
 *
 * User navigates through menu by pressing phone keys (DTMF)
 */
export async function exampleMakeSurveyCall(phoneNumber: string, surveyId: string) {
  try {
    const call = await makeCall({
      to: phoneNumber,
      // This TwiML app presents menu and captures responses
      url: `https://your-api.example.com/api/voice/survey/${surveyId}`,
      method: "POST",
      statusCallback: "https://your-api.example.com/api/webhooks/twilio",
      statusCallbackEvent: ["answered", "completed"],
      record: true,
      metadata: {
        surveyId,
        campaignType: "survey",
      },
    });

    return call;
  } catch (error) {
    console.error("Survey call failed:", error);
    throw error;
  }
}

/**
 * Example: Call with machine detection
 *
 * Twilio will detect if an answering machine or live person answers
 */
export async function exampleCallWithMachineDetection(
  phoneNumber: string,
  campaignId: string
) {
  try {
    const call = await makeCall({
      to: phoneNumber,
      url: "https://your-api.example.com/api/voice/campaign",
      statusCallback: "https://your-api.example.com/api/webhooks/twilio",
      record: true,
      // Machine detection will be included in webhook callback
      metadata: {
        campaignId,
        machineDetection: "Enable",
      },
    });

    return call;
  } catch (error) {
    console.error("Call with machine detection failed:", error);
    throw error;
  }
}

/**
 * Example: Check call status in real-time
 */
export async function exampleCheckCallStatus(callSid: string) {
  try {
    const status = await getCallStatus(callSid);

    console.log(`Call ${callSid}:`);
    console.log(`  Status: ${status.status}`);
    console.log(`  From: ${status.from}`);
    console.log(`  To: ${status.to}`);
    console.log(`  Duration: ${status.duration || "N/A"}s`);

    return status;
  } catch (error) {
    console.error("Failed to get call status:", error);
    throw error;
  }
}

/**
 * Example: Track a campaign's call progress
 */
export async function exampleTrackCampaignCalls(campaignId: string) {
  try {
    // List all calls made in the last hour
    const calls = await listCalls(undefined, undefined, undefined, 100);

    // Filter to this campaign (would require metadata tracking in your app)
    const campaignCalls = calls.filter((call) => {
      // Your app would need to track which calls belong to which campaign
      return true; // Placeholder
    });

    // Calculate statistics
    const stats = {
      total: campaignCalls.length,
      completed: campaignCalls.filter((c) => c.status === "completed").length,
      failed: campaignCalls.filter((c) => c.status === "failed").length,
      noAnswer: campaignCalls.filter((c) => c.status === "no-answer").length,
      totalDuration: campaignCalls.reduce(
        (sum, c) => sum + (c.duration || 0),
        0
      ),
      averageDuration:
        campaignCalls.length > 0
          ? campaignCalls.reduce((sum, c) => sum + (c.duration || 0), 0) /
            campaignCalls.length
          : 0,
    };

    console.log(`Campaign ${campaignId} statistics:`, stats);
    return stats;
  } catch (error) {
    console.error("Failed to track campaign calls:", error);
    throw error;
  }
}

// =============================================================================
// RECORDING EXAMPLES
// =============================================================================

/**
 * Example: Get and process a call recording
 */
export async function exampleGetRecordingDetails(callSid: string) {
  try {
    // Get all recordings for this call
    const recordings = await getCallRecordings(callSid);

    console.log(`Found ${recordings.length} recording(s) for call ${callSid}`);

    for (const recording of recordings) {
      console.log(`Recording ${recording.sid}:`);
      console.log(`  Duration: ${recording.duration}s`);
      console.log(`  Channels: ${recording.channels}`);
      console.log(`  Created: ${recording.dateCreated}`);

      // Get URL for playback or transcription
      const mp3Url = getRecordingUrl(recording.sid, "mp3");
      const wavUrl = getRecordingUrl(recording.sid, "wav");

      console.log(`  MP3 URL: ${mp3Url}`);
      console.log(`  WAV URL: ${wavUrl}`);
    }

    return recordings;
  } catch (error) {
    console.error("Failed to get recording details:", error);
    throw error;
  }
}

/**
 * Example: Send recording for transcription
 *
 * Integration with transcription service (e.g., AWS Transcribe, Rev.com)
 */
export async function exampleTranscribeRecording(
  callSid: string,
  transcriptionService: "aws" | "rev" | "google"
) {
  try {
    const recordings = await getCallRecordings(callSid);

    if (recordings.length === 0) {
      console.log("No recordings found for this call");
      return null;
    }

    const recording = recordings[0];
    const audioUrl = getRecordingUrl(recording.sid, "wav");

    // Submit to transcription service based on choice
    let transcriptionJobId: string;

    if (transcriptionService === "aws") {
      // Example: AWS Transcribe
      // transcriptionJobId = await startAWSTranscription(audioUrl);
      transcriptionJobId = "aws-transcription-job-id";
    } else if (transcriptionService === "rev") {
      // Example: Rev.com API
      // transcriptionJobId = await submitToRev(audioUrl);
      transcriptionJobId = "rev-transcript-id";
    } else {
      // Example: Google Cloud Speech-to-Text
      // transcriptionJobId = await submitToGoogle(audioUrl);
      transcriptionJobId = "google-transcription-id";
    }

    console.log(`Transcription submitted: ${transcriptionJobId}`);
    console.log(`Audio URL: ${audioUrl}`);

    return {
      callSid,
      recordingSid: recording.sid,
      audioUrl,
      transcriptionJobId,
      transcriptionService,
    };
  } catch (error) {
    console.error("Failed to transcribe recording:", error);
    throw error;
  }
}

/**
 * Example: Archive old recordings (delete after X days)
 */
export async function exampleArchiveOldRecordings(daysOld: number = 90) {
  try {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - daysOld * 24 * 60 * 60 * 1000);

    // In production, you'd paginate through all recordings
    // For now, this is a template
    const recordings = await getCallRecordings("CA0000000000000000000000"); // Placeholder

    let deletedCount = 0;
    let totalSize = 0;

    for (const recording of recordings) {
      if (recording.dateCreated < cutoffDate) {
        // Don't actually delete - just show what would be deleted
        totalSize += recording.duration;
        console.log(
          `Would delete: ${recording.sid} (${recording.duration}s, from ${recording.dateCreated})`
        );
        deletedCount++;

        // Uncomment to actually delete:
        // await deleteRecording(recording.sid);
      }
    }

    console.log(
      `Archival summary: ${deletedCount} recordings (${totalSize}s total)`
    );
    return { deletedCount, totalSize };
  } catch (error) {
    console.error("Failed to archive recordings:", error);
    throw error;
  }
}

// =============================================================================
// SMS/MESSAGE EXAMPLES
// =============================================================================

/**
 * Example: Send appointment reminder SMS
 */
export async function exampleSendAppointmentReminder(
  phoneNumber: string,
  appointmentDetails: {
    date: string;
    time: string;
    location: string;
  }
) {
  try {
    const message = await sendSMS({
      to: phoneNumber,
      body: `Reminder: Your appointment is on ${appointmentDetails.date} at ${appointmentDetails.time} at ${appointmentDetails.location}. Reply CONFIRM to confirm or CANCEL to reschedule.`,
      statusCallback: "https://your-api.example.com/api/webhooks/twilio",
      statusCallbackMethod: "POST",
    });

    console.log(`Reminder sent: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("Failed to send reminder:", error);
    throw error;
  }
}

/**
 * Example: Send promotional SMS to multiple recipients
 */
export async function exampleSendBulkPromotion(
  phoneNumbers: string[],
  promotionText: string
) {
  try {
    const results = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        const message = await sendSMS({
          to: phoneNumber,
          body: promotionText,
          statusCallback: "https://your-api.example.com/api/webhooks/twilio",
        });
        results.push({
          phoneNumber,
          messageSid: message.sid,
          status: "sent",
        });
      } catch (error) {
        results.push({
          phoneNumber,
          error: (error as Error).message,
          status: "failed",
        });
      }

      // Rate limiting: space out requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successful = results.filter((r) => r.status === "sent").length;
    console.log(
      `Bulk promotion: ${successful}/${phoneNumbers.length} sent successfully`
    );

    return results;
  } catch (error) {
    console.error("Bulk promotion failed:", error);
    throw error;
  }
}

/**
 * Example: Send MMS with image
 */
export async function exampleSendMMS(
  phoneNumber: string,
  message: string,
  imageUrl: string
) {
  try {
    const mms = await sendSMS({
      to: phoneNumber,
      body: message,
      mediaUrl: [imageUrl],
      statusCallback: "https://your-api.example.com/api/webhooks/twilio",
    });

    console.log(`MMS sent: ${mms.sid}`);
    return mms;
  } catch (error) {
    console.error("Failed to send MMS:", error);
    throw error;
  }
}

/**
 * Example: Track message delivery status
 */
export async function exampleTrackMessageDelivery(messageSid: string) {
  try {
    const status = await getMessageStatus(messageSid);

    console.log(`Message ${messageSid}:`);
    console.log(`  Status: ${status.status}`);
    console.log(`  To: ${status.to}`);
    console.log(`  From: ${status.from}`);
    console.log(`  Sent: ${status.dateSent || "pending"}`);

    if (status.errorCode) {
      console.log(`  Error: ${status.errorCode} - ${status.errorMessage}`);
    }

    return status;
  } catch (error) {
    console.error("Failed to track message:", error);
    throw error;
  }
}

/**
 * Example: List recent messages for customer service review
 */
export async function exampleGetConversationHistory(
  fromNumber: string,
  toNumber: string
) {
  try {
    const messages = await listMessages(fromNumber, toNumber, 50);

    console.log(`Conversation between ${fromNumber} and ${toNumber}:`);

    for (const message of messages) {
      const direction = message.from === fromNumber ? "→" : "←";
      console.log(
        `${direction} [${message.dateCreated.toLocaleTimeString()}] ${message.body}`
      );

      if (message.status !== "delivered" && message.status !== "sent") {
        console.log(`  (Status: ${message.status})`);
      }
    }

    return messages;
  } catch (error) {
    console.error("Failed to get conversation history:", error);
    throw error;
  }
}

// =============================================================================
// INTEGRATION EXAMPLES
// =============================================================================

/**
 * Example: Complete call campaign workflow
 *
 * 1. Initiate calls to a list of contacts
 * 2. Track call status via webhooks
 * 3. Download and transcribe recordings
 * 4. Generate campaign report
 */
export async function exampleCompleteCampaignWorkflow(
  campaignId: string,
  contacts: Array<{
    id: string;
    phoneNumber: string;
    name: string;
  }>
) {
  const campaign = {
    id: campaignId,
    startedAt: new Date(),
    calls: [] as any[],
  };

  console.log(`Starting campaign ${campaignId} with ${contacts.length} contacts`);

  // Phase 1: Initiate calls
  for (const contact of contacts) {
    try {
      const call = await makeCall({
        to: contact.phoneNumber,
        url: `https://your-api.example.com/api/voice/campaign/${campaignId}`,
        statusCallback: "https://your-api.example.com/api/webhooks/twilio",
        statusCallbackEvent: ["answered", "completed"],
        record: true,
      });

      campaign.calls.push({
        contactId: contact.id,
        contactName: contact.name,
        phoneNumber: contact.phoneNumber,
        callSid: call.sid,
        status: "initiated",
        initiatedAt: new Date(),
      });

      console.log(`Call initiated for ${contact.name}: ${call.sid}`);

      // Rate limiting between calls
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to call ${contact.name}:`, error);
    }
  }

  // Phase 2: Monitor (in real app, this would be driven by webhooks)
  console.log("Campaign initiated. Monitoring calls via webhooks...");
  console.log("Webhooks will update call status and download recordings");

  // Phase 3: Report generation (template)
  const report = {
    campaignId,
    totalContacts: contacts.length,
    totalCalls: campaign.calls.length,
    completedCalls: 0,
    failedCalls: 0,
    averageDuration: 0,
    recordingsProcessed: 0,
  };

  console.log("Campaign report:", report);
  return campaign;
}

/**
 * Example: Error handling and recovery
 */
export async function exampleErrorHandling(phoneNumber: string) {
  try {
    const call = await makeCall({
      to: phoneNumber,
      url: "https://your-api.example.com/api/voice/main",
    });

    return call;
  } catch (error: any) {
    if (error.code === 21202) {
      // Invalid phone number
      console.error("Invalid phone number format");
      return { error: "Invalid phone number", code: 21202 };
    } else if (error.code === 20003) {
      // Account suspended
      console.error("Account suspended or trial expired");
      return { error: "Account issue", code: 20003 };
    } else if (error.status === 401) {
      // Authentication failed
      console.error("Authentication failed - check credentials");
      return { error: "Auth failed", code: 401 };
    } else {
      // Generic error
      console.error("Unexpected error:", error.message);
      throw error;
    }
  }
}
