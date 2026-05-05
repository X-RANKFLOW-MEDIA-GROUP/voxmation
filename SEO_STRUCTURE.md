# Voxmation National SEO Foundation

## Overview

This document describes the credit-efficient national SEO architecture for Voxmation. The system uses data-driven templates and dynamic routing to support 40+ pages without code duplication.

## Architecture

### Data-Driven Approach

All content is stored in `/src/data/seoData.ts`:
- **Verticals**: HVAC, Plumbing, Electrical, Roofing
- **States**: 10 initial states with localized copy
- **Comparisons**: 5 competitor comparison pages
- **Resources**: 3 resource pages (ROI calculator, compliance, missed call recovery)

This single data file generates all pages dynamically.

## URL Structure

### 1. Vertical Pillar Pages (4 pages)

```
/hvac-ai-voice-agents/
/plumbing-phone-automation/
/electrical-call-booking/
/roofing-lead-follow-up/
```

**Template**: `VerticalPage.tsx`
**Route**: `/:vertical`
**Features**:
- Industry-specific H1, problem section, benefits
- Common use cases
- Compliance notes
- FAQ with schema markup
- Internal links to state pages

### 2. State-Specific Pages (40 pages)

```
/hvac-ai-voice-agents/texas/
/hvac-ai-voice-agents/california/
/plumbing-phone-automation/texas/
... and so on for all 10 states × 4 verticals
```

**Template**: `StateVerticalPage.tsx`
**Route**: `/:vertical/:state`
**Features**:
- Localized H1 and copy
- State-specific intro text
- State compliance notes
- Breadcrumb navigation
- Links back to vertical pillar page

### 3. Comparison Pages (5 pages)

```
/vs-smith-ai/
/vs-synthflow/
/vs-dialora/
/vs-aloware/
/vs-retell-ai/
```

**Template**: `ComparisonPage.tsx`
**Route**: `/vs-:slug`
**Features**:
- Honest competitor analysis
- Feature comparison table
- Why Voxmation wins
- No false claims

### 4. Resource Pages (3 pages)

```
/resources/hvac-roi-calculator/
/resources/ai-voice-agent-compliance-home-service/
/resources/missed-call-recovery-strategy/
```

**Template**: `ResourcePage.tsx`
**Route**: `/resources/:slug`
**Features**:
- Interactive ROI calculator
- Compliance guide
- Strategy framework
- FAQ and CTA

## Files Created

### Core Data
- `src/data/seoData.ts` - Central SEO data source (274 lines)

### Page Templates
- `src/pages/VerticalPage.tsx` - Vertical pillar template (138 lines)
- `src/pages/StateVerticalPage.tsx` - State-specific template (160 lines)
- `src/pages/ComparisonPage.tsx` - Competitor comparison (161 lines)
- `src/pages/ResourcePage.tsx` - Resource guide template (186 lines)

### SEO Helpers
- `src/lib/seoHelpers.ts` - Sitemap and robots.txt generation
- `src/lib/schemaHelpers.ts` - JSON-LD schema generation

## Routes Added

```typescript
// Vertical pillar pages
<Route path="/:vertical" element={<VerticalPage />} />

// State-specific pages
<Route path="/:vertical/:state" element={<StateVerticalPage />} />

// Comparison pages
<Route path="/vs-:slug" element={<ComparisonPage />} />

// Resource pages
<Route path="/resources/:slug" element={<ResourcePage />} />
```

## SEO Features Implemented

### 1. Metadata & Canonical URLs
- Dynamic title tags
- Meta descriptions
- Canonical URLs via Helmet
- Author and publish date support

### 2. Schema Markup
- FAQPage schema on all pages
- SoftwareApplication schema for verticals
- BreadcrumbList schema on state pages
- Organization schema
- LocalBusiness schema option

### 3. Sitemap
Generated via `/lib/seoHelpers.ts`:
- All vertical pages (4)
- All state pages (40)
- All comparison pages (5)
- All resource pages (3)
- Total: 52 URLs

### 4. Robots.txt
Standard setup with:
- Crawl delay: 1 second
- Disallow: /admin/, /portal/, /auth
- Sitemap reference

## How to Use

### Adding a New Vertical

