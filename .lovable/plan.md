

## Plan: Lead Capture Form + English-Only Content

### Problem
Currently, all CTA buttons ("Book a Demo", "Get Started", "Book Now") link to an external Cal.com URL. There's no on-site lead capture, meaning you lose control over leads and can't track conversions. Some remnant Portuguese text exists in `HeroSection.tsx`.

### Solution

#### 1. Create a `LeadCaptureDialog` component
A modal dialog (using shadcn `Dialog`) that opens when any CTA is clicked instead of navigating to Cal.com. Fields:
- **Full Name** (required)
- **Business Name** (required)
- **Email** (required, validated)
- **Phone** (required)
- **Service Industry** (select: HVAC, Plumbing, Electrical, Cleaning, Landscaping, Other)
- **Monthly Call Volume** (select: Under 100, 100-300, 300-500, 500+)
- Submit button: "Book My Free Demo"

On submit → insert into a new `website_leads` database table → show success message → optionally redirect to Cal.com for scheduling.

#### 2. Create `website_leads` database table
```sql
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

-- Public insert (no auth required), no read/update/delete
ALTER TABLE public.website_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead"
  ON public.website_leads FOR INSERT
  TO anon WITH CHECK (true);
```

#### 3. Update all CTAs across the site
Replace all `cal.com` links and external hrefs with an `onClick` that opens the `LeadCaptureDialog`:
- **HomeTest.tsx**: Navbar "Book a Demo", Hero "Get Started Free", Pricing "Get Started" buttons, CTA section "Book Free Demo"
- **FloatingCTA.tsx**: "Book Now" button
- **HeroSection.tsx**: "Agendar demo gratuita" → translate to English + open dialog

#### 4. Translate remaining Portuguese content
- `HeroSection.tsx`: All Portuguese text → English (this component is used on the `/` route via `Index.tsx`)

#### 5. Wire up the flow
- Form uses zod validation
- Submits via Supabase client (`supabase.from('website_leads').insert(...)`)
- Shows toast on success: "Thanks! We'll be in touch within 24 hours."
- After success, optionally opens Cal.com in new tab for immediate scheduling

### Files to create/modify
- **Create**: `src/components/LeadCaptureDialog.tsx`
- **Modify**: `src/pages/HomeTest.tsx` — replace all cal.com hrefs
- **Modify**: `src/components/FloatingCTA.tsx` — open dialog instead of cal.com
- **Modify**: `src/components/HeroSection.tsx` — translate to English + open dialog
- **Migration**: New `website_leads` table with anon insert policy

