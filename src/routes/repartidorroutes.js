import express from "express";
import { listarRepartidoresController, asignarZonaController } from "../controllers/repartidorcontroller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { hasRole } from "../middlewares/roles.js";

const router = express.Router();

// Listar repartidores (admin y operador)
router.get("/", isAuthenticated, hasRole("admin", "operador"), listarRepartidoresController);

// Asignar zona a repartidor (solo admin)
router.put("/:id/zona", isAuthenticated, hasRole("admin"), asignarZonaController);

export default router;
