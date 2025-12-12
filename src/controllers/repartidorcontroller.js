import Repartidor from "../models/repartidor.js";
import Zona from "../models/zona.js";
import Usuario from "../models/usuario.js";

export const listarRepartidoresController = async (req, res) => {
    try {
        const repartidores = await Repartidor.find().populate("usuario_id");
        // Renderiza la vista con datos (o array vacío)
        res.render("repartidores/listarepartidores", { repartidores, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const asignarZonaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { zona } = req.body;
        const rep = await Repartidor.findByIdAndUpdate(id, { zona_asignada: zona }, { new: true });
        if (!rep) return res.status(404).send("Repartidor no encontrado");
        res.redirect("/repartidores");
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const renderAsignarZonaForm = async (req, res) => {
    try {
        const repartidores = await Repartidor.find().populate("usuario_id");
        const zonas = await Zona.find();
        res.render("repartidores/asignarzona", { repartidores, zonas, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const renderNuevoRepartidor = async (req, res) => {
    try {
        console.log("Render Nuevo Repartidor");
        const usuarios = await Usuario.find({}, "_id nombre");
        const zonas = await Zona.find({}, "nombre");
        res.render("repartidores/nuevo", { usuarios, zonas, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const crearRepartidor = async (req, res) => {
    try {
        const { usuario_id, vehiculo, placa, zona_asignada, status, entregas_realizadas } = req.body;
        await Repartidor.create({ usuario_id, vehiculo, placa, zona_asignada, status, entregas_realizadas });
        res.redirect("/repartidores?msg=Repartidor%20creado&type=success");
    } catch (error) {
        console.error("Error creando repartidor:", error);
        res.redirect("/repartidores/nuevo?msg=Error%20creando%20repartidor&type=error");
    }
};

export const renderDetalleRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const repartidor = await Repartidor.findById(id).populate("usuario_id");
        if (!repartidor) return res.status(404).send("Repartidor no encontrado");
        res.render("repartidores/detalle", { repartidor, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const renderEditarRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const repartidor = await Repartidor.findById(id);
        if (!repartidor) return res.status(404).send("Repartidor no encontrado");
        const usuarios = await Usuario.find({}, "_id nombre");
        const zonas = await Zona.find({}, "nombre");
        res.render("repartidores/editar", { repartidor, usuarios, zonas, user: req.user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const actualizarRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id, vehiculo, placa, zona_asignada, status, entregas_realizadas } = req.body;
        const rep = await Repartidor.findByIdAndUpdate(id, { usuario_id, vehiculo, placa, zona_asignada, status, entregas_realizadas }, { new: true });
        if (!rep) return res.status(404).send("Repartidor no encontrado");
        res.redirect(`/repartidores/${id}?msg=Actualizado&type=success`);
    } catch (error) {
        console.error("Error actualizando repartidor:", error);
        res.redirect(`/repartidores/${req.params.id}/editar?msg=Error%20actualizando&type=error`);
    }
};

export const eliminarRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        await Repartidor.findByIdAndDelete(id);
        res.redirect("/repartidores?msg=Eliminado&type=success");
    } catch (error) {
        console.error("Error eliminando repartidor:", error);
        res.redirect("/repartidores?msg=Error%20eliminando&type=error");
    }
};
