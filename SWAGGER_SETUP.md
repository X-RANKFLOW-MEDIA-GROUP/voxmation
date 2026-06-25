# Swagger/OpenAPI Documentation Setup Guide

This guide explains how to access and use the Swagger/OpenAPI documentation for the Voxmation API.

## Overview

The Voxmation API comes with comprehensive OpenAPI 3.0 documentation that includes:

- **Interactive API Explorer** - Test API endpoints directly in the browser
- **Complete Endpoint Reference** - All endpoints with request/response examples
- **Schema Definitions** - All data models and their properties
- **Authentication Details** - Security schemes and token management
- **Error Reference** - Common error codes and their meanings
- **Rate Limiting Info** - Request limits and quotas

## Files Generated

The following files have been created:

### 1. **swagger.json** (`/server/swagger.json`)
- Complete OpenAPI 3.0 specification in JSON format
- Used by Swagger UI for rendering interactive documentation
- Can be imported into other tools (Postman, Insomnia, etc.)
- Size: ~99KB with all endpoint definitions

### 2. **swagger-setup.ts** (`/server/swagger-setup.ts`)
- TypeScript setup module for Express.js
- Integrates Swagger UI into the application
- Handles serving OpenAPI specs in multiple formats
- Provides health check endpoint for API docs

### 3. **API_DOCUMENTATION.md**
- Comprehensive markdown documentation
- Error codes and HTTP status codes
- Rate limiting information
- Complete endpoint reference
- Use cases and examples

### 4. **API_QUICKSTART.md**
- Quick start guide for new developers
- Authentication examples
- Common use cases with code samples
- Testing and debugging tips

## Installation & Setup

### Step 1: Install Dependencies

The required dependencies have been added to `package.json`:

```bash
npm install
```

This installs:
- `swagger-ui-express` - Renders the interactive API documentation
- `swagger-jsdoc` - Optional: for programmatic spec generation

### Step 2: Verify Integration

The `swagger-setup.ts` has been imported in `server/index.ts`:

```typescript
import { setupSwagger } from "./swagger-setup";

// ... app setup ...

// Setup Swagger/OpenAPI documentation
setupSwagger(app);
```

### Step 3: Start the Server

```bash
npm run dev
```

## Accessing the Documentation

### Interactive Swagger UI

**URL:** `http://localhost:3001/api-docs`

The Swagger UI provides:
- Interactive endpoint explorer
- Request builder with parameter validation
- Live API testing (requires valid token)
- Automatic response formatting
- Authentication token management

### OpenAPI JSON Specification

**URL:** `http://localhost:3001/api-docs/swagger.json`

Raw OpenAPI 3.0 specification for programmatic use.

### OpenAPI YAML Specification

**URL:** `http://localhost:3001/api-docs/swagger.yaml`

Same spec in YAML format for compatibility with various tools.

### API Docs Health Check

**URL:** `http://localhost:3001/api-docs/health`

Returns:
```json
{
  "status": "ok",
  "message": "API documentation is available",
  "endpoints": {
    "swagger_ui": "/api-docs",
    "openapi_json": "/api-docs/swagger.json",
    "openapi_yaml": "/api-docs/swagger.yaml"
  }
}
```

## Using Swagger UI

### 1. Explore Endpoints

- All endpoints are grouped by tag (Auth, CRM, Campaigns, etc.)
- Click on any endpoint to expand and see details
- View request parameters, request body schema, and response examples

### 2. Test Endpoints

- Click "Try it out" on any endpoint
- Enter required parameters
- Enter request body (if applicable)
- Click "Execute"
- View the response, headers, and curl command

### 3. Authenticate

- In Swagger UI, click the lock icon or "Authorize" button
- Select "BearerAuth" authentication scheme
- Paste your JWT token (obtained from `/api/auth/login`)
- Protected endpoints will now include the token automatically

### 4. View Schemas

- Scroll down to see request/response schemas
- View all model definitions at the bottom
- See required fields and data types for each model

## Integrating with Other Tools

### Postman

1. Open Postman
2. Click "Import"
3. Select "Link" tab
4. Enter: `http://localhost:3001/api-docs/swagger.json`
5. Postman will import all endpoints
6. Set up environment variable for `token`

### Insomnia

1. Open Insomnia
2. Click "Create" → "Import"
3. Select "From URL"
4. Enter: `http://localhost:3001/api-docs/swagger.json`
5. All endpoints will be imported as collection

### VS Code REST Client

Create a `.http` file and use the generated documentation:

```http
@baseUrl = http://localhost:3001
@token = your-jwt-token

### List Contacts
GET {{baseUrl}}/api/crm/contacts
Authorization: Bearer {{token}}
Content-Type: application/json

###
```

### JavaScript SDK Generation

Many tools can generate client SDKs from OpenAPI specs:

**OpenAPI Generator:**
```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3001/api-docs/swagger.json \
  -g javascript \
  -o ./generated-client
```

**Swagger Codegen:**
```bash
swagger-codegen generate \
  -i http://localhost:3001/api-docs/swagger.json \
  -l javascript \
  -o ./generated
```

## Security & Authentication

### JWT Bearer Token

All protected endpoints require authentication:

