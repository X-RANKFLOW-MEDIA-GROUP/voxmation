# Branding System - Database Setup Guide

## Overview

This guide covers the database configuration needed for the BrandingContext system to work properly.

## Supabase Table Structure

### Accounts Table Update

The `accounts` table needs to include a `branding` column to store branding configuration.

#### SQL Migration

```sql
-- Add branding column to accounts table if not exists
ALTER TABLE accounts
ADD COLUMN branding JSONB DEFAULT NULL;

-- Create index for branding queries (optional, for performance)
CREATE INDEX idx_accounts_branding ON accounts USING gin(branding);

-- Update existing accounts with default branding (optional)
UPDATE accounts
SET branding = jsonb_build_object(
  'show_branding', true,
  'theme', 'auto'
)
WHERE branding IS NULL;
```

### Branding Schema Structure

The `branding` JSONB column should contain:

```json
{
  "primary_color": "214 66% 14%",
  "secondary_color": "214 50% 34%",
  "accent_color": "26 100% 56%",
  "logo_url": "https://example.com/logo.png",
  "logo_dark_url": "https://example.com/logo-dark.png",
  "favicon_url": "https://example.com/favicon.ico",
  "company_name": "Acme Corporation",
  "font_family": "'Inter', 'Segoe UI', sans-serif",
  "support_email": "support@acme.com",
  "support_phone": "+1-800-ACME-123",
  "support_url": "https://support.acme.com",
  "custom_css": "/* Custom CSS rules */",
  "show_branding": true,
  "theme": "auto"
}
```

## Column Details

| Field | Type | Required | Description |
|---|---|---|---|
| `primary_color` | string | No | Brand primary color (HSL: "H S% L%") |
| `secondary_color` | string | No | Brand secondary color (HSL format) |
| `accent_color` | string | No | Brand accent color (HSL format) |
| `logo_url` | string | No | Main logo URL (light/default) |
| `logo_dark_url` | string | No | Dark mode logo URL |
| `favicon_url` | string | No | Browser favicon URL |
| `company_name` | string | No | Display name for the company |
| `font_family` | string | No | Custom font family CSS |
| `support_email` | string | No | Support email address |
| `support_phone` | string | No | Support phone number |
| `support_url` | string | No | Support portal URL |
| `custom_css` | string | No | Custom CSS to inject (max 50KB) |
| `show_branding` | boolean | No | Toggle branding display (default: true) |
| `theme` | string | No | Theme preference: 'light', 'dark', or 'auto' (default: 'auto') |

## Color Format Requirements

### Supported Formats

The system supports three color formats:

#### 1. HSL (Recommended)
```
"primary_color": "214 66% 14%"
"secondary_color": "214 50% 34%"
"accent_color": "26 100% 56%"
```

**Pros:**
- Human-readable
- Easy to adjust brightness/saturation
- Consistent across the application

#### 2. Hex
```
"primary_color": "#2c1c1f"
"secondary_color": "#2c3e54"
"accent_color": "#ff8800"
```

**Pros:**
- Common format
- Easy to copy from design tools

#### 3. RGB
```
"primary_color": "rgb(44, 28, 31)"
"secondary_color": "rgb(44, 62, 84)"
"accent_color": "rgb(255, 136, 0)"
```

**Pros:**
- Direct RGB values
- RGBA support with opacity

## Validation Rules

### Color Validation
- All color fields must be valid CSS color values
- HSL format: `\d+ \d+% \d+%`
- Hex format: `#[0-9A-Fa-f]{6}`
- RGB format: `rgb(\d+, \d+, \d+)`

### URL Validation
- Must start with `http://` or `https://`
- Must be a valid URL format
- Must be HTTPS recommended for production

### Email Validation
- Must match: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Valid email format required

### Phone Validation
- Must contain at least 10 digits
- Supports: `+`, `-`, `()`, spaces
- Format: `^[+]?[\d\s\-().]+$`

### Custom CSS Validation
- Maximum 50KB size
- No JavaScript injection
- CSS-only rules allowed
- Scoped within `#branding-custom-css` style element

## Sample Data

### Example 1: SaaS Company
```json
{
  "primary_color": "219 68% 51%",
  "secondary_color": "217 33% 16%",
  "accent_color": "48 97% 52%",
  "logo_url": "https://cdn.example.com/logo-light.svg",
  "logo_dark_url": "https://cdn.example.com/logo-dark.svg",
  "favicon_url": "https://cdn.example.com/favicon.ico",
  "company_name": "TechCorp",
  "font_family": "'Inter', 'Helvetica Neue', sans-serif",
  "support_email": "support@techcorp.com",
  "support_phone": "+1-800-TECH-123",
  "support_url": "https://help.techcorp.com",
  "show_branding": true,
  "theme": "auto"
}
```

