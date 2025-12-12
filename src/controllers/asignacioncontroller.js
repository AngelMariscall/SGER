import { asignarPedido } from "../services/asignacionservice.js";

export const asignarPedidoController = async (req, res) => {
    try {
        const result = await asignarPedido(req.body.pedido_id, req.body.repartidor_id);
        // Tras asignar, volver a la página de asignación
        res.redirect("/asignacion");
    } catch (error) {
        res.status(500).send(error.message);
    }
};
