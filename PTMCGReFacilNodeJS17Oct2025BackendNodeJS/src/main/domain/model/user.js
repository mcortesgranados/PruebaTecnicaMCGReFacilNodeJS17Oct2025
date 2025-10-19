/**
 * @file user.js
 * @description 👤 Agregado raíz del dominio que representa un usuario dentro del sistema de billetera digital.
 *               Encapsula la lógica de negocio relacionada con el manejo del balance (depósitos y retiros).
 *
 * Principios SOLID aplicados:
 *   - ✅ SRP (Single Responsibility Principle): La clase solo se encarga de la lógica de balance del usuario.
 *   - ✅ OCP (Open/Closed Principle): Puede extenderse para manejar límites diarios, historial o validaciones adicionales.
 *   - ✅ LSP (Liskov Substitution Principle): Puede sustituirse por una subclase sin alterar el comportamiento esperado.
 *   - ✅ ISP (Interface Segregation Principle): No depende de interfaces que no necesita; maneja sus propios métodos.
 *   - ✅ DIP (Dependency Inversion Principle): No depende de la infraestructura; pertenece al dominio puro.
 *
 * Patrón de diseño:
 *   - 🧩 Parte del **Dominio** dentro de una arquitectura hexagonal (DDD).
 *   - 🏛️ Se considera un **Agregado raíz** que garantiza la consistencia de sus invariantes.
 *
 * @author Manuela Cortés Granados
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-17
 */

'use strict';

/**
 * @class User
 * @classdesc 💼 Representa al usuario del sistema y su balance actual. 
 *             Incluye operaciones atómicas de negocio como depósito y retiro.
 */
class User {
  /**
   * @constructor
   * @param {Object} params - Parámetros del usuario.
   * @param {string} params.id - Identificador único del usuario.
   * @param {string} params.name - Nombre del usuario.
   * @param {number} [params.balance=0] - Balance inicial del usuario.
   * @example
   * const user = new User({ id: 'uuid', name: 'Alice', balance: 100 });
   */
  constructor({ id, name, balance = 0 }) {
    this.id = id;
    this.name = name;
    this.balance = Number(balance);
  }

  /**
   * @method deposit
   * @description ➕ Realiza un depósito al balance del usuario.
   *              Lanza error si el monto no es positivo.
   * @param {number} amount - Monto a depositar.
   * @throws {Error} Si el monto es menor o igual a 0.
   * @example
   * user.deposit(50);
   * console.log(user.balance); // 150
   */
  deposit(amount) {
    if (amount <= 0) throw new Error('amount must be positive');
    this.balance += Number(amount);
  }

  /**
   * @method withdraw
   * @description ➖ Retira un monto del balance del usuario. 
   *              Verifica que haya fondos suficientes antes de descontar.
   * @param {number} amount - Monto a retirar.
   * @throws {Error} Si el monto es menor o igual a 0 o si no hay fondos suficientes.
   * @example
   * user.withdraw(30);
   * console.log(user.balance); // 70
   */
  withdraw(amount) {
    if (amount <= 0) throw new Error('amount must be positive');
    if (amount > this.balance) throw new Error('insufficient funds');
    this.balance -= Number(amount);
  }
}

module.exports = User;
