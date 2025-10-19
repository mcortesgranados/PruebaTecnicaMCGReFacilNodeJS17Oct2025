/**
 * @file TransactionService.js
 * @description 💳 Servicio de dominio encargado de procesar transacciones de usuarios en la billetera digital.
 *              Se encarga de la validación, persistencia y publicación de eventos de manera desacoplada.
 *
 * Principios SOLID aplicados:
 *   - ✅ SRP: Solo se ocupa de la lógica de transacciones.
 *   - ✅ OCP: Puede extenderse para manejar tipos de transacción adicionales sin modificar métodos existentes.
 *   - ✅ LSP: Subclases que extiendan el servicio pueden reemplazarlo sin romper contratos.
 *   - ✅ ISP: No depende de métodos que no utiliza; solo requiere repository y eventPublisher.
 *   - ✅ DIP: Depende de abstracciones (repository y eventPublisher) y no de implementaciones concretas.
 *
 * Arquitectura:
 *   - 🧩 Dominio puro en arquitectura hexagonal (DDD). No conoce infraestructura específica.
 *   - 🏛️ Se comunica con la infraestructura a través de adaptadores (repositorios y publicadores de eventos).
 *
 * @author Manuela Cortés Granados
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-19
 */

'use strict';
import { logInfo, logError } from "../../infrastructure/logger.js";

/**
 * @class TransactionService
 * @classdesc Servicio de dominio que procesa transacciones de usuarios y publica eventos asociados.
 */
export class TransactionService {
  /**
   * @constructor
   * @param {Object} repository - Repositorio de transacciones (adaptador) que maneja persistencia.
   * @param {Object} eventPublisher - Publicador de eventos del dominio (puede ser simulado).
   * @example
   * const service = new TransactionService(transactionRepo, eventPublisher);
   */
  constructor(repository, eventPublisher) {
    this.repository = repository;
    this.eventPublisher = eventPublisher;
  }

  /**
   * @method processTransaction
   * @description 🔄 Procesa una nueva transacción de depósito o retiro, validando la entrada, aplicando reglas de negocio,
   *              persistiendo la transacción y publicando un evento de dominio.
   * @param {Object} transactionData - Datos de la transacción.
   * @param {string} transactionData.userId - ID del usuario.
   * @param {number} transactionData.amount - Monto de la transacción.
   * @param {string} transactionData.type - Tipo de transacción: "deposit" | "withdraw".
   * @returns {Promise<Object>} Transacción guardada.
   * @throws {Error} En caso de validaciones fallidas o errores de persistencia.
   * @example
   * const tx = await service.processTransaction({ userId: 'uuid', amount: 50, type: 'deposit' });
   */
  async processTransaction(transactionData) {
    const { userId, amount, type } = transactionData;

    if (!userId || typeof userId !== "string") {
      logError("Invalid or missing userId", transactionData);
      throw new Error("Invalid or missing userId");
    }
    if (typeof amount !== "number" || amount <= 0) {
      logError("Amount must be positive", transactionData);
      throw new Error("Amount must be a positive number");
    }
    if (!["deposit", "withdraw"].includes(type)) {
      logError("Invalid transaction type", transactionData);
      throw new Error("Type must be either 'deposit' or 'withdraw'");
    }

    logInfo("Processing transaction", transactionData);

    try {
      if (type === "withdraw") {
        const currentBalance = await this.repository.getUserBalance(userId);
        if (amount > currentBalance) {
          logError("Insufficient balance for withdrawal", {
            userId,
            amount,
            currentBalance
          });
          throw new Error("Insufficient balance");
        }
      }

      const savedTransaction = await this.repository.saveTransaction(transactionData);

      if (this.eventPublisher && typeof this.eventPublisher.publish === "function") {
        await this.eventPublisher.publish({
          type: "TRANSACTION_PROCESSED",
          payload: savedTransaction
        });
        logInfo("Event published (mock)", savedTransaction);
      }

      return savedTransaction;
    } catch (err) {
      logError("Error processing transaction", err);
      throw err;
    }
  }

  /**
   * @method getUserTransactions
   * @description 📜 Obtiene historial de transacciones de un usuario.
   * @param {string} userId - ID del usuario.
   * @returns {Promise<Array>} Lista de transacciones.
   * @throws {Error} Si userId no es proporcionado.
   */
  async getUserTransactions(userId) {
    if (!userId) {
      logError("UserId required for getUserTransactions");
      throw new Error("UserId is required");
    }
    return await this.repository.getUserTransactions(userId);
  }

  /**
   * @method getUserBalance
   * @description 💰 Obtiene el balance actual del usuario basado en todas sus transacciones.
   * @param {string} userId - ID del usuario.
   * @returns {Promise<number>} Balance actual.
   * @throws {Error} Si userId no es proporcionado.
   */
  async getUserBalance(userId) {
    if (!userId) {
      logError("UserId required for getUserBalance");
      throw new Error("UserId is required");
    }
    return await this.repository.getUserBalance(userId);
  }
}
