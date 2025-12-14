import mongoose from "mongoose";

// Cache de conexiones por zona (singleton por zona)
const conexionesPorZona = new Map();
const zonaLogOnce = new Set(); // para loggear solo una vez por zona

/**
 * Conecta (o reutiliza) una conexión por zona usando mongoose.createConnection.
 * - Normaliza la zona con toUpperCase y reemplaza no alfanumérico por _.
 * - Obtiene el URI desde env: MONGO_URI_<ZONA_NORMALIZADA>
 * - Registra log solo la primera vez que se conecta a esa zona.
 */
export const connectZonaDB = async (zona) => {
    if (!zona) throw new Error("Zona requerida para conexión");

    // Normalizar zona: mayúsculas y caracteres no alfanuméricos a _
    const normalizedZona = String(zona).toUpperCase().replace(/[^A-Z0-9]/g, "_");
    const envKey = `MONGO_URI_${normalizedZona}`;
    const mongoUri = process.env[envKey];
    if (!mongoUri) throw new Error(`No existe URI para la zona: ${zona} (clave env: ${envKey})`);

    // Si ya tenemos conexión, reutilizarla
    if (conexionesPorZona.has(normalizedZona)) {
        return conexionesPorZona.get(normalizedZona);
    }

    try {
        const conexion = await mongoose.createConnection(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        conexionesPorZona.set(normalizedZona, conexion);

        if (!zonaLogOnce.has(normalizedZona)) {
            console.log(`[DB] Conectado a zona ${normalizedZona} (singleton)`);
            zonaLogOnce.add(normalizedZona);
        }

        return conexion;
    } catch (error) {
        console.error(`[DB] Error al conectar MongoDB zona ${normalizedZona}:`, error.message);
        throw error;
    }
};
