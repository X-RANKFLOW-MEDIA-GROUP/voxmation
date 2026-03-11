
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  lead1_id uuid := gen_random_uuid();
  lead2_id uuid := gen_random_uuid();
  lead3_id uuid := gen_random_uuid();
  lead4_id uuid := gen_random_uuid();
  lead5_id uuid := gen_random_uuid();
BEGIN
  -- Seed calls
  INSERT INTO public.calls (user_id, caller_name, caller_phone, call_type, status, duration_seconds, sentiment, outcome, summary, created_at) VALUES
    (NEW.id, 'Maria Santos', '+1 (555) 234-5678', 'inbound', 'completed', 187, 'positive', 'booked', 'Client inquired about HVAC maintenance package. Booked annual service appointment for next Tuesday.', now() - interval '2 hours'),
    (NEW.id, 'James Wilson', '+1 (555) 345-6789', 'inbound', 'completed', 94, 'neutral', 'follow_up', 'Requested quote for commercial plumbing repair. Follow-up scheduled.', now() - interval '5 hours'),
    (NEW.id, 'Sarah Chen', '+1 (555) 456-7890', 'inbound', 'missed', 0, null, 'missed', 'Missed call — automated SMS sent.', now() - interval '8 hours'),
    (NEW.id, 'Robert Davis', '+1 (555) 567-8901', 'inbound', 'completed', 243, 'positive', 'booked', 'New client booked emergency electrical inspection. High priority.', now() - interval '1 day'),
    (NEW.id, 'Emily Park', '+1 (555) 678-9012', 'inbound', 'completed', 156, 'positive', 'booked', 'Returning client scheduled quarterly pest control service.', now() - interval '1 day 3 hours'),
    (NEW.id, 'Michael Brown', '+1 (555) 789-0123', 'inbound', 'missed', 0, null, 'recovered', 'Missed call recovered via SMS. Client booked online.', now() - interval '2 days'),
    (NEW.id, 'Lisa Thompson', '+1 (555) 890-1234', 'inbound', 'completed', 312, 'positive', 'booked', 'Discussed landscaping project scope. Booked on-site consultation.', now() - interval '2 days 5 hours'),
    (NEW.id, 'David Kim', '+1 (555) 901-2345', 'inbound', 'completed', 78, 'neutral', 'no_action', 'General pricing inquiry. No immediate booking needed.', now() - interval '3 days'),
    (NEW.id, 'Amanda Garcia', '+1 (555) 012-3456', 'inbound', 'missed', 0, null, 'missed', 'Missed call — voicemail left. AI follow-up queued.', now() - interval '3 days 2 hours'),
    (NEW.id, 'Chris Johnson', '+1 (555) 123-4567', 'inbound', 'completed', 198, 'positive', 'booked', 'Booked roof inspection after storm damage inquiry.', now() - interval '4 days');

  -- Seed leads
  INSERT INTO public.leads (id, user_id, name, phone, email, city, service_requested, status, source, lead_score, created_at) VALUES
    (lead1_id, NEW.id, 'Maria Santos', '+1 (555) 234-5678', 'maria@email.com', 'Austin', 'HVAC Maintenance', 'qualified', 'ai_voice', 85, now() - interval '2 hours'),
    (lead2_id, NEW.id, 'James Wilson', '+1 (555) 345-6789', 'james.w@email.com', 'Dallas', 'Plumbing Repair', 'contacted', 'ai_voice', 62, now() - interval '5 hours'),
    (lead3_id, NEW.id, 'Sarah Chen', '+1 (555) 456-7890', 'schen@email.com', 'Houston', 'General Inquiry', 'new', 'missed_call', 45, now() - interval '8 hours'),
    (lead4_id, NEW.id, 'Robert Davis', '+1 (555) 567-8901', 'rdavis@email.com', 'San Antonio', 'Electrical Inspection', 'converted', 'ai_voice', 92, now() - interval '1 day'),
    (lead5_id, NEW.id, 'Emily Park', '+1 (555) 678-9012', 'epark@email.com', 'Austin', 'Pest Control', 'qualified', 'referral', 78, now() - interval '1 day 3 hours');

  -- Seed bookings
  INSERT INTO public.bookings (user_id, lead_id, title, scheduled_at, duration_minutes, service_type, status, created_at) VALUES
    (NEW.id, lead1_id, 'HVAC Annual Service — Maria Santos', now() + interval '2 days', 90, 'HVAC Maintenance', 'confirmed', now() - interval '2 hours'),
    (NEW.id, lead4_id, 'Emergency Electrical Inspection — Robert Davis', now() + interval '1 day', 60, 'Electrical', 'confirmed', now() - interval '1 day'),
    (NEW.id, lead5_id, 'Quarterly Pest Control — Emily Park', now() + interval '5 days', 45, 'Pest Control', 'confirmed', now() - interval '1 day 3 hours'),
    (NEW.id, null, 'Roof Inspection — Chris Johnson', now() + interval '3 days', 120, 'Roofing', 'pending', now() - interval '4 days');

  -- Seed automations
  INSERT INTO public.automations (user_id, name, type, description, status, trigger_count, last_triggered_at) VALUES
    (NEW.id, 'Missed Call Text-Back', 'missed_call_sms', 'Automatically sends SMS when a call is missed with booking link.', 'active', 24, now() - interval '8 hours'),
    (NEW.id, 'Lead Follow-Up Sequence', 'lead_follow_up', '3-step email/SMS sequence for new leads over 48h without response.', 'active', 67, now() - interval '3 hours'),
    (NEW.id, 'Review Request', 'review_request', 'Sends review request 24h after completed service appointment.', 'active', 31, now() - interval '1 day'),
    (NEW.id, 'Appointment Reminder', 'appointment_reminder', 'SMS reminder sent 24h and 1h before scheduled appointments.', 'active', 42, now() - interval '6 hours'),
    (NEW.id, 'After-Hours Auto-Reply', 'after_hours', 'AI voice agent handles calls outside business hours with smart routing.', 'paused', 18, now() - interval '2 days');

  -- Seed integrations
  INSERT INTO public.integrations (user_id, provider, status, connected_at) VALUES
    (NEW.id, 'twilio', 'connected', now() - interval '30 days'),
    (NEW.id, 'google_calendar', 'connected', now() - interval '28 days'),
    (NEW.id, 'highlevel', 'connected', now() - interval '25 days'),
    (NEW.id, 'zoho', 'disconnected', null),
    (NEW.id, 'stripe', 'disconnected', null),
    (NEW.id, 'zapier', 'disconnected', null);

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users (fires after profile creation trigger)
CREATE TRIGGER on_auth_user_created_seed_data
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_demo_data();
