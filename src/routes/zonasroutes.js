import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import Zona from "../models/zona.js";

const router = express.Router();

// Lista
router.get("/", isAuthenticated, async (req, res) => {
  const zonas = await Zona.find().sort({ nombre: 1 });
  const { msg, type } = req.query;
  res.render("zonas/listazonas", { zonas, user: req.user, msg, type });
});

// Nuevo (form)
router.get("/nuevo", isAuthenticated, (req, res) => {
  res.render("zonas/nuevo", { user: req.user });
});

// Crear
router.post("/nuevo", isAuthenticated, async (req, res) => {
  try {
    const { nombre, descripcion, codigo, localidades, activa } = req.body;
    const locs = Array.isArray(localidades) ? localidades : (localidades ? localidades.split(",").map(s=>s.trim()).filter(Boolean) : []);
    await Zona.create({ nombre, descripcion, codigo, localidades: locs, activa: activa === "on" });
    res.redirect("/zonas?msg=Zona%20creada&type=success");
  } catch (error) {
    console.error("Error creando zona:", error);
    res.status(500).send(error.message);
  }
});

// Detalle
router.get("/:id", isAuthenticated, async (req, res) => {
  const zona = await Zona.findById(req.params.id);
  if (!zona) return res.status(404).send("Zona no encontrada");
  res.render("zonas/detalle", { zona, user: req.user });
});

// Editar (form)
router.get("/:id/editar", isAuthenticated, async (req, res) => {
  const zona = await Zona.findById(req.params.id);
  if (!zona) return res.status(404).send("Zona no encontrada");
  res.render("zonas/editar", { zona, user: req.user });
});

// Editar (submit)
router.post("/:id/editar", isAuthenticated, async (req, res) => {
  try {
    const { nombre, descripcion, codigo, localidades, activa } = req.body;
    const locs = Array.isArray(localidades) ? localidades : (localidades ? localidades.split(",").map(s=>s.trim()).filter(Boolean) : []);
    await Zona.findByIdAndUpdate(req.params.id, { nombre, descripcion, codigo, localidades: locs, activa: activa === "on" });
    res.redirect("/zonas?msg=Zona%20actualizada&type=success");
  } catch (error) {
    console.error("Error actualizando zona:", error);
    res.status(500).send(error.message);
  }
});

// Eliminar
router.post("/:id/eliminar", isAuthenticated, async (req, res) => {
  try {
    await Zona.findByIdAndDelete(req.params.id);
    res.redirect("/zonas?msg=Zona%20eliminada&type=success");
  } catch (error) {
    console.error("Error eliminando zona:", error);
    res.status(500).send(error.message);
  }
});

export default router;