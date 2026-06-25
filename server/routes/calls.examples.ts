/**
 * Call Management API - Usage Examples
 *
 * This file demonstrates common patterns and use cases for the Call Management API.
 * It's not meant to be executed directly, but serves as a reference guide.
 */

import fetch from 'node-fetch';

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'your_bearer_token_here';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${AUTH_TOKEN}`,
};

// =============================================================================
// EXAMPLE 1: Simple Outbound Call
// =============================================================================

async function example1_simpleCall() {
  console.log('Example 1: Simple Outbound Call');
  console.log('--------------------------------\n');

  try {
    // Initiate a simple call
    const response = await fetch(`${API_BASE_URL}/api/calls/make`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: '+14155552671',
        from: '+14155551234',
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const call = await response.json();
    console.log('Call initiated:', call);
    console.log(`Call ID: ${call.id}`);
    console.log(`Twilio SID: ${call.twilio_call_sid}`);
    console.log(`Status: ${call.status}\n`);

    return call;
  } catch (error) {
    console.error('Error:', error);
  }
}

// =============================================================================
// EXAMPLE 2: Call with Recording
// =============================================================================

async function example2_callWithRecording() {
  console.log('Example 2: Call with Recording');
  console.log('-------------------------------\n');

  try {
    const response = await fetch(`${API_BASE_URL}/api/calls/make`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: '+14155552671',
        from: '+14155551234',
        record: true,                    // Enable recording
        recordingChannels: 'mono',       // Single channel
        metadata: {
          callType: 'customer_service',
          priority: 'high',
        },
      }),
    });

    const call = await response.json();
    console.log('Call with recording initiated:', call.id);
    console.log('Recording will be available after call completion\n');

    return call;
  } catch (error) {
    console.error('Error:', error);
  }
}

// =============================================================================
// EXAMPLE 3: Campaign Call Batch
// =============================================================================

interface Contact {
  name: string;
  phone: string;
  email: string;
}

async function example3_batchCalls(campaignId: string, contacts: Contact[]) {
  console.log('Example 3: Batch Campaign Calls');
  console.log('--------------------------------\n');

  console.log(`Initiating ${contacts.length} calls for campaign: ${campaignId}`);

  try {
    // Create array of call promises
    const callPromises = contacts.map((contact) =>
      fetch(`${API_BASE_URL}/api/calls/make`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: contact.phone,
          campaignId,
          record: true,
          metadata: {
            contactName: contact.name,
            contactEmail: contact.email,
          },
        }),
      }).then((res) => res.json())
    );

    // Execute all in parallel
    const calls = await Promise.all(callPromises);

    console.log(`Successfully initiated ${calls.length} calls:`);
    calls.forEach((call, index) => {
      console.log(
        `  ${index + 1}. ${contacts[index].name}: ${call.twilio_call_sid}`
      );
    });

    return calls;
  } catch (error) {
    console.error('Error:', error);
  }
}

// =============================================================================
// EXAMPLE 4: Poll Call Until Completion
// =============================================================================

async function example4_pollCallCompletion(callId: string) {
  console.log('Example 4: Poll Call Until Completion');
  console.log('-------------------------------------\n');

  const maxWaitTime = 5 * 60 * 1000; // 5 minutes
  const pollInterval = 2000; // 2 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/${callId}`, {
        headers,
      });

      const call = await response.json();
      console.log(`Status: ${call.status}`);

      // Check if call is complete
      if (call.status === 'completed' || call.status === 'failed') {
        console.log(`\nCall ${call.status}:`);
        console.log(`  Duration: ${call.duration}s`);
        console.log(`  Started: ${call.startTime}`);
        console.log(`  Ended: ${call.endTime}`);

        if (call.recordingSid) {
          console.log(`  Recording SID: ${call.recordingSid}`);
        }

        return call;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Poll error:', error);
    }
  }

  throw new Error('Call did not complete within timeout period');
}

// =============================================================================
// EXAMPLE 5: Retrieve and Download Recording
// =============================================================================

