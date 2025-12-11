export const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).send("No autenticado"); // si no hay usuario

        // Si el rol del usuario está en la lista de roles permitidos, deja pasar
        if (roles.includes(req.user.rol)) {
            return next();
        }

        // Si no tiene el rol adecuado, devuelve error
        return res.status(403).send("No tienes permisos para acceder a esta ruta");
    };
};
