import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { hasRole } from "../middlewares/roles.js";
import { asignarPedidoController } from "../controllers/asignacioncontroller.js";


const router = express.Router();

// Crear pedido
router.put("/:pedidoId", isAuthenticated, hasRole("admin"), asignarPedidoController);

// Otras rutas de pedidos (listar, actualizar estatus) se pueden agregar aquí con los mismos middlewares

export default router;