async function example5_getRecording(callId: string) {
  console.log('Example 5: Retrieve and Download Recording');
  console.log('------------------------------------------\n');

  try {
    // Get recording info
    const response = await fetch(`${API_BASE_URL}/api/calls/${callId}/recording`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No recording found for this call');
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const recording = await response.json();
    console.log('Recording Information:');
    console.log(`  Recording ID: ${recording.recordingSid}`);
    console.log(`  Duration: ${recording.duration}s`);
    console.log(`  Channels: ${recording.channels}`);
    console.log(`  Created: ${recording.dateCreated}`);
    console.log(`  Download URL: ${recording.downloadUrl}`);
    console.log(`  Media URL: ${recording.mediaUrl}`);

    return recording;
  } catch (error) {
    console.error('Error:', error);
  }
}

// =============================================================================
// EXAMPLE 6: Retrieve Call Transcript
// =============================================================================

async function example6_getTranscript(callId: string) {
  console.log('Example 6: Retrieve Call Transcript');
  console.log('-----------------------------------\n');

  try {
    const response = await fetch(`${API_BASE_URL}/api/calls/${callId}/transcript`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No transcript available for this call');
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }

    const transcript = await response.json();

    if (transcript.status === 'processing') {
      console.log('Transcript is still being processed...');
      console.log(`Transcript ID: ${transcript.transcriptId}`);
    } else {
      console.log('Transcript:');
      console.log(transcript.transcript);
    }

    return transcript;
  } catch (error) {
    console.error('Error:', error);
  }
}

// =============================================================================
// EXAMPLE 7: List Campaign Calls with Pagination
// =============================================================================

async function example7_listCampaignCalls(campaignId: string) {
  console.log('Example 7: List Campaign Calls');
  console.log('------------------------------\n');

  try {
    let offset = 0;
    const limit = 50;
    let hasMore = true;
    const allCalls = [];

    while (hasMore) {
      const response = await fetch(
        `${API_BASE_URL}/api/calls?campaignId=${campaignId}&limit=${limit}&offset=${offset}`,
        { headers }
      );

      const data = await response.json();
      allCalls.push(...data.calls);

      console.log(`Loaded ${data.calls.length} calls (offset: ${offset})`);

      // Check if there are more results
      hasMore = offset + limit < data.pagination.total;
      offset += limit;
    }

    console.log(`\nTotal calls: ${allCalls.length}`);

    // Group by status
    const byStatus = allCalls.reduce((acc, call) => {
      acc[call.status] = (acc[call.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Calls by status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    return allCalls;
  } catch (error) {
    console.error('Error:', error);
  }
}

// =============================================================================
// EXAMPLE 8: Get Campaign Statistics
// =============================================================================

async function example8_getCampaignStats(campaignId: string) {
  console.log('Example 8: Get Campaign Statistics');
  console.log('----------------------------------\n');

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/calls/stats/summary?campaignId=${campaignId}`,
      { headers }
    );

    const stats = await response.json();

    console.log('Campaign Statistics:');
    console.log(`  Total Calls: ${stats.totalCalls}`);
    console.log(`  Completed: ${stats.completedCalls}`);
    console.log(`  Failed: ${stats.failedCalls}`);
    console.log(`  Total Duration: ${stats.totalDuration}s`);
    console.log(`  Average Duration: ${stats.averageDuration}s`);

    if (stats.totalCalls > 0) {
      const completionRate = (
        (stats.completedCalls / stats.totalCalls) *
        100
      ).toFixed(2);
      console.log(`  Completion Rate: ${completionRate}%`);
    }

    return stats;
  } catch (error) {
    console.error('Error:', error);
  }
}

// =============================================================================
// EXAMPLE 9: Filter Calls by Status
// =============================================================================

async function example9_filterByStatus(status: string) {
  console.log(`Example 9: Filter Calls by Status: ${status}`);
  console.log('--------------------------------------\n');

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/calls?status=${status}&limit=100`,
      { headers }
    );

    const data = await response.json();

    console.log(`Found ${data.calls.length} ${status} calls:`);
    data.calls.forEach((call) => {
      console.log(
        `  - ${call.id}: ${call.from} -> ${call.to} (${call.duration}s)`
      );
    });

    return data.calls;
  } catch (error) {
    console.error('Error:', error);
  }
}

// =============================================================================
// EXAMPLE 10: Complete Call Workflow
// =============================================================================

async function example10_completeWorkflow() {
  console.log('Example 10: Complete Call Workflow');
  console.log('----------------------------------\n');

  try {
    // Step 1: Initiate call
    console.log('Step 1: Initiating call...');
    const initiateResponse = await fetch(`${API_BASE_URL}/api/calls/make`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: '+14155552671',
        campaignId: 'workflow-demo',
        record: true,
        metadata: {
          workflow: 'complete_example',
        },
      }),
    });

    const call = await initiateResponse.json();
    console.log(`✓ Call initiated: ${call.id}\n`);

    // Step 2: Poll for completion
    console.log('Step 2: Waiting for call to complete...');
    let completedCall = call;
    let pollCount = 0;

    while (
      completedCall.status !== 'completed' &&
      completedCall.status !== 'failed' &&
      pollCount < 30
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pollResponse = await fetch(`${API_BASE_URL}/api/calls/${call.id}`, {
        headers,
      });

      completedCall = await pollResponse.json();
      console.log(`  Status: ${completedCall.status}`);
      pollCount++;
    }

    console.log(`✓ Call ${completedCall.status}\n`);

    // Step 3: Get recording
    if (completedCall.recordingSid) {
      console.log('Step 3: Retrieving recording...');
      const recordingResponse = await fetch(
        `${API_BASE_URL}/api/calls/${call.id}/recording`,
        { headers }
      );

      const recording = await recordingResponse.json();
      console.log(`✓ Recording available: ${recording.downloadUrl}\n`);
    }

    // Step 4: Get transcript
    console.log('Step 4: Checking transcript...');
    const transcriptResponse = await fetch(
      `${API_BASE_URL}/api/calls/${call.id}/transcript`,
      { headers }
    );

    if (transcriptResponse.ok) {
      const transcript = await transcriptResponse.json();
      if (transcript.status === 'processing') {
        console.log('⏳ Transcript is being processed\n');
      } else {
        console.log(`✓ Transcript available: ${transcript.transcript.substring(0, 100)}...\n`);
      }
    }

    // Step 5: Get statistics
    console.log('Step 5: Retrieving campaign stats...');
    const statsResponse = await fetch(
      `${API_BASE_URL}/api/calls/stats/summary?campaignId=workflow-demo`,
      { headers }
    );

    const stats = await statsResponse.json();
    console.log(`✓ Campaign Stats:`);
    console.log(`    Total calls: ${stats.totalCalls}`);
    console.log(`    Completed: ${stats.completedCalls}`);
    console.log(`    Average duration: ${stats.averageDuration}s\n`);

    console.log('✓ Workflow completed successfully!');
  } catch (error) {
    console.error('Workflow error:', error);
  }
}

