import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    // Optional: present for users created via Google OAuth. For local/manual users, leave undefined.
    // Use sparse unique index so null/undefined values don't conflict.
    oauth_id: { type: String, unique: true, sparse: true },
    rol: { type: String, enum: ["admin", "operador", "repartidor"], required: true },
    telefono: { type: String },
    activo: { type: Boolean, default: true }
}, { timestamps: true });

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
