import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { Application } from "express";

export function setupSwagger(app: Application): void {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "INKLUSIO API Documentation",
        version: "1.0.0",
        description:
          "INKLUSIO Backend API with Firebase Authentication. Use the 'Authorize' button to add your Firebase ID token.",
        contact: {
          name: "INKLUSIO Team",
          email: "support@inklusio.com",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development server",
        },
        {
          url: "https://dev.api.inklusio-digital.com",
          description: "Development server",
        },
        {
          url: "https://api.inklusio-digital.com",
          description: "Production server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter your Firebase ID Token (obtained from Flutter app after Firebase authentication)",
          },
        },
        schemas: {
          Error: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: false,
              },
              message: {
                type: "string",
                example: "Error message",
              },
              errors: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
          },
          Success: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
              },
              message: {
                type: "string",
                example: "Operation successful",
              },
              data: {
                type: "object",
              },
            },
          },
        },
      },
      tags: [
        {
          name: "Auth",
          description: "Firebase Authentication endpoints - Verify token and manage user sessions",
        },
        {
          name: "Onboarding",
          description: "User onboarding and profile completion APIs - Complete 6-step onboarding process for new users",
        },
        {
          name: "Community",
          description: "Community feed APIs - Create and view posts (photo, location, review)",
        },
      ],
    },
    apis: [
      "./src/modules/**/interfaces/routes/*.routes.ts",
      "./src/modules/**/interfaces/controllers/*.controller.ts",
    ],
  };

  const swaggerSpec = swaggerJsdoc(options);

  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "INKLUSIO API Docs",
  };

  app.use("/api/docs", swaggerUi.serve as any, swaggerUi.setup(swaggerSpec, swaggerUiOptions) as any);

  // Serve swagger JSON
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Get the appropriate base URL based on environment
  const baseUrl = process.env.API_URL || "http://localhost:3000";
  console.log("📚 Swagger Docs available at", `${baseUrl}/api/docs`);
  console.log("📄 Swagger JSON at", `${baseUrl}/api/docs.json`);
}
