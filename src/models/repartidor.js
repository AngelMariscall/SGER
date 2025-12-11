import mongoose from "mongoose";

const repartidorSchema = new mongoose.Schema({
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    vehiculo: { type: String, required: true },
    placa: { type: String, required: true },
    zona_asignada: { type: String, required: true }, // nombre de la zona
    status: { type: String, enum: ["disponible", "ocupado", "fuera de servicio"], default: "disponible" },
    entregas_realizadas: { type: Number, default: 0 }
}, { timestamps: true });

const Repartidor = mongoose.model("Repartidor", repartidorSchema);
export default Repartidor;
