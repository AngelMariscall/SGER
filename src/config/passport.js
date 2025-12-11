import dotenv from "dotenv";
dotenv.config();

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Usuario from "../models/usuario.js";

// Configuración de la estrategia de Google
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_REDIRECT_URI
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Tomamos el correo del perfil de Google
                const email = profile.emails[0].value;

                // Buscamos el usuario registrado por correo
                let usuario = await Usuario.findOne({ correo: email });

                if (!usuario) {
                    // Usuario no registrado → rechazar acceso
                    return done(null, false, { message: "Usuario no registrado" });
                }

                // Guardamos oauth_id si aún no existe
                if (!usuario.oauth_id) {
                    usuario.oauth_id = profile.id;
                    await usuario.save();
                }

                // Usuario encontrado y validado
                return done(null, usuario);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// Serializa al usuario para guardar en sesión
passport.serializeUser((usuario, done) => {
    done(null, usuario._id);
});

// Deserializa al usuario desde la sesión
passport.deserializeUser(async (id, done) => {
    try {
        const usuario = await Usuario.findById(id);
        done(null, usuario);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
