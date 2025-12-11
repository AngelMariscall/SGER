import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import passport from "./src/config/passport.js";
import connectDB from "./src/config/dbglobal.js";
import usuarioRoutes from "./src/routes/usuarioroutes.js";
import repartidorRoutes from "./src/routes/repartidorroutes.js";
import pedidoRoutes from "./src/routes/pedidoroutes.js";
import asignacionRoutes from "./src/routes/asignacionroutes.js";
import path from "path";
import { fileURLToPath } from 'url';


console.log("Prueba dotenv:", process.env.GOOGLE_CLIENT_ID);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'src/public')));

// Configuración de sesiones
app.use(
    session({
        secret: "ProyectoEscolar",  // En producción poner una más segura
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Middlewares para parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirigir la raíz al login
app.get("/", (req, res) => {
    res.redirect("/auth/login");
});

// Rutas de autenticación
import authRoutes from "./src/routes/authroutes.js";
app.use("/auth", authRoutes);

app.use("/usuarios", usuarioRoutes);
app.use("/repartidores", repartidorRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/asignacion", asignacionRoutes);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
