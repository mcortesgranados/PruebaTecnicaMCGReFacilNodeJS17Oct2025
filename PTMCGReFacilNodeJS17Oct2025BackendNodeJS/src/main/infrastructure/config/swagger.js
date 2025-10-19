/**
 * @file swagger.js
 * @description 📝 Configuración de Swagger/OpenAPI para documentar la API de transacciones de la billetera digital.
 *              Permite exponer documentación interactiva de endpoints REST para desarrolladores y testers.
 *
 * Arquitectura y buenas prácticas:
 *   - 🏗️ Hexagonal: Este módulo pertenece a la infraestructura, desacoplado del dominio y la aplicación.
 *   - 🧩 Desacoplamiento: La configuración de Swagger no depende de servicios de dominio ni de la base de datos.
 *   - ⚡ Facilidad de uso: Permite levantar documentación interactiva con Swagger UI.
 *   - 🌐 Compatibilidad: OpenAPI 3.0 para estandarización y compatibilidad con herramientas externas.
 *
 * @author Manuela Cortés Granados
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-19
 */

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @constant {Object} options
 * @description Opciones de configuración para swagger-jsdoc.
 * @property {Object} definition - Definición principal de OpenAPI.
 * @property {string} definition.openapi - Versión de OpenAPI (3.0.0).
 * @property {Object} definition.info - Información de la API (título, versión, descripción).
 * @property {Array<Object>} definition.servers - Lista de servidores donde la API estará disponible.
 * @property {Array<string>} apis - Lista de rutas absolutas a archivos que contienen anotaciones JSDoc para endpoints.
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wallet Transaction API",
      version: "1.0.0",
      description: "API for wallet transactions 💳",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: [path.join(__dirname, "../server/localServer.js")], // 🔗 ruta absoluta a tu server
};

/**
 * @constant {Object} specs
 * @description Esquema generado por swagger-jsdoc a partir de las opciones definidas.
 */
const specs = swaggerJSDoc(options);

/**
 * @function setupSwagger
 * @description 🚀 Inicializa Swagger UI en la aplicación Express para exponer documentación interactiva.
 * @param {import('express').Express} app - Instancia de Express sobre la que se montará Swagger.
 * @example
 * import express from "express";
 * import { setupSwagger } from "./infrastructure/config/swagger.js";
 * const app = express();
 * setupSwagger(app);
 * app.listen(3000, () => console.log("Server running..."));
 */
export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
