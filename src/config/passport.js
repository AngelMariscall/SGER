import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Usuario from "../models/usuario.js";

// Evitar inicializar la estrategia varias veces en procesos con hot-reload
const hasGoogleStrategy = passport._strategies && passport._strategies.google;

// Validar variables de entorno (evita error: OAuth2Strategy requires a clientID option)
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!hasGoogleStrategy) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
        // En producción preferimos lanzar error para detectar misconfiguración temprano
        throw new Error("Variables de entorno de Google OAuth incompletas: GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI");
    }

    // Configuración de la estrategia de Google con guardia para no duplicar
    passport.use(
        new GoogleStrategy(
            {
                clientID: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                callbackURL: REDIRECT_URI,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile?.emails?.[0]?.value;
                    if (!email) {
                        return done(new Error("Perfil de Google sin email"));
                    }

                    // Buscar usuario por correo
                    let usuario = await Usuario.findOne({ correo: email });
                    if (!usuario) {
                        // Sesión temporal con perfil de Google (sin oauth_id ni persistencia obligatoria)
                        usuario = {
                            _id: profile.id,
                            nombre: profile.displayName || "Usuario",
                            correo: email,
                        };
                    }

                    return done(null, usuario);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
}

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
