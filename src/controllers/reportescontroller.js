import Zona from "../models/zona.js";
import Repartidor from "../models/repartidor.js";
import Pedido from "../models/pedido.js";
import { connectZonaDB } from "../config/dbzonas.js";

export async function reporteEntregasController(req, res) {
  const { zona = "todas", repartidor_id = "", desde = "", hasta = "" } = req.query;
  try {
    const zonas = await Zona.find({ activa: true }).sort({ nombre: 1 });

    const rango = {};
    if (desde || hasta) {
      rango.fecha_entrega = {};
      if (desde) rango.fecha_entrega.$gte = new Date(desde);
      if (hasta) rango.fecha_entrega.$lte = new Date(hasta);
    }

    const resultados = [];
    for (const z of zonas) {
      if (zona !== "todas" && zona !== z.nombre) continue;
      const db = await connectZonaDB(z.nombre);
      const PedidoZona = db.model("Pedido", Pedido.schema);
      const q = { estatus: "entregado", ...rango };
      if (repartidor_id) q.repartidor_id = repartidor_id;
      const pedidos = await PedidoZona.find(q).lean();
      pedidos.forEach(p => resultados.push({ ...p, __zona: z.nombre }));
    }

    const totalEntregas = resultados.length;
    const porZona = resultados.reduce((acc, p) => { acc[p.__zona] = (acc[p.__zona] || 0) + 1; return acc; }, {});
    const repartidores = await Repartidor.find({}).populate("usuario_id").lean();

    res.render("reportes/entregas", {
      user: req.user,
      zonas,
      repartidores,
      filtros: { zona, repartidor_id, desde, hasta },
      resultados,
      metrics: { totalEntregas, porZona }
    });
  } catch (e) {
    console.error("Error reporte entregas:", e);
    res.status(500).send("Error generando reporte");
  }
}
