import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "⚠️  Supabase not configured. Using in-memory storage for applications."
  );
}

export const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export interface JobApplicationRecord {
  id?: string;
  job_id: string;
  job_title: string;
  full_name: string;
  email: string;
  phone: string;
  resume_url?: string;
  resume_file_name?: string;
  years_experience: string;
  greatest_achievement: string;
  why_interested: string;
  additional_info: string;
  status: "new" | "reviewed" | "shortlisted" | "rejected" | "hired";
  notes?: string;
  applied_at?: string;
}

// Save application to Supabase
export const saveApplication = async (
  app: JobApplicationRecord
): Promise<string> => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from("job_applications")
    .insert([app])
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
};

// Get all applications with pagination
export const getApplications = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  search?: string
) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  let query = supabase.from("job_applications").select("*", { count: "exact" });

  // Apply filters
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query
    .order("applied_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    applications: data || [],
    total: count || 0,
    page,
    limit,
    pages: Math.ceil((count || 0) / limit),
  };
};

// Get single application
export const getApplication = async (id: string) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// Update application status
export const updateApplicationStatus = async (
  id: string,
  status: string,
  notes?: string
) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { error } = await supabase
    .from("job_applications")
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;

  // Log the activity
  await logActivity(id, "status_change", status, notes);
};

// Log activity
export const logActivity = async (
  applicationId: string,
  action: string,
  status?: string,
  message?: string
) => {
  if (!supabase) return;

  await supabase.from("activity_logs").insert([
    {
      application_id: applicationId,
      action,
      new_status: status,
      message,
    },
  ]);
};

// Add email to queue
export const queueEmail = async (
  applicationId: string,
  recipientEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  emailType: string
) => {
  if (!supabase) return;

  await supabase.from("email_queue").insert([
    {
      application_id: applicationId,
      recipient_email: recipientEmail,
      subject,
      html_content: htmlContent,
      text_content: textContent,
      email_type: emailType,
      status: "pending",
    },
  ]);
};

// Get stats
export const getStats = async () => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const statuses = ["new", "reviewed", "shortlisted", "rejected", "hired"];
  const stats: Record<string, number> = {};

  for (const status of statuses) {
    const { count } = await supabase
      .from("job_applications")
      .select("*", { count: "exact" })
      .eq("status", status);

    stats[status] = count || 0;
  }

  return stats;
};
