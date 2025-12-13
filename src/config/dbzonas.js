import mongoose from "mongoose";

// Objeto para almacenar las conexiones ya abiertas
const conexiones = {};

// Función para conectarse a la base de datos de una zona
export const connectZonaDB = async (zona) => {
    try {
        // Si ya existe la conexión, la reutilizamos
        if (conexiones[zona]) {
            return conexiones[zona];
        }

        // Construimos la clave de env de forma robusta (espacios/guiones a _)
        const normalized = String(zona).toUpperCase().replace(/[^A-Z0-9]/g, "_");
        const envKey = `MONGO_URI_${normalized}`;
        const mongoUri = process.env[envKey];
        if (!mongoUri) throw new Error(`No existe URI para la zona: ${zona}`);

        // Conectamos
        // Conectar sin opciones deprecated; Mongoose actual gestiona los defaults
        const conexion = await mongoose.createConnection(mongoUri);

        // Guardamos la conexión para reutilizarla
        conexiones[zona] = conexion;
        console.log(`MongoDB conectado correctamente a la zona: ${zona}`);
        return conexion;

    } catch (error) {
        console.error(`Error al conectar MongoDB zona ${zona}:`, error);
        throw error;
    }
};
