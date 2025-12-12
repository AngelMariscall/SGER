import { crearPedido } from "../services/pedidoservice.js";
import Pedido from "../models/pedido.js";
import Zona from "../models/zona.js";
import { connectZonaDB } from "../config/dbzonas.js";

export const crearPedidoController = async (req, res) => {
    try {
        // Derivar zona a partir de la localidad si no viene explícita
        const data = { ...req.body };
        const localidad = data?.direccion?.localidad;
        if (!data.zona) {
            const z = await Zona.findOne({ localidades: localidad });
            if (!z) throw new Error(`No se encontró una zona para la localidad: ${localidad}`);
            data.zona = z.nombre.toLowerCase();
        }
        // Calcular total si no viene
        if (!data.total && Array.isArray(data.detalles)) {
            data.total = data.detalles.reduce((sum, d) => sum + (Number(d.precio) * Number(d.cantidad)), 0);
        }
        // Normalizar estatus y repartidor
        if (!data.estatus) data.estatus = "pendiente";
        if (!data.repartidor_id) data.repartidor_id = null;

        const pedido = await crearPedido(data);
        // Redirigimos pasando la zona para que el detalle cargue desde la DB correcta
        res.redirect(`/pedidos/${pedido._id}?zona=${data.zona}`);
    } catch (error) {
        // En caso de error, re-render del formulario
        const zonas = await Zona.find();
        res.status(500).render("pedidos/nuevopedido", { user: req.user, zonas, error: error.message });
    }
};

export const actualizarPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const pedidoActualizado = await Pedido.findByIdAndUpdate(id, update, { new: true });
        if (!pedidoActualizado) {
            return res.status(404).send("Pedido no encontrado");
        }
        res.redirect(`/pedidos/${id}`);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const listarPedidosController = async (req, res) => {
    try {
        // Obtener todas las zonas registradas
        const zonas = await Zona.find({}, "nombre");
        const pedidos = [];
        // Consultar cada base de datos por zona y acumular
        for (const z of zonas) {
            const nombreZona = (z.nombre || "").toLowerCase();
            const dbZona = await connectZonaDB(nombreZona);
            const PedidoZona = dbZona.model("Pedido", Pedido.schema);
            const encontrados = await PedidoZona.find();
            // Adjuntar metadato de zona para uso en vistas
            for (const p of encontrados) {
                p._doc.__zona = nombreZona;
                // Resolver nombre del repartidor si existe
                if (p.repartidor_id) {
                    try {
                        const rep = await (await import("../models/repartidor.js")).default.findById(p.repartidor_id).populate("usuario_id");
                        p._doc.__repartidorNombre = rep ? (rep.usuario_id?.nombre || "") : "";
                    } catch (e) {
                        p._doc.__repartidorNombre = "";
                    }
                } else {
                    p._doc.__repartidorNombre = "";
                }
            }
            pedidos.push(...encontrados);
        }
        res.render("pedidos/listapedidos", { pedidos, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const verPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { zona } = req.query;
        let pedido;
        if (zona) {
            // Buscar en la base de datos de la zona indicada
            const dbZona = await connectZonaDB(zona);
            const PedidoZona = dbZona.model("Pedido", Pedido.schema);
            pedido = await PedidoZona.findById(id);
        } else {
            // Buscar en todas las zonas si no se proporcionó zona
            const zonas = await Zona.find({}, "nombre");
            for (const z of zonas) {
                const nombreZona = (z.nombre || "").toLowerCase();
                const dbZona = await connectZonaDB(nombreZona);
                const PedidoZona = dbZona.model("Pedido", Pedido.schema);
                const found = await PedidoZona.findById(id);
                if (found) { pedido = found; break; }
            }
        }
        if (!pedido) {
            return res.status(404).send("Pedido no encontrado");
        }
        res.render("pedidos/detalle", { pedido, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};