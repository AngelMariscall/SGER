import { connectZonaDB } from "../config/dbzonas.js";
import PedidoModel from "../models/pedido.js";
import RepartidorModel from "../models/repartidor.js";

export const asignarPedido = async (pedidoId, repartidorId) => {
    const repartidor = await RepartidorModel.findById(repartidorId).populate("usuario_id");
    if (!repartidor) throw new Error("Repartidor no encontrado");

    const dbZona = await connectZonaDB(repartidor.zona_asignada);
    const Pedido = dbZona.model("Pedido", PedidoModel.schema);

    const pedido = await Pedido.findByIdAndUpdate(
        pedidoId,
        { 
            repartidor_id: repartidorId, 
            repartidor_nombre: repartidor.usuario_id ? repartidor.usuario_id.nombre : "",
            estatus: "asignado", 
            fecha_asignacion: new Date() 
        },
        { new: true }
    );

    return pedido;
};
