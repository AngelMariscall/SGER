import express from "express";
import passport from "../config/passport.js";

const router = express.Router();

// Página de login
router.get("/login", (req, res) => {
    res.render("auth/login", { user: req.user });
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
        // Redirige según rol
        if (req.user.rol === "admin") res.redirect("/usuarios");
        else if (req.user.rol === "operador") res.redirect("/pedidos");
        else res.redirect("/perfil");
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
