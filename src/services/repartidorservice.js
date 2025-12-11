import RepartidorModel from "../models/repartidor.js";

export const listarRepartidores = async () => {
    return await RepartidorModel.find({}).populate("usuario_id");
};

export const asignarZona = async (repartidorId, zonaId) => {
    const rep = await RepartidorModel.findByIdAndUpdate(
        repartidorId,
        { zona_asignada: zonaId },
        { new: true }
    );
    return rep;
};
