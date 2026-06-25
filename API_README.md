# Voxmation API Documentation

Complete, production-ready OpenAPI/Swagger documentation for the Voxmation platform.

## Quick Links

- **Interactive API Documentation:** http://localhost:3001/api-docs
- **OpenAPI JSON Spec:** http://localhost:3001/api-docs/swagger.json
- **OpenAPI YAML Spec:** http://localhost:3001/api-docs/swagger.yaml

## Documentation Files

### Core Documentation

| File | Purpose | For |
|------|---------|-----|
| [SWAGGER_SETUP.md](./SWAGGER_SETUP.md) | Complete setup and integration guide | Developers setting up the API |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Detailed API reference with all endpoints | Developers integrating with the API |
| [API_QUICKSTART.md](./API_QUICKSTART.md) | Getting started guide with examples | New API users |

### API Specification Files

| File | Purpose | Format |
|------|---------|--------|
| `server/swagger.json` | OpenAPI 3.0 specification | JSON |
| `server/swagger-setup.ts` | Swagger UI integration module | TypeScript |

## What's Included

### 1. Interactive Swagger UI

- **URL:** `/api-docs`
- **Features:**
  - Browse all 41 API endpoints
  - View detailed documentation for each endpoint
  - Test endpoints directly in the browser
  - Automatic authentication support
  - Live request/response examples
  - Error code reference

### 2. Complete OpenAPI Specification

- **Standard:** OpenAPI 3.0.0
- **Coverage:** All 41 endpoints documented
- **Schemas:** All request/response models defined
- **Security:** Authentication methods documented
- **Errors:** All error codes and meanings

### 3. API Endpoints Documented

#### Authentication (4 endpoints)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

#### CRM - Contacts (7 endpoints)
- `GET /api/crm/contacts` - List contacts
- `POST /api/crm/contacts` - Create contact
- `GET /api/crm/contacts/{id}` - Get contact
- `PUT /api/crm/contacts/{id}` - Update contact
- `DELETE /api/crm/contacts/{id}` - Delete contact
- `GET /api/crm/contacts/{id}/interactions` - Get interactions

#### CRM - Opportunities (4 endpoints)
- `GET /api/crm/opportunities` - List opportunities
- `POST /api/crm/opportunities` - Create opportunity
- `PATCH /api/crm/opportunities/{id}/stage` - Update stage

#### Email Campaigns (8 endpoints)
- `GET /api/campaigns/email` - List campaigns
- `POST /api/campaigns/email` - Create campaign
- `GET /api/campaigns/email/{id}` - Get campaign
- `PUT /api/campaigns/email/{id}` - Update campaign
- `DELETE /api/campaigns/email/{id}` - Delete campaign
- `POST /api/campaigns/email/{id}/send` - Send campaign
- `POST /api/campaigns/email/{id}/pause` - Pause campaign
- `GET /api/campaigns/email/{id}/stats` - Get statistics

#### Automations (8 endpoints)
- `GET /api/automations` - List automations
- `POST /api/automations` - Create automation
- `GET /api/automations/{id}` - Get automation
- `PATCH /api/automations/{id}` - Update automation
- `DELETE /api/automations/{id}` - Delete automation
- `POST /api/automations/{id}/activate` - Activate
- `POST /api/automations/{id}/pause` - Pause
- `POST /api/automations/{id}/test` - Test automation
- `GET /api/automations/{id}/executions` - Get executions

#### Phone Calls (3 endpoints)
- `GET /api/calls` - List calls
- `POST /api/calls` - Make call
- `GET /api/calls/{id}` - Get call details
- `GET /api/calls/{id}/recordings` - Get recordings

#### Billing (4 endpoints)
- `GET /api/billing/plans` - List plans
- `GET /api/billing/subscription` - Get subscription
- `GET /api/billing/invoices` - List invoices
- `GET /api/billing/usage` - Get usage metrics

#### Webhooks (2 endpoints)
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/twilio` - Twilio webhook handler

#### Admin (2 endpoints)
- `GET /api/admin/accounts` - List accounts
- `GET /api/admin/accounts/{id}` - Get account details

### 4. Comprehensive Error Reference

**Error Categories:**
- Authentication errors (5 codes)
- Validation errors (5 codes)
- Resource errors (5 codes)
- Permission errors (3 codes)
- State errors (3 codes)
- Server errors (3 codes)

**Total Error Codes:** 24 documented

### 5. Example Code

**Included Examples:**
- cURL examples for all endpoints
- Python code samples
- JavaScript/Node.js code samples
- Complete workflow examples
- Debugging tips and troubleshooting

## Getting Started

### 1. Installation

Dependencies are in `package.json`:

```bash
npm install
```

This installs:
- `swagger-ui-express` - Interactive documentation
- `swagger-jsdoc` - Specification generation

### 2. Start Server

```bash
npm run dev
```

### 3. Access Documentation

- **Interactive UI:** http://localhost:3001/api-docs
- **Raw JSON:** http://localhost:3001/api-docs/swagger.json
- **Health Check:** http://localhost:3001/api-docs/health

### 4. Authenticate

```bash
# Get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "password"
  }'

