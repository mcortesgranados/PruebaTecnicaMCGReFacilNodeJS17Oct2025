/**
 * @file PgTransactionWriteRepositoryAdapter.js
 * @description 🏗 Adaptador de escritura de transacciones usando PostgreSQL para la capa de infraestructura
 *              en una arquitectura hexagonal. Permite que la capa de dominio persista transacciones y
 *              actualice balances sin conocer detalles de SQL ni Postgres.
 *              Principios SOLID aplicados:
 *                - ✅ SRP: Solo se encarga de escribir transacciones y actualizar balances.
 *                - ✅ OCP: Se puede extender a otros repositorios de escritura (Mongo, MySQL) sin modificar la clase.
 *                - ✅ DIP: La dependencia (pool de Postgres) se inyecta desde afuera.
 * 
 * @author Manuela Cortés Granados
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-17
 */

'use strict';

const { Pool } = require('pg');

/**
 * 📤 Adaptador de repositorio de escritura de transacciones para PostgreSQL.
 * Esta clase pertenece a la capa de infraestructura en una arquitectura hexagonal.
 * La capa de dominio interactúa con este adaptador mediante una interfaz abstracta (TransactionWriteRepository).
 */
class PgTransactionWriteRepositoryAdapter {

  /**
   * Crea una instancia de PgTransactionWriteRepositoryAdapter.
   * @param {Pool} pool - Pool de conexiones de PostgreSQL 🔌
   * @example
   * const { Pool } = require('pg');
   * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   * const writeRepo = new PgTransactionWriteRepositoryAdapter(pool);
   */
  constructor(pool) {
    /**
     * Pool de PostgreSQL inyectado para ejecutar consultas SQL.
     * @type {Pool}
     * @private
     */
    this.pool = pool;
  }

  /**
   * 💾 Persiste una transacción y actualiza el balance del usuario.
   * Usa transacciones de PostgreSQL para asegurar atomicidad.
   * @param {Object} tx - Objeto de transacción
   * @param {string|number} tx.transaction_id - ID único de la transacción 🔑
   * @param {string|number} tx.user_id - ID del usuario 🧑
   * @param {number} tx.amount - Monto de la transacción 💰
   * @param {string} tx.type - Tipo de transacción: "deposit" o "withdraw" ⬆️⬇️
   * @param {Date|string} tx.timestamp - Fecha y hora de la transacción 🕒
   * @returns {Promise<void>}
   * @throws Lanzará un error si falla la inserción o actualización de balance
   * @example
   * await writeRepo.saveTransaction({
   *   transaction_id: 'tx123',
   *   user_id: 42,
   *   amount: 500,
   *   type: 'deposit',
   *   timestamp: new Date()
   * });
   */
  async saveTransaction(tx) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert transaction 📥
      await client.query(
        `INSERT INTO transactions(transaction_id, user_id, amount, type, timestamp)
         VALUES($1,$2,$3,$4,$5)`,
        [tx.transaction_id, tx.user_id, tx.amount, tx.type, tx.timestamp]
      );

      // Update user balance 💳 (optimistic locking podría mejorarse)
      if (tx.type === 'deposit') {
        await client.query(
          `UPDATE users SET balance = balance + $1 WHERE id = $2`,
          [tx.amount, tx.user_id]
        );
      } else {
        await client.query(
          `UPDATE users SET balance = balance - $1 WHERE id = $2`,
          [tx.amount, tx.user_id]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK'); // 🔄 Garantiza atomicidad
      throw err;
    } finally {
      client.release(); // Liberar conexión
    }
  }
}

module.exports = PgTransactionWriteRepositoryAdapter;
