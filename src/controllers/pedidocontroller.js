import { crearPedido } from "../services/pedidoservice.js";
import Pedido from "../models/pedido.js";


export const crearPedidoController = async (req, res) => {
    try {
        const pedido = await crearPedido(req.body);
        res.status(201).json({ ok: true, pedido });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};

export const actualizarPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const pedidoActualizado = await Pedido.findByIdAndUpdate(id, update, { new: true });
        if (!pedidoActualizado) {
            return res.status(404).json({ ok: false, error: "Pedido no encontrado" });
        }
        res.json({ ok: true, pedido: pedidoActualizado });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};

export const listarPedidosController = async (req, res) => {
    try {
        const pedidos = await Pedido.find();
        res.json({ ok: true, pedidos });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};

export const verPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findById(id);
        if (!pedido) {
            return res.status(404).json({ ok: false, error: "Pedido no encontrado" });
        }
        res.json({ ok: true, pedido });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};