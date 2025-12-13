import { isAuthenticated } from "../middlewares/auth.js";
import { Router } from "express";
import { crearPedidoController, listarPedidosController, verPedidoController, actualizarPedidoController, entregarPedidoController, editarPedidoFormController, editarPedidoSubmitController, eliminarPedidoController } from "../controllers/pedidocontroller.js";
import Zona from "../models/zona.js";

const router = Router();

// Formulario nuevo pedido
router.get("/nuevo", isAuthenticated, async (req, res) => {
	const zonas = await Zona.find();
	res.render("pedidos/nuevopedido", { user: req.user, zonas });
});

// Crear nuevo pedido desde formulario
router.post("/nuevo", isAuthenticated, crearPedidoController);

router.post("/", isAuthenticated, crearPedidoController);  // Crear pedido API
router.get("/", isAuthenticated, listarPedidosController); // Listar pedidos
router.get("/:id", isAuthenticated, verPedidoController);             // Ver detalle
router.put("/:id", isAuthenticated, actualizarPedidoController);      // Actualizar estatus
router.post("/:id/entregar", isAuthenticated, entregarPedidoController); // Entregar pedido
// Editar y eliminar (por zona)
router.get("/:id/editar", isAuthenticated, editarPedidoFormController);
router.post("/:id/editar", isAuthenticated, editarPedidoSubmitController);
router.post("/:id/eliminar", isAuthenticated, eliminarPedidoController);

export default router;
