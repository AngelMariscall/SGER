import express from "express";
import passport from "../config/passport.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Página de login
router.get("/login", (req, res) => {
    res.render("auth/login", { user: req.user });
});

// Página de perfil
router.get("/perfil", isAuthenticated, (req, res) => {
    res.render("auth/perfil", { user: req.user });
});

// Login con Google
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback de Google
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/failure" }),
        (req, res) => {
            // Éxito: redirigir al dashboard con métricas
            res.redirect("/dashboard");
    }
);

// Logout
router.get("/logout", (req, res) => {
    req.logout(err => {
        if (err) console.log(err);
        res.redirect("/");
    });
});

router.get("/failure", (req, res) => {
    res.send("Fallo en la autenticación");
});

export default router;
