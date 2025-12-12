import { connectZonaDB } from "../config/dbzonas.js";
import PedidoModel from "../models/pedido.js"; // modelo de pedido

export const crearPedido = async (pedidoData) => {
    const { zona, detalles } = pedidoData;
    if (!zona) {
        throw new Error("Zona no especificada para el pedido");
    }

    // Obtenemos la conexión a la base de datos de la zona
    const dbZona = await connectZonaDB(zona);

    // Creamos el modelo sobre esa conexión
    const Pedido = dbZona.model("Pedido", PedidoModel.schema);

    // Guardamos el pedido
    const total = (Array.isArray(detalles) ? detalles.reduce((sum, d) => sum + (Number(d.precio) * Number(d.cantidad)), 0) : 0);
    const nuevoPedido = new Pedido({ ...pedidoData, total });
    await nuevoPedido.save();

    return nuevoPedido;
};
