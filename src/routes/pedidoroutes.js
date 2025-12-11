import { isAuthenticated } from "../middlewares/auth.js";
import { getZonaDB } from "../middlewares/zonabd.js";
import { Router } from "express";
import { crearPedidoController } from "../controllers/pedidocontroller.js";
import { listarPedidosController } from "../controllers/pedidocontroller.js";
import { verPedidoController } from "../controllers/pedidocontroller.js";
import { actualizarPedidoController } from "../controllers/pedidocontroller.js";

const router = Router();

router.post("/", isAuthenticated, getZonaDB, crearPedidoController);  // Crear pedido
router.get("/", isAuthenticated, listarPedidosController);            // Listar pedidos
router.get("/:id", isAuthenticated, verPedidoController);             // Ver detalle
router.put("/:id", isAuthenticated, actualizarPedidoController);      // Actualizar estatus

export default router;
