/**
 * Email Queue Service
 * Manages email queuing, processing, and retry logic
 */

import { v4 as uuidv4 } from "uuid";
import { EmailQueueItem } from "../types/campaign";
import { sendEmail } from "../email";

// In-memory storage - in production use Redis or database
const emailQueue: Map<string, EmailQueueItem> = new Map();

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 60000; // 1 minute between retries

/**
 * Add emails to the queue
 */
export function enqueueEmails(
  campaignId: string,
  recipients: Array<{ email: string; name: string; variables?: Record<string, string> }>,
  subject: string,
  htmlBody: string,
  textBody?: string
): string[] {
  const queueIds: string[] = [];

  recipients.forEach((recipient) => {
    const queueId = uuidv4();
    const queueItem: EmailQueueItem = {
      id: queueId,
      campaignId,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      subject,
      htmlBody,
      textBody,
      status: "pending",
      attemptCount: 0,
      createdAt: new Date().toISOString(),
    };

    emailQueue.set(queueId, queueItem);
    queueIds.push(queueId);
  });

  return queueIds;
}

/**
 * Process a single queue item with variable replacement
 */
export async function processQueueItem(
  queueItem: EmailQueueItem,
  variables?: Record<string, string>
): Promise<boolean> {
  try {
    // Replace variables in subject and body
    let personalizedSubject = queueItem.subject;
    let personalizedHtml = queueItem.htmlBody;
    let personalizedText = queueItem.textBody;

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        personalizedSubject = personalizedSubject.replace(new RegExp(placeholder, "g"), value);
        personalizedHtml = personalizedHtml.replace(new RegExp(placeholder, "g"), value);
        if (personalizedText) {
          personalizedText = personalizedText.replace(new RegExp(placeholder, "g"), value);
        }
      });
    }

    const sent = await sendEmail({
      to: queueItem.recipientEmail,
      subject: personalizedSubject,
      html: personalizedHtml,
      text: personalizedText,
    });

    if (sent) {
      queueItem.status = "sent";
      queueItem.sentAt = new Date().toISOString();
    } else {
      queueItem.status = "failed";
      queueItem.error = "Failed to send email";
    }

    queueItem.lastAttemptAt = new Date().toISOString();
    queueItem.attemptCount++;
    emailQueue.set(queueItem.id, queueItem);

    return sent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    queueItem.status = "failed";
    queueItem.error = errorMessage;
    queueItem.lastAttemptAt = new Date().toISOString();
    queueItem.attemptCount++;
    emailQueue.set(queueItem.id, queueItem);
    return false;
  }
}

/**
 * Get queue items by campaign ID
 */
export function getQueueItemsByCampaign(campaignId: string): EmailQueueItem[] {
  return Array.from(emailQueue.values()).filter((item) => item.campaignId === campaignId);
}

/**
 * Get pending queue items for a campaign
 */
export function getPendingQueueItems(campaignId: string): EmailQueueItem[] {
  return Array.from(emailQueue.values()).filter((item) => item.campaignId === campaignId && item.status === "pending");
}

/**
 * Get queue item by ID
 */
export function getQueueItem(queueId: string): EmailQueueItem | undefined {
  return emailQueue.get(queueId);
}

/**
 * Get overall queue statistics
 */
export function getQueueStats() {
  const items = Array.from(emailQueue.values());

  return {
    total: items.length,
    sent: items.filter((item) => item.status === "sent").length,
    failed: items.filter((item) => item.status === "failed").length,
    pending: items.filter((item) => item.status === "pending").length,
    retryable: items.filter((item) => item.status === "failed" && item.attemptCount < MAX_RETRY_ATTEMPTS).length,
  };
}

/**
 * Get queue statistics by campaign
 */
export function getCampaignQueueStats(campaignId: string) {
  const items = getQueueItemsByCampaign(campaignId);

  return {
    total: items.length,
    sent: items.filter((item) => item.status === "sent").length,
    failed: items.filter((item) => item.status === "failed").length,
    pending: items.filter((item) => item.status === "pending").length,
    retryable: items.filter((item) => item.status === "failed" && item.attemptCount < MAX_RETRY_ATTEMPTS).length,
  };
}

/**
 * Clear queue items for a campaign
 */
export function clearCampaignQueue(campaignId: string): void {
  Array.from(emailQueue.entries()).forEach(([id, item]) => {
    if (item.campaignId === campaignId) {
      emailQueue.delete(id);
    }
  });
}

/**
 * Retry failed items
 */
export function getRetryableItems(): EmailQueueItem[] {
  return Array.from(emailQueue.values()).filter(
    (item) => item.status === "failed" && item.attemptCount < MAX_RETRY_ATTEMPTS
  );
}

/**
 * Mark item as sent
 */
export function markAsSent(queueId: string): void {
  const item = emailQueue.get(queueId);
  if (item) {
    item.status = "sent";
    item.sentAt = new Date().toISOString();
    emailQueue.set(queueId, item);
  }
}

/**
 * Mark item as failed
 */
export function markAsFailed(queueId: string, error: string): void {
  const item = emailQueue.get(queueId);
  if (item) {
    item.status = "failed";
    item.error = error;
    item.lastAttemptAt = new Date().toISOString();
    item.attemptCount++;
    emailQueue.set(queueId, item);
  }
}

/**
 * Get all queue items (admin only)
 */
export function getAllQueueItems(): EmailQueueItem[] {
  return Array.from(emailQueue.values());
}

/**
 * Get queue item count
 */
export function getQueueItemCount(): number {
  return emailQueue.size;
}
