import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import Usuario from "../models/usuario.js";

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
    const usuarios = await Usuario.find();
    const { msg, type } = req.query;
    res.render("usuarios/listausuarios", { usuarios, user: req.user, msg, type });
});

// Nota: No montar rutas de pedidos aquí. Usar /pedidos en su propio router.

router.get("/nuevo", isAuthenticated, (req, res) => {
    res.render("usuarios/nuevo", { user: req.user });
});

// Crear usuario
router.post("/nuevo", isAuthenticated, async (req, res) => {
    try {
        const { nombre, correo, rol, telefono, activo, oauth_id } = req.body;
        // No forzamos oauth_id en altas manuales: se establecerá cuando el usuario inicie sesión por primera vez.
        await Usuario.create({ nombre, correo, rol, telefono, activo: activo === "on", oauth_id });
        res.redirect("/usuarios?msg=Usuario%20creado%20correctamente&type=success");
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.render("usuarios/nuevo", { user: req.user, error: error.message });
    }
});

// Ver detalle usuario
router.get("/:id", isAuthenticated, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).send("Usuario no encontrado");
        res.render("usuarios/detalle", { usuario, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Editar usuario (render formulario)
router.get("/:id/editar", isAuthenticated, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).send("Usuario no encontrado");
        res.render("usuarios/editar", { usuario, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Editar usuario (procesar formulario)
router.post("/:id/editar", isAuthenticated, async (req, res) => {
    console.log("POST /usuarios/:id/editar", req.params.id);
    try {
        const { nombre, correo, rol, telefono, activo } = req.body;
        await Usuario.findByIdAndUpdate(req.params.id, { nombre, correo, rol, telefono, activo: activo === "on" });
        res.redirect("/usuarios?msg=Usuario%20actualizado&type=success");
    } catch (error) {
        console.error("Error al editar usuario:", error);
        res.status(500).send(error.message);
    }
});

// Alias para evitar problemas de rutas (por si el formulario envía /usuarios/editar/:id)
router.post("/editar/:id", isAuthenticated, async (req, res) => {
    console.log("POST /usuarios/editar/:id", req.params.id);
    try {
        const { nombre, correo, rol, telefono, activo } = req.body;
        await Usuario.findByIdAndUpdate(req.params.id, { nombre, correo, rol, telefono, activo: activo === "on" });
        res.redirect("/usuarios?msg=Usuario%20actualizado&type=success");
    } catch (error) {
        console.error("Error al editar usuario (alias):", error);
        res.status(500).send(error.message);
    }
});

// Eliminar usuario
router.post("/:id/eliminar", isAuthenticated, async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.redirect("/usuarios?msg=Usuario%20eliminado&type=success");
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).send(error.message);
    }
});

export default router;
