import express from "express";
import { listarRepartidoresController, asignarZonaController, renderAsignarZonaForm, renderNuevoRepartidor, crearRepartidor, renderDetalleRepartidor, renderEditarRepartidor, actualizarRepartidor, eliminarRepartidor } from "../controllers/repartidorcontroller.js";
import { isAuthenticated } from "../middlewares/auth.js";
// removed role restrictions

const router = express.Router();

// Listar repartidores (admin y operador)
router.get("/", isAuthenticated, listarRepartidoresController);
router.get("/ping", (req, res) => res.send("repartidores ok"));
router.get("/nuevo", renderNuevoRepartidor);
router.get("/nuevo/", renderNuevoRepartidor); // alias with trailing slash
router.post("/nuevo", isAuthenticated, crearRepartidor);
// Formulario asignar zona
router.get("/asignar", isAuthenticated, renderAsignarZonaForm);

router.get("/:id", isAuthenticated, renderDetalleRepartidor);
router.get("/:id/editar", isAuthenticated, renderEditarRepartidor);
router.post("/:id/editar", isAuthenticated, actualizarRepartidor);
router.post("/:id/eliminar", isAuthenticated, eliminarRepartidor);

// Asignar zona a repartidor (submit)
router.post("/:id/zona", isAuthenticated, asignarZonaController);

export default router;