# Use token in requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/crm/contacts
```

## For Different Use Cases

### I'm a Frontend Developer
Start with [API_QUICKSTART.md](./API_QUICKSTART.md) for quick examples and code samples.

### I'm Building Integration
Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint reference and error handling.

### I'm Setting Up the API
Follow [SWAGGER_SETUP.md](./SWAGGER_SETUP.md) for installation and configuration.

### I Want to Test Endpoints
Use the interactive Swagger UI at `/api-docs` to test endpoints directly.

### I Need to Integrate with Postman/Insomnia
Import the spec from `/api-docs/swagger.json` into your tool.

## Key Features

### 1. Complete Schema Documentation

Every endpoint includes:
- Request schema with required fields
- Response schema with field descriptions
- Example requests and responses
- Data types and constraints

### 2. Security Documentation

- Bearer token authentication details
- API key support for programmatic access
- Token refresh flow
- Security best practices

### 3. Error Handling Guide

- HTTP status codes explained
- Standard error response format
- All error codes listed
- Troubleshooting tips for common errors

### 4. Rate Limiting Information

- Rate limits by subscription plan
- Rate limit headers explained
- Handling 429 responses
- Retry strategy recommendations

### 5. Real-World Examples

- Complete workflow examples
- Code in multiple languages (cURL, Python, JavaScript)
- Common use cases with step-by-step instructions
- Debugging and testing guidance

## API Structure

### Endpoints Organization

Endpoints are organized by functionality:

```
/api/
├── /auth/          - Authentication (4 endpoints)
├── /crm/           - Customer data (11 endpoints)
├── /campaigns/     - Marketing campaigns (8 endpoints)
├── /automations/   - Automation workflows (9 endpoints)
├── /calls/         - Phone calls (3 endpoints)
├── /billing/       - Subscription & billing (4 endpoints)
├── /webhooks/      - Webhook handlers (2 endpoints)
└── /admin/         - Administration (2 endpoints)
```

### Response Format

All responses follow a standard format:

**Success (2xx):**
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

**Error (4xx, 5xx):**
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

## Authentication

### JWT Bearer Token

1. Call `/api/auth/login` with email and password
2. Receive JWT token in response
3. Include in all requests: `Authorization: Bearer <token>`
4. Token expires in 24 hours
5. Use `/api/auth/refresh` to get new token

### API Key (Optional)

1. Request API key from support
2. Include in header: `X-API-Key: <key>`
3. Better for programmatic/automated access
4. Can be revoked anytime

## Rate Limiting

| Plan | Requests/Hour | Burst | Monthly Calls |
|------|--------------|-------|--------------|
| Free | 100 | 10 | 2,400 |
| Starter | 1,000 | 100 | 24,000 |
| Pro | 10,000 | 1,000 | 240,000 |
| Enterprise | Unlimited | Unlimited | Unlimited |

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

## Tooling Integration

### Postman

```
File → Import → Link
URL: http://localhost:3001/api-docs/swagger.json
```

### Insomnia

```
Create → Import → From URL
URL: http://localhost:3001/api-docs/swagger.json
```

### VS Code REST Client

Use the exported spec to create `.http` files with autocomplete.

### SDK Generation

Generate client libraries with OpenAPI Generator:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3001/api-docs/swagger.json \
  -g javascript \
  -o ./generated-client
```

## Documentation Updates

The API documentation is automatically served from:
- `server/swagger.json` - OpenAPI specification
- `server/swagger-setup.ts` - Swagger UI configuration

When you add new endpoints:
1. Update `swagger.json` with new endpoint definitions
2. Add request/response schemas
3. Document error responses
4. Restart server to reload specs

## Support & Resources

### Documentation
- **Full Reference:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Quick Start:** [API_QUICKSTART.md](./API_QUICKSTART.md)
- **Setup Guide:** [SWAGGER_SETUP.md](./SWAGGER_SETUP.md)

### Interactive Tools
- **Swagger UI:** http://localhost:3001/api-docs
- **OpenAPI JSON:** http://localhost:3001/api-docs/swagger.json
- **OpenAPI YAML:** http://localhost:3001/api-docs/swagger.yaml
- **Health Check:** http://localhost:3001/api-docs/health

### Help & Support
- **Email:** support@voxmation.com
- **Issues:** [Report a bug](https://github.com/voxmation/api/issues)
- **Documentation:** See links above

## File Structure

```
voxmation/
├── server/
│   ├── swagger.json              # OpenAPI 3.0 specification
│   ├── swagger-setup.ts          # Swagger UI integration
│   └── index.ts                  # Server entry (setupSwagger called here)
├── API_README.md                 # This file
├── API_DOCUMENTATION.md          # Complete API reference
├── API_QUICKSTART.md             # Getting started guide
└── SWAGGER_SETUP.md              # Setup and configuration guide
```

## Version Info

- **API Version:** 1.0.0
- **OpenAPI Version:** 3.0.0
- **Last Updated:** 2024-01-16
- **Documentation Status:** Complete

## Next Steps

1. **Explore the API**
   - Visit http://localhost:3001/api-docs
   - Browse endpoints by category
   - Try out endpoints with test data

2. **Get Started with Code**
   - Read [API_QUICKSTART.md](./API_QUICKSTART.md)
   - Copy code examples for your language
   - Test with provided curl commands

3. **Deep Dive**
   - Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
   - Learn about error handling
   - Understand rate limiting

4. **Integration**
   - Set up your development environment
   - Import spec into your tools (Postman, Insomnia)
   - Start building your integration

---

**Happy coding!** For questions or issues, reach out to support@voxmation.com
