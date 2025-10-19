/**
 * @file PostgresRepository.js
 * @description 🗄️ Adaptador de persistencia para Postgres que gestiona transacciones y consultas de usuarios
 *              en el proyecto de billetera digital. Pertenece a la capa de infraestructura en arquitectura hexagonal.
 *
 * Principios y buenas prácticas:
 *   - 🏗️ Hexagonal Architecture: Este repositorio desacopla la lógica de persistencia de la aplicación y del dominio.
 *   - 🧩 SOLID: 
 *       - Single Responsibility: Cada método tiene responsabilidad única (query, saveTransaction, getUserTransactions, getUserBalance)
 *       - Dependency Inversion: Se podrían inyectar pools externos para tests o escalabilidad.
 *   - ⚡ Seguridad y consistencia: Usa transacciones DB (`BEGIN/COMMIT/ROLLBACK`) para atomicidad de operaciones.
 *   - 🔄 Manejo de errores: Rollback automático ante fallos en transacciones.
 *
 * @author Manuela Cortés Granados
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-19
 */

import pkg from "pg";
const { Pool } = pkg;

/**
 * @constant {Pool} pool - Conexión global a la base de datos Postgres usando configuración de entorno
 */
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "wallet_db",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432
});

/**
 * @class PostgresRepository
 * @description Repositorio para consultas y transacciones de usuarios.
 */
export class PostgresRepository {

  /**
   * @method query
   * @description Ejecuta una consulta SQL genérica con parámetros
   * @param {string} text - SQL query
   * @param {Array<any>} params - Parámetros para la consulta
   * @returns {Promise<Object>} Resultado de la consulta
   * @example
   * const result = await repository.query("SELECT * FROM users WHERE id=$1", [userId]);
   */
  async query(text, params) {
    const res = await pool.query(text, params);
    return res;
  }

  /**
   * @method saveTransaction
   * @description Guarda una transacción y actualiza el balance del usuario de manera atómica
   * @param {Object} param0
   * @param {string} param0.userId - ID del usuario
   * @param {number} param0.amount - Monto de la transacción
   * @param {string} param0.type - Tipo de transacción: 'deposit' | 'withdraw'
   * @returns {Promise<Object>} Transacción guardada
   * @throws {Error} Si el usuario no existe, saldo insuficiente o tipo inválido
   * @example
   * await repository.saveTransaction({ userId: "uuid", amount: 100, type: "deposit" });
   */
  async saveTransaction({ userId, amount, type }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const userRes = await client.query(
        "SELECT balance FROM users WHERE user_id = $1",
        [userId]
      );

      if (userRes.rows.length === 0) {
        throw new Error("User not found");
      }

      let newBalance = userRes.rows[0].balance;

      if (type === "deposit") newBalance += amount;
      else if (type === "withdraw") {
        if (amount > newBalance) throw new Error("Insufficient balance");
        newBalance -= amount;
      } else {
        throw new Error("Invalid transaction type");
      }

      const txRes = await client.query(
        "INSERT INTO transactions (user_id, amount, type) VALUES ($1, $2, $3) RETURNING *",
        [userId, amount, type]
      );

      await client.query(
        "UPDATE users SET balance=$1 WHERE user_id=$2",
        [newBalance, userId]
      );

      await client.query("COMMIT");
      return txRes.rows[0];

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * @method getUserTransactions
   * @description Obtiene el historial de transacciones de un usuario ordenado por fecha descendente
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array<Object>>} Lista de transacciones
   */
  async getUserTransactions(userId) {
    const res = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC",
      [userId]
    );
    return res.rows;
  }

  /**
   * @method getUserBalance
   * @description Calcula el saldo actual del usuario basado en todas sus transacciones
   * @param {string} userId - ID del usuario
   * @returns {Promise<number>} Saldo actual del usuario
   */
  async getUserBalance(userId) {
    const res = await pool.query(
      `SELECT COALESCE(SUM(
        CASE
          WHEN type='deposit' THEN amount
          WHEN type='withdraw' THEN -amount
          ELSE 0
        END
      ), 0) AS balance
      FROM transactions
      WHERE user_id = $1`,
      [userId]
    );
    return res.rows[0].balance;
  }
}
