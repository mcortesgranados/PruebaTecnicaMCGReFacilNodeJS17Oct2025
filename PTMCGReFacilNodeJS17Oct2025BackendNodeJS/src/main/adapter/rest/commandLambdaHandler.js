/**
 * @file transactionLambdaHandler.js
 * @description 🌐 Handler minimalista para AWS Lambda que expone el endpoint POST /transactions
 *              vía API Gateway, integrando los adaptadores de persistencia, el servicio de dominio
 *              y un Event Publisher simulado. Pertenece a la capa de infraestructura en una
 *              arquitectura hexagonal.
 *
 * Principios SOLID aplicados:
 *   - ✅ SRP: Solo maneja la recepción de eventos, parseo, ejecución del servicio y respuesta HTTP.
 *   - ✅ OCP: Se puede extender para nuevos endpoints o servicios sin modificar la lógica existente.
 *   - ✅ DIP: Depende de interfaces de repositorios y servicio inyectadas, no de implementaciones concretas.
 *
 * @author Manuela Cortés Granados
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-17
 */

'use strict';

const { Pool } = require('pg');
const PgWrite = require('../persistence/write/pgTransactionWriteRepositoryAdapter');
const PgRead = require('../persistence/read/pgTransactionReadRepositoryAdapter');
const CreateTransactionService = require('../../application/service/createTransactionService');
const EventPublisherSimulator = require('../events/eventPublisherSimulator');
const logger = require('../../infrastructure/logger');

/**
 * 🌊 Pool de PostgreSQL para conexión a la base de datos.
 * @type {Pool}
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * 📤 Repositorio de escritura de transacciones
 */
const writeRepo = new PgWrite(pool);

/**
 * 📥 Repositorio de lectura de transacciones
 */
const readRepo = new PgRead(pool);

/**
 * 📨 Publicador de eventos simulado
 */
const eventPublisher = new EventPublisherSimulator(logger);

/**
 * 🛠 Servicio de dominio que maneja la lógica de creación de transacciones
 */
const service = new CreateTransactionService({ writeRepo, readRepo, eventPublisher, logger });

/**
 * 🟢 Handler principal de Lambda para procesar POST /transactions
 * @param {Object} event - Objeto del evento AWS Lambda enviado por API Gateway
 * @param {string|Object} event.body - Contiene JSON con los datos de la transacción
 * @returns {Promise<Object>} Response con statusCode y body en JSON
 * @example
 * {
 *   "user_id": "00000000-0000-0000-0000-000000000000",
 *   "amount": 10,
 *   "type": "deposit"
 * }
 */
exports.handler = async (event) => {
  try {
    // 🔄 Parseo del body si viene como string
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // 🚀 Ejecución del servicio de dominio
    const result = await service.execute(body);

    // ✅ Respuesta exitosa
    return { statusCode: 201, body: JSON.stringify(result) };
  } catch (err) {
    // ❌ Log de errores
    logger.error('transaction_error', { error: err.message });

    // ⚠ Respuesta de error
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};

/**
 * 🔧 Permite ejecución local para pruebas sin AWS Lambda
 * node handler.js
 */
if (require.main === module) {
  (async () => {
    try {
      const sample = {
        user_id: '00000000-0000-0000-0000-000000000000',
        amount: 10,
        type: 'deposit'
      };

      const res = await service.execute(sample);
      console.log('sample result', res);
    } catch (err) {
      console.error('Error during local test', err);
    } finally {
      await pool.end(); // 🔌 Cerrar pool de PostgreSQL
    }
  })();
}
