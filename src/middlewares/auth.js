import passport from "passport";

export const isAuthenticated = (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => { //jwt=current
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ status: "error", message: "No Autorizado" });
        }
        req.user = user;
        return next();
    })(req, res, next);
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ status: "error", message: "Acceso Denegado" });
};

// NUEVO: Middleware de autorización basado en roles
export const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        // if (!req.user || !req.user.role) {
        //     // Esto no debería suceder si isAuthenticated se ejecuta primero
        //     return res.status(403).json({ status: "error", message: "Acceso Denegado - Rol no especificado" });
        // }
        // Asegurarse de que el middleware isAuthenticated se ejecute primero
        if (!req.user) {
            console.log("Usuario no autenticado en authorizeRoles");
            return res.status(401).json({ status: "error", message: "No Autorizado" });
        }

        // Verificar que el usuario tenga un rol
        if (!req.user.role) {
            console.log("Usuario sin rol especificado:", req.user.email);
            return res.status(403).json({ status: "error", message: "Acceso Denegado, Rol no especificado" });
        }

        const hasRole = allowedRoles.includes(req.user.role);
        if (hasRole) {
            return next(); // El usuario tiene uno de los roles permitidos
        }

        return res.status(403).json({ status: "error", message: `Acceso Denegado - Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`});
    };
};