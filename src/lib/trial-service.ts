import { supabase } from "@/integrations/supabase/client";
import { generateApiKey } from "./api-key-generator";
import { sendTrialEmail } from "./email-service";

export interface TrialCreationData {
  email: string;
  businessName: string;
  industry?: string;
  fullName: string;
  phone: string;
}

export async function createTrial(data: TrialCreationData) {
  try {
    // First, create the website_lead
    const { data: leadData, error: leadError } = await supabase
      .from("website_leads")
      .insert({
        full_name: data.fullName,
        business_name: data.businessName,
        email: data.email,
        phone: data.phone,
        industry: data.industry,
      })
      .select()
      .single();

    if (leadError) throw leadError;

    // Create the trial
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: trialData, error: trialError } = await supabase
      .from("trials")
      .insert({
        lead_id: leadData.id,
        email: data.email,
        business_name: data.businessName,
        industry: data.industry,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (trialError) throw trialError;

    // Generate and create the API key
    const apiKey = generateApiKey("vox_trial");

    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .insert({
        trial_id: trialData.id,
        api_key: apiKey,
      })
      .select()
      .single();

    if (keyError) throw keyError;

    // Send welcome email with API key
    await sendTrialEmail(
      data.email,
      data.businessName,
      apiKey,
      expiresAt
    );

    return {
      success: true,
      trial: trialData,
      apiKey: apiKey,
    };
  } catch (error) {
    console.error("Error creating trial:", error);
    throw error;
  }
}

export async function validateApiKey(apiKey: string) {
  try {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*, trials(*)")
      .eq("api_key", apiKey)
      .eq("status", "active")
      .single();

    if (error || !data) {
      return { valid: false, error: "Invalid API key" };
    }

    // Check if trial is expired
    const trial = (data as any).trials;
    if (new Date(trial.expires_at) < new Date()) {
      return { valid: false, error: "Trial has expired" };
    }

    // Update last_used_at
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id);

    return {
      valid: true,
      trial: trial,
      keyInfo: data,
    };
  } catch (error) {
    console.error("Error validating API key:", error);
    return { valid: false, error: "Validation failed" };
  }
}

export async function getTrial(email: string) {
  try {
    const { data, error } = await supabase
      .from("trials")
      .select("*, api_keys(*)")
      .eq("email", email)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return { success: true, trial: data };
  } catch (error) {
    console.error("Error getting trial:", error);
    return { success: false, error: null };
  }
}
