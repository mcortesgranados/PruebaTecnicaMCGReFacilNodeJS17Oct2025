/**
 * @file logger.js
 * @description 📝 Logger minimalista para la Wallet Transaction API.
 *              Maneja logs de información y errores con timestamps.
 *
 * Arquitectura y principios:
 *   - 🏗️ Hexagonal Architecture: Logger desacoplado del dominio y de la infraestructura de persistencia.
 *   - 🧩 SOLID:
 *       - Single Responsibility: Este módulo solo registra logs.
 *       - Open/Closed: Se puede extender para integrarse con sistemas externos de logging.
 *       - Dependency Inversion: Servicios de dominio pueden inyectar este logger.
 *
 * @example
 * import { logInfo, logError } from "./logger.js";
 * logInfo("Transaction processed", { userId: "uuid", amount: 100 });
 * logError("Failed to process transaction", new Error("Insufficient funds"));
 *
 * @author Manuela Cortés
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-19
 */

/**
 * 🌟 Registrar mensaje de información
 * @param {string} message - Mensaje descriptivo del evento
 * @param {any} [data] - Información adicional (opcional)
 */
export const logInfo = (message, data) => {
  console.log(`📗 [INFO] ${new Date().toISOString()} - ${message}`, data || "");
};

/**
 * ❌ Registrar mensaje de error
 * @param {string} message - Mensaje de error descriptivo
 * @param {any} [error] - Detalle del error o stack trace (opcional)
 */
export const logError = (message, error) => {
  console.error(`📕 [ERROR] ${new Date().toISOString()} - ${message}`, error || "");
};
