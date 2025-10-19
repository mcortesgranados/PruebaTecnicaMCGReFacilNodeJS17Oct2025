/**
 * @file PgTransactionReadRepositoryAdapter.js
 * @description 🏗 Adaptador de lectura de transacciones usando PostgreSQL para la capa de infraestructura
 *              en una arquitectura hexagonal. Permite que la capa de dominio interactúe con la base de datos
 *              sin conocer detalles de SQL ni Postgres.
 *              Principios SOLID aplicados:
 *                - ✅ SRP: Solo se encarga de leer transacciones y balances.
 *                - ✅ OCP: Se puede extender a otros repositorios de lectura (Mongo, MySQL) sin modificar la clase.
 *                - ✅ DIP: La dependencia (pool de Postgres) se inyecta desde afuera.
 * 
 * @author Manuela Cortés Granados
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-17
 */

'use strict';

/**
 * 📚 Adaptador de repositorio de lectura de transacciones para PostgreSQL.
 * Esta clase pertenece a la capa de infraestructura en una arquitectura hexagonal.
 * La capa de dominio interactúa con este adaptador mediante una interfaz abstracta (TransactionReadRepository).
 */
class PgTransactionReadRepositoryAdapter {

  /**
   * Crea una instancia de PgTransactionReadRepositoryAdapter.
   * @param {Object} pool - Pool de conexiones de PostgreSQL (ej: pg.Pool) 🔌
   * @example
   * const { Pool } = require('pg');
   * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   * const repo = new PgTransactionReadRepositoryAdapter(pool);
   */
  constructor(pool) {
    /**
     * Pool de PostgreSQL inyectado para ejecutar consultas SQL.
     * @type {Object}
     * @private
     */
    this.pool = pool;
  }

  /**
   * 📥 Obtiene las transacciones recientes de un usuario.
   * @param {number|string} userId - ID del usuario 🧑
   * @param {number} [limit=100] - Cantidad máxima de transacciones a devolver
   * @returns {Promise<Array<Object>>} Arreglo de transacciones con { transaction_id, user_id, amount, type, timestamp }
   * @example
   * const transactions = await repo.getTransactionsByUser(123, 50);
   */
  async getTransactionsByUser(userId, limit = 100) {
    const res = await this.pool.query(
      `SELECT transaction_id, user_id, amount, type, timestamp
       FROM transactions
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  }

  /**
   * 💰 Obtiene el balance actual de un usuario.
   * @param {number|string} userId - ID del usuario 🧑
   * @returns {Promise<number|null>} Saldo del usuario, o null si no se encuentra
   * @example
   * const balance = await repo.getBalanceByUser(123);
   * console.log(balance); // 5000
   */
  async getBalanceByUser(userId) {
    const res = await this.pool.query(
      `SELECT balance FROM users WHERE id = $1`,
      [userId]
    );
    return res.rows[0] ? Number(res.rows[0].balance) : null;
  }
}

module.exports = PgTransactionReadRepositoryAdapter;
