-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  resume_url TEXT,
  resume_file_name VARCHAR(255),
  years_experience TEXT,
  greatest_achievement TEXT,
  why_interested TEXT,
  additional_info TEXT,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_email ON job_applications(email);
CREATE INDEX idx_job_applications_applied_at ON job_applications(applied_at DESC);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);

-- Create activity_logs table for tracking status changes
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  message TEXT,
  admin_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for activity logs
CREATE INDEX idx_activity_logs_application ON activity_logs(application_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Create email_queue table for retry logic
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  email_type VARCHAR(50) NOT NULL, -- 'confirmation', 'status_update', 'rejection', 'offer'
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  last_error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email queue
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_application ON email_queue(application_id);

-- Enable RLS (Row Level Security)
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (optional - restrict public access)
-- For now, we'll allow authenticated users to read/write
-- This assumes you have authentication set up

CREATE POLICY "Applications are viewable by authenticated users" ON job_applications
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Applications can be updated by authenticated users" ON job_applications
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Activity logs are viewable by authenticated users" ON activity_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');
