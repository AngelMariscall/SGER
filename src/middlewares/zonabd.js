import { connectZonaDB } from "../config/dbzonas.js";

export const getZonaDB = async (req, res, next) => {
    try {
        const zona = req.body.zona || req.query.zona; // Zona que envía el cliente
        if (!zona) return res.status(400).send("Zona no especificada");

        const dbZona = await connectZonaDB(zona); // Obtiene la conexión a la DB de esa zona
        req.dbZona = dbZona; // Guardamos la conexión en la request para usarla en el controller
        next(); // Continúa con la ejecución de la ruta
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al conectar a la base de datos de la zona");
    }
};
