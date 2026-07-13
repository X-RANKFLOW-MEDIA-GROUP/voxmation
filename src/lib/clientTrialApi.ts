import { supabase } from "@/integrations/supabase/client";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const authHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in to continue");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

const request = async <T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> => {
  const headers = authenticated
    ? { ...(await authHeaders()), ...(init.headers || {}) }
    : { "Content-Type": "application/json", ...(init.headers || {}) };
  const response = await fetch(`${API_BASE}/api/client-trials${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Request failed") as Error & { blockers?: string[]; missing?: string[] };
    error.blockers = payload.blockers;
    error.missing = payload.missing;
    throw error;
  }
  return payload.data as T;
};

export type TrialInvite = {
  businessName: string;
  contactName: string;
  industry: string;
  serviceArea?: string;
  status: string;
  claimed: boolean;
  emailHint: string;
};

export type ClientTrial = {
  id: string;
  business_name: string;
  contact_name: string;
  invite_email: string;
  phone?: string;
  industry: string;
  service_area?: string;
  timezone: string;
  status: string;
  trial_started_at?: string;
  trial_ends_at?: string;
  intake_completed_at?: string;
  agent_configured_at?: string;
  number_connected_at?: string;
  test_call_passed_at?: string;
  client_approved_at?: string;
  terms_accepted_at?: string;
  recording_consent_acknowledged_at?: string;
  elevenlabs_agent_id?: string;
  elevenlabs_phone_number_id?: string;
  twilio_phone_number?: string;
  intake: Record<string, any>;
  readiness: Record<string, boolean>;
  last_error?: string;
  next_action?: string;
  events?: Array<{ event_type: string; event_data: Record<string, unknown>; created_at: string }>;
  tasks?: Array<{ id: string; title: string; status: string; due_at?: string }>;
};

export const clientTrialApi = {
  getInvite: (token: string) => request<TrialInvite>(`/invite/${encodeURIComponent(token)}`, {}, false),
  claimInvite: (token: string) => request<ClientTrial>(`/invite/${encodeURIComponent(token)}/claim`, { method: "POST" }),
  getMine: () => request<ClientTrial>("/me"),
  saveIntake: (intake: Record<string, unknown>) => request<ClientTrial>("/me/intake", { method: "PATCH", body: JSON.stringify(intake) }),
  testCall: (toNumber: string) => request<Record<string, unknown>>("/me/test-call", { method: "POST", body: JSON.stringify({ toNumber }) }),
  submitTestResult: (passed: boolean, notes?: string) => request<ClientTrial>("/me/test-result", { method: "POST", body: JSON.stringify({ passed, notes }) }),
  goLive: () => request<ClientTrial>("/me/go-live", { method: "POST", body: JSON.stringify({ approved: true }) }),
  createInvite: (input: Record<string, unknown>) => request<{ trialId: string; inviteUrl: string; expiresAt: string; emailSent: boolean }>("/admin/invites", { method: "POST", body: JSON.stringify(input) }),
  listTrials: () => request<ClientTrial[]>("/admin"),
  configureAgent: (trialId: string, voiceId?: string) => request<ClientTrial>(`/admin/${trialId}/configure-agent`, { method: "POST", body: JSON.stringify({ voiceId }) }),
  connectNumber: (trialId: string, phoneNumber: string) => request<ClientTrial>(`/admin/${trialId}/connect-number`, { method: "POST", body: JSON.stringify({ phoneNumber }) }),
};
