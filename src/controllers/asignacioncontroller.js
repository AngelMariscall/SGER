import { asignarPedido } from "../services/asignacionservice.js";

export const asignarPedidoController = async (req, res) => {
    try {
        const result = await asignarPedido(req.body.pedido_id, req.body.repartidor_id);
        // Tras asignar, volver a la página de asignación con notificación
        const msg = encodeURIComponent("Repartidor asignado al pedido correctamente");
        res.redirect(`/asignacion?type=success&msg=${msg}`);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
