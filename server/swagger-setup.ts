import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

/**
 * Setup Swagger/OpenAPI documentation for API
 * Serves Swagger UI at /api-docs and OpenAPI JSON at /api-docs/swagger.json
 */
export function setupSwagger(app: Express) {
  try {
    // Load swagger.json file
    const swaggerPath = path.join(currentDirectory, 'swagger.json');
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));

    // Serve Swagger UI
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        swaggerOptions: {
          url: '/api-docs/swagger.json',
          displayOperationId: true,
          docExpansion: 'list',
          deepLinking: true,
        },
        customCss: `
          .topbar { display: none !important; }
          .swagger-ui { padding: 20px; }
          .swagger-ui .info { margin: 20px 0; }
          .swagger-ui .scheme-container { background: #fff; }
          .swagger-ui .btn { border-radius: 4px; }
          .swagger-ui .model-container { background: #f5f5f5; }
          .swagger-ui .topbar-wrapper { display: none; }
        `,
        customSiteTitle: 'Voxmation API Documentation',
      })
    );

    // Serve raw OpenAPI JSON
    app.get('/api-docs/swagger.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerDocument);
    });

    // Serve OpenAPI in YAML format (convert from JSON)
    app.get('/api-docs/swagger.yaml', (_req, res) => {
      const yaml = convertJsonToYaml(swaggerDocument);
      res.setHeader('Content-Type', 'application/yaml');
      res.send(yaml);
    });

    // Health check endpoint for API docs
    app.get('/api-docs/health', (_req, res) => {
      res.json({
        status: 'ok',
        message: 'API documentation is available',
        endpoints: {
          swagger_ui: '/api-docs',
          openapi_json: '/api-docs/swagger.json',
          openapi_yaml: '/api-docs/swagger.yaml',
        },
      });
    });

    console.log('✓ Swagger UI setup complete');
    console.log('  - Access at: http://localhost:3001/api-docs');
    console.log('  - OpenAPI JSON: http://localhost:3001/api-docs/swagger.json');
    console.log('  - OpenAPI YAML: http://localhost:3001/api-docs/swagger.yaml');
  } catch (error) {
    console.error('Failed to setup Swagger UI:', error);
    throw error;
  }
}

/**
 * Convert JSON object to YAML format
 * Simple implementation for basic YAML conversion
 */
function convertJsonToYaml(obj: any, indent = 0): string {
  const indentStr = '  '.repeat(indent);
  let yaml = '';

  if (typeof obj === 'string') {
    return `"${obj.replace(/"/g, '\\"')}"`;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      yaml += `${indentStr}- ${convertJsonToYaml(item, 0)}\n`;
    });
    return yaml.trimEnd();
  }

  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        yaml += `${indentStr}${key}:\n${convertJsonToYaml(value, indent + 1)}\n`;
      } else {
        yaml += `${indentStr}${key}: ${convertJsonToYaml(value, 0)}\n`;
      }
    });
    return yaml.trimEnd();
  }

  return String(obj);
}
