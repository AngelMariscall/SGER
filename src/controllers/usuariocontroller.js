import { crearUsuario, listarUsuarios } from "../services/usuarioservice.js";

export const crearUsuarioController = async (req, res) => {
    try {
        const user = await crearUsuario(req.body);
        res.status(201).json({ ok: true, user });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};

export const listarUsuariosController = async (req, res) => {
    try {
        const users = await listarUsuarios();
        res.json({ ok: true, users });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};
