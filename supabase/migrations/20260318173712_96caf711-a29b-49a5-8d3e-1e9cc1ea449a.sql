CREATE TABLE public.website_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  business_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  industry text,
  monthly_call_volume text,
  source text DEFAULT 'website',
  page_source text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.website_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.website_leads FOR INSERT
  TO anon WITH CHECK (true);