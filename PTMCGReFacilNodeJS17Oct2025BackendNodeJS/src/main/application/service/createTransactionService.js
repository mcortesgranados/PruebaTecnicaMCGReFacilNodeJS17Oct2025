/**
 * @file createTransactionService.js
 * @description 💳 Servicio de aplicación para crear transacciones en la billetera digital.
 *              Encapsula la lógica de negocio para validar, persistir y publicar eventos
 *              de transacciones, siguiendo arquitectura hexagonal.
 *
 * Principios SOLID aplicados:
 *   - ✅ SRP: Solo se encarga de la creación de transacciones.
 *   - ✅ OCP: Puede extenderse para nuevas reglas de negocio sin modificar la estructura base.
 *   - ✅ LSP: Cualquier implementación de repositorio cumple la misma interfaz esperada.
 *   - ✅ ISP: No fuerza dependencias de métodos que no usa.
 *   - ✅ DIP: Depende de abstracciones (repositorios, eventPublisher, logger) y no de implementaciones concretas.
 *
 * Autor: Manuela Cortés Granados
 * Email: manuelacortesgranados@gmail.com
 * Since: 2025-10-17
 */

'use strict';

const { v4: uuidv4 } = require('uuid');
const TransactionCreatedEvent = require('../../domain/event/transactionCreatedEvent');

/**
 * @class CreateTransactionService
 * @description 🚀 Servicio que maneja la creación de transacciones.
 * @param {Object} deps - Dependencias inyectadas siguiendo DIP
 * @param {Object} deps.writeRepo - Repositorio de escritura de transacciones
 * @param {Object} deps.readRepo - Repositorio de lectura de transacciones
 * @param {Object} deps.eventPublisher - Publicador de eventos de dominio (simulado)
 * @param {Object} deps.logger - Logger para trazabilidad de eventos
 */
class CreateTransactionService {
  constructor({ writeRepo, readRepo, eventPublisher, logger }) {
    /**
     * 📥 Repositorio para persistir transacciones
     * @private
     */
    this.writeRepo = writeRepo;

    /**
     * 🔍 Repositorio de lectura para validaciones o consultas adicionales
     * @private
     */
    this.readRepo = readRepo;

    /**
     * 📡 Publicador de eventos (Event Driven Architecture)
     * @private
     */
    this.eventPublisher = eventPublisher;

    /**
     * 📝 Logger para trazabilidad y auditoría
     * @private
     */
    this.logger = logger;
  }

  /**
   * 🟢 Ejecuta la creación de una transacción
   * @param {Object} command - Comando con los datos de la transacción
   * @param {string} command.user_id - ID del usuario que realiza la transacción
   * @param {number} command.amount - Monto de la transacción (positivo)
   * @param {string} command.type - Tipo de transacción: 'deposit' | 'withdraw'
   * @param {string} [command.transaction_id] - Opcional: ID de la transacción
   * @param {string} [command.timestamp] - Opcional: fecha de la transacción (ISO)
   * @returns {Promise<Object>} La transacción creada
   * @throws {Error} Si faltan datos o son inválidos
   * @example
   * const service = new CreateTransactionService({ writeRepo, readRepo, eventPublisher, logger });
   * const tx = await service.execute({ user_id: '123', amount: 100, type: 'deposit' });
   * console.log(tx.transaction_id); // UUID generado
   */
  async execute(command) {
    // ⚠ Validaciones básicas
    if (!command.user_id) throw new Error('user_id required');
    if (!command.amount || Number(command.amount) <= 0) throw new Error('amount must be positive');
    if (!['deposit','withdraw'].includes(command.type)) throw new Error('invalid type');

    // 💳 Construcción del objeto transacción
    const tx = {
      transaction_id: command.transaction_id || uuidv4(),
      user_id: command.user_id,
      amount: Number(command.amount),
      type: command.type,
      timestamp: command.timestamp || new Date().toISOString()
    };

    // 💾 Persistencia (repositorio maneja transacción DB)
    await this.writeRepo.saveTransaction(tx);

    // 📡 Publicación de evento de dominio (simulado)
    const event = new TransactionCreatedEvent(tx);
    this.eventPublisher.publish(event);

    // 📝 Log de transacción creada
    this.logger.info('transaction_created', { tx });

    return tx;
  }
}

module.exports = CreateTransactionService;