### Example 2: Agency
```json
{
  "primary_color": "275 75% 34%",
  "secondary_color": "14 100% 50%",
  "accent_color": "260 87% 60%",
  "logo_url": "https://cdn.agency.com/logo.png",
  "company_name": "Creative Agency",
  "font_family": "'Poppins', 'Segoe UI', sans-serif",
  "support_email": "contact@agency.com",
  "custom_css": "body { letter-spacing: 0.5px; }",
  "show_branding": true,
  "theme": "light"
}
```

### Example 3: Minimal
```json
{
  "company_name": "My App",
  "show_branding": false,
  "theme": "auto"
}
```

## Database Queries

### Get Account Branding
```sql
SELECT branding FROM accounts WHERE id = $1;
```

### Update Account Branding
```sql
UPDATE accounts
SET branding = $1
WHERE id = $2
RETURNING branding;
```

### Get All Companies Using Custom Theme
```sql
SELECT id, name, branding->>'company_name' as custom_name
FROM accounts
WHERE branding->>'show_branding' = 'true';
```

### Find Accounts with Custom CSS
```sql
SELECT id, name, branding->>'custom_css' as css
FROM accounts
WHERE branding->>'custom_css' IS NOT NULL
AND branding->>'custom_css' != '';
```

## Row-Level Security (RLS) Policies

### Policy 1: Users Can View Their Account's Branding

```sql
CREATE POLICY "Users can view their account branding"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
    )
  );
```

### Policy 2: Admins Can Update Branding

```sql
CREATE POLICY "Admins can update branding"
  ON accounts FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
```

## API Endpoints

### Get Branding
```
GET /api/branding
Response: { branding: BrandingConfig }
```

### Update Branding
```
PATCH /api/branding
Request: { branding: Partial<BrandingConfig> }
Response: { branding: BrandingConfig }
```

### Validate Branding
```
POST /api/branding/validate
Request: { branding: Partial<BrandingConfig> }
Response: { valid: boolean, errors: string[] }
```

## Testing Data

### Development Account
```sql
INSERT INTO accounts (id, name, branding) VALUES (
  'dev-account-1',
  'Development Account',
  jsonb_build_object(
    'primary_color', '214 66% 14%',
    'secondary_color', '214 50% 34%',
    'accent_color', '26 100% 56%',
    'company_name', 'Dev Company',
    'show_branding', true,
    'theme', 'auto'
  )
)
ON CONFLICT (id) DO UPDATE SET
  branding = EXCLUDED.branding;
```

## Performance Optimization

### Index Creation
```sql
-- Index for JSONB column
CREATE INDEX idx_accounts_branding ON accounts USING gin(branding);

-- Index for specific fields
CREATE INDEX idx_accounts_branding_company 
  ON accounts ((branding->>'company_name'));
```

### Query Optimization
```sql
-- Use -> for JSON traversal (returns JSON)
-- Use ->> for JSON traversal (returns text)
-- Use #> for nested paths

SELECT branding->'primary_color' FROM accounts;
SELECT branding->>'company_name' FROM accounts;
SELECT branding#>'{colors,primary}' FROM accounts;
```

## Backup & Migration

### Backup Branding
```sql
-- Export all branding configurations
SELECT id, name, branding
FROM accounts
WHERE branding IS NOT NULL
ORDER BY id;
```

### Copy Branding Between Accounts
```sql
UPDATE accounts
SET branding = (SELECT branding FROM accounts WHERE id = $1)
WHERE id = $2;
```

### Reset to Defaults
```sql
UPDATE accounts
SET branding = jsonb_build_object(
  'show_branding', true,
  'theme', 'auto'
)
WHERE id = $1;
```

## Monitoring & Audits

### Track Branding Changes
```sql
-- Add audit table
CREATE TABLE branding_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id),
  old_branding JSONB,
  new_branding JSONB,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);

-- Create trigger
CREATE TRIGGER audit_branding_changes
AFTER UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION audit_branding_change();
```

## Troubleshooting

### Branding Not Loading
1. Check column exists: `SELECT branding FROM accounts LIMIT 1;`
2. Verify data format: `SELECT jsonb_typeof(branding) FROM accounts;`
3. Check RLS policies are correct
4. Verify account ID in context

### Invalid JSON
```sql
-- Validate JSON structure
SELECT jsonb_pretty(branding) FROM accounts WHERE id = $1;

-- Check for NULL values
SELECT branding IS NULL FROM accounts WHERE id = $1;
```

### Performance Issues
```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM accounts
WHERE branding->>'company_name' = 'TechCorp';

-- Use VACUUM for cleanup
VACUUM ANALYZE accounts;
```

## Next Steps

1. Run the migration SQL above
2. Add sample branding data to test account
3. Verify API endpoints work
4. Set up RLS policies
5. Create audit table (optional)
6. Test in development
7. Deploy to production

## Resources

- [Supabase JSONB Documentation](https://supabase.com/docs/guides/database/json)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
