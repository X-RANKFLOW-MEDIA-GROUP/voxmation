

## Plan: Add Prominent "Book a Call" CTAs Across the Site

### Changes

**1. Navbar — persistent CTA (`Navbar.tsx`)**
- Replace the "Deploy System" neon button with **"Book a Call"** linking to `https://cal.com/voxmation/meeting` (opens in new tab)
- Add the same CTA in the mobile menu

**2. Hero Section (`HeroSection.tsx`)**
- Update primary CTA text from current copy to **"Book a Free Call"** (already links to cal.com — just update label if needed)
- Ensure secondary CTA also references booking

**3. Floating CTA Button (new)**
- Add a fixed-position **"Book Now"** button in the bottom-right corner that appears after scrolling past the hero
- Uses the `neon` variant, links to `https://cal.com/voxmation/meeting`
- Animates in/out with framer-motion based on scroll position
- Stays visible on all screen sizes for easy access

**4. Footer CTA band (`FooterSection.tsx`)**
- Update "Book Audit" to **"Book a Free Call"** for consistency

**5. Pricing Section (`PricingSection.tsx`)**
- Ensure all plan CTAs say **"Book a Call"** consistently

**6. Services Section (`ServicesSection.tsx`)**
- Update "Book Your Demo" to **"Book a Call"**

### Files modified
- `src/components/Navbar.tsx` — CTA button update
- `src/components/HeroSection.tsx` — CTA label update
- `src/components/FooterSection.tsx` — CTA label update
- `src/components/PricingSection.tsx` — CTA label update
- `src/components/ServicesSection.tsx` — CTA label update
- `src/pages/Index.tsx` — add floating CTA component (or inline it)