1. Get token from `/api/auth/login`
2. Include in Authorization header: `Authorization: Bearer <token>`
3. Token expires in 24 hours
4. Use `/api/auth/refresh` to get new token

### API Key (Optional)

For programmatic access, you can use API keys:

1. Include in header: `X-API-Key: <api-key>`
2. Contact support to generate API keys
3. API keys don't expire but can be revoked

In Swagger UI, both schemes are documented and available for selection.

## API Specification Details

### OpenAPI Version

- **Version:** 3.0.0
- **Title:** Voxmation API
- **Current API Version:** 1.0.0

### Servers Configured

```json
{
  "servers": [
    {
      "url": "http://localhost:3001",
      "description": "Development server"
    },
    {
      "url": "https://api.voxmation.com",
      "description": "Production server"
    }
  ]
}
```

### Security Schemes

1. **BearerAuth** - JWT Token
2. **ApiKey** - X-API-Key header

### Content Types

- **Request:** `application/json`, `application/x-www-form-urlencoded`
- **Response:** `application/json`

## Documented Endpoints

### By Category

| Category | Endpoints | Count |
|----------|-----------|-------|
| Authentication | login, register, logout, refresh | 4 |
| CRM | contacts, opportunities, interactions | 10 |
| Campaigns | email campaigns, queue, stats | 8 |
| Automations | CRUD, activate, pause, test, executions | 8 |
| Calls | initiate, get, recordings | 3 |
| Billing | plans, subscription, invoices, usage | 4 |
| Webhooks | Stripe, Twilio | 2 |
| Admin | accounts, account details | 2 |

**Total: 41 documented endpoints**

## Error Handling

All error responses are documented with:

- HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500, 503)
- Standard error schema with `error` code and `message`
- Common error codes by category
- Recommended resolution steps

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#error-handling) for complete error reference.

## Request/Response Examples

All endpoints include:

- **Request Examples** - Sample request bodies with real data
- **Response Examples** - Sample responses for success and error cases
- **Parameter Examples** - Query and path parameter examples
- **Data Type Info** - Required fields, field types, constraints

## Rate Limiting

The API includes rate limiting documentation:

```
X-RateLimit-Limit: Request limit per hour
X-RateLimit-Remaining: Remaining requests
X-RateLimit-Reset: Unix timestamp of reset time
```

Rate limits vary by subscription plan:
- Free: 100 requests/hour
- Starter: 1,000 requests/hour
- Pro: 10,000 requests/hour
- Enterprise: Unlimited

## Customization

### Updating Swagger Spec

To update the OpenAPI specification:

1. Edit `server/swagger.json` directly, or
2. Modify `swagger-setup.ts` to regenerate from source files

### Customizing Swagger UI

Modify `swagger-setup.ts` in the `setupSwagger` function:

```typescript
swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    // Customize options here
  },
  customCss: `
    /* Add custom CSS here */
  `,
  customSiteTitle: 'My API Docs'
})
```

### Adding New Endpoints

When adding new endpoints:

1. Document in `swagger.json`
2. Add request/response schemas
3. Include error responses
4. Restart server to load updated spec

## Troubleshooting

### Documentation Not Loading

**Issue:** Cannot access http://localhost:3001/api-docs

**Solution:**
1. Verify server is running: `npm run dev`
2. Check that `setupSwagger(app)` is called in `server/index.ts`
3. Verify `swagger.json` exists in server directory
4. Check browser console for errors

### Swagger UI Shows Errors

**Issue:** "Failed to fetch spec"

**Solution:**
1. Verify swagger.json is valid JSON (check syntax)
2. Check CORS is enabled on server
3. Verify file permissions
4. Try clearing browser cache (Ctrl+Shift+Del)

### Can't Authenticate in Swagger

**Issue:** Token not working in Swagger UI

**Solution:**
1. Verify token is valid (not expired)
2. Check token format: should start with `Bearer `
3. Try logging in again to get fresh token
4. Verify API is accessible with same token via curl

### Missing Endpoints

**Issue:** Expected endpoint not in documentation

**Solution:**
1. Verify endpoint is implemented in route files
2. Check swagger.json includes endpoint definition
3. Restart server after changes
4. Clear browser cache and reload

## Support & Resources

- **Documentation:** See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Quick Start:** See [API_QUICKSTART.md](./API_QUICKSTART.md)
- **Interactive Docs:** http://localhost:3001/api-docs
- **Raw Spec:** http://localhost:3001/api-docs/swagger.json
- **Support Email:** support@voxmation.com

## Next Steps

1. Access the interactive documentation at `/api-docs`
2. Try out endpoints in Swagger UI
3. Import spec into Postman/Insomnia for advanced testing
4. Use [API_QUICKSTART.md](./API_QUICKSTART.md) for code examples
5. Refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed reference

## Maintenance

### Keeping Documentation Updated

The swagger.json file should be updated when:

- New endpoints are added
- Endpoint behavior changes
- New error conditions are possible
- API version changes
- Authentication schemes change

### Version Control

Include in version control:

- `swagger.json` - API specification
- `swagger-setup.ts` - Integration code
- `API_DOCUMENTATION.md` - Reference docs
- `API_QUICKSTART.md` - Quick start guide

This ensures documentation stays in sync with code changes.
