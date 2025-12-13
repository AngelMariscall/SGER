import { crearUsuario, listarUsuarios } from "../services/usuarioservice.js";

export const renderNuevoUsuario = async (req, res) => {
    // Render the EJS form for creating a new user
    res.render("usuarios/nuevo", { user: req.user, error: null });
};

export const crearUsuarioController = async (req, res) => {
    try {
        await crearUsuario(req.body);
        // Redirect to list after successful creation
        res.redirect("/usuarios");
    } catch (error) {
        console.error("Error al crear usuario:", error);
        // Re-render the form with an error message
        res.status(400).render("usuarios/nuevo", { user: req.user, error: error.message });
    }
};

export const listarUsuariosController = async (req, res) => {
    try {
        const users = await listarUsuarios();
        res.render("usuarios/listausuarios", { user: req.user, usuarios: users });
    } catch (error) {
        res.status(500).send(error.message);
    }
};
