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

        // Construimos la URL según la zona (de tu .env)
        const mongoUri = process.env[`MONGO_URI_${zona.toUpperCase()}`];
        if (!mongoUri) throw new Error(`No existe URI para la zona: ${zona}`);

        // Conectamos
        const conexion = await mongoose.createConnection(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Guardamos la conexión para reutilizarla
        conexiones[zona] = conexion;
        console.log(`MongoDB conectado correctamente a la zona: ${zona}`);
        return conexion;

    } catch (error) {
        console.error(`Error al conectar MongoDB zona ${zona}:`, error);
        throw error;
    }
};
