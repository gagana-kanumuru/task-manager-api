import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Task Manager API",
            version: "1.0.0",
            description: "API documentation for Task Manager (Node.js/TypeScript/MongoDB)"
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Local server"
            }
        ]
    },
    // Point to your route files for endpoint auto-discovery
    apis: ["./src/routes/*.ts"],
};
const swaggerSpec = swaggerJSDoc(options);
export function setupSwagger(app) {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
