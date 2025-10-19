/**
 * @file localServer.js
 * @description 🌐 Servidor local Express para la Wallet Transaction API.
 *              Maneja endpoints REST para transacciones, historial y balance.
 *              Integra PostgresRepository, TransactionService y EventPublisherMock.
 *
 * Arquitectura y principios:
 *   - 🏗️ Hexagonal Architecture: Separación clara entre dominio, infraestructura y adaptadores.
 *   - 🧩 SOLID:
 *       - Single Responsibility: Este módulo solo configura el servidor y endpoints.
 *       - Dependency Inversion: Transacción y repositorio inyectados como dependencias.
 *       - Open/Closed: Fácil de extender con nuevos endpoints o adaptadores.
 *   - ⚡ Mocking: EventPublisherMock permite pruebas locales sin infra real.
 *
 * Integraciones:
 *   - 📦 Express.js
 *   - 📄 Swagger para documentación interactiva (/api-docs)
 *   - 🐘 PostgreSQL mediante PostgresRepository
 *   - 📡 Publicación de eventos simulada
 *   - 📜 Logger centralizado (logInfo / logError)
 *
 * @example
 * // Iniciar servidor local
 * node localServer.js
 * // POST /transaction
 * fetch("http://localhost:3000/transaction", {
 *   method: "POST",
 *   body: JSON.stringify({ userId: "uuid", amount: 100, type: "deposit" }),
 *   headers: { "Content-Type": "application/json" }
 * });
 *
 * @author Manuela Cortés
 * @email manuelacortesgranados@gmail.com
 * @since 2025-10-19
 */

import express from "express";
import dotenv from "dotenv";
import { TransactionService } from "../../domain/service/TransactionService.js";
import { PostgresRepository } from "../db/PostgresRepository.js";
import EventPublisherMock from "../event/EventPublisherMock.js";
import { setupSwagger } from "../config/swagger.js";
import { logInfo, logError } from "../logger.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
setupSwagger(app);

// Dependencias
const repository = new PostgresRepository();
const eventPublisher = new EventPublisherMock();
const transactionService = new TransactionService(repository, eventPublisher);

/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Crear una nueva transacción 💳
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [deposit, withdraw]
 *     responses:
 *       200:
 *         description: Transacción procesada con éxito
 */
app.post("/transaction", async (req, res) => {
  try {
    const result = await transactionService.processTransaction(req.body);
    res.json({ status: "ok", result });
  } catch (err) {
    logError("Failed to process transaction", err);
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /transactions/{userId}:
 *   get:
 *     summary: Obtener historial de transacciones 📜
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de transacciones
 */
app.get("/transactions/:userId", async (req, res) => {
  try {
    const transactions = await transactionService.getUserTransactions(req.params.userId);
    res.json({ transactions });
  } catch (err) {
    logError("Failed to process transaction", err); // ITEM-04-03 Registro de logs
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /balance/{userId}:
 *   get:
 *     summary: Obtener saldo actual 💰
 *     tags: [Balance]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Saldo actual del usuario
 */
app.get("/balance/:userId", async (req, res) => {
  try {
    const balance = await transactionService.getUserBalance(req.params.userId);
    res.json({ balance });
  } catch (err) {
    logError("Failed to process transaction", err); // ITEM-04-03 Registro de logs
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Health check 🩺
app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs available at http://localhost:${PORT}/api-docs`);
});
