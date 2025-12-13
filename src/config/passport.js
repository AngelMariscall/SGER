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

                // Buscar usuario por correo; si no existe, permitir acceso con el perfil de Google sin crear registro
                let usuario = await Usuario.findOne({ correo: email });
                if (!usuario) {
                    usuario = {
                        _id: profile.id, // usar id de Google para la sesión
                        nombre: profile.displayName || "Usuario",
                        correo: email,
                        oauth_id: profile.id,
                        // rol opcional eliminado; acceso libre
                    };
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
    // Guardar el objeto usuario completo en sesión (puede ser de BD o solo perfil de Google)
    done(null, usuario);
});

// Deserializa al usuario desde la sesión
passport.deserializeUser(async (obj, done) => {
    // Recuperar el mismo objeto que se serializó; no garantiza existencia en BD
    done(null, obj);
});

export default passport;