1. Add to `src/data/seoData.ts`:
```typescript
export const verticalsData: Record<string, Vertical> = {
  // ... existing verticals
  "new-industry": {
    slug: "new-industry-ai-agents",
    name: "New Industry",
    title: "...",
    h1: "...",
    // ... rest of data
  }
}
```

2. Pages automatically generated:
   - `/new-industry-ai-agents/`
   - `/new-industry-ai-agents/texas/`
   - `/new-industry-ai-agents/california/`
   - ... etc for all states

### Adding a New State

1. Add to `statesData` array in `src/data/seoData.ts`:
```typescript
export const statesData: StateData[] = [
  // ... existing states
  { slug: "nevada", name: "Nevada", code: "NV" },
]
```

2. Add state intro copy to `stateIntros`:
```typescript
export const stateIntros: Record<string, string> = {
  // ... existing intros
  nevada: "Nevada contractors...",
}
```

3. Add compliance note to `complianceNotes` if needed:
```typescript
export const complianceNotes: Record<string, string> = {
  // ... existing notes
  nevada: "Nevada contractors...",
}
```

4. All 40 state pages now include Nevada automatically.

### Adding a Comparison

1. Add to `comparisonsData` in `src/data/seoData.ts`:
```typescript
export const comparisonsData: Record<string, ComparisonData> = {
  // ... existing comparisons
  "new-competitor": {
    slug: "vs-new-competitor",
    competitor: "New Competitor",
    // ... rest of data
  }
}
```

2. Page automatically available at `/vs-new-competitor/`

### Adding a Resource

1. Add to `resourcesData` in `src/data/seoData.ts`:
```typescript
export const resourcesData = {
  // ... existing resources
  "new-resource": {
    slug: "new-resource",
    title: "...",
    h1: "...",
    // ... rest of data
  }
}
```

2. Page automatically available at `/resources/new-resource/`

## Testing Checklist

- [ ] Visit `/hvac-ai-voice-agents/` - Should render vertical page
- [ ] Visit `/hvac-ai-voice-agents/texas/` - Should render state page with Texas copy
- [ ] Visit `/vs-smith-ai/` - Should render comparison page
- [ ] Visit `/resources/hvac-roi-calculator/` - Should render resource page
- [ ] Check page source - Should have meta tags and schema markup
- [ ] Verify breadcrumbs on state pages
- [ ] Test responsive design on mobile
- [ ] Validate schema at https://schema.org/validator
- [ ] Test sitemap generation
- [ ] Verify all internal links work

## Performance Notes

- Total template code: ~645 lines
- Data file: 274 lines
- Generates 52 pages with zero duplication
- Schema markup on every page
- Canonical URLs prevent duplicate content issues
- State pages link to each other and to vertical pillars

## What NOT to Do

- Don't hardcode individual state pages
- Don't duplicate problem descriptions between verticals
- Don't manually create comparison pages
- Don't forget to add schema markup to new resource pages
- Don't redirect old URLs without 301 redirects

## Homepage Integration

The homepage H1 and subheading should link to vertical pages:

```
AI Voice Agents for Home Service Contractors. Answer Every Call. Book Every Appointment. 24/7.

Stop losing calls. Stop losing revenue. Voxmation answers, follows up, and helps book appointments for HVAC, plumbing, electrical, and roofing contractors nationwide.

[HVAC Contractors] [Plumbers] [Electricians] [Roofers]
     ↓                  ↓              ↓             ↓
/hvac-ai-voice-agents/  /plumbing-...  /electrical-...  /roofing-...
```

## Future Expansion

To scale further:
1. Add more states (50 states = 200 pages)
2. Add more verticals (10 industries = 400+ pages)
3. Add more comparisons (10 competitors = 10 pages)
4. Add location + vertical combos if needed (NYC HVAC specialist pages, etc.)

All automatic with zero code changes—just update `seoData.ts`.

## Credit Usage Summary

- 1 data file (reusable for any page count)
- 4 template components (reusable)
- 2 SEO helper files (reusable)
- 4 route definitions
- Total: Minimal incremental cost per new page

Traditional approach: 52 separate pages = 52 copies of similar code
Data-driven approach: 1 data file + 4 templates = unlimited pages
