# Quick Reference - Voxmation SEO System

## Page Types (52 total)

| Type | Template | Count | Route |
|------|----------|-------|-------|
| Vertical Pillar | VerticalPage.tsx | 4 | `/:vertical` |
| State Pages | StateVerticalPage.tsx | 40 | `/:vertical/:state` |
| Comparison | ComparisonPage.tsx | 5 | `/vs-:slug` |
| Resources | ResourcePage.tsx | 3 | `/resources/:slug` |

## Available Verticals

- `hvac-ai-voice-agents` → HVAC
- `plumbing-phone-automation` → Plumbing  
- `electrical-call-booking` → Electrical
- `roofing-lead-follow-up` → Roofing

## Available States

- texas, california, florida, new-york, pennsylvania
- illinois, ohio, michigan, north-carolina, georgia

## Available Comparisons

- vs-smith-ai
- vs-synthflow
- vs-dialora
- vs-aloware
- vs-retell-ai

## Available Resources

- hvac-roi-calculator
- ai-voice-agent-compliance-home-service
- missed-call-recovery-strategy

## Example URLs

```
/hvac-ai-voice-agents
/hvac-ai-voice-agents/texas
/plumbing-phone-automation/california
/electrical-call-booking/florida
/roofing-lead-follow-up/new-york
/vs-smith-ai
/resources/hvac-roi-calculator
```

## Adding Content

### New Vertical (generates 10 state pages automatically)
Edit `src/data/seoData.ts`:
```typescript
export const verticalsData: Record<string, Vertical> = {
  "new-industry": {
    slug: "new-industry-slug",
    name: "New Industry",
    title: "Page Title | Voxmation",
    h1: "Main Heading",
    metaDescription: "...",
    subheadline: "...",
    problemTitle: "...",
    problemDescription: "...",
    useCases: ["Use case 1", "Use case 2"],
    benefits: [
      { title: "Benefit 1", description: "..." },
      { title: "Benefit 2", description: "..." }
    ],
    complianceNote: "...",
    faqItems: [
      { q: "Question?", a: "Answer." }
    ]
  }
}
```

### New State (adds to all 4 verticals automatically)
Edit `src/data/seoData.ts`:
```typescript
export const statesData: StateData[] = [
  // ... existing states
  { slug: "arizona", name: "Arizona", code: "AZ" },
];

export const stateIntros: Record<string, string> = {
  // ... existing
  "arizona": "Arizona contractors in the desert...",
};

export const complianceNotes: Record<string, string> = {
  // ... existing
  "arizona": "Arizona compliance note...",
};
```

### New Comparison
Edit `src/data/seoData.ts`:
```typescript
export const comparisonsData: Record<string, ComparisonData> = {
  // ... existing
  "new-competitor": {
    slug: "vs-new-competitor",
    competitor: "Competitor Name",
    title: "Voxmation vs Competitor | Comparison",
    h1: "Voxmation vs Competitor Name",
    metaDescription: "...",
    about: "Competitor overview",
    bestFor: "When to choose them",
    whyVoxmation: [
      "Reason 1",
      "Reason 2",
      "Reason 3"
    ]
  }
}
```

### New Resource
Edit `src/data/seoData.ts`:
```typescript
export const resourcesData = {
  // ... existing
  "guide-slug": {
    slug: "guide-slug",
    title: "Resource Title | Voxmation",
    h1: "Resource Heading",
    metaDescription: "...",
    description: "Resource description"
  }
};
```

Then update `ResourcePage.tsx` conditional to render custom content.

## Important Notes

- Vertical page params must match `verticalsData` keys
- State page params must match `statesData` slug values
- Comparison params must match `comparisonsData` keys
- Resource params must match `resourcesData` keys
- Routes must be placed AFTER specific routes in App.tsx
- All pages include SEO metadata and schema markup

## Testing Locally

```bash
npm run dev
# Visit http://localhost:5173/hvac-ai-voice-agents
# Visit http://localhost:5173/hvac-ai-voice-agents/texas
# Visit http://localhost:5173/vs-smith-ai
# Visit http://localhost:5173/resources/hvac-roi-calculator
```

## Schema Markup

All pages include:
- ✅ Meta tags (title, description)
- ✅ Open Graph tags
- ✅ Canonical URLs
- ✅ JSON-LD schema
  - FAQPage (questions + answers)
  - SoftwareApplication (verticals)
  - Organization
  - LocalBusiness (state pages)

## Performance

- 52 pages from 1 data file
- 4 reusable templates
- No code duplication
- Automatic sitemap generation
- Automatic robots.txt generation

## Troubleshooting

**Page not found?**
- Check params match data keys exactly
- Verify data exists in seoData.ts
- Check App.tsx routes are in correct order

**Schema not showing?**
- View page source and look for `<script type="application/ld+json">`
- Validate at schema.org/validator
- Check SEOHead component receives jsonLd prop

**Content not displaying?**
- Verify data is properly exported from seoData.ts
- Check for typos in vertical/state/comparison slugs
- Inspect network tab to see if data loads

## Maintenance

Monthly tasks:
- [ ] Monitor Google Search Console for new pages
- [ ] Check page rankings in Google
- [ ] Review bounce rates and conversion rates
- [ ] Update compliance notes as regulations change
- [ ] Add new state pages as market expands

Quarterly tasks:
- [ ] Review and update competitor comparisons
- [ ] Refresh state-specific copy
- [ ] Update ROI calculator figures
- [ ] Monitor technical SEO metrics

## Need More Info?

- **Architecture**: See `SEO_STRUCTURE.md`
- **Implementation**: See `SEO_IMPLEMENTATION_SUMMARY.md`
- **Code**: Check `src/data/seoData.ts` for structure
- **Templates**: Review page components for patterns
