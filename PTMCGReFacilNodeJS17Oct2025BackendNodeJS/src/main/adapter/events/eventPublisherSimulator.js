/**
 * @file EventPublisherSimulator.js
 * @description 🎯 Simulador de publicación de eventos para arquitectura hexagonal.
 *              Permite desacoplar la lógica de negocio (dominio) del transporte real de eventos.
 *              Cumple principios SOLID:
 *                - ✅ SRP: Solo se encarga de publicar eventos.
 *                - ✅ OCP: Se puede extender a otros publishers sin modificar código existente.
 *                - ✅ DIP: Logger externo inyectado como dependencia.
 *              Se puede usar para pruebas unitarias, simulación de integración o desarrollo sin infraestructura real.
 * 
 * @author Manuela Cortés Granados
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-17
 */

'use strict';

/**
 * 🏗 Clase que simula la publicación de eventos.
 * Parte de la capa de infraestructura en un diseño hexagonal.
 * La capa de dominio puede usar esta clase a través de una interfaz (EventPublisher) sin acoplarse a detalles de implementación.
 */
class EventPublisherSimulator {

  /**
   * Crea una instancia de EventPublisherSimulator.
   * @param {Object} logger - Objeto logger externo con método info 📝
   * @example
   * const logger = { info: console.log };
   * const publisher = new EventPublisherSimulator(logger);
   */
  constructor(logger) {
    /**
     * Logger para registrar eventos publicados.
     * @type {Object} 
     * @private
     */
    this.logger = logger;

    /**
     * Arreglo en memoria para almacenar eventos publicados 🔄 (simulación/testing)
     * @type {Array<Object>}
     * @private
     */
    this._eventsMemory = [];
  }

  /**
   * 📤 Publica un evento en la simulación.
   * @param {Object} event - Evento a publicar.
   * @param {string} event.name - Nombre del evento (ej: 'user_created') ✨
   * @param {Object} event.payload - Datos asociados al evento 📦
   * @param {Date|string} event.occurredAt - Fecha y hora del evento ⏰
   * 
   * @example
   * const logger = { info: console.log };
   * const publisher = new EventPublisherSimulator(logger);
   * publisher.publish({
   *   name: 'transaction_completed',
   *   payload: { transactionId: 123, amount: 5000 },
   *   occurredAt: new Date()
   * });
   */
  publish(event) {
    // 📌 Loguear el evento publicado
    this.logger.info('event_published', { 
      name: event.name, 
      payload: event.payload, 
      at: event.occurredAt 
    });

    // 💾 Guardar evento en memoria para pruebas o verificación
    this._eventsMemory.push(event);

    // ⚡ Nota: en producción, podrías enviar a EventEmitter local, Kafka, RabbitMQ o SQS
  }

  /**
   * 🔍 Obtiene todos los eventos publicados en memoria (solo para testing)
   * @returns {Array<Object>} Arreglo de eventos publicados
   * @example
   * const events = publisher.getPublishedEvents();
   * console.log(events);
   */
  getPublishedEvents() {
    return [...this._eventsMemory];
  }
}

module.exports = EventPublisherSimulator;
