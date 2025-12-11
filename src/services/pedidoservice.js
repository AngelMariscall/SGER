import { connectZonaDB } from "../config/dbzonas.js";
import PedidoModel from "../models/pedido.js"; // modelo de pedido

export const crearPedido = async (pedidoData) => {
    const { zona } = pedidoData;

    // Obtenemos la conexión a la base de datos de la zona
    const dbZona = await connectZonaDB(zona);

    // Creamos el modelo sobre esa conexión
    const Pedido = dbZona.model("Pedido", PedidoModel.schema);

    // Guardamos el pedido
    const nuevoPedido = new Pedido(pedidoData);
    await nuevoPedido.save();

    return nuevoPedido;
};
