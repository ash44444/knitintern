import swaggerUi from "swagger-ui-express"
import swaggerJSDoc from "swagger-jsdoc"

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Express Mongo API",
      version: "1.0.0",
      description: "Versioned REST API with JWT auth and products CRUD",
    },
    servers: [{ url: "/api/v1", description: "v1 base path" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [], // Using inline spec below rather than JSDoc on files for brevity
}

const spec = swaggerJSDoc(options)
spec.paths = {
  "/auth/signup": {
    post: {
      summary: "User signup",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/Signup" } } },
      },
      responses: { 201: { description: "Created" }, 409: { description: "Conflict" } },
    },
  },
  "/auth/login": {
    post: {
      summary: "User login",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/Login" } } },
      },
      responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } },
    },
  },
  "/auth/logout": { post: { summary: "Logout", responses: { 200: { description: "OK" } } } },
  "/users/me": { get: { summary: "Get current user", responses: { 200: { description: "OK" } } } },
  "/products": {
    get: { summary: "List products", responses: { 200: { description: "OK" } } },
    post: {
      summary: "Create product (admin)",
      responses: { 201: { description: "Created" }, 403: { description: "Forbidden" } },
    },
  },
  "/products/{id}": {
    get: {
      summary: "Get product by id",
      parameters: [{ name: "id", in: "path", required: true }],
      responses: { 200: { description: "OK" }, 404: { description: "Not Found" } },
    },
    patch: {
      summary: "Update product (admin)",
      parameters: [{ name: "id", in: "path", required: true }],
      responses: { 200: { description: "OK" }, 403: { description: "Forbidden" } },
    },
    delete: {
      summary: "Delete product (admin)",
      parameters: [{ name: "id", in: "path", required: true }],
      responses: { 200: { description: "OK" }, 403: { description: "Forbidden" } },
    },
  },
}

spec.components.schemas = {
  Signup: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", format: "password" },
    },
  },
  Login: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", format: "password" },
    },
  },
  Product: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      price: { type: "number" },
    },
  },
}

export const swaggerServe = swaggerUi.serve
export const swaggerSetup = swaggerUi.setup(spec)
