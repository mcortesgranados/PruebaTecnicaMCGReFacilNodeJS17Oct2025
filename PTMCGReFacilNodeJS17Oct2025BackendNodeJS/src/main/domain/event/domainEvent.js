/**
 * @file domainEvent.js
 * @description 📦 Clase base para todos los eventos de dominio en la arquitectura hexagonal.
 *              Permite capturar la ocurrencia de un evento en la billetera digital con
 *              trazabilidad temporal y payload asociado.
 *
 * Principios SOLID aplicados:
 *   - ✅ SRP: Solo representa un evento de dominio.
 *   - ✅ OCP: Puede extenderse para eventos específicos como TransactionCreatedEvent.
 *   - ✅ LSP: Subclases pueden reemplazar esta clase sin romper contratos.
 *   - ✅ ISP: Solo contiene propiedades esenciales de un evento.
 *   - ✅ DIP: No depende de implementaciones concretas de repositorios ni servicios.
 *
 * Autor: Manuela Cortés Granados
 * Email: manuelacortesgranados@gmail.com
 * Since: 2025-10-17
 */

'use strict';

/**
 * @class DomainEvent
 * @description 🟢 Representa un evento de dominio genérico.
 * @param {string} name - Nombre del evento
 * @param {Object} payload - Datos asociados al evento
 * @property {string} occurredAt - Timestamp ISO cuando ocurrió el evento
 * @example
 * const event = new DomainEvent('transaction_created', { user_id: '123', amount: 100 });
 * console.log(event.occurredAt); // 2025-10-17T14:23:30.123Z
 */
class DomainEvent {
  constructor(name, payload) {
    /**
     * 🏷 Nombre del evento
     * @type {string}
     */
    this.name = name;

    /**
     * 📦 Datos asociados al evento
     * @type {Object}
     */
    this.payload = payload;

    /**
     * ⏱ Timestamp ISO de ocurrencia del evento
     * @type {string}
     */
    this.occurredAt = new Date().toISOString();
  }
}

module.exports = DomainEvent;
