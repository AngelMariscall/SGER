import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    oauth_id: { type: String, required: true, unique: true },
    rol: { type: String, enum: ["admin", "operador", "repartidor"], required: true },
    telefono: { type: String },
    activo: { type: Boolean, default: true }
}, { timestamps: true });

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
