/**
 * @file transactionCreatedEvent.js
 * @description 🟢 Evento de dominio específico que representa la creación de una transacción
 *              en la billetera digital. Hereda de DomainEvent para mantener trazabilidad temporal
 *              y payload estructurado.
 *
 * Principios SOLID aplicados:
 *   - ✅ SRP: Solo representa un evento de creación de transacción.
 *   - ✅ OCP: Puede extenderse para eventos de transacciones más específicas.
 *   - ✅ LSP: Sustituye correctamente la clase base DomainEvent.
 *   - ✅ ISP: Contiene únicamente propiedades necesarias del evento.
 *   - ✅ DIP: No depende de la infraestructura ni de repositorios concretos.
 *
 * Autor: Manuela Cortés Granados
 * Email: manuelacortesgranados@gmail.com
 * Since: 2025-10-17
 */

'use strict';

const DomainEvent = require('./domainEvent');

/**
 * @class TransactionCreatedEvent
 * @extends DomainEvent
 * @description 💳 Evento que se dispara cuando se crea una transacción
 *              (depósito o retiro) en la billetera digital.
 * @param {Object} payload - Datos asociados a la transacción, por ejemplo:
 *                           { user_id, amount, type, transaction_id, timestamp }
 * @example
 * const event = new TransactionCreatedEvent({
 *   user_id: '00000000-0000-0000-0000-000000000000',
 *   amount: 100,
 *   type: 'deposit',
 *   transaction_id: 'uuid',
 *   timestamp: '2025-10-17T14:23:30.123Z'
 * });
 * console.log(event.name); // TransactionCreated
 * console.log(event.occurredAt); // 2025-10-17T14:23:30.123Z
 */
class TransactionCreatedEvent extends DomainEvent {
  constructor(payload) {
    super('TransactionCreated', payload);
  }
}

module.exports = TransactionCreatedEvent;
