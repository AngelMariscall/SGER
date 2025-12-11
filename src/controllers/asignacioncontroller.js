import { asignarPedido } from "../services/asignacionservice.js";

export const asignarPedidoController = async (req, res) => {
    try {
        const result = await asignarPedido(req.body.pedido_id, req.body.repartidor_id);
        res.json({ ok: true, result });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};