// =============================================================================
// EXAMPLE 11: Error Handling and Retry Logic
// =============================================================================

async function example11_errorHandling() {
  console.log('Example 11: Error Handling and Retry Logic');
  console.log('------------------------------------------\n');

  async function makeCallWithRetry(
    phoneNumber: string,
    maxRetries = 3
  ): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}...`);

        const response = await fetch(`${API_BASE_URL}/api/calls/make`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: phoneNumber,
            record: true,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`API error: ${error.error}`);
        }

        const call = await response.json();
        console.log(`✓ Success: ${call.id}\n`);
        return call;
      } catch (error) {
        console.log(`✗ Failed: ${error}\n`);

        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delay}ms...\n`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  try {
    await makeCallWithRetry('+14155552671', 3);
  } catch (error) {
    console.error('Max retries exceeded:', error);
  }
}

// =============================================================================
// EXAMPLE 12: Real-time Call Monitoring
// =============================================================================

async function example12_realTimeMonitoring() {
  console.log('Example 12: Real-time Call Monitoring');
  console.log('-------------------------------------\n');

  async function monitorCalls(campaignId: string) {
    console.log(`Monitoring campaign: ${campaignId}\n`);

    let iteration = 0;
    const maxIterations = 10; // Monitor for 10 checks (20 seconds)

    while (iteration < maxIterations) {
      try {
        // Get statistics
        const statsResponse = await fetch(
          `${API_BASE_URL}/api/calls/stats/summary?campaignId=${campaignId}`,
          { headers }
        );

        const stats = await statsResponse.json();

        console.log(`[${new Date().toLocaleTimeString()}] Campaign Stats:`);
        console.log(`  Total: ${stats.totalCalls}`);
        console.log(`  Completed: ${stats.completedCalls}`);
        console.log(`  Failed: ${stats.failedCalls}`);
        console.log(
          `  Success Rate: ${(
            (stats.completedCalls / stats.totalCalls) *
            100
          ).toFixed(2)}%`
        );
        console.log(`  Avg Duration: ${stats.averageDuration}s\n`);

        iteration++;

        // Wait 2 seconds before next check
        if (iteration < maxIterations) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }
  }

  await monitorCalls('monitoring-demo');
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function runAllExamples() {
  console.log('='.repeat(50));
  console.log('Call Management API - Examples');
  console.log('='.repeat(50) + '\n');

  // Note: These are example functions. In a real scenario, you would:
  // 1. Uncomment and run individual examples
  // 2. Replace placeholder values with real data
  // 3. Handle async/await properly in your context

  console.log('Available examples:');
  console.log('  1. example1_simpleCall()');
  console.log('  2. example2_callWithRecording()');
  console.log('  3. example3_batchCalls()');
  console.log('  4. example4_pollCallCompletion()');
  console.log('  5. example5_getRecording()');
  console.log('  6. example6_getTranscript()');
  console.log('  7. example7_listCampaignCalls()');
  console.log('  8. example8_getCampaignStats()');
  console.log('  9. example9_filterByStatus()');
  console.log('  10. example10_completeWorkflow()');
  console.log('  11. example11_errorHandling()');
  console.log('  12. example12_realTimeMonitoring()');
  console.log('\nRun individual examples in your code or Node REPL\n');
}

// Export for use in other modules
export {
  example1_simpleCall,
  example2_callWithRecording,
  example3_batchCalls,
  example4_pollCallCompletion,
  example5_getRecording,
  example6_getTranscript,
  example7_listCampaignCalls,
  example8_getCampaignStats,
  example9_filterByStatus,
  example10_completeWorkflow,
  example11_errorHandling,
  example12_realTimeMonitoring,
  runAllExamples,
};
