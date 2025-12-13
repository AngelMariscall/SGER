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

export const entregarPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        // zona puede venir en query o body; preferimos query
        const zona = (req.query.zona || req.body.zona || '').toLowerCase();
        if (!zona) {
            return res.status(400).send("Zona requerida para marcar entrega");
        }
        const dbZona = await connectZonaDB(zona);
        const PedidoZona = dbZona.model("Pedido", Pedido.schema);
        const pedido = await PedidoZona.findById(id);
        if (!pedido) return res.status(404).send("Pedido no encontrado en zona " + zona);

        // Validar que tenga repartidor asignado
        if (!pedido.repartidor_id) {
            return res.redirect(`/pedidos/${id}?zona=${zona}&msg=No%20puede%20entregarse%20sin%20repartidor&type=error`);
        }

        // Actualizar estatus y fecha_entrega
        pedido.estatus = "entregado";
        pedido.fecha_entrega = new Date();
        await pedido.save();

        // Incrementar entregas_realizadas del repartidor
        if (pedido.repartidor_id) {
            try {
                const Repartidor = (await import("../models/repartidor.js")).default;
                await Repartidor.findByIdAndUpdate(pedido.repartidor_id, { $inc: { entregas_realizadas: 1 } });
            } catch (e) {
                console.error("No se pudo incrementar entregas del repartidor:", e);
            }
        }

        // Redirigir al detalle
        res.redirect(`/pedidos/${id}?zona=${zona}`);
    } catch (error) {
        console.error("Error al marcar pedido como entregado:", error);
        res.status(500).send(error.message);
    }
};

// Editar pedido - formulario
export const editarPedidoFormController = async (req, res) => {
    try {
        const { id } = req.params;
        const zona = (req.query.zona || '').toLowerCase();
        let pedido = null; let zonaCtx = zona;
        if (zonaCtx) {
            const dbZona = await connectZonaDB(zonaCtx);
            const PedidoZona = dbZona.model("Pedido", Pedido.schema);
            pedido = await PedidoZona.findById(id);
        } else {
            const zonas = await Zona.find({}, "nombre");
            for (const z of zonas) {
                const nombreZona = (z.nombre || "").toLowerCase();
                const dbZona = await connectZonaDB(nombreZona);
                const PedidoZona = dbZona.model("Pedido", Pedido.schema);
                const found = await PedidoZona.findById(id);
                if (found) { pedido = found; zonaCtx = nombreZona; break; }
            }
        }
        if (!pedido) return res.status(404).send("Pedido no encontrado");
        // Obtener todas las localidades disponibles de todas las zonas
        const zonasAll = await Zona.find({}, "localidades nombre");
        const localidades = Array.from(new Set(zonasAll.flatMap(z => z.localidades || []))).sort();
        res.render("pedidos/editar", { pedido, zona: zonaCtx, user: req.user, localidades });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Editar pedido - submit
export const editarPedidoSubmitController = async (req, res) => {
    try {
        const { id } = req.params;
        const zona = (req.query.zona || req.body.zona || '').toLowerCase();
        if (!zona) return res.status(400).send("Zona requerida");
        const dbZona = await connectZonaDB(zona);
        const PedidoZona = dbZona.model("Pedido", Pedido.schema);
        // Construir detalles desde campos planos
        const prods = Array.isArray(req.body.detalles_producto) ? req.body.detalles_producto : (req.body.detalles_producto ? [req.body.detalles_producto] : []);
        const cants = Array.isArray(req.body.detalles_cantidad) ? req.body.detalles_cantidad : (req.body.detalles_cantidad ? [req.body.detalles_cantidad] : []);
        const precios = Array.isArray(req.body.detalles_precio) ? req.body.detalles_precio : (req.body.detalles_precio ? [req.body.detalles_precio] : []);
        const detalles = prods.map((p, i) => ({ producto: p, cantidad: Number(cants[i] || 0), precio: Number(precios[i] || 0) })).filter(d => d.producto);
        // Calcular total del servidor por seguridad
        const totalCalc = detalles.reduce((sum, d) => sum + (Number(d.cantidad) * Number(d.precio)), 0);

        const update = {
            cliente: {
                nombre: req.body.cliente_nombre,
                telefono: req.body.cliente_telefono,
                id: req.body.cliente_id || null
            },
            direccion: {
                calle: req.body.calle,
                localidad: req.body.localidad,
                ciudad: req.body.ciudad
            },
            // Estatus: solo permitir cambiar si sigue pendiente; si viene disabled, mantener actual
            estatus: req.body.estatus || undefined,
            detalles,
            total: totalCalc
        };
        // Recalcular zona si cambia localidad (opcional)
        if (req.body.localidad) {
            const z = await Zona.findOne({ localidades: req.body.localidad });
            if (z) {
                update.zona = (z.nombre || '').toLowerCase();
            }
        }
        // Si estatus no se permite cambiar, preservar el actual
        const current = await PedidoZona.findById(id);
        if (!current) return res.status(404).send("Pedido no encontrado");
        if (current.estatus !== 'pendiente') {
            delete update.estatus;
        }
        const zonaFinal = update.zona || zona;
        // Si la zona final es distinta a la actual, migrar el documento entre DBs
        if (zonaFinal && zonaFinal !== zona) {
            // Construir el payload final fusionando current + update
            const payload = {
                cliente: update.cliente ?? current.cliente,
                direccion: update.direccion ?? current.direccion,
                estatus: (update.estatus ?? current.estatus),
                detalles: update.detalles ?? current.detalles,
                total: update.total ?? current.total,
                repartidor_id: current.repartidor_id ?? null,
                repartidor_nombre: current.repartidor_nombre ?? '',
                fecha_creacion: current.fecha_creacion ?? new Date(),
                fecha_asignacion: current.fecha_asignacion ?? null,
                fecha_entrega: current.fecha_entrega ?? null,
                zona: zonaFinal
            };
            // Conectar a nueva zona y crear el documento con el mismo _id
            const dbNueva = await connectZonaDB(zonaFinal);
            const PedidoNuevaZona = dbNueva.model("Pedido", Pedido.schema);
            // Intentar crear con mismo _id para mantener enlaces
            const nuevo = new PedidoNuevaZona({ _id: current._id, ...payload });
            await nuevo.save();
            // Eliminar de la zona anterior
            await PedidoZona.findByIdAndDelete(id);
            // Redirigir al detalle en nueva zona
            return res.redirect(`/pedidos/${id}?zona=${zonaFinal}`);
        } else {
            // Actualización en la misma zona
            const pedido = await PedidoZona.findByIdAndUpdate(id, update, { new: true });
            if (!pedido) return res.status(404).send("Pedido no encontrado");
            return res.redirect(`/pedidos/${id}?zona=${zonaFinal}`);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Eliminar pedido
export const eliminarPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const zona = (req.query.zona || req.body.zona || '').toLowerCase();
        if (!zona) return res.status(400).send("Zona requerida");
        const dbZona = await connectZonaDB(zona);
        const PedidoZona = dbZona.model("Pedido", Pedido.schema);
        const deleted = await PedidoZona.findByIdAndDelete(id);
        if (!deleted) return res.status(404).send("Pedido no encontrado");
        res.redirect(`/pedidos?msg=Pedido%20eliminado&type=success`);
    } catch (error) {
        res.status(500).send(error.message);
    }
};