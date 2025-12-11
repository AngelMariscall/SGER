import mongoose from "mongoose";

const zonaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    codigo: { type: String, required: true, unique: true },
    localidades: [{ type: String, required: true }],
    activa: { type: Boolean, default: true }
}, { timestamps: true });

const Zona = mongoose.model("Zona", zonaSchema);
export default Zona;
