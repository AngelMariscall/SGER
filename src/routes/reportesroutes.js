import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { reporteEntregasController } from "../controllers/reportescontroller.js";

const router = Router();

router.get("/entregas", isAuthenticated, reporteEntregasController);

export default router;
