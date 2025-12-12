import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
// removed role restrictions
import { asignarPedidoController } from "../controllers/asignacioncontroller.js";
import Pedido from "../models/pedido.js";
import Repartidor from "../models/repartidor.js";
import Zona from "../models/zona.js";
import { connectZonaDB } from "../config/dbzonas.js";

const router = express.Router();

// Página de asignación
router.get("/", isAuthenticated, async (req, res) => {
    try {
        // Recolectar pedidos pendientes/sin asignar de todas las zonas
        const zonas = await Zona.find({}, "nombre");
        const pedidos = [];
        for (const z of zonas) {
            const nombreZona = (z.nombre || "").toLowerCase();
            const dbZona = await connectZonaDB(nombreZona);
            const PedidoZona = dbZona.model("Pedido", Pedido.schema);
            const encontrados = await PedidoZona.find({ estatus: { $in: ["pendiente", "asignado"] } });
            encontrados.forEach(p => { p._doc.__zona = nombreZona; });
            pedidos.push(...encontrados);
        }

        // Repartidores desde la DB global con nombre del usuario
        const repartidores = await Repartidor.find().populate("usuario_id");

        res.render("asignacion/asignar", { pedidos, repartidores, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Procesar asignación desde formulario (POST /asignacion)
router.post("/", isAuthenticated, async (req, res, next) => {
    try {
        // Adaptar body al formato esperado por el controlador (usa :pedidoId)
        const { pedido_id, repartidor_id } = req.body;
        req.params.pedidoId = pedido_id;
        req.body.repartidor_id = repartidor_id;
        // Delegar al controlador de asignación
        return asignarPedidoController(req, res, next);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Crear pedido
router.put("/:pedidoId", isAuthenticated, asignarPedidoController);

// Otras rutas de pedidos (listar, actualizar estatus) se pueden agregar aquí con los mismos middlewares

export default router;
