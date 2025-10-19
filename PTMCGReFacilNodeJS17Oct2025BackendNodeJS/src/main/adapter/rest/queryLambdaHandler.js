/**
 * @file transactionQueryLambdaHandler.js
 * @description 🌐 Handler minimalista para AWS Lambda que expone el endpoint GET /transactions/{user_id}
 *              vía API Gateway, usando el repositorio de lectura de transacciones. Pertenece a la capa
 *              de infraestructura dentro de una arquitectura hexagonal.
 *
 * Principios SOLID aplicados:
 *   - ✅ SRP: Solo maneja la recepción del request, obtención de datos y retorno de respuesta HTTP.
 *   - ✅ OCP: Se puede extender para nuevos endpoints de consulta sin modificar la lógica existente.
 *   - ✅ DIP: Depende de interfaces de repositorios inyectadas, no de implementaciones concretas.
 *
 * Autor: Manuela Cortés Granados
 * Email: manuelacortesgranados@gmail.com
 * Since: 2025-10-17
 */

'use strict';

const { Pool } = require('pg');
const PgRead = require('../persistence/read/pgTransactionReadRepositoryAdapter');
const logger = require('../../infrastructure/logger');

/**
 * 🌊 Pool de PostgreSQL para conexión a la base de datos
 * @type {Pool}
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * 📥 Repositorio de lectura de transacciones
 */
const readRepo = new PgRead(pool);

/**
 * 🟢 Handler principal de Lambda para procesar GET /transactions/{user_id}
 * @param {Object} event - Evento de AWS Lambda enviado por API Gateway
 * @param {Object} event.pathParameters - Parámetros de ruta
 * @param {string} event.pathParameters.user_id - ID del usuario a consultar
 * @returns {Promise<Object>} Response con statusCode y body en JSON con balance y transacciones
 * @example
 * GET /transactions/00000000-0000-0000-0000-000000000000
 * Response:
 * {
 *   "balance": 1000,
 *   "transactions": [
 *     { "transaction_id": "tx1", "user_id": "...", "amount": 10, "type": "deposit", "timestamp": "2025-10-17T12:00:00Z" },
 *     ...
 *   ]
 * }
 */
exports.handler = async (event) => {
  try {
    // 🔎 Extracción del user_id desde path parameters
    const userId = event.pathParameters && event.pathParameters.user_id;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'user_id required' }) };
    }

    // 📥 Obtención de transacciones y balance del usuario
    const transactions = await readRepo.getTransactionsByUser(userId);
    const balance = await readRepo.getBalanceByUser(userId);

    // ✅ Retorno exitoso
    return { statusCode: 200, body: JSON.stringify({ balance, transactions }) };
  } catch (err) {
    // ❌ Log de errores
    logger.error('query_error', { error: err.message });

    // ⚠ Respuesta de error interno
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
