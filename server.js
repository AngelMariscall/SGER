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
import zonasRoutes from "./src/routes/zonasroutes.js";
import path from "path";
import { fileURLToPath } from 'url';
import Usuario from "./src/models/usuario.js";
import Pedido from "./src/models/pedido.js";
import Repartidor from "./src/models/repartidor.js";
import Zona from "./src/models/zona.js";
import { connectZonaDB } from "./src/config/dbzonas.js";
import { isAuthenticated } from "./src/middlewares/auth.js";


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
app.use("/zonas", zonasRoutes);
// Reportes
import reportesRoutes from "./src/routes/reportesroutes.js";
app.use("/reportes", reportesRoutes);

// Dashboard con métricas
app.get("/dashboard", isAuthenticated, async (req, res) => {
    try {
        const [totalUsuarios, totalRepartidores, totalPedidos, pedidosPendientes, pedidosAsignados, pedidosSinAsignar] = await Promise.all([
            Usuario.countDocuments({}),
            Repartidor.countDocuments({}),
            Pedido.countDocuments({}),
            Pedido.countDocuments({ estado: "pendiente" }),
            Pedido.countDocuments({ estado: "asignado" }),
            Pedido.countDocuments({ repartidor: { $exists: false } })
        ]);

        // Pedidos por zona: contar en cada base de datos de zona
        const zonas = await Zona.find({ activa: true }).sort({ nombre: 1 });
        const pedidosPorZona = [];
        for (const z of zonas) {
            try {
                // Usa nombre de zona para coincidir con variables .env si están nombradas por nombre
                const dbZona = await connectZonaDB(z.nombre);
                const PedidoZona = dbZona.model("Pedido", Pedido.schema);
                const count = await PedidoZona.countDocuments({});
                pedidosPorZona.push({ nombre: z.nombre, codigo: z.codigo, count });
            } catch (e) {
                console.error(`No se pudo contar pedidos para zona ${z.codigo}:`, e.message);
                pedidosPorZona.push({ nombre: z.nombre, codigo: z.codigo, count: 0 });
            }
        }

        res.render("dashboard", {
            user: req.user,
            metrics: {
                totalUsuarios,
                totalRepartidores,
                totalPedidos,
                pedidosPendientes,
                pedidosAsignados,
                pedidosSinAsignar,
                pedidosPorZona
            }
        });
    } catch (err) {
        console.error("Error obteniendo métricas del dashboard:", err);
        res.status(500).send("Error cargando dashboard");
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
