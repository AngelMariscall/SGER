import mongoose from "mongoose";

const detalleSchema = new mongoose.Schema({
    producto: { type: String, required: true },
    cantidad: { type: Number, required: true },
    precio: { type: Number, required: true }
});

const pedidoSchema = new mongoose.Schema({
    cliente: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", default: null },
        nombre: { type: String, required: true },
        telefono: { type: String, required: true }
    },
    direccion: {
        calle: { type: String, required: true },
        localidad: { type: String, required: true },
        ciudad: { type: String, required: true }
    },
    zona: { type: String, required: true }, // se asigna automáticamente según localidad
    detalles: [detalleSchema],
    total: { type: Number, required: true },
    estatus: { type: String, enum: ["pendiente", "asignado", "en_camino", "entregado", "cancelado"], default: "pendiente" },
    repartidor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Repartidor", default: null },
    fecha_creacion: { type: Date, default: Date.now },
    fecha_asignacion: { type: Date, default: null },
    fecha_entrega: { type: Date, default: null }
});

export default mongoose.model("pedido", pedidoSchema);
