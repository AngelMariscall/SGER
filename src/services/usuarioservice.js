import UsuarioModel from "../models/usuario.js";

export const crearUsuario = async (data) => {
    const usuario = new UsuarioModel(data);
    await usuario.save();
    return usuario;
};

export const listarUsuarios = async () => {
    return await UsuarioModel.find({});
};
