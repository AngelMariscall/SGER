import { listarRepartidores, asignarZona } from "../services/repartidorservice.js";

export const listarRepartidoresController = async (req, res) => {
    try {
        const reps = await listarRepartidores();
        res.json({ ok: true, reps });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};

export const asignarZonaController = async (req, res) => {
    try {
        const rep = await asignarZona(req.params.id, req.body.zona_id);
        res.json({ ok: true, rep });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};
