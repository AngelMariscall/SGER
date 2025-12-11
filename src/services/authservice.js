import UsuarioModel from "../models/usuario.js";

export const findOrCreateUser = async (profile) => {
    let user = await UsuarioModel.findOne({ oauth_id: profile.id });
    if (!user) {
        user = new UsuarioModel({
            nombre: profile.displayName,
            correo: profile.emails[0].value,
            oauth_id: profile.id,
            rol: "repartidor", // default
            telefono: "",
            activo: true
        });
        await user.save();
    }
    return user;
};
