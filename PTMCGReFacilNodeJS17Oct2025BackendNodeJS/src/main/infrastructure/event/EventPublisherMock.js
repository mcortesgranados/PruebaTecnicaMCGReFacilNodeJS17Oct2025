/**
 * @file EventPublisherMock.js
 * @description 📡 Adaptador de eventos simulado (mock) para el proyecto de billetera digital.
 *              Pertenece a la capa de infraestructura en arquitectura hexagonal.
 *
 * Principios y buenas prácticas:
 *   - 🏗️ Hexagonal Architecture: Separa la lógica de publicación de eventos de la aplicación y dominio.
 *   - 🧩 SOLID:
 *       - Single Responsibility: Solo publica eventos simulados.
 *       - Dependency Inversion: Puede reemplazarse por un EventPublisher real sin cambiar la lógica de dominio.
 *   - ⚡ Pruebas y desarrollo: Útil para tests unitarios y simulación de flujo de eventos sin infraestructura real.
 *
 * @example
 * const eventPublisher = new EventPublisherMock();
 * eventPublisher.publish({ type: "TRANSACTION_PROCESSED", payload: { amount: 100 } });
 *
 * @author Manuela Cortés Granados
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-19
 */
export default class EventPublisherMock {

  /**
   * @method publish
   * @description Publica un evento simulado (mock) en la consola
   * @param {Object} event - Evento a publicar
   * @param {string} event.type - Tipo de evento
   * @param {Object} event.payload - Datos asociados al evento
   * @example
   * eventPublisher.publish({ type: "TRANSACTION_CREATED", payload: { userId: "uuid", amount: 50 } });
   */
  publish(event) {
    console.log("📢 Event published (mock):", event);
  }
}
