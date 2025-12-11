import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { hasRole } from "../middlewares/roles.js";
import Usuario from "../models/usuario.js";

const router = express.Router();

router.get("/", isAuthenticated, hasRole("admin"), async (req, res) => {
    const usuarios = await Usuario.find(); // O la consulta que uses
    res.render("usuarios/listausuarios", { usuarios, user: req.user });
});

router.get("/pedidos", isAuthenticated, hasRole("admin", "operador"), (req, res) => {
    res.render("pedidos/listapedidos", { user: req.user });
});

router.get("/nuevo", isAuthenticated, hasRole("admin"), (req, res) => {
    res.render("usuarios/nuevo", { user: req.user });
});

export default router;
