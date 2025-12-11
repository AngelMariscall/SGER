import passport from "passport";


export const login = passport.authenticate("google", { scope: ["profile", "email"] });
export const callback = passport.authenticate("google", { failureRedirect: "/login" });
export const perfil = (req, res) => {
    res.render("auth/perfil", { user: req.user });
};

export const logout = (req, res) => {
    req.logout(() => {
        res.redirect("/login");
    });
};
